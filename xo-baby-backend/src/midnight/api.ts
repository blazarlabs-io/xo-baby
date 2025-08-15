import { contractConfig } from './config.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import {
  UnbalancedTransaction,
  WalletProvider,
  MidnightProvider,
  BalancedTransaction,
  FinalizedTxData,
} from '@midnight-ntwrk/midnight-js-types';
import { BabyHealth, witnesses } from '@midnight-ntwrk/baby-contract';
import {
  BabyHealthProviders,
  BabyHealthPrivateStateId,
  DeployedBabyHealthContract,
  BabyHealthContract,
} from './common-types.js';
import * as Rx from 'rxjs';
import {
  deployContract,
  findDeployedContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import { WalletBuilder } from '@midnight-ntwrk/wallet';
import { Transaction, nativeToken } from '@midnight-ntwrk/ledger';
import { Transaction as ZswapTransaction } from '@midnight-ntwrk/zswap';
import {
  getLedgerNetworkId,
  getZswapNetworkId,
} from '@midnight-ntwrk/midnight-js-network-id';
import { createBalancedTx } from '@midnight-ntwrk/midnight-js-types';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { webcrypto } from 'crypto';
import * as fs from 'node:fs';
import * as fsAsync from 'node:fs/promises';
import { WebSocket } from 'ws';
import * as CSL from '@emurgo/cardano-serialization-lib-nodejs';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

let logger: any;

// Types
interface Config {
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
}

interface WalletState {
  coinPublicKey: string;
  encryptionPublicKey: string;
  address: string;
  balances: Record<string, bigint>;
  syncProgress?: {
    synced: boolean;
    lag: {
      applyGap: bigint;
      sourceGap: bigint;
    };
  };
  transactionHistory: any[];
}

interface WalletResult {
  wallet: any;
  publickey: string;
}

// Baby Health contract instance
export const babyHealthContractInstance: BabyHealthContract =
  new BabyHealth.Contract(witnesses);

// Configure providers
export const configureProviders = async (
  wallet: any,
  config: Config,
): Promise<BabyHealthProviders> => {
  const walletAndMidnightProvider =
    await createWalletAndMidnightProvider(wallet);
  return {
    privateStateProvider: levelPrivateStateProvider<
      typeof BabyHealthPrivateStateId
    >({
      privateStateStoreName: contractConfig.privateStateStoreName,
    }),
    publicDataProvider: indexerPublicDataProvider(
      config.indexer,
      config.indexerWS,
    ),
    zkConfigProvider: new NodeZkConfigProvider<
      | 'createChildId'
      | 'generateNFTId'
      | 'generateRoleBasedNFT'
      | 'getRoleFromNFT'
      | 'generateChildNFT'
      | 'getDataFromChildNFT'
      | 'removeRoleNFT'
      | 'removeChildNFT'
    >(contractConfig.zkConfigPath),
    proofProvider: httpClientProofProvider(config.proofServer),
    walletProvider: walletAndMidnightProvider,
    midnightProvider: walletAndMidnightProvider,
  };
};

// Create wallet and midnight provider
const createWalletAndMidnightProvider = async (
  wallet: any,
): Promise<WalletProvider & MidnightProvider> => {
  const state = (await Rx.firstValueFrom(wallet.state())) as WalletState;
  return {
    coinPublicKey: state.coinPublicKey,
    encryptionPublicKey: state.encryptionPublicKey,
    balanceTx(
      tx: UnbalancedTransaction,
      newCoins: any,
    ): Promise<BalancedTransaction> {
      return wallet
        .balanceTransaction(
          ZswapTransaction.deserialize(
            tx.serialize(getLedgerNetworkId()),
            getZswapNetworkId(),
          ),
          newCoins,
        )
        .then((tx: any) => wallet.proveTransaction(tx))
        .then((zswapTx: any) =>
          Transaction.deserialize(
            zswapTx.serialize(getZswapNetworkId()),
            getLedgerNetworkId(),
          ),
        )
        .then(createBalancedTx);
    },
    submitTx(tx: any) {
      return wallet.submitTransaction(
        ZswapTransaction.deserialize(
          tx.serialize(getLedgerNetworkId()),
          getZswapNetworkId(),
        ),
      );
    },
  };
};

// Generate random bytes
export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  webcrypto.getRandomValues(bytes);
  return bytes;
};

// Join a contract
export const joinContract = async (
  providers: BabyHealthProviders,
  contractAddress: string,
  privateState: any,
): Promise<DeployedBabyHealthContract> => {
  logger.info('Joining contract...');
  const babyHealthContract = await findDeployedContract(providers, {
    contractAddress,
    contract: babyHealthContractInstance,
    privateStateId: BabyHealthPrivateStateId,
    initialPrivateState: privateState,
  });
  logger.info(
    `Joined contract at address: ${babyHealthContract.deployTxData.public.contractAddress}`,
  );
  return babyHealthContract;
};

// Deploy a contract
export const deploy = async (
  providers: BabyHealthProviders,
  privateState: any,
): Promise<DeployedBabyHealthContract> => {
  logger.info('Deploying baby health contract...');
  const babyHealthContract = await deployContract(providers, {
    contract: babyHealthContractInstance,
    privateStateId: BabyHealthPrivateStateId,
    initialPrivateState: privateState,
    args: [randomBytes(32)], // initNonce parameter
  });
  logger.info(
    `Deployed contract at address: ${babyHealthContract.deployTxData.public.contractAddress}`,
  );
  return babyHealthContract;
};

// Create child ID
export const createChildId = async (
  babyHealthContract: any,
  name: Uint8Array,
  dob: Uint8Array,
  gender: Uint8Array,
): Promise<any> => {
  logger.info('Creating child ID...');
  const finalizedTxData = await babyHealthContract.callTx.createChildId(
    name,
    dob,
    gender,
  );
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  // Extract and display the child ID
  if (
    finalizedTxData.private &&
    finalizedTxData.private.output &&
    finalizedTxData.private.output.value
  ) {
    const childId = finalizedTxData.private.output.value[0];
    if (childId instanceof Uint8Array) {
      const childIdHex = toHex(childId);
      logger.info('✅ Child ID created successfully!');
      logger.info(`📋 Child ID: ${childIdHex}`);
    }
  }
  return finalizedTxData.public;
};

// Generate NFT ID
export const generateNFTId = async (
  babyHealthContract: any,
  firstname: Uint8Array,
  lastname: Uint8Array,
  email: Uint8Array,
): Promise<any> => {
  logger.info('Generating NFT ID...');
  const finalizedTxData = await babyHealthContract.callTx.generateNFTId(
    firstname,
    lastname,
    email,
  );
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  if (
    finalizedTxData.private &&
    finalizedTxData.private.output &&
    finalizedTxData.private.output.value
  ) {
    const nftId = finalizedTxData.private.output.value[0];
    if (nftId instanceof Uint8Array) {
      const nftIdHex = toHex(nftId);
      logger.info('✅ NFT ID generated successfully!');
      logger.info(`📋 NFT ID: ${nftIdHex}`);
    } else {
      logger.info('No NFT ID found');
    }
  }
  const nftId = finalizedTxData.private.output.value[0];
  const nftIdHex = toHex(nftId);
  logger.info('✅ NFT ID generated successfully!');
  logger.info(`📋 NFT ID: ${nftIdHex}`);

  return nftIdHex;
};

// Generate role-based NFT
export const generateRoleBasedNFT = async (
  babyHealthContract: any,
  nftId: Uint8Array,
  role: Uint8Array,
  validUntil: Uint8Array,
): Promise<any> => {
  logger.info('Generating role-based NFT...');
  const finalizedTxData = await babyHealthContract.callTx.generateRoleBasedNFT(
    nftId,
    role,
    validUntil,
  );
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  if (
    finalizedTxData.private &&
    finalizedTxData.private.output &&
    finalizedTxData.private.output.value
  ) {
    const createdNftId = finalizedTxData.private.output.value[0];
    if (createdNftId instanceof Uint8Array) {
      const createdNftIdHex = toHex(createdNftId);
      logger.info('✅ Role-based NFT generated successfully!');
      logger.info(`📋 Role-based NFT ID: ${createdNftIdHex}`);
    }
  }
  return finalizedTxData.public;
};

// Get role from NFT
export const getRoleFromNFT = async (
  babyHealthContract: any,
  nftId: Uint8Array,
): Promise<any> => {
  logger.info('Getting role-based NFT...');
  const finalizedTxData = await babyHealthContract.callTx.getRoleFromNFT(nftId);
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  // Extract and display the role-based NFT
  if (
    finalizedTxData.private &&
    finalizedTxData.private.output &&
    finalizedTxData.private.output.value
  ) {
    logger.info('---------------------- ');
    logger.info('Role-Based NFT Data:');
    if (Array.isArray(finalizedTxData.private.output.value)) {
      const values = finalizedTxData.private.output.value;
      formatRoleBasedNFTData(values);
    }
    logger.info('---------------------- ');
  } else {
    logger.info('No role-based NFT data found');
  }
  return finalizedTxData.public;
};

// Generate child NFT
export const generateChildNFT = async (
  babyHealthContract: any,
  childId: Uint8Array,
  CID: Uint8Array,
  AESkey: Uint8Array,
): Promise<any> => {
  logger.info('Generating child NFT...');
  const finalizedTxData = await babyHealthContract.callTx.generateChildNFT(
    childId,
    CID,
    AESkey,
  );
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  logger.info('✅ Child NFT generated successfully!');
  return finalizedTxData.public;
};

// Get data from child NFT
export const getDataFromChildNFT = async (
  babyHealthContract: any,
  childId: Uint8Array,
): Promise<any> => {
  logger.info('Getting child NFT data...');
  const finalizedTxData =
    await babyHealthContract.callTx.getDataFromChildNFT(childId);
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  if (finalizedTxData.private?.output?.value) {
    logger.info('📋 Child NFT Data Details:');
    logger.info('='.repeat(50));
    const values = finalizedTxData.private.output.value;
    if (Array.isArray(values) && values.length > 0) {
      logger.info(`Found ${values.length} values in the output`);
      values.forEach((value: any, index: number) => {
        if (value instanceof Uint8Array) {
          const hexValue = toHex(value);
          const stringValue = bytesToString(value);
          logger.info(`Value [${index}]:`);
          logger.info(`  Hex: ${hexValue}`);
          logger.info(`  String: "${stringValue}"`);
          logger.info(`  Length: ${value.length} bytes`);
          logger.info('');
        } else {
          logger.info(`Value [${index}]: ${value}`);
        }
      });
    } else {
      logger.info('No valid child NFT data found');
    }
    logger.info('='.repeat(50));
  } else {
    logger.info('No private output data found');
  }
  return finalizedTxData.public;
};

// Remove role NFT
export const removeRoleNFT = async (
  babyHealthContract: any,
  nftId: Uint8Array,
): Promise<any> => {
  logger.info('Removing role NFT...');
  const finalizedTxData = await babyHealthContract.callTx.removeRoleNFT(nftId);
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  logger.info('✅ Role NFT removed successfully!');
  return finalizedTxData.public;
};

// Remove child NFT
export const removeChildNFT = async (
  babyHealthContract: any,
  childId: Uint8Array,
): Promise<any> => {
  logger.info('Removing child NFT...');
  const finalizedTxData =
    await babyHealthContract.callTx.removeChildNFT(childId);
  logger.info(
    `Transaction ${finalizedTxData.public.txId} added in block ${finalizedTxData.public.blockHeight}`,
  );

  logger.info('✅ Child NFT removed successfully!');
  return finalizedTxData.public;
};

// Wallet functions
export const waitForSync = (wallet: any): Promise<WalletState> =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state: any) => {
        const typedState = state as WalletState;
        const applyGap = typedState.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = typedState.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(
          `Waiting for funds. Backend lag: ${sourceGap}, wallet lag: ${applyGap}, transactions=${typedState.transactionHistory.length}`,
        );
      }),
      Rx.filter((state: any) => {
        const typedState = state as WalletState;
        return (
          typedState.syncProgress !== undefined &&
          typedState.syncProgress.synced
        );
      }),
    ),
  );

export const waitForSyncProgress = async (wallet: any) =>
  await Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(5_000),
      Rx.tap((state: any) => {
        const applyGap = state.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = state.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(
          `Waiting for funds. Backend lag: ${sourceGap}, wallet lag: ${applyGap}, transactions=${state.transactionHistory.length}`,
        );
      }),
      Rx.filter((state: any) => {
        return state.syncProgress !== undefined;
      }),
    ),
  );

export const waitForFunds = (wallet: any): Promise<bigint> =>
  Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.throttleTime(10_000),
      Rx.tap((state: any) => {
        const typedState = state as WalletState;
        const applyGap = typedState.syncProgress?.lag.applyGap ?? 0n;
        const sourceGap = typedState.syncProgress?.lag.sourceGap ?? 0n;
        logger.info(
          `Waiting for funds. Backend lag: ${sourceGap}, wallet lag: ${applyGap}, transactions=${typedState.transactionHistory.length}`,
        );
      }),
      Rx.filter((state: any) => {
        const typedState = state as WalletState;
        return typedState.syncProgress?.synced === true;
      }),
      Rx.map((s: any) => {
        const typedState = s as WalletState;
        return typedState.balances[nativeToken()] ?? 0n;
      }),
      Rx.filter((balance: bigint) => balance > 0n),
    ),
  );

// Build wallet and wait for funds
export const buildWalletAndWaitForFunds = async (
  config: Config,
  seed: string,
  filename: string,
): Promise<WalletResult> => {
  const directoryPath = process.env.SYNC_CACHE;
  let wallet: any;

  if (directoryPath !== undefined) {
    if (fs.existsSync(`${directoryPath}/${filename}`)) {
      logger.info(
        `Attempting to restore state from ${directoryPath}/${filename}`,
      );
      try {
        const serializedStream = fs.createReadStream(
          `${directoryPath}/${filename}`,
          'utf-8',
        );
        const serialized = await streamToString(serializedStream);
        serializedStream.on('finish', () => {
          serializedStream.close();
        });
        wallet = await WalletBuilder.restore(
          config.indexer,
          config.indexerWS,
          config.proofServer,
          config.node,
          seed,
          serialized,
          'info',
        );
        wallet.start();
        const stateObject = JSON.parse(serialized);
        if (
          (await isAnotherChain(wallet, Number(stateObject.offset))) === true
        ) {
          logger.warn('The chain was reset, building wallet from scratch');
          wallet = await WalletBuilder.buildFromSeed(
            config.indexer,
            config.indexerWS,
            config.proofServer,
            config.node,
            seed,
            getZswapNetworkId(),
            'info',
          );
          wallet.start();
        } else {
          const newState = await waitForSync(wallet);
          if (newState.syncProgress?.synced) {
            logger.info('Wallet was able to sync from restored state');
          } else {
            logger.info(`Offset: ${stateObject.offset}`);
            logger.info(
              `SyncProgress.lag.applyGap: ${newState.syncProgress?.lag.applyGap}`,
            );
            logger.info(
              `SyncProgress.lag.sourceGap: ${newState.syncProgress?.lag.sourceGap}`,
            );
            logger.warn(
              'Wallet was not able to sync from restored state, building wallet from scratch',
            );
            wallet = await WalletBuilder.buildFromSeed(
              config.indexer,
              config.indexerWS,
              config.proofServer,
              config.node,
              seed,
              getZswapNetworkId(),
              'info',
            );
            wallet.start();
          }
        }
      } catch (error) {
        if (typeof error === 'string') {
          logger.error(error);
        } else if (error instanceof Error) {
          logger.error(error.message);
        } else {
          logger.error(error);
        }
        logger.warn(
          'Wallet was not able to restore using the stored state, building wallet from scratch',
        );
        wallet = await WalletBuilder.buildFromSeed(
          config.indexer,
          config.indexerWS,
          config.proofServer,
          config.node,
          seed,
          getZswapNetworkId(),
          'info',
        );
        wallet.start();
      }
    } else {
      logger.info('Wallet save file not found, building wallet from scratch');
      wallet = await WalletBuilder.buildFromSeed(
        config.indexer,
        config.indexerWS,
        config.proofServer,
        config.node,
        seed,
        getZswapNetworkId(),
        'info',
      );
      wallet.start();
    }
  } else {
    logger.info(
      'File path for save file not found, building wallet from scratch',
    );
    wallet = await WalletBuilder.buildFromSeed(
      config.indexer,
      config.indexerWS,
      config.proofServer,
      config.node,
      seed,
      getZswapNetworkId(),
      'info',
    );
    wallet.start();
  }

  const state = (await Rx.firstValueFrom(wallet.state())) as WalletState;
  logger.info(`Your wallet seed is: ${seed}`);
  logger.info(`Your wallet address is: ${state.address}`);
  let balance = state.balances[nativeToken()];

  if (balance === undefined || balance === 0n) {
    logger.info(`Your wallet balance is: 0`);
    logger.info(`Waiting to receive tokens...`);
    balance = await waitForFunds(wallet);
  }
  logger.info(`Your wallet balance is: ${balance}`);
  return { wallet, publickey: state.address };
};

// Build wallet without waiting for funds
export const buildWalletAndNoWaitForFunds = async (
  config: Config,
  seed: string,
  _logger: any,
): Promise<{ publickey: string }> => {
  console.log(seed);
  const wallet = await WalletBuilder.buildFromSeed(
    config.indexer,
    config.indexerWS,
    config.proofServer,
    config.node,
    seed,
    getZswapNetworkId(),
    'warn',
  );
  wallet.start();
  const state = (await Rx.firstValueFrom(wallet.state())) as WalletState;
  _logger.info(`Your wallet seed is: ${seed}`);
  _logger.info(`Your wallet address is: ${state.address}`);
  return { publickey: state.address };
};

// Build fresh wallet
export const buildFreshWallet = async (config: Config): Promise<any> =>
  await buildWalletAndWaitForFunds(config, toHex(randomBytes(32)), '');

// Set logger
export function setLogger(_logger: any): void {
  logger = _logger;
}

// Utility functions
export const streamToString = async (stream: any): Promise<string> => {
  const chunks: Buffer[] = [];
  return await new Promise((resolve, reject) => {
    stream.on('data', (chunk: any) =>
      chunks.push(
        typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk,
      ),
    );
    stream.on('error', (err: Error) => {
      reject(err);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
  });
};

export const isAnotherChain = async (
  wallet: any,
  offset: number,
): Promise<boolean> => {
  await waitForSyncProgress(wallet);
  const walletOffset = Number(JSON.parse(await wallet.serializeState()).offset);
  if (walletOffset < offset - 1) {
    logger.info(
      `Your offset offset is: ${walletOffset} restored offset: ${offset} so it is another chain`,
    );
    return true;
  } else {
    logger.info(
      `Your offset offset is: ${walletOffset} restored offset: ${offset} ok`,
    );
    return false;
  }
};

// Save state
export const saveState = async (
  wallet: any,
  filename: string,
): Promise<void> => {
  const directoryPath = process.env.SYNC_CACHE;
  if (directoryPath !== undefined) {
    logger.info(`Saving state in ${directoryPath}/${filename}`);
    try {
      await fsAsync.mkdir(directoryPath, { recursive: true });
      const serializedState = await wallet.serializeState();
      const writer = fs.createWriteStream(`${directoryPath}/${filename}`);
      writer.write(serializedState);
      writer.on('finish', function () {
        logger.info(
          `File '${directoryPath}/${filename}' written successfully.`,
        );
      });
      writer.on('error', function (err: Error) {
        logger.error(err);
      });
      writer.end();
    } catch (e) {
      if (typeof e === 'string') {
        logger.warn(e);
      } else if (e instanceof Error) {
        logger.warn(e.message);
      }
    }
  } else {
    logger.info('Not saving cache as sync cache was not defined');
  }
};

// Utility helper functions
const bytesToString = (bytes: Uint8Array): string => {
  try {
    let dataLength = bytes.length;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        dataLength = i;
        break;
      }
    }
    const actualData = bytes.slice(0, dataLength);
    const str = new TextDecoder().decode(actualData);
    return str;
  } catch (error) {
    return toHex(bytes);
  }
};

const formatRoleBasedNFTData = (values: any[]): void => {
  if (values.length >= 4) {
    const fieldNames = ['Child ID', 'Recipient', 'Role', 'Valid Until'];
    logger.info('📋 Role Token Details:');
    logger.info('='.repeat(50));
    values.forEach((value: any, index: number) => {
      if (index < fieldNames.length) {
        const fieldName = fieldNames[index];
        if (value instanceof Uint8Array) {
          const hexValue = toHex(value);
          const stringValue = bytesToString(value);
          logger.info(`${fieldName}:`);
          logger.info(`  Full Hex (32 bytes): ${hexValue}`);
          logger.info(`  Decoded String: "${stringValue}"`);
          logger.info(`  String Length: ${stringValue.length} characters`);

          if (fieldName === 'Valid Until' && stringValue) {
            try {
              const date = new Date(stringValue);
              if (!isNaN(date.getTime())) {
                logger.info(`  Parsed Date: ${date.toLocaleDateString()}`);
              }
            } catch (e) {
              // Ignore date parsing errors
            }
          }
        } else {
          logger.info(`${fieldName}: ${value}`);
        }
        logger.info('');
      }
    });
  } else {
    logger.info('📋 Role Token Data (Raw):');
    values.forEach((value: any, index: number) => {
      if (value instanceof Uint8Array) {
        const hexValue = toHex(value);
        const stringValue = bytesToString(value);
        logger.info(`[${index}]: ${hexValue} (string: "${stringValue}")`);
      } else {
        logger.info(`[${index}]: ${value}`);
      }
    });
  }
};
