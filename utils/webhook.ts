import { TextChannel, Webhook } from 'discord.js';
import lib from '../bridge/bridge';

export async function webhook(
	channel: TextChannel,
): Promise<Webhook | undefined> {
	try {
		let webhooks = await channel.fetchWebhooks();
		if (webhooks.size === 0) {
			await channel.createWebhook({
				name: lib.locales.utils.webhookjs.name,
				avatar: lib.locales.utils.webhookjs.avatarURL,
			});
			webhooks = await channel.fetchWebhooks();
		}
		const wbh = webhooks.find((webhookurl) => webhookurl.token);
		return wbh;
	}
	catch (error) {
		console.error(error);
		return undefined;
	}
}
