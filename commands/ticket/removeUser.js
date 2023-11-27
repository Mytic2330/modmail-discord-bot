const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Odstrani uporabnika iz ticketa'),
	async execute(interaction) {
		const client = interaction.client;
		const locales = interaction.client.locales.commands.removeUserjs;
		const checkOne = await client.ticket.has(interaction.channelId);
		if (checkOne === false) {
			interaction.reply(locales.notActiveChannel);
			return;
		}
		const number = await client.ticket.get(interaction.channelId);
		const data = await client.db.table(`tt_${number}`).get('info');
		if (interaction.guildId || data.creatorId === interaction.user.id) {
			if (data.dmChannel.length > 1) {
				const select = new StringSelectMenuBuilder()
					.setCustomId('removeUser')
					.setPlaceholder(locales.selectMenu.placeholder);

				for (const id of data.dmChannel) {
					const dm = await client.channels.fetch(id);
					const user = await dm.recipient;

					if (user.id === data.creatorId) continue;
					if (interaction.user.id === user.id) continue;
					select.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(user.username)
							.setValue(id),
					);
				}
				if (select.options.length === 0) {
					await interaction.reply({ content: locales.error.nousers, ephemeral: true });
					return;
				}
				const row = new ActionRowBuilder()
					.addComponents(select);
				await interaction.reply({ components: [row], ephemeral: true });
			}
			else {
				await interaction.reply({ content: locales.error.nousers, ephemeral: true });
			}
		}
		else {
			await interaction.reply({ content: locales.error.nopremission, ephemeral: true });
		}
	},
};
