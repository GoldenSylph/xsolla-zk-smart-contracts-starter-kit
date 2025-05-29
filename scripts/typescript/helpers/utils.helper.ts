import { Contract, EventLog, Log } from "ethers";
import {DeployContractOptions} from "./zkSync.helper";

import fsExtra from "fs-extra";

export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export const getEventBody = async (eventName: string, contractInstance: Contract, resultIndex = -1) => {
  const filter = contractInstance.filters[eventName]();
  const filterQueryResult: Array<EventLog | Log> = await contractInstance.queryFilter(filter);
  const lastIndex = filterQueryResult.length == 0 ? 0 : filterQueryResult.length - 1;
  return (filterQueryResult[resultIndex == -1 ? lastIndex : resultIndex] as EventLog).args;
}

export const addToIncludeIntoReportAddressesList = async (
  hre: any, 
  artifactName: string, 
  contractInstanceAddress: string, 
  log: any, 
  options: DeployContractOptions = { silent: false }
) => {
  const includeIntoReportAddressesJsonPath = "./tasks/resources/includeInZkAddressesReport.json";
    const includeIntoReportAddresses: any = await fsExtra.readJSON(includeIntoReportAddressesJsonPath);
  
    const networkIndex = includeIntoReportAddresses.findIndex(
      (entry: any) => entry.name === hre.network.name
    );
  
    if (networkIndex != -1) {
      const contractEntryIdx = includeIntoReportAddresses[networkIndex].contracts.findIndex(
        (entry: any) => entry.name === artifactName
      );
      if (contractEntryIdx === -1) {
        includeIntoReportAddresses[networkIndex].contracts.push({
          name: artifactName,
          address: contractInstanceAddress,
        });
      } else {
        includeIntoReportAddresses[networkIndex].contracts[contractEntryIdx] = {
          name: artifactName,
          address: contractInstanceAddress
        };
      }
      await fsExtra.writeJson(includeIntoReportAddressesJsonPath, includeIntoReportAddresses);
      log(`Added ${artifactName} to includeIntoReportAddresses.json`, options);
    } else {
      log(`No network found in includeIntoReportAddresses.json. Skipping adding ${artifactName} to the report.`, options);
    }
}