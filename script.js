let results = {};
function fetchCalcul() {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", "/results", true);
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4 && xhr.status === 200) {
				results = JSON.parse(xhr.responseText);
				resolve(results);
			}
		};
		xhr.onerror = () => {
			reject(xhr.statusText);
		};
		xhr.send();
	});
}

function extractData(results, name) {
	return Object.values(results).map((result) => result[name]);
}

function getAllUsers(results) {
	const users = [];
	for (const result of Object.values(results)) {
		for (const user of Object.keys(result)) {
			if (!users.includes(user)) {
				users.push(user);
			}
		}
	}
	return users;
}

let chart = null;
async function displayResultsChart() {
	const results = await fetchCalcul();
	document.getElementById("loading").style.display = "none";
	document.getElementById("search").style.display = "block";
	chart = new Chart(document.getElementById("myChart"), {
		type: "line",
		data: {
			labels: Object.keys(results).map((result) => {
				const date = new Date(result);
				console.log(typeof date);

				return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
			}),
			datasets: getAllUsers(results).map((user) => ({
				label: user,
				data: extractData(results, user),
				fill: false,
				cubicInterpolationMode: "monotone",
				tension: 0.4,
			})),
		},
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: "Visualisation des résultats",
				},
			},
			interaction: {
				intersect: false,
			},
			scales: {
				x: {
					display: true,
					title: {
						display: true,
					},
				},
				y: {
					display: true,
					title: {
						display: true,
						text: "Nombre de points",
					},
					suggestedMin: 0,
					suggestedMax: 200,
				},
			},
		},
	});
}

function searchPerson() {
	if (chart === null) {
		return;
	}

	const search = document.getElementById("search").value;
	const users = getAllUsers(results);
	const datasets = chart.data.datasets;
	for (let i = 0; i < datasets.length; i++) {
		if (users[i].includes(search)) {
			datasets[i].hidden = false;
		} else {
			datasets[i].hidden = true;
		}
	}
	chart.update();
}

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("search").style.display = "none";
	displayResultsChart();
});
