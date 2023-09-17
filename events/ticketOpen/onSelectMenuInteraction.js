const { Events, ChannelType, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'ticket') return;
		await interaction.deferReply();
		const client = interaction.client;
		const locales = client.locales.events.onSelectMenuInteractionjs;
		checkStatus(interaction, client, locales);
	},
};
async function checkStatus(interaction, client, locales) {
	const channelStatus = await client.ticket.has(interaction.channelId);
	if (channelStatus === false) {
		if (await client.ticket.has('users')) {
			const userAlreadyProcessing = await client.ticket.get('users');
			if (userAlreadyProcessing.includes(interaction.user.id) === true) {
				const embed = new EmbedBuilder()
					.setColor(await client.db.get('color'))
					.setTitle(locales.ticketAlreadyInMakingEmbed.title)
					.setTimestamp();
				await interaction.editReply({ embeds: [embed] });
				return;
			}
		}
		await client.ticket.push('users', interaction.user.id);

		const preparing = new EmbedBuilder()
			.setColor(await client.db.get('color'))
			.setTitle(locales.ticketNowInMaking.title)
			.setDescription(locales.ticketNowInMaking.description)
			.setTimestamp();

		await interaction.message.edit({ embeds: [preparing], components: [] });
		const guild = await client.guilds.fetch(await client.db.get('guildId'));
		createChannel(guild, interaction, client);
	}
	if (channelStatus === true) {
		const embed = new EmbedBuilder()
			.setColor(await client.db.get('color'))
			.setTitle(locales.ticketAlreadyOpen.description)
			.setTimestamp();
		await interaction.editReply({ embeds: [embed] });
		return;
	}
}

async function createChannel(guild, interaction, client) {
	const data = await client.db.get(guild.id);
	const category = await guild.channels.fetch(data.categoryId);
	const username = await interaction.client.hasNewUsername(interaction.user, true, 'user');
	const name = `${username}-${interaction.values[0]}`;
	try {
		const channel = await category.children.create({
			name: name,
			type: ChannelType.GuildText,
		});
		sendInitial(channel, interaction);
	}
	catch (e) {
		console.log(e);
	}
}

async function sendInitial(x, interaction) {
	const locales = interaction.client.locales.events.onSelectMenuInteractionjs.initialOpening;
	const member = await x.guild.members.fetch(interaction.user.id);

	const client = x.client;
	logInteraction(x, member);
	const wbh = await client.wbh(x);
	const embed = new EmbedBuilder()
		.setAuthor({ name: interaction.user.username, iconURL: member.user.displayAvatarURL() })
		.setColor(await client.db.get('color'))
		.setTitle((locales.logEmbed.title)
			.replace('CATEGORY', interaction.values[0]))
		.setTimestamp()
		.setFooter({ text: (locales.logEmbed.footer.text)
			.replace('USERID', interaction.user.id) });
	try {
		wbh.send({ embeds: [embed] });
	}
	catch (e) {
		console.log(e);
	}

	const embed2 = new EmbedBuilder()
		.setColor(await client.db.get('color'))
		.setTitle(locales.channelEmbed.title)
		.setTimestamp();
	await interaction.editReply({ embeds: [embed2] });
	databaseSync(interaction, x);
}

async function logInteraction(x, member) {
	const locales = x.client.locales.events.onSelectMenuInteractionjs.initialOpening;
	const data = await x.client.db.get(x.guildId);
	const channel = await x.guild.channels.fetch(data.logChannel);
	const wbh = await x.client.wbh(channel);

	const embed = new EmbedBuilder()
		.setColor(await x.client.db.get('color'))
		.setTitle((locales.otherLogEmbed.title).replace('USERNAME', member.user.username))
		.setTimestamp()
		.setFooter({ text: (locales.otherLogEmbed.footer.text).replace('USERID', member.user.id) });

	wbh.send({ embeds: [embed] });
}

async function databaseSync(interaction, x) {
	await interaction.client.ticket.set(x.id, { 'channel': [interaction.channelId], 'server': x.id, 'author': interaction.user.id, 'guild': x.guild.id, users: [interaction.user.id] });
	await interaction.client.ticket.set(interaction.channelId, { 'channel': [interaction.channelId], 'server': x.id, 'author': interaction.user.id, 'guild': x.guild.id, users: [interaction.user.id] });
	await interaction.client.ticket.pull('users', interaction.user.id);
}