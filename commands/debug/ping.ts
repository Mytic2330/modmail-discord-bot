/* eslint-disable no-inline-comments */
import {
	SlashCommandBuilder,
	EmbedBuilder,
	CommandInteraction
} from 'discord.js';
import lib from '../../bridge/bridge';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Preveri zakasnitev programa'), // Command description
	async execute(interaction: CommandInteraction) {
		const message = await interaction.deferReply({
			ephemeral: true,
			fetchReply: true
		}); // Defer the reply to make it ephemeral and fetch the reply
		const embed = new EmbedBuilder()
			.setColor(await lib.db.get('color.default'))
			.setTitle(
				`${lib.locales.commands.pingjs.embed.title} ${
					message.createdTimestamp - interaction.createdTimestamp
				}ms`
			); // Create an embed with the ping time
		await interaction.editReply({
			embeds: [embed]
		}); // Edit the reply with the embed
	}
};
