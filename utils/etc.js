module.exports = { hasNewUsername };

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
