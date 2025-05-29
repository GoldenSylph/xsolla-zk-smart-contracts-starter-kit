function mapValues(obj: any, fn: any) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v)]));
}
const formatType = (schema: any) => Object.entries(schema).map(([name, type]) => ({ name, type }));

export default mapValues(
  {
    EIP712Domain: {
      name: 'string',
      version: 'string',
      chainId: 'uint256',
      verifyingContract: 'address',
      salt: 'bytes32',
    },
    ForwardRequest: {
      from: 'address',
      to: 'address',
      value: 'uint256',
      gas: 'uint256',
      nonce: 'uint256',
      deadline: 'uint48',
      data: 'bytes',
    },
  },
  formatType,
);
const _formatType = formatType;
export { _formatType as formatType };
