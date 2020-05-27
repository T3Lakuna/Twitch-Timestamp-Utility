// Load dependencies.
const express = require('express'); // Easy way to host multiple pages.
const iohook = require('iohook'); // Get global keyboard input.
const dotenv = require('dotenv'); // Load environment variables from file.
const path = require('path'); // Load files from index.js directory.
const open = require('open'); // Open authentication page in web browser.
const fs = require('fs'); // Write to files on file system.
const os = require('os'); // Get special directories.
const request = require('request'); // Get data from Twitch API.
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout }); // Get input from the user.

// Load variables.
dotenv.config();
let oauth = null;
let markKey = null;
let stopKey = null;
let user = null;
let userId = null;
let streamStartTime = null;
const dataPath = os.homedir() + process.env.DATA_PATH;
if (!fs.existsSync(dataPath)) { fs.mkdirSync(dataPath, { recursive: true }); }
if (fs.existsSync(dataPath + process.env.KEYBIND_FILE)) {
	const data = JSON.parse(fs.readFileSync(dataPath + process.env.KEYBIND_FILE));
	markKey = data.markKey;
	stopKey = data.stopKey;
}
if (fs.existsSync(dataPath + process.env.USER_FILE)) {
	user = JSON.parse(fs.readFileSync(dataPath + process.env.USER_FILE)).user;
	start();
} else {
	readline.question('Twitch login name: ', loginName => {
		user = loginName;
		fs.writeFile(dataPath + process.env.USER_FILE, JSON.stringify({ user: user }), error => {
			if (error) { console.log(error); }
		});
		readline.close();
		start();
	});
}

function start() {
	// Create Express app to get OAuth token.
	const app = express();
	app.get('/', (req, res) => res.sendFile(path.join(__dirname + '\\index.html')));
	app.get('/token', (req, res) => {
		oauth = req.query.token;
		request({
			url: process.env.USER_ID_REQUEST + user,
			headers: {
				'Client-ID': process.env.CLIENT_ID,
				'Authorization': 'Bearer ' + oauth
			}
		}, (err, response, body) => {
			userId = JSON.parse(body).data[0].id;
			console.log('User: ' + user + ' - ' + userId);

			getStartTime();
		});

		res.sendFile(path.join(__dirname + '\\token.html'));
		app.tokenServer.close();
	});
	app.tokenServer = app.listen(process.env.PORT, () => console.log('Now listening on port ', process.env.PORT));

	// Open OAuth request page in browser.
	open(process.env.AUTH_URL + '?client_id=' + process.env.CLIENT_ID + '&redirect_uri=' + process.env.REDIRECT_URI + '&response_type=token&scope=');
}

function getStartTime() {
	const timer = setInterval(() => {
		request({
			url: process.env.STREAM_REQUEST + userId,
			headers: {
				'Client-ID': process.env.CLIENT_ID,
				'Authorization': 'Bearer ' + oauth
			}
		}, (err, response, body) => {
			try {
				streamStartTime = new Date(JSON.parse(body).data[0].started_at.slice(0, -1));
				console.log('Stream start time:', streamStartTime.toISOString());
				clearInterval(timer);
				startHook();
			} catch (error) {
				if (error.name != 'TypeError') { console.log(error); }
			}
		});
	}, 1000);
}

// Start hook.
function startHook() {
	iohook.start();
	if (!markKey) { console.log('Please press a key to set it as your mark key.'); } else { console.log('Mark key:', markKey, '\nStop key:', stopKey); }
	iohook.on('keydown', event => {
		if (!markKey) {
			markKey = event.rawcode;
			console.log('Mark key set:', markKey);
			console.log('Please press a key to set it as your stop key.');
		} else if (!stopKey) {
			stopKey = event.rawcode;
			console.log('Stop key set:', stopKey);
			fs.writeFile(dataPath + process.env.KEYBIND_FILE, JSON.stringify({ markKey: markKey, stopKey: stopKey }), error => {
				if (error) { console.log(error); }
			});
		} else if (event.rawcode == markKey) {
			const now = new Date();
			now.setHours(now.getHours() + (now.getTimezoneOffset() / 60));
			console.log();
			fs.appendFile(dataPath + process.env.OUTPUT_FILE, timeInIncrements(now - streamStartTime, [24, 60, 60, 1000]) + '\n', error => {
				if (error) { console.log(error); }
			});
		} else if (event.rawcode == stopKey) { process.exit(); }
	});
}

function timeInIncrements(time, increments) {
	let parts = [];
	let remainingTime = time;
	for (let i = 0; i < increments.length; i++) {
		parts.push(Math.floor(remainingTime / multiplyParts(increments.slice(i))));
		remainingTime = remainingTime % multiplyParts(increments.slice(i));
	}
	let resultString = '';
	parts.forEach(part => resultString += part + ':');
	return resultString.slice(0, -1);
}

function multiplyParts(parts) {
	total = 1;
	parts.forEach(part => total *= part);
	return total;
}
