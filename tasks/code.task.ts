import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default (task: any) =>
  task('code', 'Shows the bytecode behind the address (to check if the address is a smart-contract).')
    .addOptionalParam(
      'address',
      'Define an address.',
      '0x8e7E3facbE3e6d041dFc105dE3506e6f2AE965c2', // random address for example
      types.string,
    )
    .addOptionalParam(
      'slice',
      'Define the size of a slize from both ends of the bytecode. (pass: 0 and it will give the whole bytecode as is)',
      10,
      types.int,
    )
    .setAction(
      async ({ address, slice }: { address: string, slice: number }, hre: HardhatRuntimeEnvironment) => {
        console.log(`Requesting bytecode of ${address}...`);
        const bytecodeString: string = await hre.network.provider.request({
          method: 'eth_getCode',
          params: [address, "latest"],
        }) as string;
        if (slice === 0) {
          console.log(bytecodeString);
        } else {
          console.log(`${bytecodeString.substring(0, slice)}...${bytecodeString.substring(bytecodeString.length - slice, bytecodeString.length)}`);
        }
        console.log(`Bytecode size: ${(bytecodeString.length / 2) - 1} bytes`)
      },
    );
