import express, { Request, Response } from 'express';
import crypto from 'crypto';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const validKeys = new Map<string, { key: string }>();
const app = express();

export async function createAuthKey(): Promise<string> {
	const key = crypto.randomBytes(20).toString('hex');
	validKeys.set(key, { key });
	return key;
}

app.use(cors());

app.get('/', (req: Request, res: Response) => {
	const indexPath = path.join(__dirname, 'src/index.html');
	fs.readFile(indexPath, 'utf8', (err, data) => {
		if (err) {
			res.sendStatus(500);
			return;
		}
		res.send(data);
	});
});

app.get('/api/auth/createKey', (req: Request, res: Response) => {
	const head = req.headers;
	if (head.bytecode) {
		if (head.bytecode === 'authKeyToken') {
			const key = crypto.randomBytes(20).toString('hex');
			validKeys.set(key, { key });
			res.send(key);
			return;
		}
	}
	res.sendStatus(401);
});

app.get('/api/auth/isKeyValid', (req: Request, res: Response) => {
	const head = req.headers;
	if (head.bytecode) {
		if (head.bytecode === 'authKeyToken') {
			if (head.authorization) {
				if (validKeys.has(head.authorization)) {
					res.sendStatus(202);
					return;
				} else {
					res.sendStatus(403);
					return;
				}
			}
		}
	}
	res.sendStatus(401);
});

app.get('/api/transcript/getPath', (req: Request, res: Response) => {
	const head = req.headers;
	if (head.bytecode) {
		if (head.bytecode === 'authKeyToken') {
			const number = head.ticketnumber;
			if (number) {
				const basePath = `ticketarchive/${number}.htm`;
				const correctPath = path.join(__dirname, basePath);
				console.log(__dirname, correctPath);
				fs.access(correctPath, fs.constants.F_OK, (err) => {
					if (err) {
						const invalidPath = '../ticketarchive/notfound.htm';
						res.send(invalidPath);
					} else {
						res.send(`../${basePath}`);
					}
				});
				return;
			} else {
				res.sendStatus(404);
				return;
			}
		}
	}
	res.sendStatus(401);
});

app.post('/api/auth/revokeKey', (req: Request, res: Response) => {
	const head = req.headers;
	const key = req.headers.authorization;
	if (head.bytecode) {
		if (head.bytecode === 'authKeyToken') {
			if (key) {
				validKeys.delete(key);
				res.send('Key revoked');
				return;
			}
		}
	}
	res.sendStatus(400);
});

export default function startWebServer() {
	app.listen(3000);
}
