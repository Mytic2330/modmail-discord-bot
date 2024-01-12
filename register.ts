import { REST, Routes } from 'discord.js';
import { jsonc } from 'jsonc';
import * as fs from 'fs';
import * as path from 'path';

interface Command {
  data: {
    name: string;
    description: string;
    options?: any[];
  };
  execute: (interaction: any) => void;
}

const { clientId, Token } = jsonc.parse(
	fs.readFileSync(path.join(__dirname, 'config/settings.jsonc'), 'utf8'),
);

const commands: any[] = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: Command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data);
		}
		else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
		}
	}
}

const rest = new REST().setToken(Token);

(async () => {
	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`,
		);
		const data: any = await rest.put(Routes.applicationCommands(clientId), {
			body: commands,
		});
		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`,
		);
	}
	catch (error) {
		console.error(error);
	}
})();
