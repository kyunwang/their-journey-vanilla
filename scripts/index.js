// d3.text('../data/to_germany_2014.csv', loadRefugee);
// d3.text('../data/all_refugees12.csv', loadRefugee);
// d3.text('../data/all_refugees12-17.csv', loadRefugee);

async function loadRefugee(err, ref, test, world) {
	if (err) return err;

	// Set cleaned global data available
	refugeeData = await cleanRefugee(ref);
	timeData = await cleanTime(refugeeData)
	journeyData = await test;
	console.log(journeyData);

	if (refugeeData && timeData && journeyData) {
		// Render the map
		// d3.json('data/ne_50m_admin_0_countries_lakes.json', loadMap);

		await loadMap(err, world);

		// Render the timeline
		await renderTimeLine();

		await renderFilter();
	}

}

d3.queue()
	.defer(d3.text, '../data/to_germany_2014.csv')
	// .defer(d3.text, '../data/all_refugees12.csv')
	// .defer(d3.text, '../data/all_refugees12-16.csv')
	// .defer(d3.text, '../data/all_refugees12-17.csv')
	.defer(d3.json, '../data/test.json')
	.defer(d3.json, '../data/ne_50m_admin_0_countries_lakes.json')
	.await(loadRefugee)
