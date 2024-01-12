import {
	SlashCommandBuilder,
	CommandInteraction,
	PermissionFlagsBits,
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('clearcache')
		.addStringOption((option) =>
			option
				.setName('category')
				.setDescription('Type of cache to clear')
				.setRequired(true)
				.addChoices(
					{ name: 'closing', value: 'closing' },
					{ name: 'ranks', value: 'ranks' },
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Debug command'),
	async execute(interaction: CommandInteraction) {
		const reason = interaction.options.get('category') ?? null;
		if (reason) {
			if (reason.value == 'closing') {
				try {
					await lib.ticket.set('closing', []);
					interaction.reply({ ephemeral: true, content: 'Cleared!' });
				}
				catch (e) {
					console.error(e);
					interaction.reply({
						ephemeral: true,
						content: 'Error while clearing\nCheck console!',
					});
				}
			}
			else if (reason.value == 'ranks') {
				try {
					lib.cache.userRanks.clear();
					interaction.reply({ ephemeral: true, content: 'Cleared!' });
				}
				catch (e) {
					console.error(e);
					interaction.reply({
						ephemeral: true,
						content: 'Error while clearing\nCheck console!',
					});
				}
			}
		}
		else {
			interaction.reply({
				ephemeral: true,
				content: 'Error while clearing\nCheck console!',
			});
		}
	},
};
