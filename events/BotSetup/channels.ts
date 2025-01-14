import {
	Events,
	ChannelType,
	EmbedBuilder,
	TextChannel,
	CategoryChannel,
	Client,
	Guild,
	Role
} from 'discord.js';
import lib from '../../bridge/bridge';

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		// Fetch the guild using the guild ID from settings
		const guild = await client.guilds.fetch(lib.settings.guildId);
		const status = await lib.db.has(guild.id);

		// If the guild is not set up, create necessary channels and categories
		if (status === false) {
			try {
				const category = await guild.channels.create({
					name: lib.locales.events.channelsjs.channelCreation.category,
					type: ChannelType.GuildCategory
				});
				const categoryClosed = await guild.channels.create({
					name: lib.locales.events.channelsjs.channelCreation.categoryClosed,
					type: ChannelType.GuildCategory
				});

				const log = await category.children.create({
					name: lib.locales.events.channelsjs.channelCreation.log,
					type: ChannelType.GuildText
				});

				const archive = await category.children.create({
					name: lib.locales.events.channelsjs.channelCreation.archive,
					type: ChannelType.GuildText
				});

				// Set permissions for the created channels and categories
				await category.permissionOverwrites.create(guild.roles.everyone, {
					ViewChannel: false
				});
				await categoryClosed.permissionOverwrites.create(guild.roles.everyone, {
					ViewChannel: false
				});
				await log.permissionOverwrites.create(guild.roles.everyone, {
					ViewChannel: false
				});
				await archive.permissionOverwrites.create(guild.roles.everyone, {
					ViewChannel: false
				});

				// Set permissions for allowed roles
				permissionSet(category, log, archive, categoryClosed, guild);
			} catch (e) {
				console.error(e);
			}
		}
	}
};

// Function to set permissions for allowed roles
async function permissionSet(
	category: CategoryChannel,
	log: TextChannel,
	archive: TextChannel,
	categoryClosed: CategoryChannel,
	guild: Guild
) {
	const roles = lib.settings.allowedRoles;
	for (const roleLoop of roles) {
		const x = guild.roles.cache.get(roleLoop);
		const role = x as Role;
		await category.permissionOverwrites.create(role, { ViewChannel: true });
		await log.permissionOverwrites.create(role, { ViewChannel: true });
		await archive.permissionOverwrites.create(role, { ViewChannel: true });
		await categoryClosed.permissionOverwrites.create(role, {
			ViewChannel: true
		});
	}

	// Create webhooks for log and archive channels
	const wbh = await lib.wbh(log);
	const wbh2 = await lib.wbh(archive);

	// Save channel IDs to the database
	await lib.db.set(guild.id, {
		logChannel: log.id,
		transcriptChannel: archive.id,
		categoryId: category.id,
		closeCategoryId: categoryClosed.id
	});

	// Send embed messages to the log and archive channels
	const embed = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle(lib.locales.events.channelsjs.logEmbed.title)
		.setTimestamp();
	const embed2 = new EmbedBuilder()
		.setColor(await lib.db.get('color.default'))
		.setTitle(lib.locales.events.channelsjs.archiveEmbed.title)
		.setTimestamp();

	wbh?.send({ embeds: [embed] });
	wbh2?.send({ embeds: [embed2] });
}
