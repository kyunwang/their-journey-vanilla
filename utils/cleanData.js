function cleanRefugee(res) {
	let keys = [];

	const header = res.indexOf('"Country');
	res = res.slice(header);

	const allData = d3.csvParseRows(res, map);
	allData.sort(sortByDateAscending);
	// console.log(allData);
	return allData;

	function map(d, i) {
		// console.log(d);
		if (i === 0) {
			keys = d;
			return;
		}

		if (d[0] == d[1]) return; // It seems some orgin and destination are the same for some reason

		if (toIgnore.includes(d[0]) || toIgnore.includes(d[1])) {
			return;
		}

		// console.log('origin', d[1]);

		return {
			Datum: moment(`${d[2]}/${moment().month(d[3]).format('M')}`).format('YYYY/MM'),
			Destination: getName(d[0]),
			[keys[1]]: getName(d[1]),
			[keys[2]]: d[2],
			[keys[3]]: moment().month(d[3]).format('M'),
			[keys[4]]: d[4],
		};
	}
}

var parseTime = d3.timeParse('%Y/%m %I:%M%p');

function cleanTime(res) {
	// Nesting doc: http://bl.ocks.org/phoebebright/raw/3176159/

	// console.log(res);
	var time = d3.nest()
		.key(function (d) { return d.Datum; })
		.rollup(function (d) {
			return {
				total: d3.sum(d, function (item) {
					return parseInt(item.Value, 10)
				})
			}
		})
		.entries(res)

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




// Inspired and based on this sh file: https://github.com/lucified/lucify-refugees/blob/155bb072d10a3f8459a88da8305aa77130ab7806/prepare.sh
function cleanWorld(world) {
	world.objects.countries.geometries = world.objects.countries.geometries.filter(data => {
		if (toInclude.includes(data.properties.ADM0_A3)) return true;
		if (toIncConti.includes(data.properties.CONTINENT)) return true;
		if (toIncRegio.includes(data.properties.REGION_WB)) return true;
		if (toIncSubRegio.includes(data.properties.SUBREGION)) return true;
		return false;
	})

	return world
}
