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


	// centerPoints();
	// mapTraject()
	mapJourney(0);
}


function centerPoints(data) {
	var mapCenter = mapCon.append('g')
		.attr('class', 'country-center')
		.selectAll('circle')
		.data(directionMapping)

	mapCenter.enter()
		.append('circle')
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


	// await journeyData.map(data => {
	journeyData.map(data => {
		data.journey.map((country, i) => {
			journeyData[numb].journeyCoords.push(countryCenter[country])
		})
	})

	var journeyRoute = [journeyData[numb].journeyCoords[0]]
	var journeyRoute = [journeyData[numb].journeyCoords[0], journeyData[numb].journeyCoords[1]]
	// var journeyRoute = journeyData[numb].journeyCoords

	// console.log(countryCenter);
	// console.log(journeyData[numb].journeyCoords[0]);
	// console.log(mapPath(journeyData[numb].journeyCoords));
	// console.log(mapPath);


	var pathLine = d3.line()
		.x(function (d) { return projection(d)[0]; })
		.y(function (d) { return projection(d)[1]; })
		.curve(d3.curveCardinal)


	// var journeyMap = mapCon.append('g')
	// 	.select('path')
	// 	// .selectAll('path')
	// 	// .data(journeyRoute)
	// 	.datum(journeyRoute)
	// // .data(journeyData)


	// console.log(pathLine([journeyData[numb].journeyCoords[0]]));
	// console.log(pathLine(journeyRoute));

	// journeyMap.enter()
	// 	.append('path')
	// 	.attr('class', 'journey-line')
	// 	// .attr('d', pathLine([journeyData[numb].journeyCoords[0], journeyData[numb].journeyCoords[1]]))
	// 	// .attr('d', pathLine(journeyData[numb].journeyCoords))
	// 	.attr('d', pathLine(journeyRoute))
	// 	.transition()
	// 	.duration(transDur)
	// 	// .delay(5000)
	// 	.attrTween('stroke-dasharray', function (d) {
	// 		console.log(d, this);
	// 		var len = this.getTotalLength();
	// 		// var len = journeyMap.node().getTotalLength();

	// 		console.log(len);
	// 		// console.log(this[0]);
	// 		// t =  the duration set
	// 		return function (t) { return (d3.interpolateString('0,' + len, len + ',0'))(t) };
	// 	});

	// journeyMap
	// 	// .attr('d', pathLine(journeyData[numb].journeyCoords))
	// 	// .attr('d', pathLine(journeyRoute))
	// 	.attr('d', d => { console.log(d); return pathLine(journeyRoute) })
	// 	.transition()
	// 	.duration(transDur)
	// 	// .delay(5000)
	// 	.attrTween('stroke-dasharray', function () {
	// 		// var len = this.getTotalLength();
	// 		var len = this.node().getTotalLength();
	// 		console.log(len);
	// 		// t =  the duration set
	// 		return function (t) { return (d3.interpolateString('0,' + len, len + ',0'))(t) };
	// 	});

	// .append('path')
	// .datum(data)
	// .attr('class', 'line')
	// .transition()
	// .duration(500)
	// .ease(d3.easeLinear)
	// .on('start', tick);

	var journeyMap = mapCon.append('g')
		// .select('path')
		.append('path')
		.datum(journeyRoute)
		.attr('class', 'journey-line')
		.attr('d', pathLine(journeyRoute))
		.transition()
		.duration(transDur)
		// .delay(5000)
		.attrTween('stroke-dasharray', function (d) { // Tween from https://www.yerich.net/blog/bezier-curve-animation-using-d3
			var len = this.getTotalLength();
			// t =  the duration set
			return function (t) { return (d3.interpolateString('0,' + len, len + ',0'))(t) };
		});



	// Add function for r
	d3.select('#plus').on('click', addJourneyRoute)
	d3.select('#minus').on('click', removeJourneyRoute)

	function addJourneyRoute() {
		console.log('hi add route');
		let jCoords = journeyData[numb].journeyCoords

		// Checking wether to add route
		if (journeyRoute.length < jCoords.length) {
			// Add new route/data
			journeyRoute.push(jCoords[journeyRoute.length]);

			// Updating
			d3.select(journeyMap.node())
				.attr('d', pathLine(journeyRoute))
				.transition()
				.duration(transDur)
				.attrTween('stroke-dasharray', function (d) {
					var len = journeyMap.node().getTotalLength();
					return function (t) { return (d3.interpolateString('0,' + len, len + ',0'))(t) };
				});
			// Need another check when new data and different data comes in 

		}
	}
	function removeJourneyRoute() {
		console.log('bye remove route');
		let jCoords = journeyData[numb].journeyCoords

		// Checking wether to add route
		if (journeyRoute.length > 0) {
			// Add new route/data
			journeyRoute.pop();

			// Updating
			d3.select(journeyMap.node())
				.attr('d', pathLine(journeyRoute))
				.transition()
				.duration(transDur)
				.attrTween('stroke-dasharray', function (d) {
					var len = journeyMap.node().getTotalLength();
					return function (t) { return (d3.interpolateString('0,' + len, len + ',0'))(t) };
				});
			// Need another check when new data and different data comes in 

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