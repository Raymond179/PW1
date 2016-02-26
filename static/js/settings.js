// Settings function
var settings = (function() {
	var suggestData = [];

	var init = function() {
		events();
	};
	var events = function() {
		// When the user types in the location input field, run updateList
		el.locationInput.addEventListener('keydown', updateList);
		// For every suggestion element, create a click event
		var suggestion = document.querySelectorAll('#autosuggest .suggestion');
		for (var i = 0; i < suggestion.length; i++) {
			suggestion[i].addEventListener('click', fillIn)
		};
	};
	var updateList = function() {
		// Show the autosuggest
		el.autosuggest.classList.add('show');
		el.autosuggest.classList.remove('hide');
		// Get the input and run autosuggestApi with the input
		var input = this.value;
		autosuggestApi(input);
	};
	var fillIn = function() {
		// Get the value of that suggestion and fill it in
		var value = this.getAttribute('value');
		el.locationInput.value = value;
		// Hide the autosuggest
		el.autosuggest.classList.add('hide');
		el.autosuggest.classList.remove('show');
	};
	var autosuggestApi = function(input) {
		// Get the autosuggest data by adding a script tag to the body with the right source and input
		var script = document.createElement('script');
		script.src = 'http://zb.funda.info/frontend/geo/suggest/?query='+input+'&max=7&type=koop&callback=settings.autouggestCallback';

		document.body.appendChild(script);
	};
	var autouggestCallback = function(data) {
		// When data is received, put the data in the suggestData array
		suggestData = data.Results;
		render();
		events();
	};
	var render = function() {
		// Declare all functions to get data from object
		var name = function() {return this.Display.Naam+' ('+this.Display.NiveauLabel+')'};
		var value = function() {return this.Display.Naam};

		// Object to let Transparency know what values to give which element
		var directives = {
			suggestion: {text: name, value: value}
		};

		// Render
		Transparency.render(el.autosuggest, suggestData, directives);
	};
	// Return public functions
	return {
		init: init,
		autouggestCallback: autouggestCallback
	};
}());