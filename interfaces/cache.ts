// Interface for user ranks
export interface userRanksI {
	username: string;
	rank: string;
}

// Interface for users opening tickets
export interface usersOpeningTicketI {
	time: number;
}

// Interface for closing tickets
export interface closingTicketsI {
	time: number;
}

// Interface for open tickets
export interface openTicketsI {
	number: number;
}

// Interface for cache structure
export interface cacheI {
	userRanks: Map<string, userRanksI>;
	usersOpeningTicket: Map<string, usersOpeningTicketI>;
	closingTickets: Map<number, closingTicketsI>;
	openTickets: Map<string, openTicketsI>;
}
