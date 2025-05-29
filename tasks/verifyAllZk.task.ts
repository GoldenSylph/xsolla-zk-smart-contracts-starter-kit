import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

import { getAddressOf } from "../scripts/typescript/helpers/zkSync.helper";

export default (task: any) =>
  task('verifyAllZk', 'Tries to verify all the artifacts in the source folder of contracts using built-in verify task.').setAction(
    async (_: any, hre: HardhatRuntimeEnvironment) => {
      const allArtifacts = await hre.run('getAllArtifacts');
      let currentCounter = 0;
      for (const artifactFullName of allArtifacts) {
        currentCounter++;
        if (!artifactFullName.startsWith('contracts')) continue;
        const artifactName = artifactFullName.split(':')[1];
        console.log(`${currentCounter}/${allArtifacts.length} - Trying to verify ${artifactName}...`);
        const artifactAddress: string | undefined = await getAddressOf(hre, hre.deployer as unknown as Deployer, artifactName);
        if (artifactAddress === undefined) {
          console.log(`Artifact is either non-deployable or not deployed: ${artifactName}. Skipping...`);
          continue;
        }
        try {
          console.log(`Running 'verify' task on: ${artifactAddress}`);
          await hre.run('verify', {
            address: artifactAddress,
            noCompile: true
          });
        } catch (e) {
          console.log(`Cannot verify ${artifactFullName} - ${artifactAddress}.`);
          console.log('Reason:');
          console.log(e);
          console.log('Continue...');
          continue;
        }
      }
      console.log('All artifacts possible has been verified.');
    },
  );
