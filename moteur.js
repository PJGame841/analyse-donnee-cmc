// Connect to mysql
const mysql = require("mysql");
const connection = mysql.createConnection({
	host: "localhost", //"e-srv-lamp.univ-lemans.fr",
	port: 3306,
	user: "root",
	//password: "Yaz335bx",
	database: "ensim",
});

connection.connect((err) => {
	if (err) {
		console.log("Error connecting to Db", err);
		return;
	}
	console.log("Connection established");
});

function fetchMessagesTransitions() {
	return new Promise((resolve, reject) => {
		connection.query(
			'SELECT * FROM transition WHERE Titre = "Poster un nouveau message" ORDER BY Date ASC, Heure ASC',
			(err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			}
		);
	});
}

function fetchMessageAnswersTransitions(idMessage) {
	return new Promise((resolve, reject) => {
		connection.query(
			'SELECT * FROM transition WHERE Attribut LIKE ? AND Titre = "Répondre à un message"',
			[`%IDMsg=${idMessage}%`],
			(err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			}
		);
	});
}

function fetchMessageCitationsTransitions(idMessage) {
	return new Promise((resolve, reject) => {
		connection.query(
			'SELECT * FROM transition WHERE Attribut LIKE ? AND Titre = "Citer un message"',
			[`%IDMsg=${idMessage}%`],
			(err, rows) => {
				if (err) {
					reject(err);
				}
				resolve(rows);
			}
		);
	});
}

function formatAttributs(attributs) {
	const result = {};
	const list = attributs.split(",");
	for (const item of list) {
		const [key, value] = item.split("=");
		result[key] = value;
	}
	return result;
}

async function calcul() {
	// Les resultats sont par jours et par utilisateur
	/* format: {
		"2009-02-12": {
			"mmay": {
				"messages": 3,
				"nbCitationsDeSesMessages": 2,
				"nbReponsesDeSesMessages": 1,
			},
		}
	}*/
	const result = {};
	const messages = await fetchMessagesTransitions();

	for (const message of messages) {
		const attributs = formatAttributs(message.Attribut);
		const answers = await fetchMessageAnswersTransitions(attributs.IDMsg);
		const citations = await fetchMessageCitationsTransitions(attributs.IDMsg);

		if (result[message.Date] === undefined) {
			// Copy last date
			const lastDate = Object.keys(result).pop();
			if (lastDate) {
				result[message.Date] = { ...result[lastDate] };
			} else {
				result[message.Date] = {};
			}
		}

		const user = message.Utilisateur;
		if (result[message.Date][user] === undefined) {
			result[message.Date][user] = {
				messages: 1,
				nbCitationsDeSesMessages: citations.length,
				nbReponsesDeSesMessages: answers.length,
			};
		} else {
			result[message.Date][user] = {
				messages: result[message.Date][user].messages + 1,
				nbCitationsDeSesMessages:
					result[message.Date][user].nbCitationsDeSesMessages +
					citations.length,
				nbReponsesDeSesMessages:
					result[message.Date][user].nbReponsesDeSesMessages + answers.length,
			};
		}
	}

	const pts = {};
	for (const date in result) {
		pts[date] = {};

		for (const user in result[date]) {
			pts[date][user] =
				result[date][user].messages +
				result[date][user].nbCitationsDeSesMessages +
				result[date][user].nbReponsesDeSesMessages;
		}
	}

	return pts;
}

calcul().then((result) => {
	console.log(result);
});

module.exports = calcul;
