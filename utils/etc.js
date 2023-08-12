module.exports = { hasNewUsername, getTimestamp };

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
