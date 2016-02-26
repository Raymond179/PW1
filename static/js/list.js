// List function
var list = (function() {
	var list = [];

	var init = function() {
		render();
		events();
	};
	var events =  function() {
		// Add click events for every cross in the list
		var cross = document.querySelectorAll('.cross');
		for(var i = 0; i < cross.length; i++) {
			cross[i].addEventListener("click", remove);
		};
	};
	var getStorage = function() {
		// Check if the list object is saved in local storage
		var storage = JSON.parse(localStorage.getItem('list'));
		if (storage) {
			// If the object exists, list = storage and render
			list = storage;
			render();
		};
	};
	var add = function(object) {
		// Push the object to the list
		list.push(object);
		// Put the object in local storage
		localStorage.setItem('list', JSON.stringify(list));
	};
	var remove = function() {
		// Delete the object from the array
		// Source: http://stackoverflow.com/questions/5767325/remove-a-particular-element-from-an-array-in-javascript
		var remove = this.data;
		var index = list.indexOf(remove);
		if (index > -1) {
		    list.splice(index, 1);
		};
		// Put the object in local storage
		localStorage.setItem('list', JSON.stringify(list));
		// Render the list
		render();
	};
	var render = function() {
		// Declare all functions to get data from object
		var photo = function() {return this.FotoMedium};
		var street = function() {return this.Adres};
		var city = function() {return this.Woonplaats};
		var price = function() {return '€ '+this.Koopprijs};
		var href = function() {return '#detail/'+this.Id};

		// Object to let Transparency know what values to give which element
		var directives = {
			list_detail: {href: href},
			list_img: {src: photo},
			list_street: {text: street},
			list_city: {text: city},
			list_price: {text: price}
		};

		// Render
		Transparency.render(el.list, list, directives);

		// Add the data of the element to the element
		for (var i = 0; i < list.length; i++) {
			var data = list[i];
			el.list.children[i].querySelector('.cross').data = data;
		};

		// New crosses have been made, so new events should be made
		events();
	};
	// Return public functions
	return {
		init: init,
		add: add,
		getStorage: getStorage
	};
}());