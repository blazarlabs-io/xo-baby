import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from "./managed/baby-health/contract/index.cjs";

export type BabyHealthPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createBabyhealthPrivateState = (
  secretKey: Uint8Array
): BabyHealthPrivateState => ({ secretKey });

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, BabyHealthPrivateState>): [
    BabyHealthPrivateState,
    Uint8Array
  ] => [privateState, privateState.secretKey],
};
