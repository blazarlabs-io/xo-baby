export const createBabyhealthPrivateState = (secretKey) => ({ secretKey });
export const witnesses = {
    localSecretKey: ({ privateState, }) => [privateState, privateState.secretKey],
};
//# sourceMappingURL=witnesses.js.map