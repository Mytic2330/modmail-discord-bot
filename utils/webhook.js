module.exports = { webhook };

async function webhook(channel) {
	try {
		let webhooks = await channel.fetchWebhooks();
		if (webhooks.size === 0) {
			await channel.createWebhook({ name: channel.client.locales.utils.webhookjs.name, avatar: channel.client.locales.utils.webhookjs.avatarURL });
			webhooks = await channel.fetchWebhooks();
		}
		const wbh = webhooks.find((webhookurl) => webhookurl.token);
		return (wbh);
	}
	catch (error) {
		console.log(error);
		return ('ERROR');
	}
}