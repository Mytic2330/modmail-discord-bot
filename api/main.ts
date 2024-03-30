import express, { Request, Response } from 'express';
import lib from '../bridge/bridge';
// import crypto from 'crypto';

const requiredCryptoKey = '123';
// crypto.randomBytes(20).toString('hex');
const app = express();

app.get('/api/auth/authorizeKey', (req, res) => {
	const head = req.headers;
	if (head.bytecode) {
		if (head.bytecode === 'authKeyToken') {
			res.send(requiredCryptoKey);
			return;
		}
	}
	res.sendStatus(401);
});

app.get('/api/basic/settings', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	res.send(lib.settings);
});

app.get('/api/database/getallSettings', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	res.send(await lib.db.all());
});

app.get('/api/database/getAllTicketData', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	res.send(await lib.ticket.all());
});

app.get('/api/database/getTicketData', async (req, res) => {
	const auth = await authCheck(req, res);
	if (!auth) return;
	const ticketNumber = req.headers.ticketnumber;
	if (!ticketNumber) {
		res.sendStatus(400);
		return;
	}
	res.send(await lib.ticket.table(`tt_${ticketNumber}`).all());
});

export default function startServer() {
	app.listen(2559);
}

async function authCheck(req: Request, res: Response): Promise<boolean> {
	if (!req.headers.authorization) {
		res.sendStatus(401);
		return false;
	}
	if (req.headers.authorization !== requiredCryptoKey) {
		res.sendStatus(401);
		return false;
	}
	return true;
}
