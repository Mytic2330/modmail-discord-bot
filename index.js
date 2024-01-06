require('./utils/logger');
const { hasNewUsername, getTimestamp, getDatestamp } = require('./utils/etc');
const { webhook } = require('./utils/webhook');
const { Client, Collection, GatewayIntentBits, ActivityType, Events, Partials } = require('discord.js');
const jsonc = require('jsonc');
const { QuickDB } = require('quick.db');
const { version } = require('./package.json');
const fs = require('fs-extra');
const path = require('node:path');
const database = new QuickDB({ filePath: './database.sqlite' });
const { Token } = jsonc.parse(fs.readFileSync(path.join(__dirname, 'config/settings.jsonc'), 'utf8'));
const { lib } = require('./bridge/bridge.js');
const debug = true;


console.log(` \x1b[36m

██████╗░██╗░░░░░██╗░░░██╗███████╗░█████╗░██╗████████╗██╗░░░██╗
██╔══██╗██║░░░░░██║░░░██║██╔════╝██╔══██╗██║╚══██╔══╝╚██╗░██╔╝
██████╦╝██║░░░░░██║░░░██║█████╗░░██║░░╚═╝██║░░░██║░░░░╚████╔╝░
██╔══██╗██║░░░░░██║░░░██║██╔══╝░░██║░░██╗██║░░░██║░░░░░╚██╔╝░░
██████╦╝███████╗╚██████╔╝███████╗╚█████╔╝██║░░░██║░░░░░░██║░░░
╚═════╝░╚══════╝░╚═════╝░╚══════╝░╚════╝░╚═╝░░░╚═╝░░░░░░╚═╝░░░
	
███╗░░░███╗░█████╗░██████╗░███╗░░░███╗░█████╗░██╗██╗░░░░░
████╗░████║██╔══██╗██╔══██╗████╗░████║██╔══██╗██║██║░░░░░
██╔████╔██║██║░░██║██║░░██║██╔████╔██║███████║██║██║░░░░░
██║╚██╔╝██║██║░░██║██║░░██║██║╚██╔╝██║██╔══██║██║██║░░░░░
██║░╚═╝░██║╚█████╔╝██████╔╝██║░╚═╝░██║██║░░██║██║███████╗
╚═╝░░░░░╚═╝░╚════╝░╚═════╝░╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝╚══════╝

Made by mytic2330
Version: ${version} \x1b[0m`);


const client = new Client({
	presence: {
		status: 'online',
		afk: false,
		activities: [{
			name: 'Tickets',
			type: ActivityType.Watching,
		}],
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
		GatewayIntentBits.GuildVoiceStates,
	],
	partials: [
		Partials.Message,
		Partials.Channel,
		Partials.Reaction,
	],
});

client.discord = require('discord.js');
client.db = database;
client.ticket = database.table('ticket');
client.settings = jsonc.parse(fs.readFileSync(path.join(__dirname, 'config/settings.jsonc'), 'utf8'));
client.locales = jsonc.parse(fs.readFileSync(path.join(__dirname, 'locales/locales.jsonc'), 'utf8'));
client.hasNewUsername = hasNewUsername;
client.wbh = webhook;
client.timestamp = getTimestamp;
client.version = version;
client.datestamp = getDatestamp;
client.lib = lib;


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.error(`\x1b[31m[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.\x1b[0m`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

const evnetPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(evnetPath);
for (const folder of eventFolders) {
	const eventPath = path.join(evnetPath, folder);
	const commandFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(eventPath, file);
		const event = require(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}
process.on('unhandledRejection', (reason, promise, a) => {
	console.log(reason, promise, a);
});
process.on('uncaughtException', (reason, promise, a) => {
	console.log(reason, promise, a);
});

client.on('error', console.log)
	.on('warn', console.log);
if (debug === true) client.on('debug', console.log);
client.login(Token).catch(err => {
	console.error('[TOKEN-ERROR] Unable to connect to the BOT\'s Token');
	console.error(err);
});
