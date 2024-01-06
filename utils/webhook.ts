import { TextChannel } from "discord.js";

export default webhook;

async function webhook(channel:TextChannel) {
	try {
		let webhooks = await channel.fetchWebhooks();
		if (webhooks.size === 0) {
			await channel.createWebhook({ name: (channel.client as any).locales.utils.webhookjs.name, avatar: (channel.client as any).locales.utils.webhookjs.avatarURL });
			webhooks = await channel.fetchWebhooks();
		}
		const wbh = webhooks.find((webhookurl) => webhookurl.token);
		return (wbh);
	}
	catch (error) {
		console.error(error);
		return ('ERROR');
	}
}