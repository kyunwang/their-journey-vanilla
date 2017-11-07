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
	.scale(winWidth * 0.55)
	// .scale(300)
	.translate([winWidth / 2.5, winHeight / 2]);



function loadMap(err, res) {
	if (err) return err;

	var topoPath = topojson.feature(res, res.objects.countries).features;

	// Get center of countries and directions
	topoPath.map(item => {


		directionMapping = [
			...directionMapping,
			{ name: item.properties.NAME, coords: d3.geoCentroid(item) }
		]
		countryCenter = {
			...countryCenter,
			[item.properties.NAME]: d3.geoCentroid(item)
		}


		// Quick fix for center of France (prototype)
		if (item.properties.NAME === 'France') {
			var frCoords = [2.449486512892406, 46.62237366531258];

			directionMapping = [
				...directionMapping,
				{ name: item.properties.NAME, coords: frCoords }
			]
			countryCenter = {
				...countryCenter,
				[item.properties.NAME]: frCoords
			}
		}
	})


	world.selectAll('path')
		.data(topoPath)
		.enter()
		.append('path')
		.attr('class', 'country')
		.attr('d', mapPath)


	// centerPoints();
	// mapTraject();
	mapJourney(0);
}


function centerPoints(data) {
	var mapCenter = mapCon.append('g')
		.attr('class', 'country-center')
		// .selectAll('circle')
		.selectAll('.c-cirlce')
		.data(directionMapping)

	mapCenter.enter()
		.append('circle')
		.attr('class', 'c-center')
		.attr('cx', d => projection(d.coords)[0])
		.attr('cy', d => projection(d.coords)[1])
		.attr('r', 5)
		.attr('fill', '#00CC99')
		.attr('stroke', '#fff')
}

function mapTraject() {
	var routeTraject = mapCon.append('g')
		.selectAll('line')
		.data(refugeeData);

	routeTraject.enter()
		.append('line')
		.attr('class', 'trajectory')
		.attr('x1', d => getCenterX(d.Origin))
		.attr('y1', d => getCenterY(d.Origin))
		.attr('x2', d => getCenterX(d.Origin))
		.attr('y2', d => getCenterY(d.Origin))
		.transition()
		.duration(transDur)
		// .delay(delayDur)
		.delay((d, i) => seqDelay(i))
		.attr('x2', d => getCenterX(d.Destination))
		.attr('y2', d => getCenterY(d.Destination))

}


async function mapJourney(numb) {

	var journeyRoute = [];
	var checkpoint;

	// await journeyData.map(data => {
	journeyData.map(data => {
		data.journey.map((country, i) => {
			journeyData[numb].journeyCoords.push(countryCenter[country]);
			// journeyRoute.push(countryCenter[country]);
			// console.log(country);
		})
	})

	// journeyRoute.push(journeyData[numb].journeyCoords[0]);
	// console.log(journeyRoute);

	var pathLine = d3.line()
		.x(function (d) { return projection(d)[0]; })
		.y(function (d) { return projection(d)[1]; })
		// .curve(d3.curveCardinal)
		.curve(d3.curveCatmullRom)


	var journeyMap = mapCon.append('g')
		.append('path')
		.datum(journeyRoute)
		.attr('class', 'journey-line')
		.attr('d', pathLine(journeyRoute))
		// .attr('d', pathLine(journeyData[numb].journeyCoords))
		.transition()
		.duration(transDur)
		.attrTween('stroke-dasharray', function (d) { // Tween source: https://www.yerich.net/blog/bezier-curve-animation-using-d3
			var len = journeyMap.node().getTotalLength();
			return function (t) {
				checkpoint = len;
				return (d3.interpolateString(`0, ${len}`, `${len}, 0`))(t);
			};
		})


	// Add function for handleing the advent of the journey
	// function handleJourney() {
	d3.select('#plus').on('click', addJourneyRoute)
	d3.select('#minus').on('click', removeJourneyRoute)



	var journeyDestinations = mapCon.append('g')
		.attr('class', 'spots-con')
	// .selectAll('.me')
	// .data(journeyRoute)


	// Update the journey spots/stops
	function updateHotspot() {
		var updateJourney = mapCon.selectAll('.me').data(journeyRoute)

		updateJourney
			.enter()
			.append('circle')
			.attr('class', 'me')
			.attr('r', 0)
			.attr('cx', d => { return projection(d)[0] })
			.attr('cy', d => projection(d)[1])
			.transition()
			.duration(transDur)
			.attr('r', 10)
			.attr('cx', d => { return projection(d)[0] })
			.attr('cy', d => projection(d)[1])
			.attr('fill', 'blue');

		// updateJourney.transition()
		// updateJourney
		// 	.attr('fill', 'yellow');

		updateJourney.exit()
			.transition()
			.duration(transDurShort)
			.attr('r', 0)
			.remove();
	}


	function addJourneyRoute() {
		var jCoords = journeyData[numb].journeyCoords;

		// Checking wether to add route
		if (journeyRoute.length < jCoords.length) {
			// Get safe the current length 
			checkpoint = journeyMap.node().getTotalLength();

			// Add new route/data
			journeyRoute.push(jCoords[journeyRoute.length]);

			// Updating
			d3.select(journeyMap.node())
				.attr('d', pathLine(journeyRoute))
				.transition()
				.duration(transDur)
				.attrTween('stroke-dasharray', function (d) {
					var len = journeyMap.node().getTotalLength();
					return function (t) {
						return (d3.interpolateString(`${checkpoint}, ${len}`, `${len}, 0`))(t);
					};
				})
			updateHotspot();


			// Need another check when new data and different data comes in 

		}
	}

	function removeJourneyRoute() {
		var jCoords = journeyData[numb].journeyCoords;

		// Checking wether to remove route
		if (journeyRoute.length > 0) {
			// Save current length
			checkpoint = journeyMap.node().getTotalLength();

			// Remove route/data
			journeyRoute.pop();

			// Updating
			d3.select(journeyMap.node())
				.attr('d', pathLine(journeyRoute))
				.transition()
				.duration(transDur)
				.attrTween('stroke-dasharray', function (d) {
					var len = journeyMap.node().getTotalLength();
					return function (t) {
						return (d3.interpolateString(`${0}, ${len}`, `${len}, 0`))(t);
					};
				});
			updateHotspot();
		}
	}


}

/*=================
=== General functions
=================*/
function getCenterX(data) {
	if (countryCenter[data] === undefined) return;
	return projection(countryCenter[data])[0]
}

function getCenterY(data) {
	if (countryCenter[data] === undefined) return;
	return projection(countryCenter[data])[1]
}

function seqDelay(index) {
	return index * delayDur;
}