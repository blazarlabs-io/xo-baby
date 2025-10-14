import { TestnetRemoteConfig } from "./config.js";
import { createLogger } from "./logger-utils.js";
import { run } from "./cli.js";
const config = new TestnetRemoteConfig();
const logger = await createLogger(config.logDir);
await run(config, logger);
//# sourceMappingURL=testnet-remote.js.map