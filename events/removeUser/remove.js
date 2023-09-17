const { Events, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isStringSelectMenu()) return;
		if (interaction.customId !== 'removeUser') return;
		const client = interaction.client;
		const user = await client.users.fetch(interaction.values[0]);
		userCheck(interaction, client, user);
	},
};

async function userCheck(interaction, client, user) {
	const data = await client.ticket.get(interaction.channelId);
	const status = data.users.includes(user.id);

	switch (status) {
	case false:
		interaction.reply({ content: 'Uporabnik ni v ticketu!', ephemeral: true });
		break;
	case true:
		removeUserFromTicket(interaction, user);
		break;
	}

}

async function removeUserFromTicket(interaction, user) {
	const DM = await user.createDM();
	const embed = new EmbedBuilder()
		.setTitle('Bili ste odstranjeni iz ticketa!')
		.setDescription('Če želite odpreti nov ticket, pošljite sporočilo, da prejmete.');
	try {
		await DM.send({ embeds: [embed] });
		databaseSync(interaction, DM, user);
		interaction.reply({ content: 'Uporabnik odstranjen!', ephemeral: true });
	}
	catch (e) {
		console.log(e);
	}
}

async function databaseSync(interaction, DM, user) {
	const db = interaction.client.ticket;
	const data = await db.get(interaction.channelId);
	await db.pull(`${interaction.channelId}.channel`, DM.id);
	await db.pull(`${interaction.channelId}.users`, user.id);
	for (const id of data.channel) {
		await db.pull(`${id}.channel`, DM.id);
		await db.pull(`${id}.users`, user.id);
	}
	await db.delete(DM.id);
}