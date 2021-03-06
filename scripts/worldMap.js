/*=================
=== Global vars
=================*/
var mapCon = d3.select('#svg-map');

var world = mapCon
	.attr('viewBox', `0 0 ${winWidth - 200} ${winHeight + 1200}`)
	// .attr('viewBox', `0 0 ${winWidth - 200} ${winHeight + 600}`)
	.attr('width', winWidth)
	.attr('height', winHeight + 400)
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
	.center([0, la])
	.rotate([-lo, 0])
	.scale(winWidth * 0.7)
	.translate([winWidth / 4, winHeight]);

// Vars for zooming
var mapZScale = 4;
var scaleMulti = mapZScale - 1;

// Keeping track of the journey
var journeyRoute = [];


/*=================
=== Global selections
=================*/

d3.selectAll('.menu-list li')
	.on('click', function () {
		if (this.classList.contains('disabled')) return;
		mapJourney(this.dataset.storyId); // Start story based on id
	});

// End the story
d3.select('#story-end')
	.on('click', function () {
		// Hide the reset button
		d3.select(this)
			.style('display', 'none');

		resetAll(); // Reset the data/story data
	});

/*=================
=== Start functions
=================*/

// Mapping the map
function loadMap(err, res) {
	if (err) return err;

	var topoPath = topojson.feature(res, res.objects.countries).features;

	// Get center of countries and directions pairing
	topoPath.map(item => {
		directionMapping = [
			...directionMapping,
			{ name: item.properties.NAME, coords: d3.geoCentroid(item) }
		]
		countryCenter = {
			...countryCenter,
			[item.properties.NAME]: d3.geoCentroid(item)
		}


		// Quick fix for center of few countries (prototype)
		// From contants.js
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
			// return `${d.properties.NAME} country`;
			return `country`;
		})
		.attr('d', mapPath)
		.on('mouseenter', handleCountryEnter)
		.on('mouseleave', handleCountryLeave)

	// Handling the mouse events to show the country name
	function handleCountryEnter(d) {
		var cName = d.properties.NAME;
		var cNameC = d.properties.ADM0_A3;
		// console.log(cName);

		world.append('text')
			.text(cName)
			.attr('class', `${cNameC} country-adm`)
			.attr('x', d => getCenterX(cName))
			.attr('y', d => getCenterY(cName))
			.attr('dy', 2)
			.attr('text-anchor', 'middle')
	}

	function handleCountryLeave(d) {
		var cNameC = d.properties.ADM0_A3;
		world.select(`.${cNameC}`)
			.remove();
	}

	// centerPoints(); // Render dots on all the center of the countries
	// mapTraject(); // Render the course of all the refugees
	// mapJourney(0); // Select the first story (we only got one atm)
}

// Mapping a dot on the center of countries
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

// Showing the route of refugees.
function mapTraject(date) {
	resetAll(); // Reset everything first
	if (date == 'Select a date') return; // Don't do anything if we select a unvalid entry

	// Filter the data based on selection
	var filterData = refugeeData.filter(d => d.Datum === date);
	// var filterData = (date !== 'all' && date !== undefined) ? refugeeData.filter(d => d.Datum === date) : refugeeData;
	// var filterData = refugeeData;


	// var totalValue = filterData.reduce((a, b) => {
	// 	a = a.Value ? a.Value : a;
	// 	return (setNumber(a) + setNumber(b.Value));
	// });


	var routeTraject = mapCon.append('g')
		.attr('class', 'traject-con')
		.selectAll('line')
		.data(filterData);

	routeTraject.enter()
		.append('line')
		.attr('class', 'trajectory')
		// Assign starting point
		.attr('x1', d => {
			// console.log((d.Origin));
			// console.log(d.Origin, getCenterX(d.Origin));
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

	
	// Container for the bars(barcharting)
	var routeBar = mapCon.append('g')
		.attr('class', 'refbar-con')
		.selectAll('rect')
		.data(filterData)


	routeBar.enter()
		.append('rect')
		// Show a tooltip with the amount of refugees in said country
		.on('mouseenter', (d) => showRefTip(getCountryTotal(d.Destination), date))
		.on('mouseleave', hideRefTip)

		.attr('class', 'refugee-bar')
		.attr('x', d => getCenterX(d.Destination) - 5)
		.attr('y', d => getCenterY(d.Destination))
		.attr('height', 0)
		.attr('width', 10)
		.transition()
		.duration(transDur)
		.delay((d, i) => seqDelayShort(i))
		// .attr('height', d => refbarHeight(d.Value))
		.attr('height', d => refbarHeight(getCountryTotal(d.Destination)))
		.attr('y', function (d) {
			// return getCenterY(d.Destination) - refbarHeight(d.Value);
			// console.log(getCountryTotal(d.Destination));
			return getCenterY(d.Destination) - refbarHeight(getCountryTotal(d.Destination));
		})


	function getCountryTotal(dest) {
		// Heavy

		// get the correct data from country
		var singleCountry = filterData.filter(d => d.Destination == dest);

		// Return the sum of the data
		return singleCountry.reduce((a, b) => {
			if (a.Destination == dest || b.Destination == dest) {
				a = a.Value ? a.Value : a;
				return (setNumber(a) + setNumber(b.Value));
			}
		})
	}

}

// The journey/story function
async function mapJourney(storyId) {

	// Show our story nav buttons
	d3.select('.story-buttons')
		.classed('hide', false);

	// Global checpoint in function to save the previous coordinates of the journey
	var checkpoint;

	// Assign the country coordinates from the journey if they do not exist yet
	if (journeyData[storyId].journeyCoords.length === 0) {
		journeyData.map(data => {
			data.journey.map((country, i) => {
				journeyData[storyId].journeyCoords.push(countryCenter[country]);
			})
		})
	}

	// journeyRoute.push(journeyData[storyId].journeyCoords[0]);
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
		.transition()
		.duration(transDur)
		.attrTween('stroke-dasharray', function (d) { // Tween source: https://www.yerich.net/blog/bezier-curve-animation-using-d3
			// Using the string length to animate the route of the refugee
			var len = journeyMap.node().getTotalLength();
			return function (t) {
				checkpoint = len;
				return (d3.interpolateString(`0, ${len}`, `${len}, 0`))(t);
			};
		})


	// Add function for handleing the advent of the journey
	d3.select('#s-advance').on('click', addJourneyRoute);
	d3.select('#s-back').on('click', removeJourneyRoute);


	var journeyDestinations = mapCon.append('g')
		.attr('class', 'spots-con')


	// Start the journey on select story
	// After all previous data/vars have loaded
	addJourneyRoute();


	// Update the journey spots/stops
	function updateHotspot(point, routeItem) {
		var updateJourney = journeyDestinations
			.selectAll('.spots-stop')
			.data(journeyRoute)


		updateJourney
			.enter()
			.append('circle')
			.on('mouseenter', (d, i) => {
				// console.log('data', d, i);
				// console.log(journeyRoute);
				// console.log(journeyData[storyId].story);
				showStory(journeyData[storyId].story[i]);
			})
			// .on('mouseleave', hideStoryTip)
			.attr('class', 'spots-stop')
			.attr('r', 0)
			.attr('cx', d => projection(d)[0])
			.attr('cy', d => projection(d)[1])
			.attr('fill', '#f3f3f3')
			.transition()
			.duration(transDur)
			.attr('r', 5)
			// Scale to the point of journey
			.attr('transform', () => zoomPoint(point, routeItem))


		// Update / scale the map to keep the dots in the correct position
		updateJourney
			.transition()
			.duration(transDur)
			.attr('transform', () => zoomPoint(point, routeItem))
			.attr('fill', '#3b3b3b')
			.attr('stroke', '#f3f3f3')


		// Removing the dots
		updateJourney
			.exit()
			.transition()
			.duration(transDurShort)
			.attr('r', 0)
			.remove();
	}


	function addJourneyRoute() {
		// Remove all the refugee bars when starting
		if (d3.selectAll('.refbar-con')) {
			d3.selectAll('.refbar-con').remove();
		}

		var jCoords = journeyData[storyId].journeyCoords;


		// Checking wether to add route
		if (journeyRoute.length < jCoords.length) {
			// Get safe the current length 
			checkpoint = journeyMap.node().getTotalLength();

			// Add new route/data
			journeyRoute.push(jCoords[journeyRoute.length]);

			var routeItem = journeyRoute[journeyRoute.length - 1];
			var point = projection(routeItem);

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

			// Will set the dots/stops of each step
			updateHotspot(point, routeItem);

			// Zooms in to the point we want to
			zoomWorld(point, routeItem);

			// Get the correct data/storycontent to show
			showStory(journeyData[storyId].story[journeyRoute.length - 1]);

		} else {
			// Zoom out again for an overview
			d3.select(journeyMap.node())
				.transition()
				.duration(transDur)
				.attr('transform', () => zoomPoint())

			// Update the hotspot and zoom out
			updateHotspot();

 			// Zoom out lines and hotspots
			zoomWorld();

			// Show afterword of the story
			showStory(journeyData[storyId].story[journeyRoute.length], true)
		}
	}

	function removeJourneyRoute() {
		var jCoords = journeyData[storyId].journeyCoords;

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
			showStory(journeyData[storyId].story[journeyRoute.length - 1]);

			if (!routeItem) { // if there are no items. reset
				resetAll();
			}
		}
	}
}




/*=================
=== Bars tooltip - @kyunwang fe-3-assessment-3
=================*/

var mapRefTip = d3.tip()
	.attr('class', 'refugee-bar-tip')
	.offset([-10, 0]);

// Bind/assign tto mapcon
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
=== Story functions
=================*/

// Reset all data
function resetAll() {
	// Reset the journeyRoute		
	journeyRoute = [];

	// Hide the story buttons
	d3.select('.story-buttons')
		.classed('hide', true);

	// Show the menu conent again
	d3.select('.menu-list')
		.classed('hide', false);

	// Remove the story content
	d3.select('.story-content')
		.html(null);

	// Remove all hotspots/stops
	d3.selectAll('.spots-stop')
		.remove();

	// Remove the journey line
	d3.select('.journey-line')
		.attr('d', null);

}


function showStory(story, end) {
	if (end) {
		d3.select('#story-end')
			.style('display', 'block');
	}

	d3.select('.story-content')
		.html(story)

	d3.select('.menu-list')
		.classed('hide', true);
}

/*=================
=== Map Zoombehaviour
=================*/
function zoomWorld(point, location) {
	var strokeW = location ? 1 : 2.5;
	// var fontSize = location ? 6 : 20;

	// Container with transition
	var transitionWorld = world.transition()
		.duration(transDur);

	// Zoom the world and transition
	transitionWorld
		.attr('transform', () => zoomPoint(point, location))
		.selectAll('.country')
		.style('stroke-width', strokeW)

	// transitionWorld
	// 	.selectAll('.country-adm')
	// 	.style('font-size', 1)
	// .attr('font-size', fontSize)
}

// Inspired from https://stackoverflow.com/questions/20409484/d3-js-zoomto-point-in-a-2d-map-projection
function zoomPoint(point, item) {
	if (item) { // Zoom & scale to
		return `translate(${-point[0] * scaleMulti}, ${-point[1] * scaleMulti}) scale(${mapZScale})`
	}
	return ''; // Remove zoom /return 
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
	var totalHeight = numb / 100;
	if (totalHeight > 5) {
		return totalHeight;
	}
	return 3;
} 