d3.text('../data/to_germany_2014.csv', loadRefugee);
// d3.text('../data/all_refugees12.csv', loadRefugee);
// d3.text('../data/all_refugees12-17.csv', loadRefugee);

async function loadRefugee(err, ref, test) {
	if (err) return err;
	console.log(test);

	// Set cleaned global data available
	refugeeData = await cleanRefugee(ref);
	timeData = await cleanTime(refugeeData)

	// Render the map
	// d3.json('data/ne_50m_admin_0_countries_lakes.json', loadMap);

	// render teh timeline
	// await renderTimeLine();

}

d3.queue()
	// queue()
	.defer(d3.text, '../data/to_germany_2014.csv')
	.defer(d3.json, '../data/test.json')
	.await(loadRefugee)