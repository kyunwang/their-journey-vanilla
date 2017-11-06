// Based on https://bl.ocks.org/mbostock/3884955

/*=================
=== The vars
=================*/
var timeCon = d3.select('#svg-time');
var timeLine = timeCon
	// .attr('viewBox', `0 0 ${winWidth} ${200}`)
	.attr('width', winWidth)
	.attr('height', 200)
	.append('g')
	.attr('class', 'timeline');

var timeX = d3.scaleTime().range([0, winWidth]);
var timeY = d3.scaleLinear().range([200, 0]);
// var timeZ = d3.scaleOrdinal(['#feca2f', '#2ffe63', '#2f63fe', '#fe2fca']);
// var timeZ = d3.scaleOrdinal(d3.schemeCategory10);

var myLine = d3.line()
	.curve(d3.curveBasis)
	.x(function (d) { return timeX(parseT(d.key)) })
	.y(function (d) { return timeY(d.value.total); });


var parseTime = d3.timeParse('%Y/%m');

function renderTimeLine() {

	timeX.domain(d3.extent(timeData, function (d) { return parseT(d.key); }));

	timeY.domain(d3.extent(timeData, function (d) { return d.value.total; }));
	// timeY.domain([
	// 	// Or start on 0?
	// 	d3.min(timeData, function (t) { return d3.min(t.value, function (d) { return Number(d.total) }); }),
	// 	d3.max(timeData, function (t) { return d3.max(t.value, function (d) { return Number(d.total); }); })
	// ]);




	var refugeeLine = timeLine; // Easier to distinguish

	refugeeLine.append('path')
		.datum(timeData)
		.attr('class', 'refugee-line')
		.attr('d', myLine);


}

/*=================
=== General functions
=================*/
function parseT(d) {
	d = parseTime(d);
	return d;
}