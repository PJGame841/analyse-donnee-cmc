const express = require("express");
const moteur = require("./moteur");

const app = express();

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/mapage.html");
});

app.get("/script.js", (req, res) => {
	res.sendFile(__dirname + "/script.js");
});

app.get("/results", async (req, res) => {
	const results = await moteur();

	res.json(results);
});

app.listen(3000, () => {
	console.log("Server started on http://localhost:3000");
});
