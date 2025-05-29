import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getZkSyncDeployerAndWallet } from '../scripts/typescript/helpers/zkSync.helper';

export default (task: any) =>
  task('send', 'Send native ether to an address.')
    .addOptionalParam(
      'address',
      'Define an address.',
      '0xB1d82b5A1cb9BD70E6f48C259Df30634803d2DDe', // Default address for example
      types.string,
    )
    .addOptionalParam(
      'amount',
      'Define an amount in ether units.',
      '1',
      types.string,
    )
    .setAction(
      async ({ address, amount }: { address: string, amount: string }, hre: HardhatRuntimeEnvironment) => {
        const { wallet } = await getZkSyncDeployerAndWallet(hre);
        console.log(`Sending ${amount} ETH to ${address}...`);
        console.log(await wallet.sendTransaction({
          to: address,
          value: hre.ethers.parseEther(amount),
        }));
      },
    );
