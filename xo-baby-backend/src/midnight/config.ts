import {
  NetworkId,
  setNetworkId,
} from '@midnight-ntwrk/midnight-js-network-id';
import path from 'node:path';

// Get current directory
export const currentDir = path.resolve(__dirname, '..');

// Contract configuration interface
interface ContractConfig {
  privateStateStoreName: string;
  zkConfigPath: string;
}

// Contract configuration
export const contractConfig: ContractConfig = {
  privateStateStoreName: 'baby-health-private-state',
  zkConfigPath: path.resolve(
    currentDir,
    '..',
    '..',
    'contract',
    'src',
    'managed',
    'baby-health',
  ),
};

// Base configuration interface
interface BaseConfig {
  logDir: string;
  indexer: string;
  indexerWS: string;
  node: string;
  proofServer: string;
}

// Standalone configuration class
export class StandaloneConfig implements BaseConfig {
  public readonly logDir: string = path.resolve(
    currentDir,
    '..',
    'logs',
    'standalone',
    `${new Date().toISOString()}.log`,
  );

  public readonly indexer: string = 'http://127.0.0.1:8088/api/v1/graphql';
  public readonly indexerWS: string = 'ws://127.0.0.1:8088/api/v1/graphql/ws';
  public readonly node: string = 'http://127.0.0.1:9944';
  public readonly proofServer: string = 'http://127.0.0.1:6300';

  constructor() {
    setNetworkId(NetworkId.Undeployed);
  }
}

// Testnet remote configuration class
export class TestnetRemoteConfig implements BaseConfig {
  public readonly logDir: string = path.resolve(
    currentDir,
    '..',
    'logs',
    'testnet-remote',
    `${new Date().toISOString()}.log`,
  );

  public readonly indexer: string =
    'https://indexer.testnet-02.midnight.network/api/v1/graphql';
  public readonly indexerWS: string =
    'wss://indexer.testnet-02.midnight.network/api/v1/graphql/ws';
  public readonly node: string = 'https://rpc.testnet-02.midnight.network';
  public readonly proofServer: string = 'http://127.0.0.1:6300';

  constructor() {
    setNetworkId(NetworkId.TestNet);
  }
}

// Export types for external use
export type { BaseConfig, ContractConfig };
