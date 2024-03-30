interface ticketInfo {
	info: {
		guildChannel: string;
		dmChannel: [];
		creatorId: string;
		closed: boolean;
		transcript: string;
	};
	analytics: {
		date: string;
		time: string;
		rating: string;
	};
	messageAnalitys: {
		messages: {
			sentByDM: number;
			sentByServer: number;
			serverMessagesUsers: [];
			DMMessagesUsers: [{ user: string }];
		};
	};
	num: number;
}

export default ticketInfo;
