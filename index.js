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

// Constants
const PORT = 4213;
const CLIENT_ID = '2be6yrftbjgdrs0hov5lhz3uszezzv';

// Variables.
let oauth = null;
let markKey = null;
let stopKey = null;
let user = null;
let userId = null;
let streamStartTime = null;

// Directories and files.
const dataPath = `${os.homedir()}/.t3/Twitch Timestamp Utility/`;
const outPath = `${dataPath}out/`;
const keybindFile = `${dataPath}keybinds.json`;
const userFile = `${dataPath}user.json`;
const outFile = `${outPath}${new Date().toISOString().replace(/:/g, '')}.txt`;

// Clear iohook log from screen.
console.clear();

// Make directories.
if (!fs.existsSync(outPath)) { fs.mkdirSync(outPath, { recursive: true }); }

// Load variables.
if (fs.existsSync(keybindFile)) {
	const data = JSON.parse(fs.readFileSync(keybindFile));
	markKey = data.markKey;
	stopKey = data.stopKey;
}
if (fs.existsSync(userFile)) {
	user = JSON.parse(fs.readFileSync(userFile)).user;
	start();
} else {
	readline.question('Twitch login name: ', loginName => {
		user = loginName;
		fs.writeFile(userFile, JSON.stringify({ user: user }), error => {
			if (error) { console.log(error); }
		});
		readline.close();
		start();
	});
}

// Start program.
function start() {
	// Create Express app to get OAuth token.
	const app = express();
	app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}\\index.html`)));
	app.get('/token', (req, res) => {
		oauth = req.query.token;
		request({
			url: `https://api.twitch.tv/helix/users?login=${user}`,
			headers: {
				'Client-ID': CLIENT_ID,
				'Authorization': `Bearer ${oauth}`
			}
		}, (err, response, body) => {
			userId = JSON.parse(body).data[0].id;
			console.log(`User: ${user} - ${userId}`);

			getStartTime();
		});

		res.sendFile(path.join(`${__dirname}\\token.html`));
		app.tokenServer.close();
	});
	app.tokenServer = app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));

	// Open OAuth request page in browser.
	open(`https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=http://localhost:${PORT}&response_type=token&scope=`);
}

function getStartTime() {
	const timer = setInterval(() => {
		request({
			url: `https://api.twitch.tv/helix/streams?user_id=${userId}`,
			headers: {
				'Client-ID': CLIENT_ID,
				'Authorization': `Bearer ${oauth}`
			}
		}, (err, response, body) => {
			try {
				streamStartTime = new Date(JSON.parse(body).data[0].started_at.slice(0, -1));
				console.log(`Stream start time: ${streamStartTime.toISOString()}`);
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
	console.clear(); // Clear user information from screen.
	iohook.start();
	if (!markKey) { console.log('Please press a key to set it as your mark key.'); } else { console.log(`Mark key: ${markKey}\nStop key: ${stopKey}`); }
	iohook.on('keydown', event => {
		if (!markKey) {
			markKey = event.rawcode;
			console.log('Please press a key to set it as your stop key.');
		} else if (!stopKey) {
			stopKey = event.rawcode;
			fs.writeFile(keybindFile, JSON.stringify({ markKey: markKey, stopKey: stopKey }), error => {
				if (error) { console.log(error); }
			});
			console.clear(); // Clear key setup logging from screen.
		} else if (event.rawcode == markKey) {
			const now = new Date();
			now.setHours(now.getHours() + (now.getTimezoneOffset() / 60));
			fs.appendFile(outFile, timeInIncrements(now - streamStartTime, [24, 60, 60, 1000]) + '\n', error => {
				if (error) { console.log(error); }
			});
		} else if (event.rawcode == stopKey) {
			// Open output directory and end program.
			require('child_process').exec(`start "" "${outPath}"`, () => { process.exit(); });
		}
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
