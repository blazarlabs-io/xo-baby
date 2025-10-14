import { WitnessContext } from "@midnight-ntwrk/compact-runtime";
import { Ledger } from "./managed/baby-health/contract/index.cjs";
export type BabyHealthPrivateState = {
    readonly secretKey: Uint8Array;
};
export declare const createBabyhealthPrivateState: (secretKey: Uint8Array) => BabyHealthPrivateState;
export declare const witnesses: {
    localSecretKey: ({ privateState, }: WitnessContext<Ledger, BabyHealthPrivateState>) => [BabyHealthPrivateState, Uint8Array];
};
