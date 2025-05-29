import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getZkSyncDeployerAndWallet } from '../scripts/typescript/helpers/zkSync.helper';

export default (task: any) =>
  task('chain', 'Prints the chain info.')
    .setAction(
      async (_: any, hre: HardhatRuntimeEnvironment) => {
        console.log(`Chain ID: ${await hre.network.provider.request({
          method: "net_version",
          params: []
        })}`);
        console.log(`Current peers connected to the node count: ${await hre.network.provider.request({
          method: "net_peerCount",
          params: []
        })}`);
      },
    );
