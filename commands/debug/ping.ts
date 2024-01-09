import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';
import lib from '../../bridge/bridge'
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Preveri zakasnitev programa'),
	async execute(interaction: CommandInteraction) {
		const message = await interaction.deferReply({
			ephemeral: true,
			fetchReply: true,
		});
		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle(`${lib.locales.commands.pingjs.embed.title} ${message.createdTimestamp - interaction.createdTimestamp}ms`);
		await interaction.editReply({
			embeds: [embed],
		});
	},
};