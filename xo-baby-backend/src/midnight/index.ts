import { createInterface } from 'node:readline/promises';
import { StandaloneConfig } from './config.js';
import * as api from './api.js';
// import { BabyHealth } from './contract/index';
import { BabyHealth } from '@midnight-ntwrk/baby-contract';

let logger: any;

/**
 * This seed gives access to tokens minted in the genesis block of a local development node - only
 * used in standalone networks to build a wallet with initial funds.
 */
const GENESIS_MINT_WALLET_SEED =
  '0000000000000000000000000000000000000000000000000000000000000001';

// Types
interface Config {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
}

interface WalletResult {
  wallet: any;
  publickey: string;
}

// String to bytes32 conversion
const stringToBytes32 = (str: string): Uint8Array => {
  const byteLength = 32;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < str.length && i < byteLength; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes;
};

// String to bytes128 conversion (padded with zeros to 128 bytes)
// Format: [length (4 bytes)][data][padding zeros]
export const stringToBytes128 = (str: string): Uint8Array => {
  const byteLength = 128;
  const maxDataLength = byteLength - 4; // Reserve 4 bytes for length
  const bytes = new Uint8Array(byteLength); // Automatically filled with zeros

  // Store the actual data length in first 4 bytes (little endian)
  const dataLength = Math.min(str.length, maxDataLength);
  bytes[0] = dataLength & 0xff;
  bytes[1] = (dataLength >> 8) & 0xff;
  bytes[2] = (dataLength >> 16) & 0xff;
  bytes[3] = (dataLength >> 24) & 0xff;

  // Store the actual data starting from byte 4
  for (let i = 0; i < dataLength; i++) {
    bytes[4 + i] = str.charCodeAt(i);
  }

  return bytes;
};

// Convert bytes128 back to string using length prefix
export const bytes128ToString = (bytes: Uint8Array): string => {
  if (bytes.length < 4) {
    throw new Error('Invalid bytes128 data: too short');
  }

  // Read the length from first 4 bytes (little endian)
  const dataLength =
    bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);

  // Validate length
  if (dataLength < 0 || dataLength > bytes.length - 4) {
    throw new Error(`Invalid data length: ${dataLength}`);
  }

  // Extract the actual data (from byte 4 to byte 4+dataLength)
  const dataBytes = bytes.slice(4, 4 + dataLength);

  try {
    return new TextDecoder().decode(dataBytes);
  } catch (error) {
    // Fallback to hex representation if decoding fails
    return Array.from(dataBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
};

// Seed to bytes32 conversion
const seedToBytes32 = (hexString: string): Uint8Array => {
  if (hexString.length !== 64) {
    throw new Error(
      'Invalid private key, hexadecimal string must have exactly 64 characters.',
    );
  }

  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    const byteValue = parseInt(hexString.substr(i * 2, 2), 16);
    if (isNaN(byteValue)) {
      throw new Error('Invalid character found in the private key.');
    }
    bytes[i] = byteValue;
  }
  return bytes;
};

// Get baby health ledger state
export const getBabyHealthLedgerState = (
  providers: any,
  contractAddress: string,
) =>
  providers.publicDataProvider
    .queryContractState(contractAddress)
    .then((contractState: any) =>
      contractState != null ? BabyHealth.ledger(contractState.data) : null,
    );

// Join contract helper
const join = async (
  providers: any,
  contractAddress: string,
  privateState: any,
): Promise<any> => {
  return await api.joinContract(providers, contractAddress, privateState);
};

// Deploy or join helper
const deployOrJoin = async (
  providers: any,
  contractAddress: string,
  seed: string,
): Promise<any> => {
  return await join(providers, contractAddress, {
    secretKey: stringToBytes32(seed),
  });
};

// Get public key
export const getPublicKey = async (
  config: Config,
  _logger: any,
  privatekey: string,
): Promise<string | null> => {
  const wallet = await api.buildWalletAndNoWaitForFunds(
    config,
    privatekey,
    _logger,
  );
  return wallet.publickey;
};

// Build wallet from seed
const buildWalletFromSeed = async (
  config: Config,
  seed: string,
): Promise<WalletResult> => {
  return await api.buildWalletAndWaitForFunds(config, seed, '');
};

// Build wallet
const buildWallet = async (
  config: Config,
  seed: string,
): Promise<{ wallet: Promise<WalletResult>; seed: string }> => {
  return {
    wallet: buildWalletFromSeed(config, seed),
    seed: seed,
  };
};

// Create child ID
export const createChildId = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  name: string,
  birthDate: string,
  gender: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalCreateChildId(
        providers,
        contractAddress,
        privatekey,
        name,
        birthDate,
        gender,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal create child ID
const internalCreateChildId = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  name: string,
  birthDate: string,
  gender: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.createChildId(
      babyHealthApi,
      stringToBytes32(name),
      stringToBytes32(birthDate),
      stringToBytes32(gender),
    );
    console.log(result);
    return result;
  } finally {
    // Clean up if needed
  }
};

export const generateNFTId = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  firstname: string,
  lastname: string,
  email: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalGenerateNFTId(
        providers,
        contractAddress,
        privatekey,
        firstname,
        lastname,
        email,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal generate NFT ID
const internalGenerateNFTId = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  firstname: string,
  lastname: string,
  email: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.generateNFTId(
      babyHealthApi,
      stringToBytes32(firstname),
      stringToBytes32(lastname),
      stringToBytes32(email),
    );
    console.log(result);
    return result;
  } finally {
    // Clean up if needed
  }
};

// Generate role-based NFT
export const generateRoleBasedNFT = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  nftId: string,
  role: string,
  validUntil: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalGenerateRoleBasedNFT(
        providers,
        contractAddress,
        privatekey,
        nftId,
        role,
        validUntil,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal generate role-based NFT
const internalGenerateRoleBasedNFT = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  nftId: string,
  role: string,
  validUntil: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.generateRoleBasedNFT(
      babyHealthApi,
      stringToBytes32(nftId),
      stringToBytes32(role),
      stringToBytes32(validUntil),
    );
    console.log(result);
    return result;
  } finally {
    // Clean up if needed
  }
};

// Get role from NFT
export const getRoleFromNFT = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  nftId: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalGetRoleFromNFT(
        providers,
        contractAddress,
        privatekey,
        nftId,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal get role from NFT
const internalGetRoleFromNFT = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  nftId: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.getRoleFromNFT(
      babyHealthApi,
      stringToBytes32(nftId),
    );
    return result;
  } finally {
    // Clean up if needed
  }
};

// Generate child NFT
export const generateChildNFT = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  childId: string,
  cid: string,
  aesKey: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalGenerateChildNFT(
        providers,
        contractAddress,
        privatekey,
        childId,
        cid,
        aesKey,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal generate child NFT
const internalGenerateChildNFT = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  childId: string,
  cid: string,
  aesKey: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.generateChildNFT(
      babyHealthApi,
      stringToBytes32(childId),
      stringToBytes128(cid),
      stringToBytes128(aesKey),
    );
    console.log(result);
    return result;
  } finally {
    // Clean up if needed
  }
};

// Get data from child NFT
export const getDataFromChildNFT = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  childId: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalGetDataFromChildNFT(
        providers,
        contractAddress,
        privatekey,
        childId,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal get data from child NFT
const internalGetDataFromChildNFT = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  childId: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.getDataFromChildNFT(
      babyHealthApi,
      stringToBytes32(childId),
    );
    return result;
  } finally {
    // Clean up if needed
  }
};

// Remove role NFT
export const removeRoleNFT = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  nftId: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalRemoveRoleNFT(
        providers,
        contractAddress,
        privatekey,
        nftId,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal remove role NFT
const internalRemoveRoleNFT = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  nftId: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.removeRoleNFT(
      babyHealthApi,
      stringToBytes32(nftId),
    );
    console.log(result);
    return result;
  } finally {
    // Clean up if needed
  }
};

// Remove child NFT
export const removeChildNFT = async (
  config: Config,
  _logger: any,
  contractAddress: string,
  privatekey: string,
  childId: string,
): Promise<any> => {
  logger = _logger;
  api.setLogger(_logger);

  let env: any;
  const wallet1 = await buildWallet(config, privatekey);
  const wallet = await wallet1.wallet;
  let resolvedWallet: any = null;

  try {
    if (wallet !== null) {
      resolvedWallet = wallet.wallet;
      const providers = await api.configureProviders(resolvedWallet, config);
      const result = await internalRemoveChildNFT(
        providers,
        contractAddress,
        privatekey,
        childId,
      );
      return result;
    }
    return null;
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`Found error '${e.message}'`);
      logger.info('Exiting...');
      logger.debug(`${e.stack}`);
    } else {
      throw e;
    }
  } finally {
    try {
      if (resolvedWallet !== null) {
        await resolvedWallet.close();
      }
    } catch (e) {
      // Silent error handling
    } finally {
      try {
        if (env !== undefined) {
          await env.down();
          logger.info('Goodbye');
          process.exit(0);
        }
      } catch (e) {
        // Silent error handling
      }
    }
  }
};

// Internal remove child NFT
const internalRemoveChildNFT = async (
  providers: any,
  contractAddress: string,
  privatekey: string,
  childId: string,
): Promise<any> => {
  const babyHealthApi = await deployOrJoin(
    providers,
    contractAddress,
    privatekey,
  );
  if (babyHealthApi === null) {
    return null;
  }

  try {
    const result = await api.removeChildNFT(
      babyHealthApi,
      stringToBytes32(childId),
    );
    console.log(result);
    return result;
  } finally {
    // Clean up if needed
  }
};
