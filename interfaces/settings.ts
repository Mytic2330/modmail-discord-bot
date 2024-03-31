interface settingsI {
	useAPI: boolean;
	clientId: string;
	allowedRoles: [string];
	enableRanks: boolean;
	ranks: {
		[key: string]: string;
	};
	guildId: string;
	categories: [
		{
			name: string;
			channelprefix: string;
			description: string;
			modal: {
				enable: boolean;
				title: string;
				fields: [
					{
						id: string;
						lable: string;
						type: string;
						required: boolean;
						defaultValue: string;
						placeholder: string;
						minLength: number;
						maxLength: number;
					}
				];
			};
		}
	];
	colors: { [key: string]: string };
	DMClose: 60000;
	vactarCommunityID: string;
	openTicketMessageChannel: string;
}

export default settingsI;
