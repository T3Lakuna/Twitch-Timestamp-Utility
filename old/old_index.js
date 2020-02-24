const request = require("request");
const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");

/*
// OpenWeatherMap example API usage.
const city = 'fort worth'
const key = fs.readFileSync('apikey');
const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}&units=imperial`

async function streamMarker() {
	const response = JSON.parse(await new Promise((resolve, reject) => {
		request(url, function(err, response, body) {
			if (err) { reject(err); } else { resolve(body); }
		});
	}));
	console.log(`Temperature in ${response.name}: ${response.main.temp}`);
}

streamMarker();
*/

console.log('Starting localhost to get API key from Twitch. Do not close this window.');

http.createServer(function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/html'});
	response.end('Recieved API key from Twitch. You can close this window.');
}).listen(8080);
