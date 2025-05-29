# Xsolla ZK Starter Kit

### Contact to troubleshoot with: `o.bedrin@xsolla.com`

## Prerequisites

Make sure that you've installed:

1) Latest version of `foundry`
2) Latest version of `foundry-zksync`
3) Latest version of `yarn`

## Installation

1) `git clone --recurse-submodules <URL of the repo>`
2) `yarn`

## Key Features

* Hardhat zkSync + Foundry zkSync hybrid project.
* Hardhat Ignition + Hardhat zkSync Deploy integration: possibility of parallel usage.
* Conversion of Hardhat zkSync Deploy scripts into a fixtures.
* Horizontally growing architecture of tasks, stages and fixtures.

## Folders

Every folder except `./contracts` is considered a module, so they have to use `export default` operators except those ones that are composed as libraries of methods. They should use `export` operator.

### Descriptions

* `./contracts/utils` - A library of pre-defined contracts of 3 types of tokens fabrics: EIP20, EIP721, EIP1155.

* `./zk-deploy` - Main Hardhat zkSync Deploy folder with deployable through `deploy-zksync` task scripts or stages.
  * `./zk-deploy/fixtures` - zkSync Deploy scripts that are to be utilized only within `inMemoryNode` network. Has to support impersonalization and time travel management.
  * `./zk-deploy/stages` - zkSync Deploy scripts that are composed like building blocks per local artifact to deploy and configure `hardhat-zksync-solc` artifacts.
* `./scripts/solidity` - A standard folder for external Foundry scripts.
* `./scripts/typescript` - A standard folder for external scripts. Most of them are either helper scripts or reusable Hardhat zkSync Deploy stages.
  * `./typescript/helpers` - General folder where all helper functions are stored. If there to be a new one - it is a required constraint that each and every function accepts all that they need only through the arguments of the function. Please, keep that in mind.
    * `./typescript/helpers/eip712` - A scripts for EIP712 signatures manipulation. Specifically through a `ForwardRequest`s of OpenZeppelin Contracts library.
    * `./typescript/helpers/impersonating.helper` - A script that contains some functions for testing with impersonated signers.
    * `./typescript/helpers/utils.helper` - A script that contains 2 functions: for easy event decoding and for populating an addresses report hardcoded entries.
    * `./typescript/helpers/opensea.helper` - A script that contains functions to manage conduits for OpenSea-like marketplaces.
    * `./typescript/helpers/zkSync.helper` - A script that contains functions to manage all Xsolla ZK interactions (including deployments, verification, artifacts resolving and etc.)
  * `./typescript/reusables` - Collections of fabrics for modules or stages.

* `./test` - Tests could contain every kind of modules (Hardhat Ignition or Hardhat zkSync Deploy or Foundry), but they cannot overlap. Please, keep that in mind.
  * `./test/typescript` - for Hardhat tests.
  * `./test/solidity` - for Foundry tests.

## Commands

Almost no commands that are different from Hardhat external scripts or Hardhat zkSync Deploy were introduced:

* If one to utilize Foundry zkSync, they should compile through `foundry-zksync`: `forge build --zksync`

And there are some new important tasks:

* `npx hardhat verifyAllZk` - Gathers all locally developed artifacts and tries to verify them against zkSync network.
* `npx hardhat zkAddresses` - Gathers all the newest addresses from configured zkSync-based networks that are locally developed and put them into a report with name `ADDRESSES.md` in the root of the repo.