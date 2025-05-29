import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getZkSyncDeployerAndWallet } from '../scripts/typescript/helpers/zkSync.helper';

export default (task: any) =>
  task('account', 'Shows the deployer address.')
    .setAction(
      async (_: any, hre: HardhatRuntimeEnvironment) => {
        const { wallet } = await getZkSyncDeployerAndWallet(hre);
        console.log(`Deployer address: ${await wallet.getAddress()}`);
      },
    );
