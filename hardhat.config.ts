import { task } from 'hardhat/config';
import { HardhatUserConfig } from 'hardhat/types';

import dotenv from 'dotenv';
import '@typechain/hardhat';

import '@nomicfoundation/hardhat-chai-matchers';
import "@nomicfoundation/hardhat-foundry";

import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';
import 'hardhat-tracer';
import 'hardhat-docgen';

import '@matterlabs/hardhat-zksync';

dotenv.config();

import getAllArtifactsTaskInitialize from './tasks/getAllArtifacts.task';
import verifyAllZkTaskInitialize from './tasks/verifyAllZk.task';
import gatherAddressesZkTaskInitialize from './tasks/gatherAddressesZk.task';
import etherBalanceTaskInitialize from './tasks/etherBalance.task';
import sendEtherTaskInitialize from './tasks/sendEther.task';
import accountTaskInitialize from './tasks/account.task';
import codeTaskInitialize from './tasks/code.task';
import printBeaconTaskInitialize from './tasks/sso/printBeacon.task';
import chainTaskInitialize from './tasks/chain.task';
import checkIsApprovedForAllTaskInitialize from './tasks/checkIsApprovedForAll.task';
import checkIfBytecodesAreSameTaskInitialize from './tasks/checkIfBytecodesAreSame.task';
import wrapEtherToWETH9TaskInitialize from './tasks/wrapEtherToWETH9.task';
import decodePreSignedTxTaskInitialize from './tasks/decodePreSignedTx.task';
import sendToTelegramBotTaskInitialize from './tasks/sendToTelegramBot.task';

getAllArtifactsTaskInitialize(task);
verifyAllZkTaskInitialize(task);
gatherAddressesZkTaskInitialize(task);
etherBalanceTaskInitialize(task);
sendEtherTaskInitialize(task);
accountTaskInitialize(task);
codeTaskInitialize(task);
printBeaconTaskInitialize(task);
chainTaskInitialize(task);
checkIsApprovedForAllTaskInitialize(task);
checkIfBytecodesAreSameTaskInitialize(task);
wrapEtherToWETH9TaskInitialize(task);
decodePreSignedTxTaskInitialize(task);
sendToTelegramBotTaskInitialize(task);

const MAINNET_PRIVATE_KEY: string = process.env.MAINNET_PRIVATE_KEY ?? '';
const PROXY_ADMIN_OWNER_PRIVATE_KEY: string = process.env.PROXY_ADMIN_OWNER_PRIVATE_KEY ?? '';
const SELLER_PRIVATE_KEY: string = process.env.SELLER_PRIVATE_KEY ?? '';
const BUYER_PRIVATE_KEY: string = process.env.BUYER_PRIVATE_KEY ?? '';
const ZONE_PRIVATE_KEY: string = process.env.ZONE_PRIVATE_KEY ?? '';

const LOCAL_TESTNET_PRIVATE_KEY: string = process.env.LOCAL_TESTNET_PRIVATE_KEY ?? '';
const ALCHEMY_RPC_POLYGON_AMOY_URL: string = process.env.ALCHEMY_RPC_POLYGON_AMOY_URL ?? '';

const zkSyncDefaultParams = {
  deployPaths: 'zk-deploy',
  zksync: true
}

const compilersConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.28',
        zksync: true,
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
          evmVersion: "cancun"
        }
      },
      {
        version: '0.8.24',
        zksync: true,
        settings: {
          optimizer: {
            enabled: true,
            runs: 9_999_999,
          },
          viaIR: true,
          evmVersion: "cancun"
        }
      },
      {
        version: "0.8.14",
        zksync: true,
        settings: {
          optimizer: {
            enabled: true,
            runs: 19066,
          },
          viaIR: true,
        },
      }
    ],
    overrides: {
      "lib/seaport/contracts/conduit/Conduit.sol": {
        version: "0.8.14",
        zksync: true,
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
      "lib/seaport/contracts/conduit/ConduitController.sol": {
        version: "0.8.14",
        zksync: true,
        settings: {
          viaIR: true,
          optimizer: {
            enabled: true,
            runs: 1000000,
          },
        },
      },
    }
  },
  zksolc: {
    version: "1.5.15",
    settings: {
      codegen: "yul",
      // find all available options in the official documentation
      // https://docs.zksync.io/build/tooling/hardhat/hardhat-zksync-solc#configuration
      optimizer: {
        enabled: true, // optional. True by default
        mode: 'z', // optional. 3 by default, z to optimize bytecode size
        fallback_to_optimizing_for_size: true, // optional. Try to recompile with optimizer mode "z" if the bytecode is too large
      },
      // https://era.zksync.io/docs/tools/hardhat/hardhat-zksync-solc.html#configuration
      // Native AA calls an internal system contract, so it needs extra permissions
      enableEraVMExtensions: true,
      libraries: {
        "contracts/utils/libraries/SVGIconsLib.sol": {
          "SVGIconsLib": "0xb009Ee76f1280DeEA9975528740C695E2e1Db80F"
        }
      }
    },
  },
}

const config: HardhatUserConfig = {
  ...compilersConfig,
  mocha: {
    timeout: 200000,
  },
  paths: {
    tests: "./test/typescript"
  },
  defaultNetwork: "zkxsolla",
  networks: {
    amoy: {
      url: `${ALCHEMY_RPC_POLYGON_AMOY_URL}`,
      accounts: [MAINNET_PRIVATE_KEY, PROXY_ADMIN_OWNER_PRIVATE_KEY, SELLER_PRIVATE_KEY, BUYER_PRIVATE_KEY, ZONE_PRIVATE_KEY],
    },
    zkSyncSepoliaTestnet: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      verifyURL: "https://explorer.sepolia.era.zksync.dev/contract_verification",
      ...zkSyncDefaultParams
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet",
      verifyURL: "https://zksync2-mainnet-explorer.zksync.io/contract_verification",
      ...zkSyncDefaultParams
    },
    dockerizedNode: { // IF THE NAME IS TO BE CHANGED PLEASE MODIFY IT IN .gitignore ALSO!
      url: "http://localhost:3050",
      ethNetwork: "http://localhost:8545",
      accounts: [LOCAL_TESTNET_PRIVATE_KEY], // local rich wallet for tests
      ...zkSyncDefaultParams
    },
    inMemoryNode: { // IF THE NAME IS TO BE CHANGED PLEASE MODIFY IT IN .gitignore ALSO!
      url: "http://127.0.0.1:8011",
      ethNetwork: "", // in-memory node doesn't support eth node; removing this line will cause an error
      ...zkSyncDefaultParams
    },
    localAnvil: {
      url: "http://localhost:8011",
      ethNetwork: "http://localhost:8545",
      ...zkSyncDefaultParams
    },
    hardhatZk: { // IF THE NAME IS TO BE CHANGED PLEASE MODIFY IT IN .gitignore ALSO!
      url: "http://127.0.0.1:8011/",
      ethNetwork: "sepolia",
      ...zkSyncDefaultParams
    },
    zkxsolla: {
      url: "https://zkrpc.xsollazk.com",
      ethNetwork: "sepolia",
      accounts: [MAINNET_PRIVATE_KEY, PROXY_ADMIN_OWNER_PRIVATE_KEY, SELLER_PRIVATE_KEY, BUYER_PRIVATE_KEY, ZONE_PRIVATE_KEY],
      // accounts: [LOCAL_TESTNET_PRIVATE_KEY],
      verifyURL: "https://xsollazk.com/contract_verification",
      // verifyURL: "http://localhost:3000",
      ...zkSyncDefaultParams
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS == 'true',
  },
  contractSizer: {
    runOnCompile: true,
  },
  docgen: {
    path: './natspecs',
    clear: true,
    runOnCompile: false,
  }
};

export default config;
