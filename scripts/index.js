
var loader = d3.select('#loader');
// // var textp = d3.selesctAll('#loader p')
// var textp = document.querySelectorAll('#loader p');
// console.log(textp);
// var test = setInterval(function(){ renderLoader() }, 1000);

// Animating the map menu
d3.select('.menu-btn').on('click', function () {
	d3.select('.menu')
		.classed('active', function () {
			return !this.classList.contains('active');
		});
})


// Primary loader of data
async function loadRefugee(err, ref, journey, world) {
	if (err) return err;

	// renderLoader()

	// Set cleaned global data available
	refugeeData = await cleanRefugee(ref);
	timeData = await cleanTime(refugeeData)
	world = await cleanWorld(world);
	journeyData = await journey;
	// console.log(journeyData);
	// console.log(world);
	

	if (refugeeData && timeData && journeyData) {
		// console.log(refugeeData);
		loader.style('display', 'none'); // Hide the 'loader' when data has arrived



		await loadMap(err, world);

		// Render the timeline
		await renderTimeLine();

		await renderFilter();


	}

}



// Using d3 queue to get all the data first then start the inital dunction
d3.queue()
// .defer(d3.text, 'data/to_germany_2014.csv')
	.defer(d3.text, 'data/all_refugees12.csv')
	// .defer(d3.text, 'data/all_refugees12-16.csv')
	.defer(d3.json, 'data/journey.json')
	.defer(d3.json, 'data/ne_50m_admin_0_countries_lakes.json')
	.await(loadRefugee);