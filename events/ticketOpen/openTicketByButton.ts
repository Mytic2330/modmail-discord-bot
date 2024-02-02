import { Events, ButtonInteraction, DMChannel } from 'discord.js';
module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction: ButtonInteraction) {
		if (!interaction.isButton) return;
		if (interaction.customId !== 'openTicketInGuild') return;
		interaction.deferReply({ ephemeral: true });
		const user = interaction.user;
		const dm = await user.createDM();
		if (dm instanceof DMChannel) {
			try {
				await dm.send('Pošlji sporočilo, da boš lahko odprl ticket.');
				interaction.editReply({ content: `Prejel si sporočilo <#${dm.id}>` });
			}
			catch (e) {
				interaction.editReply({ content: 'Imaš zaprte DMe!' });
			}
		}
		else {
			interaction.editReply({ content: 'Napaka! Poskusi napisati DM direktno meni.' });
		}
		return;
	},
};