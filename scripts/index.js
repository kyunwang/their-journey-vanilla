// d3.text('../data/to_germany_2014.csv', loadRefugee);
// d3.text('../data/all_refugees12.csv', loadRefugee);
// d3.text('../data/all_refugees12-17.csv', loadRefugee);

// Animating the map menu
d3.select('.menu-btn').on('click', function () {
	d3.select('.menu')
		.classed('active', function () {
			return !this.classList.contains('active')
		});
})

async function loadRefugee(err, ref, test, world) {
	if (err) return err;
	console.log(12312);

	// Set cleaned global data available
	refugeeData = await cleanRefugee(ref);
	timeData = await cleanTime(refugeeData)
	world = await cleanWorld(world);
	journeyData = await test;
	console.log(journeyData);
	// console.log(world);

	if (refugeeData && timeData && journeyData) {
		d3.select('#loader')
			.style('display', 'none')

		console.log();

		// Render the map
		// d3.json('data/ne_50m_admin_0_countries_lakes.json', loadMap);

		await loadMap(err, world);

		// Render the timeline
		await renderTimeLine();

		await renderFilter();
		// mapJourney(0);


	} else {
		// Change loader text if it takes  long
	}

}

d3.queue()
	.defer(d3.text, '../data/to_germany_2014.csv')
	// .defer(d3.text, '../data/all_refugees.csv')
	// .defer(d3.text, '../data/all_refugees12.csv')
	// .defer(d3.text, '../data/all_refugees12-16.csv')
	// .defer(d3.text, '../data/all_refugees12-17.csv')
	.defer(d3.json, '../data/test.json')
	.defer(d3.json, '../data/ne_50m_admin_0_countries_lakes.json')
	// .defer(d3.json, '../data/topomap.json')
	.await(loadRefugee)
