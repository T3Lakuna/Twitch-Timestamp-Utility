const express = require("express");
const request = require("request");

const router = express.Router();

router.get("/", function(req, res, next) { 
	const options = {
		method: "GET",
		url: "https://api.twitch.tv/helix/users/",
		qs: { login: "t3lacuna" },
		headers: { "Client-ID": "2be6yrftbjgdrs0hov5lhz3uszezzv" }
	};

	request(options, function(error, response, body) {
		if (error) { throw new Error(error); }
		console.log(JSON.parse(body));
	});

	res.render("token");
});

module.exports = router;
