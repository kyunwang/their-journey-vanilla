

function renderFilter() {
	var filterKeys = refugeeData.map(d => {
		// console.log(d);
		return d.Datum
	})

	// Remove duplicates
	filterKeys = filterKeys.filter((d, i, self) => i === self.indexOf(d));


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
		console.log(this.value);
		console.log('yeee');
	}
}
