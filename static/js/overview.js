// Overview function
var overview = (function() {
	var clickNumber = 0;
	var searchResults = [];

	var init = function() {
		events();
		getStorage();
	};
	var events = function() {
		// Make click events for every circle (yes and no)
		for (var i = 0; i < el.circles.length; i++) {
			el.circles[i].addEventListener("click", nextItem);
		};
		// Make submit event for when the settings form is submitted
		el.form.addEventListener('submit', preventRefresh);
	}
	var getStorage = function() {
		// Check if an object is saved in local storage
		var storageSettings = JSON.parse(localStorage.getItem('settings'));
		var storageNumber = parseInt(localStorage.getItem('clickNumber'));
		if (storageNumber) {
			// If the storage exists, update clickNumber with the storage number and run settings with the storage settings
			clickNumber = storageNumber;
			settings(storageSettings);
		} else {
			settings();
		};
	};
	var preventRefresh = function(e) {
		// Prevent refreshing
		e.preventDefault();
		// Fire settings
		settings();
		// Set hash to overview
		window.location.hash = 'overview';
	};
	var settings = function(settings) {
		// If the settings parameter is empty
		if (!settings) {
			// Loop through the form and create a settings object with the input values
			var values = el.settingsValues;
			var settings = {};

			for (var i = 0; i < values.length; i++) {
				var input = values[i].querySelector('input');
				var value = input.value;
				var key = input.getAttribute('key');
				settings[key] = value;
			};
			// Put number in local storage
			localStorage.setItem('settings', JSON.stringify(settings));
			// Get data with these settings
			pushToArray(settings);
			// Set clicknumber back to 0
			clickNumber = 0;
		} else {
			// Fill in the form with the data from the settings object
			for (var key in settings) {
				var input = el.form.querySelector('label input[key="'+key+'"]');
				input.value = settings[key];
			};
			// Get data with these settings
			pushToArray(settings);
		};
		
	};
	var nextItem = function(state) {
		// If this function is fired from a click event
		if (this.nodeType === 1) {
			// If this is the yes circle
			if(this == el.circleYes) {
				// Declare state as moveLeft
				var state = 'moveLeft';
			} else {
				// Declare state as moveRight
				var state = 'moveRight';
			};
		};
		// If the state is moveLeft
		if (state == 'moveLeft') {
			// Add the object of the clicked item to the list
			var object = searchResults.Objects[clickNumber];
			list.add(object);
			list.init();
		};
		// Add 1 to the clickNumber and run the moveAway function with the right direction
		clickNumber++;
		var direction = state;
		moveAway(direction);
		// Put clickNumber in local storage
		localStorage.setItem('clickNumber', clickNumber);
	};
	var moveAway = function(direction) {
		// Create an array with the 2 next objects
		var renderArray = [];
		var nextNumber = clickNumber + 1;
		renderArray.push(searchResults.Objects[clickNumber],searchResults.Objects[nextNumber]);
		// Add the class of the direction to the first house element
		el.firstHouse.classList.add(direction);
		// Wait untill the animation is finished and then remove the class and render the array
		setTimeout(function(){
			el.firstHouse.classList.remove(direction);
			render(renderArray);
		}, 500);
	};
	var apiCall = function(settings) {
		// Declare new Promise function
		var promise = new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			// Declare API key
			var key = 'e2d60e885b8742d4b0648300e3703bd7';
			// Declare settings
			var location = settings.locatie.replace(/ /g, '-');
			var rooms = settings.kamers;
			var minPrice = settings.minprijs;
			var maxPrice = settings.maxprijs;
			var opp = settings.opp;

			xhr.open('GET', 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/'+key+'/?type=koop&zo=/'+location+'/'+minPrice+'-'+maxPrice+'/'+rooms+'+kamers/'+opp+'+woonopp&page=1&pagesize=25', true); // Get data from the url
			xhr.send(null);

			// When the data is received
			xhr.onreadystatechange = function() {
				// Check if the data is ready
			    if (xhr.readyState == XMLHttpRequest.DONE) {
			    	var status = xhr.status;
			    	// Check if an object is received
			    	if( (status >= 200 && status < 300) || status === 304 ) {
			    		var json = JSON.parse(xhr.responseText);
			    		// Tell the promise it succeded and return the object
			        	resolve(json);
			    	} else {
			    		// Tell the promise an error occurred
			    		reject(json);
			    	};
			    };
			};
		})
		return promise;
	};
	var pushToArray = function(settings) {
		// Fire apiCall with the settings object
		apiCall(settings)
			.then(function (object) {
				// When the data is succesfully received, object = searchResults. Then render and display the next items
				searchResults = object;

				var renderArray = [];
				var nextNumber = clickNumber + 1;
				renderArray.push(searchResults.Objects[clickNumber],searchResults.Objects[nextNumber]);

				render(renderArray);
			})
			.catch(function() {
				// If an error occurred, alert there is something wrong
				alert('Something went wrong');
			});
	};
	var render = function(arr) {
		// Declare all functions to get data from object
		var photo = function() {return this.FotoLarge};
		var street = function() {return this.Adres};
		var city = function() {return this.Woonplaats};
		var price = function() {return '€ '+this.Koopprijs};
		var href = function() {return '#detail/'+this.Id};

		// Object to let Transparency know what values to give which element
		var directives = {
			house_detail: {href: href},
			house_img: {src: photo},
			house_street: {text: street},
			house_city: {text: city},
			house_price: {text: price}
		};

		// Render
		Transparency.render(el.houses, arr, directives);
	};
	// Return public functions
	return {
		init: init,
		nextItem: nextItem
	};
}());