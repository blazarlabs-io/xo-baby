import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { StandaloneConfig, } from "./config.js";
import * as api from "./api.js";
let logger;
const GENESIS_MINT_WALLET_SEED = "0000000000000000000000000000000000000000000000000000000000000001";
const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new baby health contract
  2. Join an existing baby health contract
  3. Exit
Which would you like to do? `;
const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Create Baby ID
  2. Generate NFT ID
  3. Generate role-based NFT
  4. Get role from NFT
  5. Generate CSet Hash
  6. Get AES key from CSet
  7. Generate Access Policy
  8. Get Access Range from Access Policy
  9. Generate Datum
  10. Get data CID from Datum
  11. Exit
Which would you like to do? `;
const join = async (providers, rli, privateState) => {
    const contractAddress = await rli.question("What is the contract address (in hex)? ");
    return await api.joinContract(providers, contractAddress, privateState);
};
const deployOrJoin = async (providers, rli, seed) => {
    while (true) {
        const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
        switch (choice) {
            case "1":
                return await api.deploy(providers, {
                    secretKey: stringToBytes32(seed),
                });
            case "2":
                return await join(providers, rli, { secretKey: stringToBytes32(seed) });
            case "3":
                logger.info("Exiting...");
                return null;
            default:
                logger.error(`Invalid choice: ${choice}`);
        }
    }
};
const stringToBytes32 = (str) => {
    const byteLength = 32;
    const bytes = new Uint8Array(byteLength);
    // Convert string to bytes and fill the initial part of the array
    for (let i = 0; i < str.length && i < byteLength; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes;
};
const mainLoop = async (providers, rli, seed) => {
    const babyHealthContract = await deployOrJoin(providers, rli, seed);
    if (babyHealthContract === null) {
        return;
    }
    while (true) {
        const choice = await rli.question(MAIN_LOOP_QUESTION);
        switch (choice) {
            case "1":
                const name = await rli.question("Enter name: ");
                const birthDate = await rli.question("Enter birth date (YYYY-MM-DD): ");
                const gender = await rli.question("Enter gender (male/female): ");
                logger.info(`Creating child ID with name: ${name}, birth date: ${birthDate}, gender: ${gender}`);
                await api.createChildId(babyHealthContract, stringToBytes32(name), stringToBytes32(birthDate), stringToBytes32(gender));
                break;
            case "2":
                const firstname = await rli.question("Enter firstname: ");
                const lastname = await rli.question("Enter lastname: ");
                const email = await rli.question("Enter email: ");
                await api.generateNFTId(babyHealthContract, stringToBytes32(firstname), stringToBytes32(lastname), stringToBytes32(email));
                break;
            case "3":
                const nftId = await rli.question("Enter NFT ID: ");
                const recipient = await rli.question("Enter recipient: ");
                const role = await rli.question("Enter role(parent/admin/pediatrician/researcher): ");
                const childId = await rli.question("Enter child ID: ");
                const validUntil = await rli.question("Enter valid until: ");
                await api.generateRoleBasedNFT(babyHealthContract, stringToBytes32(nftId), stringToBytes32(childId), stringToBytes32(recipient), stringToBytes32(role), stringToBytes32(validUntil));
                break;
            case "4":
                const paramNftId = await rli.question("Enter NFT ID: ");
                const roleNFT = await api.getRoleFromNFT(babyHealthContract, stringToBytes32(paramNftId));
                logger.info(`Role-based NFT: ${roleNFT}`);
                break;
            case "5":
                const nftId5 = await rli.question("Enter NFT ID: ");
                const AESkey = await rli.question("Enter AES key: ");
                await api.generateCSet(babyHealthContract, stringToBytes32(nftId5), stringToBytes32(AESkey));
                break;
            case "6":
                const nftId6 = await rli.question("Enter NFT ID: ");
                await api.getAESKeyFromCSet(babyHealthContract, stringToBytes32(nftId6));
                // The API function now handles all the detailed AES key logging
                break;
            case "7":
                const nftId7 = await rli.question("Enter NFT ID: ");
                const rights = await rli.question("Enter Rights (personal/full/zk): ");
                const expiry = await rli.question("Enter expiry: ");
                await api.generateAccessPolicy(babyHealthContract, stringToBytes32(nftId7), stringToBytes32(rights), stringToBytes32(expiry));
                break;
            case "8":
                const nftId8 = await rli.question("Enter NFT ID: ");
                const range = await api.getRangeFromAccessPolicy(babyHealthContract, stringToBytes32(nftId8));
                logger.info(`Access range: ${range}`);
                break;
            case "9":
                const nftId9 = await rli.question("Enter NFT ID: ");
                const CID = await rli.question("Enter CID: ");
                await api.generateDatum(babyHealthContract, stringToBytes32(nftId9), stringToBytes32(CID));
                break;
            case "10":
                const nftId10 = await rli.question("Enter NFT ID: ");
                const datum = await api.getDataFromDatum(babyHealthContract, stringToBytes32(nftId10));
                logger.info(`Data CID: ${datum}`);
                break;
            case "11":
                logger.info("Exiting...");
                return;
            default:
                logger.error(`Invalid choice: ${choice}`);
        }
    }
};
const buildWalletFromSeed = async (config, rli) => {
    const seed = await rli.question("Enter your wallet seed: ");
    return await api.buildWalletAndWaitForFunds(config, seed, "");
};
const WALLET_LOOP_QUESTION = `
You can do one of the following:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;
const buildWallet = async (config, rli) => {
    if (config instanceof StandaloneConfig) {
        console.log("-----------------------------------");
        console.log("wallet built in standaloneconfig");
        console.log("-----------------------------------");
        return {
            wallet: api.buildWalletAndWaitForFunds(config, GENESIS_MINT_WALLET_SEED, ""),
            seed: GENESIS_MINT_WALLET_SEED,
        };
    }
    while (true) {
        const choice = await rli.question(WALLET_LOOP_QUESTION);
        switch (choice) {
            case "1":
                return {
                    wallet: api.buildFreshWallet(config),
                    seed: GENESIS_MINT_WALLET_SEED,
                };
            case "2":
                return {
                    wallet: buildWalletFromSeed(config, rli),
                    seed: "18e66828cf01e82b2dcb73159ac48cfe6abbec1e3b9887bf35178b15ccccce3d",
                };
            case "3":
                logger.info("Exiting...");
                return { wallet: Promise.resolve(null), seed: "" };
            default:
                logger.error(`Invalid choice: ${choice}`);
        }
    }
};
const mapContainerPort = (env, url, containerName) => {
    const mappedUrl = new URL(url);
    const container = env.getContainer(containerName);
    mappedUrl.port = String(container.getFirstMappedPort());
    return mappedUrl.toString().replace(/\/+$/, "");
};
export const run = async (config, _logger, dockerEnv) => {
    console.log("Starting baby health CLI...");
    console.log("Config: ", config);
    console.log("_logger: ", _logger);
    console.log("dockerEnv: ", dockerEnv);
    logger = _logger;
    api.setLogger(_logger);
    const rli = createInterface({ input, output, terminal: true });
    let env;
    if (dockerEnv !== undefined) {
        env = await dockerEnv.up();
        console.log("config: ", env);
        if (config instanceof StandaloneConfig) {
            config.indexer = mapContainerPort(env, config.indexer, "baby-indexer");
            config.indexerWS = mapContainerPort(env, config.indexerWS, "baby-indexer");
            config.node = mapContainerPort(env, config.node, "baby-node");
            config.proofServer = mapContainerPort(env, config.proofServer, "baby-proof-server");
        }
    }
    const wallet1 = await buildWallet(config, rli);
    const wallet = await wallet1.wallet;
    try {
        if (wallet !== null) {
            const providers = await api.configureProviders(wallet, config);
            await mainLoop(providers, rli, wallet1.seed);
        }
    }
    catch (e) {
        if (e instanceof Error) {
            logger.error(`Found error '${e.message}'`);
            logger.info("Exiting...");
            logger.debug(`${e.stack}`);
        }
        else {
            throw e;
        }
    }
    finally {
        try {
            rli.close();
            rli.removeAllListeners();
        }
        catch (e) {
            logger.error(`Error closing readline interface: ${e}`);
        }
        finally {
            try {
                if (wallet !== null) {
                    await wallet.close();
                }
            }
            catch (e) {
                logger.error(`Error closing wallet: ${e}`);
            }
            finally {
                try {
                    if (env !== undefined) {
                        await env.down();
                        logger.info("Goodbye");
                    }
                }
                catch (e) {
                    logger.error(`Error shutting down docker environment: ${e}`);
                }
            }
        }
    }
};
//# sourceMappingURL=cli.js.map