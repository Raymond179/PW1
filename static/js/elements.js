// Object where elements are declared
var el = (function() {
	var init = function() {
		this.circleYes = document.getElementById('yes');
		this.circleNo = document.getElementById('no');
		this.circles = document.querySelectorAll('.circle')
		this.list = document.getElementById('list');
		this.detailHouse = document.getElementById('detail_house');
		this.loading = document.querySelector('.loading');
		this.overview = document.getElementById('overview');
		this.form = document.getElementById('form');
		this.locationInput = document.querySelector('#form input[key="locatie"]');
		this.settingsValues = document.querySelectorAll('#form label');
		this.houses = document.getElementById('houses');
		this.firstHouse = document.querySelector('.house:first-child');
		this.autosuggest = document.getElementById('autosuggest');
	};
	// Return public functions
	return {
		init: init
	};
}());