function cleanRefugee(res) {
	let keys = [];

	const header = res.indexOf('"Country');
	res = res.slice(header);

	const allData = d3.csvParseRows(res, map);
	return allData;

	function map(d, i) {
		if (i === 0) {
			keys = d;
			return;
		}
		return {
			Datum: moment(`${d[2]}/${moment().month(d[3]).format('M')}`).format('YYYY/MM'),
			Destination: d[0],
			[keys[1]]: d[1],
			[keys[2]]: d[2],
			[keys[3]]: moment().month(d[3]).format('M'), // From string to number(string)
			[keys[4]]: d[4],
		};
	}
}

function cleanTime(res) {
	var nested_data = d3.nest()
		.key(function (d) {
			return d.Datum;
		})
		.rollup(function (d) {
			return {
				total: d3.sum(d, function (item) {
					return parseInt(item.Value, 10)
				})
			}
		})
		.entries(res);
	// console.log(nested_data);
}