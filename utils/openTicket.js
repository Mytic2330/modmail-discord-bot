// DEFINITION
const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
// FUNCTION
async function newTicket(base) {
	const client = base.client;
	const locales = client.locales.utils.openTicketjs;
	var type;

	// If is button -- True
	try {const check = base.isButton();if (check) {type = true;} }
	catch (e) {type = false;}

	if (!type) {if (base.guildId !== null) return;}

	if (type) {if (await client.ticket.has(base.user.id)) return;}
	else if (await client.ticket.has(base.author.id)) {return;}

	const channel = await client.channels.fetch(base.channelId);
	const embed = new EmbedBuilder()
		.setTitle(locales.userSelectCategory.embed.title)
		.setDescription(locales.userSelectCategory.embed.description)
		.setFooter({ text: locales.userSelectCategory.embed.footer.text, iconURL: locales.userSelectCategory.embed.footer.iconURL })
		.setTimestamp();

	const select = new StringSelectMenuBuilder()
		.setCustomId('ticket')
		.setPlaceholder(locales.userSelectCategory.SelectMenuPlaceholder);

	client.settings.categories.forEach(x => {
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
		channel.send({ embeds: [embed], components: [row] });
	}
	catch (e) {
		console.error(e);
	}
}


// EXPORT
module.exports = newTicket;