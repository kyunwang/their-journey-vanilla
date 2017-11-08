/*=================
=== Global vars
=================*/
var mapCon = d3.select('#svg-map');
// var mapCon = d3.select('#svg-con');

// var mapWidth = winWidth - 200;
// var mapHeight = winHeight + 400;

var world = mapCon
	.attr('viewBox', `0 0 ${winWidth - 200} ${winHeight + 400}`)
	.attr('width', winWidth)
	.attr('height', winHeight)
	.append('g')
	.attr('class', 'world');

// To enable plotting with coordinates
// To center the map to a certain degree
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
	.scale(winWidth * 0.65)
	// .scale(200)
	.translate([winWidth / 4, winHeight / 1.5]);

// Vars for zooming
var mapZScale = 4;
var scaleMulti = mapZScale - 1;


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
		if (correctCenter[item.properties.ADM0_A3]) {
			var adm0 = correctCenter[item.properties.ADM0_A3]

			directionMapping = [
				...directionMapping,
				{ name: item.properties.NAME, coords: adm0 }
			]
			countryCenter = {
				...countryCenter,
				[item.properties.NAME]: adm0
			}
		}
	})


	world.selectAll('path')
		.data(topoPath)
		.enter()
		.append('path')
		.attr('class', d => {
			return `${d.properties.NAME} country`
		})
		.attr('d', mapPath)
	// .on('mouseenter', (d) => { console.log(d.properties.NAME); })


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



function mapTraject(date) {
	// Filter the data
	var filterData = date !== 'all' ? refugeeData.filter(d => d.Datum === date) : refugeeData;

	console.log(filterData)

	var totalValue = filterData.reduce((a, b) => {
		a = a.Value ? a.Value : a;
		return (setNumber(a) + setNumber(b.Value));
	});

	console.log(totalValue);



	var testtotal = d3.nest()
		.key(d => d.Destination)
		.entries(filterData)
	console.log(testtotal);



	var routeTraject = mapCon.append('g')
		.attr('class', 'traject-con')
		.selectAll('line')
		// .data(refugeeData)
		.data(filterData);

	routeTraject.enter()
		.append('line')
		.attr('class', 'trajectory')
		// Assign starting point
		.attr('x1', d => {
			// console.log((d.Origin));
			console.log(d.Origin, getCenterX(d.Origin));
			return getCenterX(d.Origin)
		})
		.attr('y1', d => getCenterY(d.Origin))
		.attr('x2', d => getCenterX(d.Origin))
		.attr('y2', d => getCenterY(d.Origin))
		.transition()
		.duration(transDurShort)
		.delay((d, i) => seqDelayShort(i))
		// Transition to desitnation
		.attr('x2', d => getCenterX(d.Destination))
		.attr('y2', d => getCenterY(d.Destination))
		.transition()
		.duration(transDurShort)
		// End line at desitnation
		.attr('x1', d => getCenterX(d.Destination))
		.attr('y1', d => getCenterY(d.Destination))


	var routeBar = mapCon.append('g')
		.attr('class', 'refbar-con')
		.on('mouseenter', () => showRefTip(totalValue, date)) // Call on g to select whole area
		.on('mouseleave', hideRefTip)

		.selectAll('rect')
		.data(filterData)



	routeBar.enter()
		.append('rect')
		.attr('fill', 'red')
		.attr('x', d => getCenterX(d.Destination) - 5)
		.attr('y', d => getCenterY(d.Destination))
		.attr('height', 0)
		.attr('width', 10)
		.transition()
		.duration(transDur)
		.delay((d, i) => seqDelayShort(i))
		.attr('height', d => refbarHeight(d.Value))
		.attr('y', function (d) {
			// console.log(d.Destination);
			return getCenterY(d.Destination) - refbarHeight(d.Value);
		})

	// routeBar.selectAll('rect').attr('fill','blue')
	routeBar.attr('fill', 'blue')
	// routeBar.exit().remove


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
		.attr('class', 'journey-con')
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
	d3.select('#plus').on('click', addJourneyRoute)
	d3.select('#minus').on('click', removeJourneyRoute)



	var journeyDestinations = mapCon.append('g')
		.attr('class', 'spots-con')
	// .selectAll('.me')
	// .data(journeyRoute)


	// Update the journey spots/stops
	function updateHotspot(point, routeItem) {
		var updateJourney = mapCon
			.selectAll('.spots-stop')
			.data(journeyRoute)
			

		updateJourney
			.enter()
			.append('circle')
			.on('mouseenter', (d, i) => {
				console.log('data', d, i);
				// console.log(journeyRoute);
				console.log(journeyData[numb].story);
				return showStoryTip(journeyData[numb].story[i])
			})
			// .on('mouseleave', hideStoryTip)
				.attr('class', 'spots-stop')
				.attr('r', 0)
				.attr('cx', d => projection(d)[0])
				.attr('cy', d => projection(d)[1])
				.attr('fill', 'blue')
				.transition()
				.duration(transDur)			
				.attr('r', 5)
				// .attr('transform', `translate(${-point[0] * 2}, ${-point[1] * 2}) scale(${3})`) // To increase the dot size
				.attr('transform', () => zoomPoint(point, routeItem))
				
				

		// Update / scale the map to keep the dots in the correct position
		updateJourney
			.transition()
			.duration(transDur)	
			.attr('transform', () => zoomPoint(point, routeItem))
			.attr('fill', '#fff')
			// .attr('fill', 'transparent')
			.attr('stroke', 'blue')
			// .on('mouseenter', () => this.style('fill', 'blue'))


		// Removing the dots
		updateJourney
			.exit()
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
			
			var routeItem = journeyRoute[journeyRoute.length - 1];
			var point = projection(routeItem);
			// if (journeyRoute.length > 3) {
				// 	journeyRoute.shift()
			// }

			// Updating
			d3.select(journeyMap.node())
				.attr('d', pathLine(journeyRoute))
				.transition()
				.duration(transDur)
				.attr('transform', () => zoomPoint(point, routeItem))
				.attrTween('stroke-dasharray', function (d) {
					var len = journeyMap.node().getTotalLength();
					return function (t) {
						return (d3.interpolateString(`${checkpoint}, ${len}`, `${len}, 0`))(t);
					};
				})

			updateHotspot(point, routeItem);
			zoomWorld(point, routeItem);

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


			var routeItem = journeyRoute[journeyRoute.length - 1];
			if (routeItem) {
				var point = projection(routeItem);
			}

			// Updating
			d3.select(journeyMap.node())
				.attr('d', pathLine(journeyRoute))
				.transition()
				.duration(transDur)
				.attr('transform', () => zoomPoint(point, routeItem))				
				.attrTween('stroke-dasharray', function (d) {
					var len = journeyMap.node().getTotalLength();
					return function (t) {
						return (d3.interpolateString(`${0}, ${len}`, `${len}, 0`))(t);
					};
				});

			updateHotspot(point, routeItem);
			zoomWorld(point, routeItem);
			
			
		}
	}


}





/*=================
=== Bars tooltip - @kyunwang fe-3-assessment-3
=================*/

var mapRefTip = d3.tip()
	.attr('class', 'location-detail')
	.offset([-10, 0]);

mapCon.call(mapRefTip);

function showRefTip(numb, date) {
	mapRefTip.html(getRefHtml(numb, date)); // Set the content to be shown
	mapRefTip.show();
}

function hideRefTip(d) {
	mapRefTip.hide();
}

function getRefHtml(n, d) {
	return `
	<p>${n} refugees arrived in ${d}</p>	
`
}


/*=================
=== Hotspot tooltip
=================*/

var storyTip = d3.tip()
	.attr('class', 'journey-detail')
	.offset([-20, 0]);

mapCon.call(storyTip);

function showStoryTip(story) {
	storyTip.html(story); // Set the content to be shown
	storyTip.show();
}

function hideStoryTip(d) {
	storyTip.hide();
}

/*=================
=== Map Zoombehaviour
=================*/
function zoomWorld(point, location) {
	var strokeW = location ? 1 : 2.5;
	world.transition()
		.duration(transDur)
		.attr('transform', () => zoomPoint(point, location))
		.selectAll('.country')
		.style('stroke-width', strokeW) 
}

// Inspired from https://stackoverflow.com/questions/20409484/d3-js-zoomto-point-in-a-2d-map-projection
function zoomPoint(point, item) {
	if (item) { // Zoom & scale to
		return `translate(${-point[0] * scaleMulti}, ${-point[1] * scaleMulti}) scale(${mapZScale})`
	}
	return ''; // Remove zoom
}

/*=================
=== General functions
=================*/
function getCenterX(data) {
	if (countryCenter[data] === undefined) return; // Check wether undefined
	return projection(countryCenter[data])[0];
}

function getCenterY(data) {
	if (countryCenter[data] === undefined) return;
	return projection(countryCenter[data])[1];
}

function seqDelay(index) {
	return delayDur * index;
}

function seqDelayShort(index) {
	return delayDurShort * index;
}

function setNumber(numb) {
	return parseInt(numb, 10);
}

function refbarHeight(numb) {
	return numb / 20;
} 