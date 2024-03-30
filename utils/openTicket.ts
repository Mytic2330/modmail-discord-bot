export default newTicket;
// DEFINITION
import {
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	ActionRowBuilder,
	Message,
	Interaction,
	Snowflake,
	Channel,
	DMChannel,
} from 'discord.js';
import lib from '../bridge/bridge';
// FUNCTION
async function newTicket(
	passedMessage: Message | undefined,
	passedInteraction: Interaction | undefined,
) {
	if (passedMessage || passedInteraction) {
		let interaction;
		let message;
		if (passedMessage) {
			message = passedMessage as Message;
		}
		if (passedInteraction) {
			interaction = passedInteraction as Interaction;
		}
		const client = message?.client || interaction?.client;
		const locales = lib.locales.utils.openTicketjs;
		let type;

		// If is button -- True
		if (message) {
			type = false;
		}
		else {
			type = true;
		}

		if (!type && message) {
			if (message.guildId !== null) return;
		}

		if (type && interaction) {
			if (await lib.ticket.has(interaction.user.id)) return;
		}
		else if (message) {
			if (await lib.ticket.has(message.author.id)) {
				return;
			}
		}

		let channelId: Snowflake | null | undefined = message?.channelId;
		if (!channelId) {
			channelId = interaction!.channelId;
		}
		const channel: Channel | undefined | null = await client?.channels.fetch(channelId!);
		const embed = new EmbedBuilder()
			.setTitle(locales.userSelectCategory.embed.title)
			.setDescription(locales.userSelectCategory.embed.description)
			.setFooter({
				text: locales.userSelectCategory.embed.footer.text,
				iconURL: locales.userSelectCategory.embed.footer.iconURL,
			})
			.setTimestamp();

		const select = new StringSelectMenuBuilder()
			.setCustomId('ticket')
			.setPlaceholder(locales.userSelectCategory.SelectMenuPlaceholder);

		for (const val of lib.settings.categories) {
			const index = lib.settings.categories.indexOf(val);
			select.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(val.name)
					.setDescription(val.description)
					.setValue(index.toString()),
			);
		}

		const row: ActionRowBuilder<any> = new ActionRowBuilder().addComponents(select);

		try {
			const x = channel as DMChannel;
			x?.send({ embeds: [embed], components: [row] });
		}
		catch (e) {
			console.error(e);
		}
	}
}
