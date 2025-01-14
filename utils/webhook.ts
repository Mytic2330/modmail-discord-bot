import { TextChannel, Webhook } from 'discord.js';
import lib from '../bridge/bridge';

// Function to fetch or create a webhook for a given channel
export async function webhook(
	channel: TextChannel
): Promise<Webhook | undefined> {
	try {
		// Fetch existing webhooks in the channel
		let webhooks = await channel.fetchWebhooks();
		// If no webhooks exist, create a new one
		if (webhooks.size === 0) {
			await channel.createWebhook({
				name: lib.locales.utils.webhookjs.name,
				avatar: lib.locales.utils.webhookjs.avatarURL
			});
			webhooks = await channel.fetchWebhooks();
		}
		// Find a webhook with a token
		const wbh = webhooks.find((webhookurl) => webhookurl.token);
		return wbh;
	} catch (error) {
		// Log any errors and return undefined
		console.error(error);
		return undefined;
	}
}
