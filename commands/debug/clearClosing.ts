import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import lib from '../../bridge/bridge'
module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearclosing')
		.setDescription('Debug command'),
	async execute(interaction: CommandInteraction) {
		try {
			await lib.ticket.set('closing', []);
			interaction.reply({ ephemeral: true, content: 'Cleared!' });
		} catch (e) {
			interaction.reply({ ephemeral: true, content: 'Error while clearing\nCheck console!'});
		};
	},
};