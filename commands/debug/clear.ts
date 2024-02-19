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
					{ name: 'users', value: 'users' },
					{ name: 'ranks', value: 'ranks' },
					{ name: 'all', value: 'all' },
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Debug command'),
	async execute(interaction: CommandInteraction) {
		const reason = interaction.options.get('category') ?? null;
		if (reason) {
			if (reason.value == 'closing') {
				try {
					lib.cache.closingTickets.clear();
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
			else if (reason.value == 'users') {
				try {
					lib.cache.usersOpeningTicket.clear();
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
			else if (reason.value == 'all') {
				try {
					lib.cache.usersOpeningTicket.clear();
					lib.cache.userRanks.clear();
					lib.cache.closingTickets.clear();
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
