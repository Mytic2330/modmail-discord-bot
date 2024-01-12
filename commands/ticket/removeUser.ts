import {
	SlashCommandBuilder,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	CommandInteraction,
	DMChannel,
} from 'discord.js';
import lib from '../../bridge/bridge';
module.exports = {
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('Odstrani uporabnika iz ticketa'),
	async execute(interaction: CommandInteraction) {
		const client = interaction.client;
		const locales = lib.locales.commands.removeUserjs;
		const checkOne = await lib.ticket.has(interaction.channelId);
		if (checkOne === false) {
			interaction.reply(locales.notActiveChannel);
			return;
		}
		const number = await lib.ticket.get(interaction.channelId);
		const data = await lib.db.table(`tt_${number}`).get('info');
		if (interaction.guildId || data.creatorId === interaction.user.id) {
			if (data.dmChannel.length > 1) {
				const select = new StringSelectMenuBuilder()
					.setCustomId('removeUser')
					.setPlaceholder(locales.selectMenu.placeholder);

				for (const id of data.dmChannel) {
					const passedChannel = await client.channels.fetch(id);
					const dm = passedChannel as DMChannel;
					const user = dm.recipient;

					if (user?.id === data.creatorId) continue;
					if (interaction.user.id === user?.id) continue;
					select.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(user?.username || 'ERROR')
							.setValue(id),
					);
				}
				if (select.options.length === 0) {
					await interaction.reply({
						content: locales.error.nousers,
						ephemeral: true,
					});
					return;
				}
				const row: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(
					select,
				);
				await interaction.reply({ components: [row], ephemeral: true });
			}
			else {
				await interaction.reply({
					content: locales.error.nousers,
					ephemeral: true,
				});
			}
		}
		else {
			await interaction.reply({
				content: locales.error.nopremission,
				ephemeral: true,
			});
		}
	},
};