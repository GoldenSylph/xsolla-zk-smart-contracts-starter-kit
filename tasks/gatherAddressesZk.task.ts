import { HardhatRuntimeEnvironment } from "hardhat/types";
import { types } from 'hardhat/config';
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import handlebars from 'handlebars';
import fsExtra from 'fs-extra';

import { getAddressOf, getZkSyncDeployerAndWallet } from "../scripts/typescript/helpers/zkSync.helper";
import includeInZkAddressesReport from "./resources/includeInZkAddressesReport.json";

type ContractEntry = {
  name: string;
  address: string | undefined;
}

type NetworkEntry = {
  name: string;
  contracts: Array<ContractEntry>
}

type TemplateEntry = {
  networks: Array<NetworkEntry>
}

export default (task: any) =>
  task('zkAddresses', 'Gathers all recent addresses of contracts and making a Markdown report.')
    .addOptionalParam(
      'report',
      'Define a name of the Markdown report.',
      './ADDRESSES.md',
      types.string,
    )
    .addOptionalParam(
      'mocks',
      'Define if mock contracts has to be included in the report.',
      false,
      types.boolean,
    )
    .addFlag(
      'nocompile',
      'Define if contracts has to be recompiled to update NatSpecs custom tags.',
    )
    .addFlag(
      'tg',
      'Define if the report is to be immideately sent to the Telegram chat group (ensure that .env is configured for that correctly like in .env.example).',
    )
    .setAction(
      async ({ report, mocks, nocompile, tg }: { report: string, mocks: boolean, nocompile: boolean, tg: boolean }, hre: HardhatRuntimeEnvironment) => {
        if (!nocompile) {
          await hre.run('compile');
        }
        await fsExtra.ensureFile(report);
        const allContractsNames = (await hre.run('getAllArtifacts'))
          .filter((a: string) => a.startsWith("contracts"))
          .filter((a: string) => !a.split(":")[1].startsWith("I"))
          .filter((a: string) => !a.split(":")[1].endsWith("Lib"))
          .filter((a: string) => mocks || !a.includes("Mock"));
        const templateData: TemplateEntry = {
          networks: includeInZkAddressesReport ?? []
        };
        const deployer: Deployer = (await getZkSyncDeployerAndWallet(hre)).deployer;
        const networkName = hre.network.name;
        if (hre.config.networks[networkName].zksync !== undefined && hre.config.networks[networkName].zksync) {
          console.log(`Gathering info about Network ${networkName}...`);
        } else {
          throw Error(`Network ${networkName}: does not support zkSync.`);
        }
        const networkInfo: NetworkEntry = templateData.networks.find(
          (e: NetworkEntry) => e.name === networkName
        ) ?? {
          name: networkName,
          contracts: []
        };
        for (const fullContractName of allContractsNames) {
          const [source, contractName] = fullContractName.split(':');
          const contractInfo: ContractEntry = {
            name: contractName,
            address: undefined
          };

          const contractAddress = await getAddressOf(hre, deployer, contractName);
          if (contractAddress === undefined) {
            contractInfo.address = "NOT DEPLOYED";
          } else {
            contractInfo.address = contractAddress;
          }
          const possibleContractEntryIdx: number = networkInfo.contracts.findIndex(
            (e: ContractEntry) => e.name === contractName
          );
          const buildInfo: any = await hre.artifacts.getBuildInfo(fullContractName);
          const includeIntoReportAddressesFlag = buildInfo.output
            .contracts[source][contractName].devdoc["custom:include-in-addresses-report"];
          
          // Allows to skip contracts that are not included in the report
          // and keeping in mind the existance of the flag `include-in-addresses-report` by utilising:
          // `@custom:include-in-addresses-report true` in the contract's code. 
          if (includeIntoReportAddressesFlag !== undefined) {
            console.log(`Contract ${contractName} has the flag '@custom:include-in-addresses-report' value: ${includeIntoReportAddressesFlag}. Acknowledging it.`);
            if (!Boolean(includeIntoReportAddressesFlag.details)) {
              continue;
            }
          }
          if (possibleContractEntryIdx !== -1) {
            continue;
          } else {
            networkInfo.contracts.push(contractInfo);
          }
        }
        let possiblePreExistingNetworkEntryIdx: number = templateData.networks.findIndex(
          (e: NetworkEntry) => e.name === networkName
        );
        if (possiblePreExistingNetworkEntryIdx !== -1) {
          templateData.networks[possiblePreExistingNetworkEntryIdx] = networkInfo;
        } else {
          templateData.networks.push(networkInfo);
        }
        const templateString = (await fsExtra.readFile("./tasks/resources/addressesReportTemplate.txt")).toString();
        const compileReport = handlebars.compile(templateString);
        await fsExtra.writeFile(report, compileReport(templateData));
        console.log('Report is gathered.');
        if (tg) {
          await hre.run('tg', {
            file: report,
            token: process.env.TG_BOT_TOKEN || "",
            chat: process.env.TG_CHAT_ID || "",
          });
        }
      },
    );
