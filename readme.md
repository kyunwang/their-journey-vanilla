* Includes documentation about part B
- see /.... file for b

# Their Journey
A visualisation about refugees in the area of Europe.
Follow a journey of a refugee too while your are at it.

[Attempt using React.js with D3.js][react-v]

Partly based on [own project][base-pj]
*All the code sources used in the code are in the files themselves as comments right next to the code.*

# TOC
- [Concept](#concept)
- [Data](#data)
- [Data cleaning and modifying](#data-cleaning-and-modifying)
- [Features and Working](#features-and-working)
- [Bugs](#bugs)
- [License](#license)


# Proof of Concept
# Their-Journey in Vanilla JS
Intro

linechart: https://bl.ocks.org/mbostock/3884955


## Concept

## Tools

D3.js
D3-tip.js
Topojson.js
Moment.js

## Data
This visualisation uses the following data:
- **Asylum Seekers Monthly from [UNHCR][unhcr]**
Considering the size of the file we will be using the data from 2012 to and with 2016.

The dataset contains the following information:
	- Month and Year of arrival
	- Origin country of the refugee
	- Destination country of the refugee
	- The amount of refugees

- **Journey data of refugee(s) from [BBC][bbc-story]**
The data/content comes from BBC. The file is created by hand.

This dataset contains the following:
- Refuge name
- The crossed countries in the journey
- The story using interviews from BBC

## Data cleaning and modifying
About the cleaning of the data and data modifying. Meaning adding and changing data for use.

### Refugee data 
How we cleaned our main data namely file `all_refugees-12-16`.

In `constants.js` We defined several `variables` and a function. The use of the variables are to check for what countries to ignore, include, corrections and change from name.

*Snippet of a variable used for cleaning/modifying*
```
var toInclude = [
	'SYR', 'AFG', 'SRB', 'IRQ', 'ALB', 'ERI', 'PAK', 'SOM', 'CHI', 'UKR', 'TUR', 'CYP', 'PSE'
];
```

In `cleanData.js` we cleaned up the data and extracted the keys for usage.

*Snippets of cleaning the data*
```
// Using the previous snippet. We ignore the data that includes the items in 'toInclude'
if (toIgnore.includes(d[0]) || toIgnore.includes(d[1])) {
	return;
}
```

```
// This is our final output we will be using.
return {
	Datum: moment(`${d[2]}/${moment().month(d[3]).format('M')}`).format('YYYY/MM'),
	Destination: getName(d[0]),
	[keys[1]]: getName(d[1]),
	[keys[2]]: d[2],
	[keys[3]]: moment().month(d[3]).format('M'),
	[keys[4]]: d[4],
};
```

### Modifying
Apart from cleaning the *Refugee data*. Topojson has been modified and other branches has been made from refugee data.

**Topojson**
Topojson has been modified to extract the excess countries from the plotting.

*Snippet from `constants.js`*
```
// Declaring what to include in topojson
var toIncConti = ['Europe'] ;
var toIncRegio = ['Sub-Saharan Africa', 'Middle East & North Africa'];
var toIncSubRegio = ['Western Asia', 'Central Asia', 'Southern Asia', 'Eastern Asia', 'South-Eastern Asia'];
```

Using the declared variables topojson will be filtered down and return the desired data. `cleanData.js`
```
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
```

**Pairing and center**
In `worldMap.js` we grab topojson again, correct some centering of countries and define pairings of data and center.

```
var topoPath = topojson.feature(res, res.objects.countries).features;

topoPath.map(item => {
	directionMapping = [
		...directionMapping,
		{ name: item.properties.NAME, coords: d3.geoCentroid(item) }
	]
	countryCenter = {
		...countryCenter,
		[item.properties.NAME]: d3.geoCentroid(item)
	}


	// Quick fix for center of few countries (prototype)
	if (correctCenter[item.properties.ADM0_A3]) {
		var adm0 = correctCenter[item.properties.ADM0_A3]

		directionMapping = [
			...directionMapping,
			{ name: item.properties.NAME, coords: adm0 }
		]
		countryCenter = {
			...countryCenter,
			[item.properties.NAME]: adm0
		}
	}
}
```

**Timechart**
Getting the total amount of refugees per months across 2012 and 2016. `cleanData.js`

```
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
```

Based on `Datum` the sum will be returned of all the values of the corresponding `Datum` and sorted.


## Features and Working
The visualisation exists of three feature components:
- The timechart
- The map
- The journey (map and sidepanel)

This sectiom will explain what the components contain and how they work.

### Timechart
The timechart is a linechart showing a text and amount of refugees over time. The linechart will constist of data from 2012 to 2016 and show the amount of refugees.

**feature**
By a `mouseover` event a.k.a. hover-over, the amount of refugees and the time/date will change dynamically. The information shown will change accordingly to the position of your mousecursor.

### The map
The map shows the countries we focus on. The map will representate the distance and amount of refugees over time.

**feature**
By a `mouseenter` a.k.a. hover event, the country name will be displayed.

By the right corner there is a dropdown element. This element functions as a filter by date. By selecting a date a visualisation will be started. This visualisation will show the trajects of refugees comming and going to their destination country.

The countries will erect a bar (acting as a barchart). By hovering over the barchart you can be shown the amount of refugees who have fled to the corresponding country and the date as in year and month.


### The journey
The journey makes use of the map and the sidepanel.

**feature**
One starts the journey by opening the sidepanel by clicking the *Journeys of Refugees*, as of now only one journey is available, and selecting a journey.

When a journey start you will be zoomed in to the starting country of the refugee. The menu will be replaced by their story of the corresponding country too.

By selecting the *Prev* button you will return one step in the journey or return to the menu when the journey has yet to start.

Selecting the *Next* button you will advance the journey and so the story too.

While advancing or going back in the story, the map will follow the route of the journey will a transition for a smooth sailing.

At the end of the journey, the map will be zoomed out the give a overview of the journey. You will be able to see the path taken at once.

At the end a afterword will be given and a button to end the journey wil be displayed, which will send you back to the menu.

*Each *stop* has a dot where you can hover over to easily check that part of the story again when you want to.*

## Bugs

## Goals?


## License
GPL(3.0) - Kang Yun Wang (Kevin Wang)



[unhcr]: http://popstats.unhcr.org/en/asylum_seekers_monthly
[bbc-story]: http://www.bbc.com/news/magazine-32166388

[react-v]: https://github.com/kyunwang/their-journey
[base-pj]: https://github.com/kyunwang/fe3-assessment-3