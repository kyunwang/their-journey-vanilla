var svgCon = d3.select('#svg-con');
var winWidth = window.innerWidth;
var winHeight = window.innerHeight - 120;
// d3.json('/ne_50m_admin_0_countries_lakes.json', loadMap);

var refugeeData;
var timeData;
var directionMapping = [];
var countryCenter;

d3.text('../data/to_germany_2014.csv', loadRefugee);
// d3.text('../data/all_refugees12.csv', loadRefugee);
// d3.text('../data/all_refugees12-17.csv', loadRefugee);
// d3.json('/asylum.csv', loadRefugee);


// function loadMap(err, res) {
// 	if (err) return err;

// }

function loadRefugee(err, res) {
	if (err) return err;

	refugeeData = cleanRefugee(res);
	cleanTime(refugeeData)
	// console.log(refugeeData);
} 