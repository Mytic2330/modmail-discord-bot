import {
	SlashCommandBuilder,
	CommandInteraction,
	PermissionFlagsBits,
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('unblacklist')
		.addUserOption((option) =>
			option
				.setName('user')
				.setRequired(true)
				.setDescription('Uporabnik, ki bo unblacklistan'),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription('Debug command'),
	async execute(interaction: CommandInteraction) {
		const user = interaction.options.getUser('user');
		if (user) {
			const users = await lib.ticket.get('blacklist');
			if (users.includes(user.id)) {
				lib.ticket.pull('blacklist', user.id);
				interaction.reply({
					ephemeral: true,
					content: 'Uporabnik unblacklistan!',
				});
				return;
			} else {
				interaction.reply({
					ephemeral: true,
					content: 'Uporabnik ni blacklistan!',
				});
				return;
			}
		} else {
			interaction.reply({
				ephemeral: true,
				content: 'Uporabnik ni najden!',
			});
			return;
		}
	},
};
