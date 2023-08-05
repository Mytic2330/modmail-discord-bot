const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Latency check on bot!'),
	async execute(interaction, client) {
		const locales = client.locales.commands.pingjs;
		const message = await interaction.deferReply({
			ephemeral: true,
			fetchReply: true,
		});
		const embed = new EmbedBuilder()
			.setColor(await client.settings.get('color'))
			.setTitle(`🏓 ${locales.ping} ${message.createdTimestamp - interaction.createdTimestamp}ms`);
		await interaction.editReply({
			embeds: [embed],
		});
	},
};