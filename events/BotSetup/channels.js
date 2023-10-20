const { Events, ChannelType, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		const guild = await client.guilds.fetch(client.settings.guildId);
		const status = await client.db.has(guild.id);
		if (status === false) {
			try {
				const category = await guild.channels.create({
					name: client.locales.events.channelsjs.channelCreation.category,
					type: ChannelType.GuildCategory,
				});

				const log = await category.children.create({
					name: client.locales.events.channelsjs.channelCreation.log,
					type: ChannelType.GuildText,
				});

				const archive = await category.children.create({
					name: client.locales.events.channelsjs.channelCreation.archive,
					type: ChannelType.GuildText,
				});

				await category.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });
				await log.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });
				await archive.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });

				permissionSet(category, log, archive, client, guild);
			}
			catch (e) {
				console.log(e);
			}
		}

	},
};

async function permissionSet(category, log, archive, client, guild) {
	const roles = client.settings.allowedRoles;

	for (const role of roles) {
		const x = await guild.roles.cache.get(role);
		await category.permissionOverwrites.create(x, { ViewChannel: true });
		await log.permissionOverwrites.create(x, { ViewChannel: true });
		await archive.permissionOverwrites.create(x, { ViewChannel: true });
	}
	const wbh = await client.wbh(log);
	const wbh2 = await client.wbh(archive);

	await client.db.set(guild.id, { 'logChannel': log.id, 'transcriptChannel': archive.id, 'categoryId': category.id });

	const embed = new EmbedBuilder()
		.setColor(await client.db.get('color'))
		.setTitle(client.locales.events.channelsjs.logEmbed.title)
		.setTimestamp();
	const embed2 = new EmbedBuilder()
		.setColor(await client.db.get('color'))
		.setTitle(client.locales.events.channelsjs.archiveEmbed.title)
		.setTimestamp();

	wbh.send({ embeds: [embed] });
	wbh2.send({ embeds: [embed2] });
}
