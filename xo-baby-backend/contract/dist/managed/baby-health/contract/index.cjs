'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.8.1';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(128);

class _encryptedData_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()));
  }
  fromValue(value_0) {
    return {
      childId: _descriptor_0.fromValue(value_0),
      ipfsLink: _descriptor_1.fromValue(value_0),
      AESkey: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.childId).concat(_descriptor_1.toValue(value_0.ipfsLink).concat(_descriptor_1.toValue(value_0.AESkey)));
  }
}

const _descriptor_2 = new _encryptedData_0();

class _RoleNFT_0 {
  alignment() {
    return _descriptor_0.alignment().concat(_descriptor_0.alignment());
  }
  fromValue(value_0) {
    return {
      role: _descriptor_0.fromValue(value_0),
      validUntil: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.role).concat(_descriptor_0.toValue(value_0.validUntil));
  }
}

const _descriptor_3 = new _RoleNFT_0();

const _descriptor_4 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_5 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

const _descriptor_7 = new __compactRuntime.CompactTypeField();

const _descriptor_8 = new __compactRuntime.CompactTypeVector(4, _descriptor_0);

const _descriptor_9 = new __compactRuntime.CompactTypeVector(5, _descriptor_0);

const _descriptor_10 = new __compactRuntime.CompactTypeVector(3, _descriptor_7);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_0.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_0.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_0.toValue(value_0.bytes);
  }
}

const _descriptor_11 = new _ContractAddress_0();

const _descriptor_12 = new __compactRuntime.CompactTypeBoolean();

const _descriptor_13 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1)
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object')
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    this.witnesses = witnesses_0;
    this.circuits = {
      generateNFTId: (...args_1) => {
        if (args_1.length !== 4)
          throw new __compactRuntime.CompactError(`generateNFTId: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const firstname_0 = args_1[1];
        const lastname_0 = args_1[2];
        const email_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('generateNFTId',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 24 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(firstname_0.buffer instanceof ArrayBuffer && firstname_0.BYTES_PER_ELEMENT === 1 && firstname_0.length === 32))
          __compactRuntime.type_error('generateNFTId',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 24 char 1',
                                      'Bytes<32>',
                                      firstname_0)
        if (!(lastname_0.buffer instanceof ArrayBuffer && lastname_0.BYTES_PER_ELEMENT === 1 && lastname_0.length === 32))
          __compactRuntime.type_error('generateNFTId',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'baby.compact line 24 char 1',
                                      'Bytes<32>',
                                      lastname_0)
        if (!(email_0.buffer instanceof ArrayBuffer && email_0.BYTES_PER_ELEMENT === 1 && email_0.length === 32))
          __compactRuntime.type_error('generateNFTId',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'baby.compact line 24 char 1',
                                      'Bytes<32>',
                                      email_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(firstname_0).concat(_descriptor_0.toValue(lastname_0).concat(_descriptor_0.toValue(email_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_generateNFTId_0(context,
                                                partialProofData,
                                                firstname_0,
                                                lastname_0,
                                                email_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      generateRoleBasedNFT: (...args_1) => {
        if (args_1.length !== 4)
          throw new __compactRuntime.CompactError(`generateRoleBasedNFT: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const nftId_0 = args_1[1];
        const role_0 = args_1[2];
        const validUntil_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('generateRoleBasedNFT',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 36 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(nftId_0.buffer instanceof ArrayBuffer && nftId_0.BYTES_PER_ELEMENT === 1 && nftId_0.length === 32))
          __compactRuntime.type_error('generateRoleBasedNFT',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 36 char 1',
                                      'Bytes<32>',
                                      nftId_0)
        if (!(role_0.buffer instanceof ArrayBuffer && role_0.BYTES_PER_ELEMENT === 1 && role_0.length === 32))
          __compactRuntime.type_error('generateRoleBasedNFT',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'baby.compact line 36 char 1',
                                      'Bytes<32>',
                                      role_0)
        if (!(validUntil_0.buffer instanceof ArrayBuffer && validUntil_0.BYTES_PER_ELEMENT === 1 && validUntil_0.length === 32))
          __compactRuntime.type_error('generateRoleBasedNFT',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'baby.compact line 36 char 1',
                                      'Bytes<32>',
                                      validUntil_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(nftId_0).concat(_descriptor_0.toValue(role_0).concat(_descriptor_0.toValue(validUntil_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_generateRoleBasedNFT_0(context,
                                                       partialProofData,
                                                       nftId_0,
                                                       role_0,
                                                       validUntil_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getRoleFromNFT: (...args_1) => {
        if (args_1.length !== 2)
          throw new __compactRuntime.CompactError(`getRoleFromNFT: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const nftId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('getRoleFromNFT',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 50 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(nftId_0.buffer instanceof ArrayBuffer && nftId_0.BYTES_PER_ELEMENT === 1 && nftId_0.length === 32))
          __compactRuntime.type_error('getRoleFromNFT',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 50 char 1',
                                      'Bytes<32>',
                                      nftId_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(nftId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_getRoleFromNFT_0(context,
                                                 partialProofData,
                                                 nftId_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      createChildId: (...args_1) => {
        if (args_1.length !== 4)
          throw new __compactRuntime.CompactError(`createChildId: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const name_0 = args_1[1];
        const birthDate_0 = args_1[2];
        const gender_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('createChildId',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 56 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(name_0.buffer instanceof ArrayBuffer && name_0.BYTES_PER_ELEMENT === 1 && name_0.length === 32))
          __compactRuntime.type_error('createChildId',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 56 char 1',
                                      'Bytes<32>',
                                      name_0)
        if (!(birthDate_0.buffer instanceof ArrayBuffer && birthDate_0.BYTES_PER_ELEMENT === 1 && birthDate_0.length === 32))
          __compactRuntime.type_error('createChildId',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'baby.compact line 56 char 1',
                                      'Bytes<32>',
                                      birthDate_0)
        if (!(gender_0.buffer instanceof ArrayBuffer && gender_0.BYTES_PER_ELEMENT === 1 && gender_0.length === 32))
          __compactRuntime.type_error('createChildId',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'baby.compact line 56 char 1',
                                      'Bytes<32>',
                                      gender_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(name_0).concat(_descriptor_0.toValue(birthDate_0).concat(_descriptor_0.toValue(gender_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_0.alignment().concat(_descriptor_0.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_createChildId_0(context,
                                                partialProofData,
                                                name_0,
                                                birthDate_0,
                                                gender_0);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      generateChildNFT: (...args_1) => {
        if (args_1.length !== 4)
          throw new __compactRuntime.CompactError(`generateChildNFT: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const childId_0 = args_1[1];
        const CID_0 = args_1[2];
        const AESkey_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('generateChildNFT',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 78 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(childId_0.buffer instanceof ArrayBuffer && childId_0.BYTES_PER_ELEMENT === 1 && childId_0.length === 32))
          __compactRuntime.type_error('generateChildNFT',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 78 char 1',
                                      'Bytes<32>',
                                      childId_0)
        if (!(CID_0.buffer instanceof ArrayBuffer && CID_0.BYTES_PER_ELEMENT === 1 && CID_0.length === 128))
          __compactRuntime.type_error('generateChildNFT',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'baby.compact line 78 char 1',
                                      'Bytes<128>',
                                      CID_0)
        if (!(AESkey_0.buffer instanceof ArrayBuffer && AESkey_0.BYTES_PER_ELEMENT === 1 && AESkey_0.length === 128))
          __compactRuntime.type_error('generateChildNFT',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'baby.compact line 78 char 1',
                                      'Bytes<128>',
                                      AESkey_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(childId_0).concat(_descriptor_1.toValue(CID_0).concat(_descriptor_1.toValue(AESkey_0))),
            alignment: _descriptor_0.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_generateChildNFT_0(context,
                                                   partialProofData,
                                                   childId_0,
                                                   CID_0,
                                                   AESkey_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getDataFromChildNFT: (...args_1) => {
        if (args_1.length !== 2)
          throw new __compactRuntime.CompactError(`getDataFromChildNFT: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const childId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('getDataFromChildNFT',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 88 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(childId_0.buffer instanceof ArrayBuffer && childId_0.BYTES_PER_ELEMENT === 1 && childId_0.length === 32))
          __compactRuntime.type_error('getDataFromChildNFT',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 88 char 1',
                                      'Bytes<32>',
                                      childId_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(childId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_getDataFromChildNFT_0(context,
                                                      partialProofData,
                                                      childId_0);
        partialProofData.output = { value: _descriptor_2.toValue(result_0), alignment: _descriptor_2.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      removeRoleNFT: (...args_1) => {
        if (args_1.length !== 2)
          throw new __compactRuntime.CompactError(`removeRoleNFT: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const nftId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('removeRoleNFT',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 93 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(nftId_0.buffer instanceof ArrayBuffer && nftId_0.BYTES_PER_ELEMENT === 1 && nftId_0.length === 32))
          __compactRuntime.type_error('removeRoleNFT',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 93 char 1',
                                      'Bytes<32>',
                                      nftId_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(nftId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_removeRoleNFT_0(context,
                                                partialProofData,
                                                nftId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      removeChildNFT: (...args_1) => {
        if (args_1.length !== 2)
          throw new __compactRuntime.CompactError(`removeChildNFT: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        const contextOrig_0 = args_1[0];
        const childId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined))
          __compactRuntime.type_error('removeChildNFT',
                                      'argument 1 (as invoked from Typescript)',
                                      'baby.compact line 97 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        if (!(childId_0.buffer instanceof ArrayBuffer && childId_0.BYTES_PER_ELEMENT === 1 && childId_0.length === 32))
          __compactRuntime.type_error('removeChildNFT',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'baby.compact line 97 char 1',
                                      'Bytes<32>',
                                      childId_0)
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_0.toValue(childId_0),
            alignment: _descriptor_0.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this.#_removeChildNFT_0(context,
                                                 partialProofData,
                                                 childId_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      generateNFTId: this.circuits.generateNFTId,
      generateRoleBasedNFT: this.circuits.generateRoleBasedNFT,
      getRoleFromNFT: this.circuits.getRoleFromNFT,
      createChildId: this.circuits.createChildId,
      generateChildNFT: this.circuits.generateChildNFT,
      getDataFromChildNFT: this.circuits.getDataFromChildNFT,
      removeRoleNFT: this.circuits.removeRoleNFT,
      removeChildNFT: this.circuits.removeChildNFT
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 2)
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 2 arguments (as invoked from Typescript), received ${args_0.length}`);
    const constructorContext_0 = args_0[0];
    const initNonce_0 = args_0[1];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!(initNonce_0.buffer instanceof ArrayBuffer && initNonce_0.BYTES_PER_ELEMENT === 1 && initNonce_0.length === 32))
      __compactRuntime.type_error('Contract state constructor',
                                  'argument 1 (argument 2 as invoked from Typescript)',
                                  'baby.compact line 18 char 1',
                                  'Bytes<32>',
                                  initNonce_0)
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('generateNFTId', new __compactRuntime.ContractOperation());
    state_0.setOperation('generateRoleBasedNFT', new __compactRuntime.ContractOperation());
    state_0.setOperation('getRoleFromNFT', new __compactRuntime.ContractOperation());
    state_0.setOperation('createChildId', new __compactRuntime.ContractOperation());
    state_0.setOperation('generateChildNFT', new __compactRuntime.ContractOperation());
    state_0.setOperation('getDataFromChildNFT', new __compactRuntime.ContractOperation());
    state_0.setOperation('removeRoleNFT', new __compactRuntime.ContractOperation());
    state_0.setOperation('removeChildNFT', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(0n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(1n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(new Uint8Array(32)),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(2n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                            alignment: _descriptor_5.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(3n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(4n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(1n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(initNonce_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(0n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_4.toValue(tmp_0),
                                              alignment: _descriptor_4.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  #_transientHash_0(context, partialProofData, value_0) {
    const result_0 = __compactRuntime.transientHash(_descriptor_10, value_0);
    return result_0;
  }
  #_persistentHash_0(context, partialProofData, value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  #_persistentHash_1(context, partialProofData, value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  #_degradeToTransient_0(context, partialProofData, x_0) {
    const result_0 = __compactRuntime.degradeToTransient(x_0);
    return result_0;
  }
  #_upgradeFromTransient_0(context, partialProofData, x_0) {
    const result_0 = __compactRuntime.upgradeFromTransient(x_0);
    return result_0;
  }
  #_evolveNonce_0(context, partialProofData, index_0, nonce_0) {
    return this.#_upgradeFromTransient_0(context,
                                         partialProofData,
                                         this.#_transientHash_0(context,
                                                                partialProofData,
                                                                [__compactRuntime.convert_Uint8Array_to_bigint(28,
                                                                                                               new Uint8Array([109, 105, 100, 110, 105, 103, 104, 116, 58, 107, 101, 114, 110, 101, 108, 58, 110, 111, 110, 99, 101, 95, 101, 118, 111, 108, 118, 101])),
                                                                 index_0,
                                                                 this.#_degradeToTransient_0(context,
                                                                                             partialProofData,
                                                                                             nonce_0)]));
  }
  #_generateNFTId_0(context, partialProofData, firstname_0, lastname_0, email_0)
  {
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(0n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_4.toValue(tmp_0),
                                              alignment: _descriptor_4.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    const tokenId_0 = this.#_persistentHash_0(context,
                                              partialProofData,
                                              [new Uint8Array([98, 97, 98, 121, 58, 110, 102, 116, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                               firstname_0,
                                               lastname_0,
                                               email_0]);
    return tokenId_0;
  }
  #_generateRoleBasedNFT_0(context,
                           partialProofData,
                           nftId_0,
                           role_0,
                           validUntil_0)
  {
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(0n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_4.toValue(tmp_0),
                                              alignment: _descriptor_4.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    const roleNFT_0 = { role: role_0, validUntil: validUntil_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(3n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nftId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_3.toValue(roleNFT_0),
                                                                            alignment: _descriptor_3.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  #_getRoleFromNFT_0(context, partialProofData, nftId_0) {
    return _descriptor_3.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_13.toValue(3n),
                                                                               alignment: _descriptor_13.alignment() } }] } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_0.toValue(nftId_0),
                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  #_createChildId_0(context, partialProofData, name_0, birthDate_0, gender_0) {
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(0n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_4.toValue(tmp_0),
                                              alignment: _descriptor_4.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    const tmp_1 = this.#_evolveNonce_0(context,
                                       partialProofData,
                                       _descriptor_5.fromValue(Contract._query(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_13.toValue(0n),
                                                                                                           alignment: _descriptor_13.alignment() } }] } },
                                                                                { popeq: { cached: true,
                                                                                           result: undefined } }]).value),
                                       _descriptor_0.fromValue(Contract._query(context,
                                                                               partialProofData,
                                                                               [
                                                                                { dup: { n: 0 } },
                                                                                { idx: { cached: false,
                                                                                         pushPath: false,
                                                                                         path: [
                                                                                                { tag: 'value',
                                                                                                  value: { value: _descriptor_13.toValue(1n),
                                                                                                           alignment: _descriptor_13.alignment() } }] } },
                                                                                { popeq: { cached: false,
                                                                                           result: undefined } }]).value));
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_13.toValue(1n),
                                                                            alignment: _descriptor_13.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(tmp_1),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const childId_0 = this.#_persistentHash_1(context,
                                              partialProofData,
                                              [new Uint8Array([98, 97, 98, 121, 58, 99, 104, 105, 108, 100, 58, 105, 100, 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                               name_0,
                                               birthDate_0,
                                               gender_0,
                                               _descriptor_0.fromValue(Contract._query(context,
                                                                                       partialProofData,
                                                                                       [
                                                                                        { dup: { n: 0 } },
                                                                                        { idx: { cached: false,
                                                                                                 pushPath: false,
                                                                                                 path: [
                                                                                                        { tag: 'value',
                                                                                                          value: { value: _descriptor_13.toValue(1n),
                                                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                                                        { popeq: { cached: false,
                                                                                                   result: undefined } }]).value)]);
    return childId_0;
  }
  #_generateChildNFT_0(context, partialProofData, childId_0, CID_0, AESkey_0) {
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(0n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_4.toValue(tmp_0),
                                              alignment: _descriptor_4.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    const datum_0 = { childId: childId_0, ipfsLink: CID_0, AESkey: AESkey_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(4n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(childId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(datum_0),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  #_getDataFromChildNFT_0(context, partialProofData, childId_0) {
    return _descriptor_2.fromValue(Contract._query(context,
                                                   partialProofData,
                                                   [
                                                    { dup: { n: 0 } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_13.toValue(4n),
                                                                               alignment: _descriptor_13.alignment() } }] } },
                                                    { idx: { cached: false,
                                                             pushPath: false,
                                                             path: [
                                                                    { tag: 'value',
                                                                      value: { value: _descriptor_0.toValue(childId_0),
                                                                               alignment: _descriptor_0.alignment() } }] } },
                                                    { popeq: { cached: false,
                                                               result: undefined } }]).value);
  }
  #_removeRoleNFT_0(context, partialProofData, nftId_0) {
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(3n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(nftId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { rem: { cached: false } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  #_removeChildNFT_0(context, partialProofData, childId_0) {
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_13.toValue(4n),
                                                alignment: _descriptor_13.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(childId_0),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { rem: { cached: false } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get round() {
      return _descriptor_5.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_13.toValue(0n),
                                                                                 alignment: _descriptor_13.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    get nonce() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_13.toValue(1n),
                                                                                 alignment: _descriptor_13.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    },
    get tvl() {
      return _descriptor_5.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_13.toValue(2n),
                                                                                 alignment: _descriptor_13.alignment() } }] } },
                                                      { popeq: { cached: false,
                                                                 result: undefined } }]).value);
    },
    roleNFTs: {
      isEmpty(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_12.fromValue(Contract._query(context,
                                                        partialProofData,
                                                        [
                                                         { dup: { n: 0 } },
                                                         { idx: { cached: false,
                                                                  pushPath: false,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_13.toValue(3n),
                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                         'size',
                                                         { push: { storage: false,
                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                                alignment: _descriptor_5.alignment() }).encode() } },
                                                         'eq',
                                                         { popeq: { cached: true,
                                                                    result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_13.toValue(3n),
                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32))
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'baby.compact line 16 char 1',
                                      'Bytes<32>',
                                      key_0)
        return _descriptor_12.fromValue(Contract._query(context,
                                                        partialProofData,
                                                        [
                                                         { dup: { n: 0 } },
                                                         { idx: { cached: false,
                                                                  pushPath: false,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_13.toValue(3n),
                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                         { push: { storage: false,
                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                                         'member',
                                                         { popeq: { cached: true,
                                                                    result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32))
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'baby.compact line 16 char 1',
                                      'Bytes<32>',
                                      key_0)
        return _descriptor_3.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_13.toValue(3n),
                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        const self_0 = state.asArray()[3];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_3.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    },
    childNFTs: {
      isEmpty(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_12.fromValue(Contract._query(context,
                                                        partialProofData,
                                                        [
                                                         { dup: { n: 0 } },
                                                         { idx: { cached: false,
                                                                  pushPath: false,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_13.toValue(4n),
                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                         'size',
                                                         { push: { storage: false,
                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_5.toValue(0n),
                                                                                                                alignment: _descriptor_5.alignment() }).encode() } },
                                                         'eq',
                                                         { popeq: { cached: true,
                                                                    result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_13.toValue(4n),
                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32))
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'baby.compact line 76 char 1',
                                      'Bytes<32>',
                                      key_0)
        return _descriptor_12.fromValue(Contract._query(context,
                                                        partialProofData,
                                                        [
                                                         { dup: { n: 0 } },
                                                         { idx: { cached: false,
                                                                  pushPath: false,
                                                                  path: [
                                                                         { tag: 'value',
                                                                           value: { value: _descriptor_13.toValue(4n),
                                                                                    alignment: _descriptor_13.alignment() } }] } },
                                                         { push: { storage: false,
                                                                   value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(key_0),
                                                                                                                alignment: _descriptor_0.alignment() }).encode() } },
                                                         'member',
                                                         { popeq: { cached: true,
                                                                    result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1)
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32))
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'baby.compact line 76 char 1',
                                      'Bytes<32>',
                                      key_0)
        return _descriptor_2.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_13.toValue(4n),
                                                                                   alignment: _descriptor_13.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_0.toValue(key_0),
                                                                                   alignment: _descriptor_0.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0)
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        const self_0 = state.asArray()[4];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_0.fromValue(key.value),      _descriptor_2.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({ });
const pureCircuits = { };
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
