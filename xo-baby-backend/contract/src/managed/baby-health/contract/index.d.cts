import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type CoinInfo = { nonce: Uint8Array; color: Uint8Array; value: bigint };

export type Witnesses<T> = {
}

export type ImpureCircuits<T> = {
  generateNFTId(context: __compactRuntime.CircuitContext<T>,
                firstname_0: Uint8Array,
                lastname_0: Uint8Array,
                email_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  generateRoleBasedNFT(context: __compactRuntime.CircuitContext<T>,
                       nftId_0: Uint8Array,
                       role_0: Uint8Array,
                       validUntil_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getRoleFromNFT(context: __compactRuntime.CircuitContext<T>,
                 nftId_0: Uint8Array): __compactRuntime.CircuitResults<T, { role: Uint8Array,
                                                                            validUntil: Uint8Array
                                                                          }>;
  createChildId(context: __compactRuntime.CircuitContext<T>,
                name_0: Uint8Array,
                birthDate_0: Uint8Array,
                gender_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  generateChildNFT(context: __compactRuntime.CircuitContext<T>,
                   childId_0: Uint8Array,
                   CID_0: Uint8Array,
                   AESkey_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getDataFromChildNFT(context: __compactRuntime.CircuitContext<T>,
                      childId_0: Uint8Array): __compactRuntime.CircuitResults<T, { childId: Uint8Array,
                                                                                   ipfsLink: Uint8Array,
                                                                                   AESkey: Uint8Array
                                                                                 }>;
  removeRoleNFT(context: __compactRuntime.CircuitContext<T>, nftId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  removeChildNFT(context: __compactRuntime.CircuitContext<T>,
                 childId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
}

export type PureCircuits = {
}

export type Circuits<T> = {
  generateNFTId(context: __compactRuntime.CircuitContext<T>,
                firstname_0: Uint8Array,
                lastname_0: Uint8Array,
                email_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  generateRoleBasedNFT(context: __compactRuntime.CircuitContext<T>,
                       nftId_0: Uint8Array,
                       role_0: Uint8Array,
                       validUntil_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getRoleFromNFT(context: __compactRuntime.CircuitContext<T>,
                 nftId_0: Uint8Array): __compactRuntime.CircuitResults<T, { role: Uint8Array,
                                                                            validUntil: Uint8Array
                                                                          }>;
  createChildId(context: __compactRuntime.CircuitContext<T>,
                name_0: Uint8Array,
                birthDate_0: Uint8Array,
                gender_0: Uint8Array): __compactRuntime.CircuitResults<T, Uint8Array>;
  generateChildNFT(context: __compactRuntime.CircuitContext<T>,
                   childId_0: Uint8Array,
                   CID_0: Uint8Array,
                   AESkey_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  getDataFromChildNFT(context: __compactRuntime.CircuitContext<T>,
                      childId_0: Uint8Array): __compactRuntime.CircuitResults<T, { childId: Uint8Array,
                                                                                   ipfsLink: Uint8Array,
                                                                                   AESkey: Uint8Array
                                                                                 }>;
  removeRoleNFT(context: __compactRuntime.CircuitContext<T>, nftId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
  removeChildNFT(context: __compactRuntime.CircuitContext<T>,
                 childId_0: Uint8Array): __compactRuntime.CircuitResults<T, []>;
}

export type Ledger = {
  readonly round: bigint;
  readonly nonce: Uint8Array;
  readonly tvl: bigint;
  roleNFTs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { role: Uint8Array, validUntil: Uint8Array };
    [Symbol.iterator](): Iterator<[Uint8Array, { role: Uint8Array, validUntil: Uint8Array }]>
  };
  childNFTs: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): { childId: Uint8Array,
                                 ipfsLink: Uint8Array,
                                 AESkey: Uint8Array
                               };
    [Symbol.iterator](): Iterator<[Uint8Array, { childId: Uint8Array, ipfsLink: Uint8Array, AESkey: Uint8Array }]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<T, W extends Witnesses<T> = Witnesses<T>> {
  witnesses: W;
  circuits: Circuits<T>;
  impureCircuits: ImpureCircuits<T>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<T>,
               initNonce_0: Uint8Array): __compactRuntime.ConstructorResult<T>;
}

export declare function ledger(state: __compactRuntime.StateValue): Ledger;
export declare const pureCircuits: PureCircuits;
