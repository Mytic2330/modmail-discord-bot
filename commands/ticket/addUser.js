const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Dodaj uporabnika v ticket')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Uporabnik, ki bo dodan v ticket')
				.setRequired(true)),
	async execute(interaction) {
		const client = interaction.client;
		const user = interaction.options.getUser('user');

		const checkOne = await client.ticket.has(interaction.channelId);
		if (checkOne === false) {
			interaction.reply('Ta kanal ni aktiven ticket!\n Prosim uporabite v kanalu z ticketom.');
			return;
		}

		userCheck(interaction, client, user);
	},
};

async function userCheck(interaction, client, user) {
	const data = await client.ticket.get(interaction.channelId);
	const status = data.users.includes(user.id);

	switch (status) {
	case true:
		interaction.reply('Uporabnik je že v ticketu!');
		break;
	case false:
		addUserToTicket(interaction, user);
		break;
	}

}

async function addUserToTicket(interaction,	user) {
	const DM = await user.createDM();
	const hasTicket = await checkIfUserHasOpenTicket(interaction, DM);
	if (hasTicket === true) {
		interaction.reply('Uporabnik že ima odprt ticket!');
		return;
	}
	const embed = new EmbedBuilder()
		.setTitle('Pozdrav!')
		.setDescription('Dodani ste bili v ticket!');
	try {
		await DM.send({ embeds: [embed] });
		databaseSync(interaction, DM, user);
	}
	catch (e) {
		console.log(e);
	}
	interaction.reply('Uporabnik dodan!');
}

async function databaseSync(interaction, DM, user) {
	const db = interaction.client.ticket;
	const data = await db.get(interaction.channelId);

	await db.push(`${interaction.channelId}.channel`, DM.id);
	await db.push(`${interaction.channelId}.users`, user.id);
	await interaction.client.ticket.set(DM.id, { 'channel': data.channel, 'server': data.server, 'author': data.author, 'guild': data.guild, users: data.users });
	await db.push(`${DM.id}.channel`, DM.id);
	await db.push(`${DM.id}.users`, user.id);

	for (const id of data.channel) {
		await db.push(`${id}.channel`, DM.id);
		await db.push(`${id}.users`, user.id);
	}
}

async function checkIfUserHasOpenTicket(interaction, DM) {
	const db = interaction.client.ticket;

	const status = await db.has(DM.id);

	if (status === true) return true;
	if (status === false) return false;
	return undefined;
}