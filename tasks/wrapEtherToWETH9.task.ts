import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

export default (task: any) =>
  task('weth', 'Wraps native ETH to WETH9 and sends to an address.')
    .addOptionalParam(
      'weth',
      'Define an address of WETH9 instance.',
      '0x75E31C6b5e44D7D6Cb56c451488CD5D910C497bf',
      types.string,
    )
    .addOptionalParam(
      'address',
      'Define an address that will receive WETH9.',
      '0xdca49F439309E35B76D316303dB7BE658c619DAB',
      types.string,
    )
    .addOptionalParam(
      'amount',
      'Define an amount in ether units.',
      '0.1',
      types.string,
    )
    .addOptionalParam(
      'confirmatins',
      'Define an amount confirmations to wait.',
      1,
      types.int,
    )
    .setAction(
      async (
        { address, amount, weth, confirmations }: { address: string, amount: string, weth: string, confirmations: number },
        hre: HardhatRuntimeEnvironment
      ) => {
        console.log(`Wrapping ${amount} ETH to be converted to WETH9 and sent to ${address}...`);
        const wethInstance = await hre.ethers.getContractAt("WETH9", weth)
        const amountWei = hre.ethers.parseEther(amount);
        const depositTx = await wethInstance.deposit({ value: amountWei });
        await depositTx.wait(confirmations);
        console.log(`WETH9 is minted: ${depositTx.hash}.`);
        console.log(`Sending ${amount} WETH to ${address}...`);
        const transferTx = await wethInstance.transfer(address, amountWei);
        await transferTx.wait(confirmations);
        console.log(`WETH is transferred: ${transferTx.hash}`);
      },
    );
