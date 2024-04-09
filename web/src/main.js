let keyV;
async function checkCookies(again) {
	keyV = undefined;
	const cookies = document.cookie;
	if (!cookies.includes('key')) {
		if (again) {
			do {
				keyV = prompt('Ključ nepravilen. Vnesite ponovno.');
			} while (!keyV);
		} else {
			do {
				keyV = prompt('Vnesite ključ.');
			} while (!keyV);
		}
		axios
			.get('http://localhost:3000/api/auth/isKeyValid', {
				headers: {
					bytecode: 'authKeyToken',
					Authorization: keyV
				}
			})
			.then((res) => {
				document.cookie = 'key=' + keyV;
			})
			.catch((err) => {
				console.error(err);
				const statusCode = err.response.status;
				if (statusCode === 403) {
					checkCookies(true);
				}
			});
	} else {
		keyV = document.cookie.split('=')[1];
		axios
			.get('http://localhost:3000/api/auth/isKeyValid', {
				headers: {
					bytecode: 'authKeyToken',
					Authorization: keyV
				}
			})
			.then((res) => {})
			.catch((err) => {
				keyV = undefined;
				document.cookie = `key=${keyV}=;expires=${new Date(0).toUTCString()}`;
				console.error(err);
				const statusCode = err.response.status;
				if (statusCode === 403) {
					checkCookies();
				}
			});
	}
}

function redirectToURL() {
	var inputURL = document.getElementById('inputURL').value;
	if (inputURL == null || inputURL == '') {
		alert('Polje z kodo ne mora biti prazno!');
		return false;
	}
	axios
		.get('http://localhost:3000/api/auth/isKeyValid', {
			headers: {
				bytecode: 'authKeyToken',
				Authorization: keyV
			}
		})
		.then((res) => {
			axios
				.get('http://localhost:3000/api/transcript/getPath', {
					headers: {
						bytecode: 'authKeyToken',
						ticketnumber: inputURL
					}
				})
				.then((res) => {
					window.document.getElementById('frame').src = res.data;
				})
				.catch((err) => {
					const statusCode = err.response.status;
					if (statusCode === 403) {
						checkCookies();
					}
				});
		})
		.catch((err) => {
			const statusCode = err.response.status;
			if (statusCode === 403) {
				checkCookies();
			}
		});
}
