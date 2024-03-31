export interface userRanksI {
	username: string;
	rank: string;
}

export interface usersOpeningTicketI {
	time: number;
}

export interface closingTicketsI {
	time: number;
}

export interface openTicketsI {
	number: number;
}

export interface cacheI {
	userRanks: Map<string, userRanksI>;
	usersOpeningTicket: Map<string, usersOpeningTicketI>;
	closingTickets: Map<number, closingTicketsI>;
	openTickets: Map<string, openTicketsI>;
}
