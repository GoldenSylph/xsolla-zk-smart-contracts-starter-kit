import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync";

import { StagePriority, log } from "../helpers/zkSync.helper";

export default (tag: string, priority: StagePriority) => {
  const stage = async (hre: HardhatRuntimeEnvironment) => {
    const deployerAddr: string = await (hre.deployer as unknown as Deployer).ethWallet.getAddress();
    log(`Some reusable stage (stage fabric) called under deployer: ${deployerAddr}`);
  }
  stage.priority = priority;
  stage.tags = [tag];
  return stage;
}