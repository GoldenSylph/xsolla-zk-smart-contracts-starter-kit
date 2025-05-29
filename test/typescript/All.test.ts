import hre, { ethers } from 'hardhat';
import { ZeroAddress, parseEther } from 'ethers';
import { expect } from "chai";
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { Contract } from "ethers";

import { ERC721Factory, ERC20Factory, ERC1155Factory } from '../../typechain-types';
import { convertStageToFixture } from '../../scripts/typescript/helpers/zkSync.helper';
import { getEventBody } from '../../scripts/typescript/helpers/utils.helper';

describe('Stage "all" is deployed', () => {
  let factory721: ERC721Factory;
  let factory20: ERC20Factory;
  let factory1155: ERC1155Factory;
  let owner: HardhatEthersSigner;

  let deployedContracts: any;

  before(async () => {
    [owner] = await ethers.getSigners();
    deployedContracts = await (convertStageToFixture(hre, "all"))();
    factory1155 = deployedContracts.ERC1155Factory;
    factory20 = deployedContracts.ERC20Factory;
    factory721 = deployedContracts.ERC721Factory;
  });

  describe('ERC721Factory', () => {
    it('should deploy a new default ERC721 collection and emit event', async () => {
      const tx = await factory721.deployDefaultCollection("TestCollection", "TST");
      await tx.wait();
      const args = await getEventBody("NewCollectionDeployed", factory721 as unknown as Contract);
      expect(args[0]).to.properAddress;
    });

    it('should deploy a new custom ERC721 collection and emit event', async () => {
      const fields = Array(8).fill({ name: "", value: "", displayType: "none" });
      fields[0] = { name: "Name: ", value: "Custom", displayType: "none" };
      const ipfsImage = "custom_ipfs_image";
      const tx = await factory721.deployCollection(
        fields,
        ipfsImage,
        "CustomCollection",
        "CST",
        5000
      );
      await tx.wait();
      const args = await getEventBody("NewCollectionDeployed", factory721 as unknown as Contract);
      expect(args[0]).to.properAddress;
    });
  });

  describe('ERC20Factory', () => {
    it('should deploy a new ERC20 token and emit event', async () => {
      const signers = await ethers.getSigners();
      const defaultAdmin = signers[0];
      const pauser = signers[1];
      const minter = signers[2];
      const tx = await factory20.deployERC20(
        "TestToken",
        "TTK",
        defaultAdmin.address,
        pauser.address,
        minter.address
      );
      await tx.wait();
      const args = await getEventBody("NewERC20Deployed", factory20 as unknown as Contract);
      expect(args[0]).to.properAddress;
    });
  });

  describe('ERC1155Factory', () => {
    it('should deploy a new ERC1155 contract and emit event', async () => {
      const tx = await factory1155.deployCollection("https://test.uri/{id}.json");
      await tx.wait();
      const args = await getEventBody("NewCollectionDeployed", factory1155 as unknown as Contract);
      expect(args[0]).to.properAddress;
    });
  });
});
