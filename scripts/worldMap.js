/*=================
=== Global vars
=================*/
var mapCon = d3.select('#svg-map');
// var mapCon = d3.select('#svg-con');

// var mapWidth = parseInt(mapCon.style('width'), 10);
// var mapHeight = parseInt(mapCon.style('height'), 10);

var world = mapCon
	.attr('viewBox', `0 0 ${winWidth - 200} ${winHeight + 400}`)
	.attr('width', winWidth)
	.attr('height', winHeight)
	.append('g')
	.attr('class', 'world');

// To enable plotting with coordinates
var lo = 26.2206322; // x
var la = 46.0485818; // y

var projection = d3.geoMercator();

var mapPath = d3.geoPath()
	.projection(projection)
	.pointRadius(1.5);

projection
	// .center([-100, 40.5])
	.center([0, la])
	.rotate([-lo, 0])
	// .scale(mapWidth * 0.55)
	.scale(300)
// .translate([this.props.svgWidth / 2, this.props.svgHeight / 2]);


d3.json('data/ne_50m_admin_0_countries_lakes.json', loadMap);

function loadMap(err, res) {
	if (err) return err;
	console.log(res);

	var topoPath = topojson.feature(res, res.objects.countries).features;


	// Get center of countries and directions
	topoPath.map(item => {
		directionMapping = [
			...directionMapping,
			{ name: item.properties.ADMIN, coords: d3.geoCentroid(item) }
		]
		countryCenter = {
			...countryCenter,
			[item.properties.ADMIN]: d3.geoCentroid(item)
		}
	})


	world.selectAll('path')
		.data(topoPath)
		.enter()
		.append('path')
		.attr('class', 'country')
		.attr('d', mapPath)

}