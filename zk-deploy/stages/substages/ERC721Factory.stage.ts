import { HardhatRuntimeEnvironment } from "hardhat/types";
import { StagePriority, deployContract } from "../../../scripts/typescript/helpers/zkSync.helper";

const stage = async (hre: HardhatRuntimeEnvironment) => {
  await deployContract(
    hre,
    "ERC721Factory",
    [],
    {
      noVerify: false
    }
  );
}

stage.priority = StagePriority.HIGH;
stage.tags = ["factory721"];

export default stage;