import {
  BabyHealth,
  type BabyHealthPrivateState,
} from '@midnight-ntwrk/baby-contract';
import {
  DeployedContract,
  FoundContract,
} from '@midnight-ntwrk/midnight-js-contracts';
import {
  type Contract,
  type Witnesses,
  type MidnightProviders,
  type ImpureCircuitId,
} from '@midnight-ntwrk/midnight-js-types';

export const BabyHealthPrivateStateId = 'BabyHealthPrivateState';

export type BabyHealthCircuits = ImpureCircuitId<
  BabyHealth.Contract<BabyHealthPrivateState>
>;

export type BabyHealthContract = BabyHealth.Contract<BabyHealthPrivateState>;

export type BabyHealthProviders = MidnightProviders<
  BabyHealthCircuits,
  typeof BabyHealthPrivateStateId,
  BabyHealthPrivateState
>;

export type DeployedBabyHealthContract =
  | DeployedContract<BabyHealthContract>
  | FoundContract<BabyHealthContract>;
