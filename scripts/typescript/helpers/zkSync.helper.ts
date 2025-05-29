import { Provider, Wallet, ContractFactory, utils } from "zksync-ethers";
import { Deployer } from "@matterlabs/hardhat-zksync";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployment, loadDeployment } from "@matterlabs/hardhat-zksync-deploy/dist/deployment-saver";
import { ZkSyncArtifact } from "@matterlabs/hardhat-zksync-deploy/dist/types";

import "@matterlabs/hardhat-zksync-node/dist/type-extensions";
import "@matterlabs/hardhat-zksync-verify/dist/src/type-extensions";
import { BytesLike } from "ethers";

export enum StagePriority {
  HIGH = 4,
  NORMAL = 3,
  LOW = 2,
  DEBUG = 1 // A priority for the stages that are just gathering info and printing it for debug purposes.
}

export type DeployContractOptions = {
  /**
   * If true, the deployment process will not print any logs
   */
  silent?: boolean;
  /**
   * If true, the contract will not be verified on Block Explorer
   */
  noVerify?: boolean;
  /**
   * If specified, the contract will be deployed using this wallet
   */
  wallet?: Wallet;
  /**
   * If specified, the contract will be deployed regardless if it was already deployed
   */
  forceDeploy?: boolean
  /**
   * If true, the contract will be deployed using TransparentUpgradeableProxy,
   */
  isTUP?: boolean;
  /** 
   * If defined, the contract or contracts (ONLY in case of `isTUP == true`, otherwise the param will be ignored) will be deployed using CREATE2.
  */
  salt?: BytesLike;
  /**
   * If specified, the contract will be deployed using this system factory dependencies.
   */
  factoryDeps?: Array<any>;
};

export const emptyStage = (tag: string, message: string, dependencies: Array<string>) => {
  const emptyDeployScript = async (_: HardhatRuntimeEnvironment) => {
    console.log(message);
  };
  emptyDeployScript.priority = StagePriority.HIGH;
  emptyDeployScript.tags = [tag];
  emptyDeployScript.dependencies = dependencies;
  return emptyDeployScript;
};

export async function getAddressOf(
  hre: HardhatRuntimeEnvironment,
  deployer: Deployer,
  artifactName: string
): Promise<string | undefined> {
  const zkArtifact: ZkSyncArtifact = await deployer
    .loadArtifact(artifactName)
    .catch(catchActionWhenArtifactNameIsAmbiguousOrNotFound(artifactName, deployer));
  const artifactDeployment: Deployment | undefined = await loadDeployment(hre, zkArtifact);
  if (artifactDeployment === undefined) {
    return;
  }
  // getting the newest deployment entry
  const lastDeploymentEntry = artifactDeployment.entries[artifactDeployment.entries.length - 1];
  return lastDeploymentEntry.address;
}

export const convertStageToFixture = (
  hre: HardhatRuntimeEnvironment,
  tag: string,
  options: DeployContractOptions = { silent: false }
) => async function fixture() {
  const deployedContracts: any = {};
  await hre.run("deploy-zksync", {
    tags: tag,
    network: hre.network.name
  })
  const allArtifacts = await hre.run('getAllArtifacts');
  const { deployer } = await getZkSyncDeployerAndWallet(hre, options);
  for (let i = 0; i < allArtifacts.length; i++) {
    const artifactName: string = allArtifacts[i].split(':')[1];
    const contractAddress = await getAddressOf(hre, deployer, artifactName);
    if (contractAddress === undefined) {
      continue;
    }
    deployedContracts[artifactName] = await hre.ethers.getContractAt(artifactName, contractAddress);
  }
  return deployedContracts;
};

export const log = (message: string, options: DeployContractOptions = { silent: false }) => {
  if (!options?.silent) console.log(message);
};

export const getProvider = (hre: HardhatRuntimeEnvironment) => {
  const rpcUrl = hre.network.config.url;
  if (!rpcUrl)
    throw `⛔️ RPC URL wasn't found in "${hre.network.name}"! Please add a "url" field to the network config in hardhat.config.ts`;

  // Initialize ZKsync Provider
  const provider = new Provider(rpcUrl);

  return provider;
};

export const verifyEnoughBalance = async (hre: HardhatRuntimeEnvironment, wallet: Wallet, amount: bigint) => {
  // Check if the wallet has enough balance
  // const balance = await wallet.getBalance();
  const balance = await getProvider(hre).getBalance(wallet.address, "latest");

  if (balance < amount)
    throw `⛔️ Wallet balance is too low! Required ${hre.ethers.formatEther(
      amount
    )} ETH, but current ${wallet.address} balance is ${hre.ethers.formatEther(
      balance
    )} ETH`;
};

/**
 * @param {string} data.contract The contract's path and name. E.g., "contracts/Greeter.sol:Greeter"
 */
export const verifyContract = async (
  hre: HardhatRuntimeEnvironment,
  data: {
    address: string;
    contract: string;
    constructorArguments: string;
    bytecode: string;
  }
) => {
  const verificationRequestId: number = await hre.run("verify:verify", {
    ...data,
    noCompile: true,
  });
  return verificationRequestId;
};

export async function getZkSyncDeployerAndWallet(
  hre: HardhatRuntimeEnvironment,
  options: DeployContractOptions = { silent: false }
): Promise<{ deployer: Deployer, wallet: Wallet }> {
  let deployer: Deployer;
  let wallet: Wallet;
  if (options?.wallet !== undefined) {
    wallet = options?.wallet;
    deployer = new Deployer(hre, wallet);
  } else {
    deployer = hre.deployer as unknown as Deployer;
    wallet = await hre.deployer.getWallet();
  }
  return {
    deployer, wallet
  }
}

export const catchActionWhenArtifactNameIsAmbiguousOrNotFound = (contractArtifactName: string, deployer: any, options: DeployContractOptions = { silent: false }, prioritizedPackages: Array<string> = ["@openzeppelin"]) =>
  (error: any) => {
    if (
      error?.message?.includes(
        `HH701: There are multiple artifacts for contract "${contractArtifactName}", please use a fully qualified name.`
      )
    ) {
      log(`Found ambiguity for artifact: ${contractArtifactName}`, options);
      const suggestionsSearchRegexp = new RegExp(`[\\w@\\/\\.\\-]+:${contractArtifactName}`, 'g');

      const matches = error.message.match(suggestionsSearchRegexp);

      if (matches) {
        const prioritized: string[] = [];
        const others: string[] = [];

        matches.forEach((match: string) => {
          const isPrioritized = prioritizedPackages.some((pkg: string) => match.startsWith(pkg));
          if (isPrioritized) {
            prioritized.push(match);
          } else {
            others.push(match);
          }
        });

        log(`Suggestions for contract "${contractArtifactName}":`, options);
        prioritized.concat(others).forEach((match, index) => {
          log(`${index + 1}. ${match}`, options);
        });
        const allMatches = [...prioritized, ...others];
        log(`Utilizing first from the prioritized set of suggested artifacts: ${allMatches[0]}`, options);
        return deployer.loadArtifact(allMatches[0]);
      } else {
        console.error("No suggestions for the disambiguation found.");
        console.error(error.message);
        throw `⛔️ Please solve the disambiguity of the artifact names yourself! Suggestion: either rename your contracts or use forked and renamed contracts from conflicting dependencies.`;
      }
    } else {
      return catchActionWhenArtifactIsNotFound(contractArtifactName)
    }
  }

export const catchActionWhenArtifactIsNotFound = (contractArtifactName: string) =>
  (error: any) => {
    if (
      error?.message?.includes(
        `Artifact for contract "${contractArtifactName}" not found.`
      )
    ) {
      console.error(error.message);
      throw `⛔️ Please make sure you have compiled your contracts or specified the correct contract name!`;
    } else {
      throw error;
    }
  }

export const fundPaymaster = async (
  hre: HardhatRuntimeEnvironment,
  paymasterAddress: string,
  options: DeployContractOptions = { silent: false, noVerify: true }
) => {
  const { wallet } = await getZkSyncDeployerAndWallet(hre, options);
  const deployerBalance = await wallet.getBalance();
  const txParams = {
    to: paymasterAddress,
    value: hre.network.name.includes("localhost") ? hre.ethers.parseEther('10') : deployerBalance / BigInt(100)
  };
  const tx = await wallet.sendTransaction(txParams);
  await tx.wait();

  log(`Paymaster under ${paymasterAddress} address has been funded: ${hre.ethers.formatEther(txParams.value)} ETH`, options);
}

const createAndIfPossibleVerify = async (
  hre: HardhatRuntimeEnvironment,
  options: DeployContractOptions,
  contractArtifactName: string,
  constructorArguments?: any[]
) => {
  log(`\nStarting CREATE process of "${contractArtifactName}"...`, options);

  const { deployer, wallet } = await getZkSyncDeployerAndWallet(hre, options);

  const artifact: any = await deployer
    .loadArtifact(contractArtifactName)
    .catch(catchActionWhenArtifactNameIsAmbiguousOrNotFound(contractArtifactName, deployer));

  if (!options.forceDeploy) {
    const possibleAddress = await getAddressOf(hre, deployer, contractArtifactName);
    if (possibleAddress !== undefined) {
      log(`Contract "${contractArtifactName} was already deployed at - ${possibleAddress}. Skipping..."`, options);
      log(`Check if contract needs verification...`, options);
      const alreadyDeployedContract = await hre.ethers.getContractAt(contractArtifactName, possibleAddress);
      try {
        await verifyContract(
          hre,
          {
            address: possibleAddress,
            contract: `${artifact.sourceName}:${artifact.contractName}`,
            constructorArguments: alreadyDeployedContract.interface.encodeDeploy(constructorArguments),
            bytecode: artifact.bytecode,
          }
        );
      } catch (error) {
        log(`Contract verification stopped:\n---\n${error}\n---\nSkipping this verification...`, options);
      }
      return alreadyDeployedContract;
    }
  }

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(
    artifact,
    constructorArguments || []
  );
  log(`Estimated deployment cost: ${hre.ethers.formatEther(deploymentFee)} ETH`, options);

  // Check if the wallet has enough balance
  await verifyEnoughBalance(hre, wallet, deploymentFee);

  // Deploy the contract to ZKsync
  const contract = await deployer.deploy(artifact, constructorArguments, "create", {}, options.factoryDeps);
  const address = await contract.getAddress();
  const constructorArgs = contract.interface.encodeDeploy(constructorArguments);
  const fullContractSource = `${artifact.sourceName}:${artifact.contractName}`;

  // Display contract deployment info
  log(`\n"${artifact.contractName}" was successfully deployed:`, options);
  log(` - Contract address: ${address}`, options);
  log(` - Contract source: ${fullContractSource}`, options);
  log(` - Encoded constructor arguments: ${constructorArgs}\n`, options);

  if (!options?.noVerify && hre.network.config.verifyURL) {
    log(`Requesting contract verification...`, options);
    try {
      await verifyContract(
        hre,
        {
          address,
          contract: fullContractSource,
          constructorArguments: constructorArgs,
          bytecode: artifact.bytecode,
        }
      );
    } catch (error) {
      log(`Contract verification failed:\n---\n${error}\n---\nSkipping this verification...`, options);
    }
  }
  return contract;
};

const create2AndIfPossibleVerify = async (
  hre: HardhatRuntimeEnvironment,
  options: DeployContractOptions,
  contractArtifactName: string,
  constructorArguments?: any[]
) => {
  log(`\nStarting CREATE2 process of "${contractArtifactName}"...`, options);
  options.salt = hre.ethers.hexlify(options.salt || hre.ethers.randomBytes(32));

  const { deployer, wallet } = await getZkSyncDeployerAndWallet(hre, options);

  const artifact: any = await deployer
    .loadArtifact(contractArtifactName)
    .catch(catchActionWhenArtifactNameIsAmbiguousOrNotFound(contractArtifactName, deployer));

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(
    artifact,
    constructorArguments || []
  );
  log(`Estimated deployment cost: ${hre.ethers.formatEther(deploymentFee)} ETH`, options);

  // Check if the wallet has enough balance
  await verifyEnoughBalance(hre, wallet, deploymentFee);

  const contractFactory = new ContractFactory(artifact.abi, artifact.bytecode, wallet, "create2");
  const bytecodeHash = utils.hashBytecode(artifact.bytecode);
  const constructorArgs = contractFactory.interface.encodeDeploy(constructorArguments);
  const standardCreate2Address = utils.create2Address(wallet.address, bytecodeHash, options.salt, constructorArguments ? constructorArgs : "0x");

  const accountCode = await wallet.provider.getCode(standardCreate2Address);
  if (accountCode != "0x") {
    console.log(`Contract "${contractArtifactName} was already deployed at - ${standardCreate2Address}. Skipping..."`);
    log(`Check if contract needs verification...`, options);
    const alreadyDeployedContract = new hre.ethers.Contract(standardCreate2Address, artifact.abi, wallet);
    try {
      await verifyContract(
        hre,
        {
          address: standardCreate2Address,
          contract: `${artifact.sourceName}:${artifact.contractName}`,
          constructorArguments: constructorArgs,
          bytecode: artifact.bytecode,
        }
      );
    } catch (error) {
      log(`Contract verification stopped:\n---\n${error}\n---\nSkipping this verification...`, options);
    }
    return alreadyDeployedContract;
  }

  let deployingContract;

  const customData: any = {
    salt: options.salt,
  };
  if (options.factoryDeps) {
    customData.factoryDeps = options.factoryDeps;
  }

  if (constructorArguments) {
    deployingContract = await contractFactory.deploy(constructorArguments, { customData });
  } else {
    deployingContract = await contractFactory.deploy({ customData });
  }

  const deployedContract = await deployingContract.waitForDeployment();
  const deployedContractAddress = await deployedContract.getAddress();
  const fullContractSource = `${artifact.sourceName}:${artifact.contractName}`;

  // Display contract deployment info
  log(`\n"${artifact.contractName}" was successfully deployed:`, options);
  log(` - Contract address: ${deployedContractAddress}`, options);
  log(` - Contract source: ${fullContractSource}`, options);
  log(` - Encoded constructor arguments: ${constructorArgs}\n`, options);

  if (standardCreate2Address != deployedContractAddress) {
    log("Unexpected Create2 address, perhaps salt is misconfigured?");
    log(`addressFromCreate2: ${standardCreate2Address}`);
    log(`deployedContractAddress: ${deployedContractAddress}`);
    throw `⛔️ Unexpected Create2 address, perhaps salt is misconfigured?`;
  }

  if (!options?.noVerify && hre.network.config.verifyURL) {
    log(`Requesting contract verification...`, options);
    try {
      await verifyContract(
        hre,
        {
          address: deployedContractAddress,
          contract: fullContractSource,
          constructorArguments: constructorArgs,
          bytecode: artifact.bytecode,
        }
      );
    } catch (error) {
      log(`Contract verification failed:\n---\n${error}\n---\nSkipping this verification...`, options);
    }
  }

  return deployedContract;
}

export const deployContract = async (
  hre: HardhatRuntimeEnvironment,
  contractArtifactName: string,
  constructorArguments?: any[],
  options: DeployContractOptions = { silent: false, noVerify: true, forceDeploy: false, isTUP: false }
) => {
  let implInstance = options.salt ?
    await create2AndIfPossibleVerify(hre, options, contractArtifactName, constructorArguments) :
    await createAndIfPossibleVerify(hre, options, contractArtifactName, constructorArguments);
  if (options.isTUP) {
    return options.salt ? await create2AndIfPossibleVerify(hre, options, "TransparentProxy", [await implInstance.getAddress()]) :
      await createAndIfPossibleVerify(hre, options, "TransparentProxy", [await implInstance.getAddress()]);
  } else {
    return implInstance;
  }
};