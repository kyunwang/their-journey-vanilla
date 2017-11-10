

function renderFilter() {
	// Get all the keys/dates
	var filterKeys = refugeeData.map(d => {
		return d.Datum
	})

	// Remove duplicates
	filterKeys = filterKeys.filter((d, i, self) => i === self.indexOf(d));

	// Add a 'empty' rule to the dropdown
	filterKeys.unshift('Select a date');


	// Creating the options and assigning a function
	d3.select('#filter-list')
		.on('change', changeDate)
		.selectAll('option')
		.data(filterKeys)
		.enter()
		.append('option')
		.attr('value', label => {
			// console.log(label);
			return label
		})
		.text(label => label);

	function changeDate() {
		console.log('filter selected: ',this.value);

		// console.log(mapTraject);
		d3.selectAll('.refbar-con')
			.remove('.refbar-con');
			// Remove the bars as it does not update otherwise
			// Well it actually layers itself but still

		// Start the animation/transition
		mapTraject(this.value);

	}
}
