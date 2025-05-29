import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { decode } from "@ethersproject/rlp";
import fsExtra from "fs-extra";

export default (task: any) =>
  task('presigned', 'Decodes and prints a pre-signed transaction.')
    .addOptionalParam(
      'tx',
      'Define a presigned TX.',
      '0x',
      types.string,
    )
    .addOptionalParam(
      'file',
      'Define a file from which to read the presigned TX.',
      "-",
      types.string,
    )
    .addOptionalParam(
      'silent',
      'Define if logs are to be printed.',
      false,
      types.boolean,
    )
    .setAction(
      async ({ tx, file, silent }: { tx: string, file: string, silent: boolean }, hre: HardhatRuntimeEnvironment) => {
        const preSignedTx = file !== "-" ? await fsExtra.readFile(file, "utf-8") : tx;
        const decodedTx = decode(preSignedTx) as string[];
        const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = decodedTx;
        if (!silent) {
          console.log("Decoded Transaction Fields:");
          console.log("Nonce:", nonce !== "0x" ? hre.ethers.toBigInt(nonce).toString() : nonce);
          console.log("Gas Price:", gasPrice !== "0x" ? hre.ethers.toBigInt(gasPrice).toString() : gasPrice);
          console.log("Gas Limit:", gasPrice !== "0x" ? hre.ethers.toBigInt(gasLimit).toString() : gasLimit);
          console.log("To Address:", to);
          console.log("Value:", value !== "0x" ? hre.ethers.toBigInt(value).toString() : value);
          console.log("Data:", data);
          console.log("V:", v);
          console.log("R:", r);
          console.log("S:", s);
        }

        return {nonce, gasPrice, gasLimit, to, value, data, v, r, s};
      },
    );
