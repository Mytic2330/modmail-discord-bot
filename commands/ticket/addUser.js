const { SlashCommandBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Dodaj uporabnika v ticket')
		.addUserOption(option =>
			option.setName('user')
				.setDescription('Uporabnik, ki bo dodan v ticket')
				.setRequired(true)),
	async execute(interaction) {
		interaction.deferReply();

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
	const status = data.users.includes(user.id)
	if () {
		// IMPLEMENT LOGIC FOR 'USER ALREADY IN TICKET'
	}
	
	switch (status) {
		case true:
			interaction.editReply('Uporabnik je že v ticketu!');
			break;
		case false:
			addUserToTicket(interaction, client, user);
			break;
	}

}

async function addUserToTicket(interaction, client, user) {
	
}