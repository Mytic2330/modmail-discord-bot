import { Events, EmbedBuilder, Message, Client, DMChannel, TextChannel } from 'discord.js';
import { QuickDB } from 'quick.db';
import lib from '../../bridge/bridge';
module.exports = {
	name: Events.MessageUpdate,
	async execute(oldMessage: Message, newMessage: Message) {
		const client = newMessage.client;
		if (newMessage.content.toLowerCase().startsWith('!')) {
			const check = newMessage.content.substring(1, 4);
			if (check.toLowerCase().startsWith('adm')) {
				return;
			}
		}
		if (newMessage.author.bot === true) return;
		if (!await lib.ticket.has(newMessage.channelId)) return;
		const num = await lib.ticket.get(newMessage.channelId);
		const table = await lib.db.table(`tt_${num}`);
		const hasMessage = await table.has(newMessage.id);
		switch (hasMessage) {
		case true:
			handleHasMessage(client, newMessage, table);
			break;
		case false:
			handleNoMessage(newMessage);
			break;
		}
	},
};

async function handleHasMessage(client: Client, message: Message, table:QuickDB) {
	const dataMessage = await table.get(message.id);
	const arr = [];
	for (const obj of dataMessage.recive) {
		const resolvingChannel = await client.channels.fetch(obj.channelId);
		const channel = resolvingChannel as DMChannel | TextChannel
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
	} else {
		const embed = await createEditedEmbed(client, message);
		const passedChannel = await client.channels.fetch(message.channelId)
		const channel = passedChannel as TextChannel | DMChannel;
		channel.send({ embeds: [embed] });
	}
}

async function handleNoMessage(message:Message) {
	await message.reply({ content: 'Ni mogoče poslati spremenjenega sporočila' });
}

async function createEmbedToSend(client: Client, message: Message): Promise<EmbedBuilder> {
	const user = await client.users.fetch(message.author.id);
	const reciveChannelEmbed = new EmbedBuilder()
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setColor(await lib.db.get('color.recive'))
		.setTitle('Novo sporočilo')
		.setTimestamp()
		.setFooter({ text: `${'Ekipa BCRP'}`, iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });

	if (message.content) {
		reciveChannelEmbed.setDescription(message.content);
	}
	if (message.attachments) {
		let num = 1;
		message.attachments.forEach((keys:any) => {
			reciveChannelEmbed.addFields({ name: `Priponka ${num}`, value: `[**LINK**](${keys.attachment})` });
			num++;
		});
	}

	return reciveChannelEmbed;
}

async function createEditedEmbed(client: Client, message: Message): Promise<EmbedBuilder> {
	const reciveChannelEmbed = new EmbedBuilder()
		.setColor(await lib.db.get('color.info'))
		.setTitle('Uspešno urejeno sporočilo')
		.setTimestamp()
		.setFooter({ text: (message.id).toString(), iconURL: 'https://cdn.discordapp.com/attachments/1012850899980394557/1138546219640176851/097e89ede70464edaf570046b6b3f7b8.png' });


	return reciveChannelEmbed;
}