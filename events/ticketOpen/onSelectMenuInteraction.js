const { Events, ChannelType, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'ticket') return;
		await interaction.deferReply();
		const client = interaction.client;
		if (await client.ticket.has(interaction.channelId) === false) {
			if (await client.ticket.has(interaction.user.id) === true) {
				const embed = new EmbedBuilder()
					.setColor(await client.db.get('color'))
					.setTitle('Vaš ticket se procesira. Molimo pričekajte!')
					.setTimestamp();
				await interaction.editReply({ embeds: [embed] });
				return;
			}
			await client.ticket.set(interaction.user.id, true);
			const preparing = new EmbedBuilder()
				.setColor(await client.db.get('color'))
				.setTitle('Vaš ticket se odpira!')
				.setDescription('Proismo za poterpežljivost. Po navadi traja nekaj sekund!\n Počakajte na potrdilo odprtja.')
				.setTimestamp();

			await interaction.message.edit({ embeds: [preparing], components: [] });
			const guild = await client.guilds.fetch(await client.db.get('guildId'));
			createChannel(guild, interaction, client);
		}
		else {
			const embed = new EmbedBuilder()
				.setColor(await client.db.get('color'))
				.setTitle('Že imate odprt ticket!')
				.setTimestamp();
			await interaction.editReply({ embeds: [embed] });
			return;
		}
	},
};

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
	const member = await x.guild.members.fetch(interaction.user.id);

	const client = x.client;
	logInteraction(x, member);
	const wbh = await client.wbh(x);
	const embed = new EmbedBuilder()
		.setAuthor({ name: interaction.user.username, iconURL: member.user.displayAvatarURL() })
		.setColor(await client.db.get('color'))
		.setTitle('Je odprl ticket z kategorijo: ' + interaction.values[0])
		.setTimestamp()
		.setFooter({ text: 'ID: ' + member.user.id });
	try {
		wbh.send({ embeds: [embed] });
	}
	catch (e) {
		console.log(e);
	}
	const db = client.ticket;
	await db.set(x.id, { 'channel': interaction.channelId, 'author': interaction.user.id, 'guild': x.guild.id });
	await db.set(interaction.channelId, { 'channel': x.id, 'author': interaction.user.id, 'guild': x.guild.id });

	const embed2 = new EmbedBuilder()
		.setColor(await client.db.get('color'))
		.setTitle('Začeli ste pogovor z staff ekipo.')
		.setTimestamp();
	await interaction.editReply({ embeds: [embed2] });
	await client.ticket.delete(interaction.user.id, true);
}

async function logInteraction(x, member) {
	const data = await x.client.db.get(x.guildId);
	const channel = await x.guild.channels.fetch(data.logChannel);
	const wbh = await x.client.wbh(channel);

	const embed = new EmbedBuilder()
		.setColor(await x.client.db.get('color'))
		.setTitle(`${member.user.username} has opend a new ticket!`)
		.setTimestamp()
		.setFooter({ text: 'ID: ' + member.user.id });


	wbh.send({ embeds: [embed] });
}