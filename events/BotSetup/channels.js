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
					name: 'modmail',
					type: ChannelType.GuildCategory,
				});

				const log = await category.children.create({
					name: 'modmail-log',
					type: ChannelType.GuildText,
				});

				const archive = await category.children.create({
					name: 'modmail-archive',
					type: ChannelType.GuildText,
				});

				await category.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });

				permissionSet(category, log, archive, client, guild);
			}
			catch (e) {
				console.log(e);
			}
		}

	},
};

async function permissionSet(category, log, archive, client, guild) {
	client.settings.allowedRoles.forEach(element => {
		const role = guild.roles.cache.get(element);
		category.permissionOverwrites.create(role, { ViewChannel: true });
	});

	log.lockPermissions();
	archive.lockPermissions();
	const wbh = await client.wbh(log);
	const wbh2 = await client.wbh(archive);

	await client.db.set(guild.id, { 'logChannel': log.id, 'transcriptChannel': archive.id, 'categoryId': category.id, 'webhook': wbh });

	const embed = new EmbedBuilder()
		.setColor(await client.db.get('color'))
		.setTitle('Started logging new modmails')
		.setTimestamp();
	const embed2 = new EmbedBuilder()
		.setColor(await client.db.get('color'))
		.setTitle('Started saving transcribe files')
		.setTimestamp();

	wbh.send({ embeds: [embed] });
	wbh2.send({ embeds: [embed2] });
}
