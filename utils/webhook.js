module.exports = { webhook };

const avatarurl = 'https://cdn.discordapp.com/icons/978368922527101059/a_4c5511c4cb5008ec4a0aeb0ab63c8368.gif?size=4096&width=0&height=256';
async function webhook(channel) {
	try {
		let webhooks = await channel.fetchWebhooks();
		if (webhooks.size === 0) {
			await channel.createWebhook({ name: 'BCRP MODMAIL', avatar: avatarurl });
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