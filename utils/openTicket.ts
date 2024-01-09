export default newTicket;
// DEFINITION
import { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, Message, Interaction } from 'discord.js';
import lib from '../bridge/bridge';
// FUNCTION
async function newTicket(passedMessage: Message | undefined, passedInteraction: Interaction | undefined) {
	if (passedMessage || passedInteraction) {
		var interaction;
		var message;
		if (passedMessage) {
			message = passedMessage as Message;
		}
		if (passedInteraction) {
			interaction = passedInteraction as Interaction;
		}
		const client = message?.client || interaction?.client;
		const locales = lib.locales.utils.openTicketjs;
		var type;
	
		// If is button -- True
		if (message) {type = false;} else {type = true}
	
		if (!type && message) {if (message.guildId !== null) return;}
	
		if (type && interaction) {if (await lib.ticket.has(interaction.user.id)) return;}
		else if (message) {if (await lib.ticket.has(message.author.id)) {return;}}
	
		var channelId: any = message?.channelId
		if (!channelId) {channelId = interaction?.channelId}
		const channel: any = await client?.channels.fetch(channelId);
		const embed = new EmbedBuilder()
			.setTitle(locales.userSelectCategory.embed.title)
			.setDescription(locales.userSelectCategory.embed.description)
			.setFooter({ text: locales.userSelectCategory.embed.footer.text, iconURL: locales.userSelectCategory.embed.footer.iconURL })
			.setTimestamp();
	
		const select = new StringSelectMenuBuilder()
			.setCustomId('ticket')
			.setPlaceholder(locales.userSelectCategory.SelectMenuPlaceholder);
	
		lib.settings.categories.forEach((x: string) => {
			const options = x.split('_');
			select.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(options[1])
					.setDescription(options[2])
					.setValue(options[0]),
			);
		});
	
		const row = new ActionRowBuilder()
			.addComponents(select);
	
		try {
			channel?.send({ embeds: [embed], components: [row] });
		}
		catch (e) {
			console.error(e);
		}
	}

}
