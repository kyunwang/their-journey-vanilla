// Based on https://bl.ocks.org/mbostock/3884955

/*=================
=== The vars
=================*/
var timeWidth = winWidth - 200;
var timeHeight = 250;

var timeCon = d3.select('#svg-time');
var timeLine = timeCon
	// .attr('viewBox', `0 0 ${winWidth} ${200}`)
	.attr('width', winWidth)
	.attr('height', timeHeight)

	.attr('class', 'timeline')
// .append('g')

var timeX = d3.scaleTime().range([0, timeWidth]);
var timeY = d3.scaleLinear().range([200, 0]);
// var timeZ = d3.scaleOrdinal(['#feca2f', '#2ffe63', '#2f63fe', '#fe2fca']);
var timeZ = d3.scaleOrdinal(d3.schemeCategory10);

var myLine = d3.line()
	// .curve(d3.curveBasis)
	.x(function (d) { return timeX(parseT(d.key)) })
	.y(function (d) { return timeY(d.value.total); });


// parsetime from: http://learnjsdata.com/time.html
var parseTime = d3.timeParse('%Y/%m %I:%M%p');


function renderTimeLine() {

	timeX.domain(d3.extent(timeData, function (d) { return parseT(d.key); }));

	timeY.domain(d3.extent(timeData, function (d) { return d.value.total; }));
	// timeY.domain([
	// 	// Or start on 0?
	// 	d3.min(timeData, function (t) { return d3.min(t.value, function (d) { return Number(d.total) }); }),
	// 	d3.max(timeData, function (t) { return d3.max(t.value, function (d) { return Number(d.total); }); })
	// ]);

	timeZ.domain(timeData.map(function (d) { return d.key; }));




	var refugeeLine = timeLine; // Easier to distinguish
	// console.log(timeData);
	refugeeLine.append('path')
		.datum(timeData)
		.attr('class', 'refugee-line')
		.attr('d', myLine);


	// to chagne
	refugeeLine.append('g')
		.attr('transform', 'translate(0, 220)')
		.call(d3.axisBottom(timeX))
		.select('.domain')
		.remove();


	// refugeeLine.selectAll('.my')
	// 	.data(timeData)
	// 	.enter()
	// 	.append("text")
	// 	// .datum(timeData)
	// 	.attr("transform", function (d) { return "translate(" + timeX(d.key) + "," + timeY(d.value.total) + ")"; })
	// 	.attr("x", 3)
	// 	.attr("dy", "0.35em")
	// 	.style("font", "10px sans-serif")
	// 	.text(function (d) { return d.key; });






	// var focus = timeLine.append("g")
	// 	.attr("class", "focus")
	// 	.style("display", "none");

	// focus.append("circle")
	// 	.attr("r", 4.5);

	// focus.append("text")
	// 	.attr("x", 9)
	// 	.attr("dy", ".35em");

	// timeLine.append("rect")
	// 	.attr("class", "overlay")
	// 	.attr("width", timeWidth)
	// 	.attr("height", timeHeight)
	// 	.on("mouseover", function () { focus.style("display", null); })
	// 	.on("mouseout", function () { focus.style("display", "none"); })
	// 	.on("mousemove", mousemove);


	// var bisectDate = d3.bisector(function (d) { return parseT(d.key); }).left;

	// function mousemove() {
	// 	var x0 = timeX.invert(d3.mouse(this)[0]),
	// 		i = bisectDate(timeData, x0, 1),
	// 		d0 = timeData[i - 1],
	// 		d1 = timeData[i],
	// 		d = x0 - d0.key > d1.key - x0 ? d1 : d0;

	// 	console.log(d);
	// 	focus.attr("transform", "translate(" + timeX(parseT(d.key)) + "," + timeY(d.value.total) + ")");
	// 	focus.select("text").text(d.value.total);
	// }










	console.log(timeData);
	// From https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
	var mouseG = timeLine.append("g")
		.attr("class", "mouse-over-effects");

	mouseG.append("path") // this is the black vertical line to follow mouse
		.attr("class", "mouse-line")
		.style("stroke", "black")
		.style("stroke-width", "1px")
		.style("opacity", "0");

	var lines = document.getElementsByClassName('refugee-line');

	var mousePerLine = mouseG.selectAll('.mouse-per-line')
		.data(timeData)
		.enter()
		.append("g")
		.attr("class", "mouse-per-line");

	mousePerLine.append("circle")
		.attr("r", 7)
		.style("stroke", function (d) {
			// return color(d.name);
			return 'red';
		})
		.style("fill", "none")
		.style("stroke-width", "1px")
		.style("opacity", "0");

	mousePerLine.append("text")
		.attr('class', 'classy')
		.attr("transform", "translate(10,3)");

	mouseG.append('rect') // append a rect to catch mouse movements on canvas
		.attr('width', timeWidth) // can't catch mouse events on a g element
		.attr('height', timeHeight)
		.attr('fill', 'none')
		.attr('pointer-events', 'all')
		.on('mouseout', function () { // on mouse out hide line, circles and text
			d3.select(".mouse-line")
				.style("opacity", "0");
			d3.selectAll(".mouse-per-line circle")
				.style("opacity", "0");
			d3.selectAll(".mouse-per-line text")
				.style("opacity", "0");
		})
		.on('mouseover', function () { // on mouse in show line, circles and text
			d3.select(".mouse-line")
				.style("opacity", "1");
			d3.selectAll(".mouse-per-line circle")
				.style("opacity", "1");
			d3.selectAll(".mouse-per-line text")
				.style("opacity", "1");
		})
		.on('mousemove', function () { // mouse moving over canvas
			var mouse = d3.mouse(this);
			d3.select(".mouse-line")
				.attr("d", function () {
					var d = "M" + mouse[0] + "," + timeHeight; // timeHeight = heigth
					d += " " + mouse[0] + "," + 0;
					return d;
				});

			d3.selectAll(".mouse-per-line")
				.attr("transform", function (d, i) {
					// console.log(timeWidth / mouse[0])
					var xDate = timeX.invert(mouse[0]),
						bisect = d3.bisector(function (d) {
							return parseT(d.key);
						}).right;
					idx = bisect(d.value, xDate);

					var beginning = 0,
						end = lines[i].getTotalLength(),
						end = 1000,
						target = null;

					while (true) {
						target = Math.floor((beginning + end) / 2);
						pos = lines[i].getPointAtLength(target);
						if ((target === end || target === beginning) && pos.x !== mouse[0]) {
							break;
						}
						if (pos.x > mouse[0]) end = target;
						else if (pos.x < mouse[0]) beginning = target;
						else break; //position found
					}

					d3.select(this)
						.select('text')
						.text(timeY.invert(pos.y).toFixed(0));

					return "translate(" + mouse[0] + "," + pos.y + ")";
				});
		});
}

/*=================
=== General functions
=================*/

// Parse the time
function parseT(d) {
	d = parseTime(`${d} 12:00pm`);
	return d;
}