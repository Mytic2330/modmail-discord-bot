const { Events, EmbedBuilder } = require('discord.js');
module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage, newMessage) {
		const client = newMessage.client;
		if (newMessage.author.bot === true) return;
		if (!await client.ticket.has(newMessage.channelId)) return;
		const num = await client.ticket.get(newMessage.channelId);
		const table = await client.db.table(`tt_${num}`);
		const hasMessage = await table.has(newMessage.id);
		switch (hasMessage) {
		case true:
			handleHasMessage(client, newMessage, table);
			break;
		case false:
			handleNoMessage(client, newMessage);
			break;
		}
	},
};

async function handleHasMessage(client, message, table) {
	const dataMessage = await table.get(message.id);
	const arr = [];
	for (const obj of dataMessage.recive) {
		const channel = await client.channels.fetch(obj.channelId);
		const msg = await channel.messages.fetch(obj.messageId);
		const embed = await createEmbedToSend(client, message);
		try {
			await msg.edit({ embeds: [embed] });
		}
		catch (e) {
			console.error(e);
			arr.push(obj.channelId);
		}
	}

	if (arr.length != 0) {
		const string = arr.join('\n');
		message.reply({ content: 'Ni bilo mogoče spremeniti sporočila v naslednjih kanalih:\n' + string });
	}
}

async function handleNoMessage(client, message) {
	await message.reply({ content: 'Ni mogoče poslati spremenjenega sporočila' });
}

async function createEmbedToSend(client, message) {
	const user = await client.users.fetch(message.author.id);
	const reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await client.db.get('color.recive'))
		.setTitle('Novo sporočilo')
		.setTimestamp()
		.setFooter({ text: `${'Ekipa BCRP'}`, iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });

	if (message.content) {
		reciveChannelEmbed.setDescription(message.content);
	}
	if (message.attachments) {
		let num = 1;
		message.attachments.forEach((keys) => {
			reciveChannelEmbed.addFields({ name: `Priponka ${num}`, value: `[**LINK**](${keys.attachment})` });
			num++;
		});
	}

	return reciveChannelEmbed;
}