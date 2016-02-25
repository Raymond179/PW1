// App function
var app = (function() {
	var init = function() {
		el.init();
		states.init();
		overview.init();
		list.getStorage();
		settings.init();
	};

	// Return public functions
	return {
		init: init
	};
}());

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

// States function
var states = (function() {
	// Declare all routes
	var routes = ['overview', 'list', 'detail'];
	var init = function() {
		events();
	};
	var events = function() {
		// Fire render function on hash change and on refresh
		window.addEventListener("hashchange", render, false);
		window.addEventListener("load", render, false);

		// Hammer
		// Make new hammer
		var mc = new Hammer(el.houses);

		// When swipe left, fire nextItem
		mc.on("swipeleft", function(ev) {
			overview.nextItem('moveLeft');
		});

		// When swipe right, fire nextItem
		mc.on("swiperight", function(ev) {
			overview.nextItem('moveRight');
		});

	};
	var loading = function(state, elem) {
		// If the state parameter is show
		if (state == 'show') {
			// Hide the list and show the loading gif
			elem.classList.add('hide');
			elem.classList.remove('show');
			
			el.loading.classList.add('show');
			el.loading.classList.remove('hide');
			
		} else {
			// Show the list and hide the loading gif
			elem.classList.add('show');
			elem.classList.remove('hide');

			el.loading.classList.add('hide');
			el.loading.classList.remove('show');
		};
	};
	var render = function() {
		// Declare hash as the current hash without #
		var hash = window.location.hash.replace('#', '');

		// Remove everything after the slash. Source: http://stackoverflow.com/questions/5631384/remove-everything-after-a-certain-character
		var s = hash;
		var n = s.indexOf('/');
		hash = s.substring(0, n != -1 ? n : s.length);

		// If no hash, set the hash to #overview
		if (!hash) {
			window.location.hash = 'overview';
		} else if (hash == 'detail') {
			// If the hash is detail load the id after the slash and send it to detail.init to render the right information
			var id = window.location.hash.replace('#detail/', '');
			detail.init(id);
		} else if (hash == 'settings') {
			// If the hash is settings, set the hash to overview
			var hash = 'overview';
		};

		// Loop throug the routes
    	for(var i = 0; i < routes.length; i++) {
    		// Find the element of the current route
    		var elem = document.querySelector('#'+routes[i]);
    		// If the route is the hash, display the right section. If not, do the opposite
    		if(routes[i] != hash) {
    			elem.classList.add('hide');
				elem.classList.remove('show');
    		} else {
    			elem.classList.add('show');
				elem.classList.remove('hide');
    		};
    	};
    	
	};
	// Return public functions
	return {
		init: init,
		loading: loading
	};
}());

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
		var photo = function() {return this.FotoMedium};
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
// Detail function
var detail = (function() {
	// The object with the detailed data
	var detailObject = [];
	var init = function(id) {
		pushToArray(id);
	};
	var apiCall = function(id) {
		// Declare new Promise function
		var promise = new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			// When it starts getting the data, show the loading icon
			xhr.onloadstart = function() {
				states.loading('show', el.detailHouse);
			};
			// When the data is received, hide the loading icon
			xhr.onloadend = function() {
				states.loading('hide', el.detailHouse);
			};
			// Declare the API key
			var key = 'e2d60e885b8742d4b0648300e3703bd7';

			xhr.open('GET', 'http://funda.kyrandia.nl/feeds/Aanbod.svc/json/detail/'+key+'/koop/'+id+'/', true); // Get data from the url
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
		});
		return promise;
	};
	var pushToArray = function(id) {
		// Fire apiCall with the id. When the data is succesfully received, object = detailObject. Then render
		apiCall(id).then(function (object) {
			detailObject = object;
			render();
		})
		.catch(function() {
			// If an error occurred, alert there is something wrong
			alert('Something went wrong');
		});		
	};
	var render = function() {
		// Declare all functions to get data from object
		var photo = function() {return this.HoofdFoto};
		var street = function() {return this.Adres};
		var city = function() {return this.Plaats};
		var price = function() {return '€ '+this.Koopprijs};
		var description = function() {return this.VolledigeOmschrijving};
		var ligging = function() {return this.Ligging};
		var rooms = function() {return this.AantalKamers + ' kamers'};
		var lagen = function() {return this.AantalWoonlagen};
		var tuin = function() {if(this.Tuin != null){return this.Tuin}else {return 'Geen tuin'}};

		// Object to let Transparency know what values to give which element
		var directives = {
			house_img: {src: photo},
			house_street: {text: street},
			house_city: {text: city},
			house_price: {text: price},
			house_description: {text: description},
			house_ligging: {text: ligging},
			house_rooms: {text: rooms},
			house_lagen: {text: lagen},
			house_tuin: {text: tuin}
		};

		// Render
		Transparency.render(el.detailHouse, detailObject, directives);
	};

	// Return public functions
	return {
		init: init
	};
}());
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
// Run the application
app.init();