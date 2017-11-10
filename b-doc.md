*All technical difficulties are to be taken in consideration of what could be done in a span of a few days*

*The end results are based on what was possible in a span of few days*

# Documentation about part-B
All information here goes hand-in-hand with the readme.

*Check the [sketches][sketches-link]*

## Concept
The concept for B is that one can follow a refugee on his journey to safety/another country. The user will be zoomed into the journey and story of a refugee theu selected themselves. By advancing and/or going back the user too will follow the tracks of the refugee.

I wanted to incoorporate this idea in the previous idea of A. This also deemed logical because I wanted to use a map for both.

The story should not be in the way when it shouldn't and be the focus when active. The sidepanel is kept out of the way but faintly in vision before starting a journey. It will not bother the current experience or interaction this way. When a story is active the previous interactions will be disabled and removed during a journey to give the limelight to the journey.


*Check out the sketches in the link above*

If I could accomplish this concept, I was told I could use it for part C.

**The working is descripted in the `readme`**

## Data
See **Data** from `readme`.

## In depth functionally
How it works

1. Call a story via the sidepanel.
```
d3.selectAll('.menu-list li')
	.on('click', function() {
		if (this.classList.contains('disabled')) return;
		mapJourney(this.dataset.storyId); // Start story based on id
	});
```

2. Assign the country coordinated to our story object
Assign the country coordinates if they do not exist yet.
We need the coordinates so that we know where we should go to. 

```
if (journeyData[storyId].journeyCoords.length === 0) {
	journeyData.map(data => {
		data.journey.map((country, i) => {
			journeyData[storyId].journeyCoords.push(countryCenter[country]);
		})
	})
}
```

3. Create a container for our path
```
var journeyMap = mapCon.append('g')
	.attr('class', 'journey-con')
	.append('path')
	.datum(journeyRoute)
	.attr('class', 'journey-line')
	.attr('d', pathLine(journeyRoute))
	.transition()
	.duration(transDur)
	.attrTween('stroke-dasharray', function (d) { // Tween source: https://www.yerich.net/blog/bezier-curve-animation-using-d3
		var len = journeyMap.node().getTotalLength();
		return function (t) {
			checkpoint = len;
			return (d3.interpolateString(`0, ${len}`, `${len}, 0`))(t);
		};
	})
```

4. Assigning our events to our buttons to advance and go back
```
d3.select('#s-advance').on('click', addJourneyRoute);
d3.select('#s-back').on('click', removeJourneyRoute);
```

And initial start.
`addJourneyRoute();`

5. Calling advance or go back
In short 
```
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
```

*Check the code for more in depth explanations with comments*


[sketches-link]: https://drive.google.com/open?id=1DUOJDD0HnXnEJhnGppq0Ma0bFmsDk6dL