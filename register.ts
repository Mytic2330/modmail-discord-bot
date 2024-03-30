import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import lib from './bridge/bridge';
import { jsonc } from 'jsonc';
const { Token } = jsonc.parse(
	fs.readFileSync(path.join(__dirname, 'config/token.jsonc'), 'utf8')
);

const deployCommands = async () => {
	const commands = [];
	const foldersPath = path.join(__dirname, 'commands');
	const commandFolders = fs.readdirSync(foldersPath);

	for (const folder of commandFolders) {
		const commandsPath = path.join(foldersPath, folder);
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file.endsWith('.js'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const commandImport = await import(filePath);
			const command: any = commandImport.default || commandImport;
			if ('data' in command && 'execute' in command) {
				commands.push(command.data.toJSON());
			} else {
				console.log(
					`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
				);
			}
		}
	}
	const rest = new REST().setToken(Token);

	try {
		console.log(
			`Started refreshing ${commands.length} application (/) commands.`
		);
		const data: any = await rest.put(
			Routes.applicationGuildCommands(
				lib.settings.clientId,
				lib.settings.guildId
			),
			{ body: commands }
		);

		console.log(
			`Successfully reloaded ${data.length} application (/) commands.`
		);
	} catch (error) {
		console.error(error);
	}
};
deployCommands();
