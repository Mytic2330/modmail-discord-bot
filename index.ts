/* eslint-disable @typescript-eslint/no-var-requires */
// require('./utils/logger');
import {
	Client,
	Collection,
	GatewayIntentBits,
	ActivityType,
	Events,
	Partials
} from 'discord.js';
import { jsonc } from 'jsonc';
import { QuickDB } from 'quick.db';
import { version } from './package.json';
import * as fs from 'fs-extra';
import * as path from 'node:path';

// Initialize the database
const database: QuickDB = new QuickDB({ filePath: './database.sqlite' });
export default database;

// Load the bot token from the configuration file
const { Token } = jsonc.parse(
	fs.readFileSync(path.join(__dirname, 'config/token.jsonc'), 'utf8')
);
const debug: boolean = true;

// Display a startup message
console.log(` \x1b[36m
	
███╗░░░███╗░█████╗░██████╗░███╗░░░███╗░█████╗░██╗██╗░░░░░
████╗░████║██╔══██╗██╔══██╗████╗░████║██╔══██╗██║██║░░░░░
██╔████╔██║██║░░██║██║░░██║██╔████╔██║███████║██║██║░░░░░
██║╚██╔╝██║██║░░██║██║░░██║██║╚██╔╝██║██╔══██║██║██║░░░░░
██║░╚═╝░██║╚█████╔╝██████╔╝██║░╚═╝░██║██║░░██║██║███████╗
╚═╝░░░░░╚═╝░╚════╝░╚═════╝░╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝

Made by mytic2330
Version: ${version} \x1b[0m`);

// Initialize the Discord client
const client = new Client({
	presence: {
		status: 'online',
		afk: false,
		activities: [
			{
				name: 'Tickets',
				type: ActivityType.Watching
			}
		]
	},
	intents: [
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.AutoModerationConfiguration,
		GatewayIntentBits.AutoModerationExecution,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildIntegrations,
		GatewayIntentBits.GuildInvites,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildWebhooks,
		GatewayIntentBits.Guilds,
		// SCREENSHARE COMMAND
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Load commands from the commands folder
const commands = new Collection<string, any>();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.set(command.data.name, command);
		} else {
			console.error(
				`\x1b[31m[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.\x1b[0m`
			);
		}
	}
}

// Handle interaction events
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	const command = commands.get(interaction.commandName);
	if (!command) {
		console.error(
			`No command matching ${interaction.commandName} was found.`
		);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'Error occurred!',
				ephemeral: true
			});
		} else {
			await interaction.reply({
				content: 'Error occurred!',
				ephemeral: true
			});
		}
	}
});

// Load events from the events folder
const evnetPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(evnetPath);
for (const folder of eventFolders) {
	const eventPath = path.join(evnetPath, folder);
	const commandFiles = fs
		.readdirSync(eventPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(eventPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

// Handle unhandled promise rejections
process.on(
	'unhandledRejection',
	(reason: unknown, promise: unknown, a: unknown) => {
		console.log(reason, promise, a);
	}
);

// Handle uncaught exceptions
process.on(
	'uncaughtException',
	(reason: unknown, promise: unknown, a: unknown) => {
		console.log(reason, promise, a);
	}
);

// Log errors and warnings
client.on('error', console.log).on('warn', console.log);
if (debug === true) client.on('debug', console.log);

// Log in to Discord
client.login(Token).catch((err) => {
	console.log('[TOKEN-ERROR] Unable to connect to the BOT\'s Token');
	console.log(err);
});
