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
	await journeyData.map(data => {
		data.journey.map((country, i) => {
			journeyData[numb].journeyCoords.push(countryCenter[country])
		})
	})


	// console.log(countryCenter);
	console.log(journeyData[numb].journeyCoords);
	// console.log(mapPath(journeyData[numb].journeyCoords));
	// console.log(mapPath);


	var pathLine = d3.line()
		.x(function (d) { return projection(d)[0]; })
		.y(function (d) { return projection(d)[1]; })
		// .curve("curveCardinal")
		.curve(d3.curveCardinal)


	var journeyMap = mapCon.append('g')
		.selectAll('path')
		.data(journeyData)
	// .data(journeyData[numb].journeyCoords)

	// journeyMap.append('path')
	// .attr('d', pathLine(journeyData[numb].journeyCoords))

	journeyMap.enter()
		.append('path')
		// .style('fill', 'none')
		// .attr('d', mapPath)
		.attr('d', pathLine(journeyData[numb].journeyCoords))
		// .attr('d', pathLine(journeyData))
		.attr('fill', 'none')
		.attr('stroke', '#000')


	// journeyMap
	// 	.attr('d', d => { console.log(d); mapPath(d) })
	// 	.attr('x2', d => getCenterX(d.Origin))
	// .attr('y2', d => getCenterY(d.Origin))



	// var journeyMap = mapCon.append('g')
	// 	.selectAll('line')
	// 	.data(journeyData);


	// journeyMap.enter()
	// 	.append('line')
	// 	.attr('x1', d => {
	// 		console.log(d);
	// 		getCenterX(d)
	// 	})
	// 	.attr('y1', d => getCenterY(d))
	// .attr('x2', d => getCenterX(d.Origin))
	// .attr('y2', d => getCenterY(d.Origin))
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