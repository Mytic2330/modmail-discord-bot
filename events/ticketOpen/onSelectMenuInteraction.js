const { Events, ChannelType, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'ticket') return;
		await interaction.deferReply({ ephemeral: true });
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
			.setTitle(locales.ticketAlreadyOpen.title)
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
	const num = await ticketNumberCalculation(interaction, x);

	logInteraction(x, member, num);
	const client = x.client;
	const wbh = await client.wbh(x);
	const embed = new EmbedBuilder()
		.setAuthor({ name: interaction.user.username, iconURL: member.user.displayAvatarURL() })
		.setColor(await client.db.get('color'))
		.setTitle((locales.logEmbed.title)
			.replace('CATEGORY', interaction.values[0]))
		.setTimestamp()
		.addFields({ name: locales.logEmbed.ticketNumber, value: `${num}`, inline: true }, { name: 'Profil uporabnika', value: `${member.user}`, inline: true })
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
	databaseSync(interaction, x, num);
}

async function logInteraction(x, member, num) {
	const locales = x.client.locales.events.onSelectMenuInteractionjs.initialOpening;
	const data = await x.client.db.get(x.guildId);
	const channel = await x.guild.channels.fetch(data.logChannel);
	const wbh = await x.client.wbh(channel);

	const embed = new EmbedBuilder()
		.setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
		.setColor(await x.client.db.get('color'))
		.setTitle((locales.otherLogEmbed.title)
			.replace('USERNAME', member.user.username))
		.setTimestamp()
		.addFields({ name: locales.otherLogEmbed.ticketNumber, value: `${num}`, inline: true }, { name: 'Profil uporabnika', value: `${member.user}`, inline: true })
		.setFooter({ text: (locales.otherLogEmbed.footer.text) });

	wbh.send({ embeds: [embed] });
}

async function databaseSync(interaction, x, num) {
	await interaction.client.ticket.pull('users', interaction.user.id);
	const newTable = await interaction.client.db.table(`tt_${num}`);
	await newTable.set('info', {
		'guildChannel': x.id,
		'dmChannel': [interaction.channelId],
		'creatorId': interaction.user.id,
		'closed': false,
	});
	await interaction.client.ticket.set(x.id, num);
	await interaction.client.ticket.set(interaction.channelId, num);
	await newTable.set('analytics', {
		'date': await interaction.client.datestamp(),
		'time': await interaction.client.timestamp(),
		'rating': null,
	});
	await newTable.set('messageAnalitys', {
		'messages': { 'sentByDM': 0, 'sentByServer': 0, 'serverMessagesUsers': [], 'DMMessagesUsers': [] },
	});
	await interaction.client.ticket.push('tickets', num);
}

async function ticketNumberCalculation(interaction, x) {
	var num = await interaction.client.db.get('ticketNumber');
	if (num) {
		await interaction.client.db.set('ticketNumber', num + 1);
	}
	else {
		num = interaction.channelId + x.id;
		await interaction.client.db.set('ticketNumber', 1);
	}
	return num;
}