module.exports = { hasNewUsername, getTimestamp, getDatestamp };

async function hasNewUsername(x, returnUsername, type) {
	if (type == 'member') {
		const discriminator = x.user.discriminator;
		const field = discriminator.split('#');
		const len = field[0].split('').length;
		if (len != 4) {
			if (returnUsername == true) return x.user.username;
			return true;
		}
		if (len == 4) {
			if (returnUsername == true) return x.user.tag;
			return false;
		}
		return;
	}
	if (type == 'user') {
		const discriminator = x.discriminator;
		const field = discriminator.split('#');
		const len = field[0].split('').length;
		if (len != 4) {
			if (returnUsername == true) return x.username;
			return true;
		}
		if (len == 4) {
			if (returnUsername == true) return x.tag;
			return false;
		}
		return;
	}
	return;
}

function getTimestamp() {
	const date = new Date();
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

function getDatestamp() {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const week = getWeekNumber(date);

	return `D:${day}_W:${week}_M:${month}_Y:${year}`;
}

function getWeekNumber(date) {
	const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
	return weekNumber;
}
