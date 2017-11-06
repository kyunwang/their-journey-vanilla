function cleanRefugee(res) {
	let keys = [];

	const header = res.indexOf('"Country');
	res = res.slice(header);

	const allData = d3.csvParseRows(res, map);
	allData.sort(sortByDateAscending);
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


var parseTime = d3.timeParse('%Y/%m %I:%M%p');

function cleanTime(res) {
	// Nesting doc: http://bl.ocks.org/phoebebright/raw/3176159/
	var time = d3.nest()
		.key(function (d) { return d.Datum; })
		.rollup(function (d) {
			return {
				// origin: d.Origin,
				// destination: d.Destination,
				total: d3.sum(d, function (item) {
					return parseInt(item.Value, 10)
				})
			}
		})
		.entries(res)
	// .map(function (d) {
	// 	console.log(d);
	// 	return {
	// 		origin: d.Origin,
	// 		destination: d.Destination,
	// 	}
	// })

	time = time.sort(sortByDateAscending2);
	return time;
}

// Sorting date
// https://stackoverflow.com/questions/26067081/date-sorting-with-d3-js
function sortByDateAscending(a, b) {
	return parseTime(`${a.Datum} 12:00pm`) - parseTime(`${b.Datum} 12:00pm`);
}
// I know it is awfull but time constrains
function sortByDateAscending2(a, b) {
	return parseTime(`${a.key} 12:00pm`) - parseTime(`${b.key} 12:00pm`);
}