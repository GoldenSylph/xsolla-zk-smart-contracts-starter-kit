import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
export default (task: any) =>
  task('getAllArtifacts', 'Returns all artifacts full names with specific filters')
    .addOptionalParam(
      'areInterfacesExcluded',
      'Define whether interfaces should be excluded from the resulting set.',
      'false',
      types.boolean,
    )
    .addOptionalParam(
      'areMocksExcluded',
      'Define whether the mocks should be excluded from the resulting set.',
      'false',
      types.boolean,
    )
    .addOptionalParam(
      'areInternalContractsExcluded',
      'Define whether the internal contracts should be excluded from the resulting set.',
      'false',
      types.boolean,
    )
    .setAction(async (optionalParams: any, hre: HardhatRuntimeEnvironment) =>
      (await hre.artifacts.getAllFullyQualifiedNames()).filter((e: string) => {
        return (
          !e.includes('hardhat') &&
          (e.startsWith('contracts') || optionalParams.areInternalContractsExcluded) &&
          (!e.includes('interface') || optionalParams.areInterfacesExcluded) &&
          (!e.includes('Mock') || optionalParams.areMocksExcluded)
        );
      }),
    );
