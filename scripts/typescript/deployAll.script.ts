import hardhatRuntimeEnvironment from 'hardhat';
import { convertStageToFixture } from './helpers/zkSync.helper';

async function main(hre: any) {
  const signers = await hre.ethers.getSigners();
  const ownerAddr = await signers[0].getAddress();
  const deployedContracts: any = await (convertStageToFixture(hre, "all"))();
  console.log(`ERC20Factory address: ${await deployedContracts.ERC20Factory.getAddress()}`);
  console.log(`ERC721Factory address: ${await deployedContracts.ERC721Factory.getAddress()}`);
  console.log(`ERC1155Factory implementation address: ${await deployedContracts.ERC1155Factory.getAddress()}`);
  console.log(`Owner address: ${ownerAddr}`);
}

main(hardhatRuntimeEnvironment).catch(console.error);
