import { SlashCommandBuilder, PermissionFlagsBits, CommandInteraction, User } from 'discord.js';
import lib from '../../bridge/bridge'
module.exports = {
	data: new SlashCommandBuilder()
		.setName('screenshare')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('Uporabnik, ki bo dobil callperm')
				.setRequired(true))
		.setDescription('Daj rolo za screenshare'),
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		const recivedTarget = interaction.options.getUser('target');
		const target = recivedTarget as User;
		const member = await interaction?.guild?.members.fetch(target);
		const role = await lib.db.get('screenshareRole');
		const usersWithRole = await lib.db.get('uWsr');

		if (!member?.voice.channel) {
			interaction.reply({ content: 'Uporabnik ni povezan v kanal!', ephemeral: true });
			return;
		}

		for (const id of member.roles.cache) {
			if (id[0] === role) {
				interaction.reply({ content: 'Uporabnik že ima screenshare rolo!', ephemeral: true });
				return;
			}
		}

		for (const id of usersWithRole) {
			if (id === member.id) {
				interaction.reply({ content: 'Uporabnik je že dobil screenshare rolo!', ephemeral: true });
				return;
			}
		}

		try {
			await member.roles.add(role);
			await lib.db.push('uWsr', member.id);
		}
		catch (e) {
			console.error(e);
			interaction.reply({ content: 'Napaka pri dodajanju role!', ephemeral: true });
		}

		interaction.reply({ content: 'Rola dodana!', ephemeral: true });
	},
};