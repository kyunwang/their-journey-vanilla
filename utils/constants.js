// var winWidth = window.innerWidth;
var winWidth = document.body.clientWidth;
// var winHeight = window.innerHeight - 120;
// var winHeight = document.body.clientHeight - 120;
var winHeight = document.body.clientHeight;

// Data vars
var refugeeData;
var timeData;

var directionMapping = [];
var countryCenter;

var journeyData;

// Animation var
var transDur = 1000;
var transDurShort = transDur / 2;
var delayDur = 100;
var delayDurShort = 10;




// From https://github.com/lucified/lucify-refugees/blob/155bb072d10a3f8459a88da8305aa77130ab7806/src/js/model/map-model.js
var correctCenter = {
	FRA: [2.449486512892406, 46.62237366531258],
	SWE: [15.273817, 59.803497],
	FIN: [25.356445, 61.490593],
	NOR: [8.506239, 60.975869],
	GBR: [-1.538086, 52.815213],
	GRC: [21.752930, 39.270271],
	RUS: [51.328125, 56.641127],
	HUN: [18.632813, 47.159840],
}


// Seriously need iso codes instead but timeconstrains mate
function getName(country) {
	// console.log(country);
	switch(country) {
		case 'United Kingdom of Great Britain and Northern Ireland':
			return 'United Kingdom';
		case 'Dem. Rep. of the Congo':
			return 'Dem. Rep. Congo'
		case 'Iran (Islamic Rep. of)':
			return 'Iran';
		case 'Palestinian':
			return 'Palestine';
		case 'The former Yugoslav Rep. of Macedonia':
			return 'Macedonia';
		case 'Rep. of Moldova':
			return 'Moldova';
		case 'United Rep. of Tanzania':
			return 'Tanzania';
		case 'Serbia and Kosovo (S/RES/1244 (1999))': // No hard feelings Kosovo
			return 'Serbia';
		case 'Serbia and Kosovo: S/RES/1244 (1999)':
			return 'Serbia';
		
		// case 'Dem. People's Rep. of Korea':
		case "Lao People's Dem. Rep.":
			return 'Lao';
		case 'Bosnia and Herzegovina':
			return 'Bosnia and Herz.';
		case 'Czech Rep.':
			return 'Czechia';
		case 'Russian Federation':
			return 'Russia';
		case 'Syrian Arab Rep.':
			return 'Syria';
		case 'Equatorial Guinea':
			return 'Eq. Guinea';
		case 'Saint Kitts and Nevis':
			return 'St. Kitts and Nevis';
		case 'Western Sahara':
			return 'W. Sahara';
		case 'Bolivia (Plurinational State of)':
			return 'Bolivia';
		case 'Venezuela (Bolivarian Republic of)':
			return 'Venezuela';
		case 'South Sudan':
			return 'S. Sudan';
		case 'Antigua and Barbuda':
			return 'Antigua and Barb.';
		case 'Saint Vincent and the Grenadines':
			return 'St. Vin. and Gren..';



			
		default: 
			return country;
	}
}



var toIgnore = [
	'Canada', 'Australia', 'New Zealand', 'Japan', 'Rep. of Korea', 'Turkey',
	'Stateless', 'Various/unknown', 'Tibetan', 'USA (EOIR)', 'USA (INS/DHS)', "Dem. People's Rep. of Korea", 'Viet Nam', 'Jamaica', 'Chile', 'Brazil', 'Colombia', 'Cuba', 'United States of America', 'Honduras', 'El Salvador', 'Mexico', 'Dominican Rep.', 'Venezuela', 'Guatemala', 'Solomon Islands', 'Peru', 'Lao', 'Sao Tome and Principe', 'Ecuador', 'Argentina', 'Bahamas'
 ]


var toInclude = [
	'SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERI', 'PAK', 'SOM', 'CHI', 'UKR', 'TUR', 'CYP', 'PSE'
];

var toIncConti = ['Europe'] ;
var toIncRegio = ['Sub-Saharan Africa', 'Middle East & North Africa'];
var toIncSubRegio = ['Western Asia', 'Central Asia', 'Southern Asia', 'Eastern Asia', 'South-Eastern Asia'];