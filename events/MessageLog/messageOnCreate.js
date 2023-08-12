/* eslint-disable no-undef */
const { Events, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot === true) return;

		const client = message.client;
		const locales = client.locales.events.messageOnCreatejs;
		const status = await client.ticket.has(message.channelId);
		console.log(status);

		switch (status) {
		case true:
			messageHandeler(message, client, locales);
			break;
		case false:
			newTicketOpen(message, client, locales);
			break;
		}
	},
};

async function newTicketOpen(message, client, locales) {
	if (message.guildId !== null) return;
	if (await client.ticket.has(message.author.id) === true) return;
	const channel = await client.channels.fetch(message.channelId);
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
		console.log(e);
	}
}

async function messageHandeler(message, client, locales) {
	const user = await client.users.fetch(message.author.id);
	const reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await client.db.get('recive'))
		.setTitle(locales.messageProcessing.reciveNewMessageEmbed.title)
		.setTimestamp()
		.setFooter({ text: `${locales.messageProcessing.reciveNewMessageEmbed.footer.text}`, iconURL: locales.messageProcessing.reciveNewMessageEmbed.footer.iconURL });


	const channelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await client.db.get('send'))
		.setTitle(locales.messageProcessing.sendNewMessageEmbed.title)
		.setTimestamp()
		.setFooter({ text: `${locales.messageProcessing.sendNewMessageEmbed.footer.text}`, iconURL: locales.messageProcessing.sendNewMessageEmbed.footer.iconURL });


	if (message.content) {
		channelEmbed.setDescription(message.content);
		reciveChannelEmbed.setDescription(message.content);
	}
	if (message.attachments) {
		let num = 1;
		message.attachments.forEach((keys) => {
			console.log(keys);
			channelEmbed.addFields({ name: `Attachment ${num}`, value: `[**LINK**](${keys.attachment})` });
			reciveChannelEmbed.addFields({ name: `Attachment ${num}`, value: `[**LINK**](${keys.attachment})` });
			num++;
		});
	}
	messageReciverSwitch(message, reciveChannelEmbed, client, channelEmbed);
}
async function messageReciverSwitch(message, reciveChannelEmbed, client, channelEmbed) {
	const switchStatus = message.guildId === null;

	switch (switchStatus) {
	case true: {
		const sts = await sendToServer(message, reciveChannelEmbed);
		afterSendHandler(message, channelEmbed, client, 'server', sts);
		break;
	}
	case false: {
		const sts = await sendToDMChannel(message, reciveChannelEmbed);
		afterSendHandler(message, channelEmbed, client, 'DM', sts);
		break;
	}
	default: {
		console.log('ERR');
	}
	}
}


async function afterSendHandler(message, channelEmbed, client, type, values) {
	const channel = await client.channels.fetch(message.channelId);
	console.log(type);
	if (type === 'DM') {
		const wbh = await client.wbh(channel);
		console.log(values);
		if (values.channels.length === values.errorSender.length) {
			const embd = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Sporočila ni bilo mogoče dostaviti!')
				.setDescription('Lastnik ticketa ni več dostopen. \nMožen razlog je, da je izklopil `allow direct messages`.\n Če uporabnika ne morate ponovno kontaktirate, priporočamo zaprtje ticketa')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard}', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });

			wbh.send({ embeds: [embd] });
			return;
		}
		if (values.channels.length === 0) {
			const embd = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Prišlo je do napake!')
				.setDescription('Prosimo kontaktirajte skribnika bota, da preveri konzolo za neznane pojave.\n Ne moremo vam potrditi, da je sporočilo prispelo uporabniku.')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });

			wbh.send({ embeds: [embd] });
			return;
		}
		if (values.channels.length > 1 && values.errorSender.length > 0) {
			var one_time_warn_EMBED = new EmbedBuilder()
				.setColor(await client.db.get('error'))
				.setTitle('Enemu ali več uporabnikom ni bilo možno dostaviti sporočila!')
				.setTimestamp()
				.setFooter({ text: 'BCRP Guard', iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });
			var x = 1;
			for (const id in values.errorSender) {
				try {
					const chan = await client.channels.fetch(id);
					console.log(!chan);
					one_time_warn_EMBED.addFields({ name: id, value: `Uporabnik ${chan.recipient.username} NI prejel sporočila!` });
				}
				catch (e) {
					console.log(e);
					one_time_warn_EMBED.addFields({ name: `Neznan uporabnik ${x}`, value: 'Uporabnik `NI BILO MOGOČE PRIDOBITI UPORABNIKA` NI prejel sporočila!' });
					x++;
				}
			}

		}
		try {
			await wbh.send({ embeds: [channelEmbed], files: message.attachments.map(attachment => attachment.url) });
			if (one_time_warn_EMBED) wbh.send({ embeds: [one_time_warn_EMBED] });
			message.delete();
		}
		catch (e) {
			console.log(e);
		}
	}

	if (type === 'server') {
		await message.react('✅');
	}


}
async function sendToDMChannel(message, reciveChannelEmbed) {
	const client = message.client;
	const reciverData = await client.ticket.get(message.channelId);
	const channels = reciverData.channel;
	const errorSender = [];
	for (id of channels) {
		try {
			const channel = await client.channels.fetch(id);
			await channel.send({ embeds: [reciveChannelEmbed] });
		}
		catch (e) {
			console.log(e);
			errorSender.push(id);
		}
	}
	return { errorSender, channels };
}

async function sendToServer(message, reciveChannelEmbed) {
	const client = message.client;

	const reciverData = await client.ticket.get(message.channelId);
	const recive = await client.channels.fetch(reciverData.channel[0]);
	const wbh = await client.wbh(recive);
	try {
		wbh.send({ embeds: [reciveChannelEmbed] });
		return true;
	}
	catch (e) {
		console.log(e);
		return false;
	}
}