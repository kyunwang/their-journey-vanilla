

function renderFilter() {
	var filterKeys = refugeeData.map(d => {
		// console.log(d);
		return d.Datum
	})

	// Remove duplicates
	filterKeys = filterKeys.filter((d, i, self) => i === self.indexOf(d));

	filterKeys.unshift('all')


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
		d3.selectAll('.refbar-con').remove('.refbar-con'); // Remove the bars as it does not update otherwise

		mapTraject(this.value);

	}
}
