import { ContractFactory } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy/dist/types";

import "@matterlabs/hardhat-zksync-node/dist/type-extensions";
import "@matterlabs/hardhat-zksync-verify/dist/src/type-extensions";

import { catchActionWhenArtifactNameIsAmbiguousOrNotFound, DeployContractOptions, log } from "./zkSync.helper";

export const conduitKeyGenerator = (deployerAddress: string) => `${deployerAddress}000000000000000000000000`; 

export const deployNewConduit = async (
  hre: HardhatRuntimeEnvironment,
  deployer: Deployer | HardhatEthersSigner,
  conduitController: any,
  zksync: boolean = true,
  options: DeployContractOptions = { silent: false }
) => {
  const conduitArtifactName = "Conduit";

  let conduitInfo: any;
  let conduitOne: any;
  let conduitKeyOne: string;
  let deployerAddress: string;

  if (zksync) {
    const conduitArtifact: ZkSyncArtifact = await (deployer as Deployer)
      .loadArtifact(conduitArtifactName)
      .catch(catchActionWhenArtifactNameIsAmbiguousOrNotFound(conduitArtifactName, deployer));
    deployerAddress = await (deployer as Deployer).ethWallet.getAddress();
    conduitKeyOne = conduitKeyGenerator(deployerAddress);
    conduitInfo = await conduitController.getConduit(conduitKeyOne);
    const conduitOneFactory = new ContractFactory(conduitArtifact.abi, conduitArtifact.bytecode, (deployer as Deployer).zkWallet);
    conduitOne = conduitOneFactory.attach(conduitInfo[0]);
  } else {
    deployerAddress = await (deployer as HardhatEthersSigner).getAddress();
    conduitKeyOne = conduitKeyGenerator(deployerAddress);
    conduitInfo = await conduitController.getConduit(conduitKeyOne);
    conduitOne = await hre.ethers.getContractAt(conduitArtifactName, conduitInfo[0]);
  }

  if (!conduitInfo[1]) {
    let createConduitTx = await conduitController.createConduit(conduitKeyOne, deployerAddress);
    await createConduitTx.wait();
    log(`Conduit created with key: ${conduitKeyOne} (existed: ${conduitInfo[1]}): ${conduitInfo[0]}`, options);
  } else {
    log(`Conduit already exists with key: ${conduitKeyOne} (code onchain exists: ${conduitInfo[1]}): ${conduitInfo[0]}`, options);
  }
  return conduitOne;
}