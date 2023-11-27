const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Preveri zakasnitev programa'),
	async execute(interaction) {
		const client = interaction.client;
		const message = await interaction.deferReply({
			ephemeral: true,
			fetchReply: true,
		});
		const embed = new EmbedBuilder()
			.setColor(await client.db.get('color.default'))
			.setTitle(`${client.locales.commands.pingjs.embed.title} ${message.createdTimestamp - interaction.createdTimestamp}ms`);
		await interaction.editReply({
			embeds: [embed],
		});
	},
};