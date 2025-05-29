import { types } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Telegraf } from 'telegraf';
import fsExtra from 'fs-extra';

export default (task: any) =>
  task('tg', 'Sends a text file to the Telegram bot.')
    .addOptionalParam(
      'file',
      'Define a file.',
      './ADDRESSES.md',
      types.string,
    )
    .addOptionalParam(
      'token',
      'Define a Telegram bot token.',
      process.env.TG_BOT_TOKEN || "",
      types.string,
    )
    .addOptionalParam(
      'chat',
      'Define a chat ID.',
      process.env.TG_CHAT_ID || "",
      types.string,
    )
    .setAction(
      async ({ file, token, chat }: { file: string, token: string, chat: string }, hre: HardhatRuntimeEnvironment) => {
        if (!await fsExtra.pathExists(file)) {
          throw `Error: The specified file '${file}' does not exist. Please check the file path and try again.`;
        }
        const fileContent = await fsExtra.readFile(file, 'utf-8');
        const bot = new Telegraf(token);
        console.log('Raw file to be sent:');
        console.log(fileContent);
        await bot.telegram.sendMessage(chat, fileContent, { parse_mode: 'MarkdownV2' });
        console.log(`File '${file}' has been successfully sent to the Telegram chat group.`);
      },
    );
