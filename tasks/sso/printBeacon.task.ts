import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";

import { getZkSyncDeployerAndWallet } from '../../scripts/typescript/helpers/zkSync.helper';

export default (task: any) =>
  task('beacon', 'Prints beacon and beacon bytecode hash from the AAFactory.')
    .addOptionalParam(
      'factory',
      'Define a AAFactory instance address.',
      '0xCE7aC63403f7209bE019Bba9fffc486bd544B1B7',
      types.string,
    )
    .setAction(
      async ({ factory }: { factory: string }, hre: HardhatRuntimeEnvironment) => {
        const factoryInstance = await hre.zksyncEthers.getContractAt("IGetBeacon", factory);
        console.log(`Beacon address: ${await factoryInstance.beacon()}`);
        console.log(`Beacon proxy bytecode hash: ${await factoryInstance.beaconProxyBytecodeHash()}`);
      },
    );
