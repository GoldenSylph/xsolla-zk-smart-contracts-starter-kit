import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getZkSyncDeployerAndWallet } from '../scripts/typescript/helpers/zkSync.helper';

export default (task: any) =>
  task('eth', 'Get native balance of an address.')
    .setAction(
      async (_: any, hre: HardhatRuntimeEnvironment) => {
        const { wallet } = await getZkSyncDeployerAndWallet(hre);
        console.log(`${hre.ethers.formatEther(await wallet.getBalance())} ETH`);
      },
    );
