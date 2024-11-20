const express = require("express");
const moteur = require("./moteur");

const app = express();

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/mapage.html");
});

app.get("/results", (req, res) => {
	const results = moteur();

	res.json(results);
});

app.listen(3000, () => {
	console.log("Server started on http://localhost:3000");
});
