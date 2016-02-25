var app = (function() {
	var init = function() {
		el.init();
		states.init();
		overview.init();
		list.getStorage();
		settings.init();
	}

	// Return public functions
	return {
		init: init
	}
}());

// Object where elements are declared
var el = (function() {
	var init = function() {
		this.circleYes = document.getElementById('yes');
		this.circleNo = document.getElementById('no');
		this.circles = document.querySelectorAll('.circle')
		this.list = document.getElementById('list');
		this.detailHouse = document.getElementById('detail_house');
		this.loading = document.querySelectorAll('.loading');
		this.overview = document.getElementById('overview');
		this.form = document.getElementById('form');
		this.locationInput = document.querySelector('#form input[key="locatie"]');
		this.settingsValues = document.querySelectorAll('#form label');
		this.houses = document.getElementById('houses');
		this.firstHouse = document.querySelector('.house:first-child');
		this.autosuggest = document.getElementById('autosuggest');
	}
	// Return public functions
	return {
		init: init
	}
}());

// Navigation
var states = (function() {
	// Declare all routes
	var routes = ['overview', 'list', 'detail']
	var init = function() {
		events();
	};
	var events = function() {
		// Fire router function on hash change and on refresh
		window.addEventListener("hashchange", render, false);
		window.addEventListener("load", render, false);

		// Hammer
		// Make new hammer
		var mc = new Hammer(el.houses);
		// Set pan to horizontal direction and threshold to 100px
		// mc.add( new Hammer.Swipe({direction: Hammer.DIRECTION_HORIZONTAL}));

		// When swipe left, set hash to watchlist
		mc.on("swipeleft", function(ev) {
			overview.nextItem('moveLeft');
		});

		// When swipe right, set hash to search
		mc.on("swiperight", function(ev) {
			overview.nextItem('moveRight');
		});

	};
	var loading = function(state, elem) {
		if (state == 'show') {
			// Hide the list and show the loading gif
			elem.classList.add('hide');
			elem.classList.remove('show');
			for (var i = 0; i < el.loading.length; i++) {
				el.loading[i].classList.add('show');
				el.loading[i].classList.remove('hide');
			}
		} else {
			// Show the list and hide the loading gif
			elem.classList.add('show');
			elem.classList.remove('hide');
			for (var i = 0; i < el.loading.length; i++) {
				el.loading[i].classList.add('hide');
				el.loading[i].classList.remove('show');
			}
		}
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
			// If the hash is detail load the id after the slash and send it detail.pushToArray to render the right information
			var id = window.location.hash.replace('#detail/', '')
			detail.init(id);
		} else if (hash == 'settings') {
			return false;
		}

		// Loop throug the routes
    	for(var i = 0; i < routes.length; i++) {
    		// Find the element of the current route
    		var elem = document.querySelector('#'+routes[i]);
    		// If the route is the hash, display the right section and make the right menu button active. If not, do the opposite
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

// Object for rendering data by filter
var overview = (function() {
	var clickNumber = 0;
	var searchResults = [];

	var init = function() {
		events();
		getStorage();
	}
	var events = function() {
		// Make click events for every circle (yes and no)
		for (var i = 0; i < el.circles.length; i++) {
			el.circles[i].addEventListener("click", nextItem);
		}
		// Make submit event for when settings are submitted
		el.form.addEventListener('submit', preventRefresh)
	}
	var getStorage = function() {
		// Check if an object is saved in local storage
		var storageSettings = JSON.parse(localStorage.getItem('settings'));
		var storageNumber = parseInt(localStorage.getItem('clickNumber'));
		if (storageNumber) {
			// If the object exists, render the list
			clickNumber = storageNumber;
			settings(storageSettings);
		} else {
			settings();
		};
	}
	var preventRefresh = function(e) {
		// Prevent refreshing
		e.preventDefault();
		// Fire settings
		settings();
		// Set hash to overview
		window.location.hash = 'overview';
	}
	var settings = function(settings) {
		if (!settings) {
			var values = el.settingsValues;
			var settings = {};

			for (var i = 0; i < values.length; i++) {
				var input = values[i].querySelector('input');
				var value = input.value;
				var key = input.getAttribute('key');
				settings[key] = value;
			}
			// Put number in local storage
			localStorage.setItem('settings', JSON.stringify(settings));
			// Get data with these settings
			pushToArray(settings);

			clickNumber = 0;
		} else {
			// Fill in the form with the data from the settings object
			for (var key in settings) {
				var input = el.form.querySelector('label input[key="'+key+'"]')
				input.value = settings[key];
			}

			// Get data with these settings
			pushToArray(settings);
		}
		
	}
	var nextItem = function(state) {
		if (this.nodeType === 1) {
			if(this == el.circleYes) {
				var state = 'moveLeft';
			} else {
				var state = 'moveRight'
			};
		};
		// If the item is the 'yes' button
		if (state == 'moveLeft') {
			// Add the object to the list
			var object = searchResults.Objects[clickNumber];
			list.add(object);
			list.init();
		};

		// Add 1 and render the object of that number in the array
		clickNumber++

		var direction = state;
		moveAway(direction);

		// Put number in local storage
		localStorage.setItem('clickNumber', clickNumber);
	}
	var moveAway = function(direction) {
		var renderArray = [];
		var nextNumber = clickNumber + 1;
		renderArray.push(searchResults.Objects[clickNumber],searchResults.Objects[nextNumber])

		el.firstHouse.classList.add(direction);

		setTimeout(function(){
			el.firstHouse.classList.remove(direction);
			render(renderArray);
		}, 500);
	}
	var apiCall = function(settings) {
		// Declare new Promise function
		var promise = new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();

			var key = 'e2d60e885b8742d4b0648300e3703bd7';

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
			    	}
			    }
			}
		})
		return promise;
	}
	var pushToArray = function(settings) {
		// Fire apiCall with the settings object
		apiCall(settings)
			.then(function (object) {
				// When the data is succesfully received, object = searchResults. Then render and display the list
				searchResults = object;

				var renderArray = [];
				var nextNumber = clickNumber + 1;
				renderArray.push(searchResults.Objects[clickNumber],searchResults.Objects[nextNumber])

				render(renderArray);
			})
			// .catch(function() {
			// 	// If an error occurred, alert there is something wrong
			// 	alert('Something went wrong')
			// })
	}
	var render = function(arr) {
		// Declare all functions to get data from object
		var photo = function() {return this.FotoMedium}
		var street = function() {return this.Adres}
		var city = function() {return this.Woonplaats}
		var price = function() {return '€ '+this.Koopprijs}
		var href = function() {return '#detail/'+this.Id}

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
	}
	// Return public functions
	return {
		init: init,
		nextItem: nextItem
	}
}());

var settings = (function() {
	var suggestData = [];
	var init = function() {
		events();
	}
	var events = function() {
		el.locationInput.addEventListener('keydown', updateList);
		var suggestion = document.querySelectorAll('#autosuggest .suggestion');
		for (var i = 0; i < suggestion.length; i++) {
			suggestion[i].addEventListener('click', fillIn)
		}
	}
	var updateList = function() {
		el.autosuggest.classList.add('show');
		el.autosuggest.classList.remove('hide');

		var input = this.value;
		autosuggestApi(input);
	}
	var fillIn = function() {
		var value = this.getAttribute('value');
		el.locationInput.value = value;
		
		el.autosuggest.classList.add('hide');
		el.autosuggest.classList.remove('show');
	}
	var autosuggestApi = function(input) {
		var script = document.createElement('script');
		script.src = 'http://zb.funda.info/frontend/geo/suggest/?query='+input+'&max=7&type=koop&callback=settings.autouggestCallback'

		document.body.appendChild(script);
	}
	var autouggestCallback = function(data) {
		suggestData = data.Results;
		render();
		events()
	}
	var render = function() {
		// Declare all functions to get data from object
		var name = function() {return this.Display.Naam+' ('+this.Display.NiveauLabel+')'}
		var value = function() {return this.Display.Naam}

		// Object to let Transparency know what values to give which element
		var directives = {
			suggestion: {text: name, value: value}
		};

		// Render
		Transparency.render(el.autosuggest, suggestData, directives);
	}
	// Return public functions
	return {
		init: init,
		autouggestCallback: autouggestCallback
	}
}());

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

			xhr.onloadstart = function() {
				states.loading('show', el.detailHouse);
			}

			xhr.onloadend = function() {
				states.loading('hide', el.detailHouse);
			}

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
			    	}
			    }
			};
		})
		return promise;
	};
	var pushToArray = function(id) {
		// Fire apiCall. When the data is succesfully received, object = searchResults. Then render and display the list
		apiCall(id).then(function (object) {
			detailObject = object;
			render();
		})
		// .catch(function() {
		// 	// If an error occurred, alert there is something wrong
		// 	alert('Something went wrong')
		// });		
	};
	var render = function() {
		// Declare all functions to get data from object
		var photo = function() {return this.HoofdFoto}
		var street = function() {return this.Adres}
		var city = function() {return this.Plaats}
		var price = function() {return '€ '+this.Koopprijs}
		var description = function() {return this.VolledigeOmschrijving}
		var ligging = function() {return this.Ligging}
		var rooms = function() {return this.AantalKamers + ' kamers'}
		var lagen = function() {return this.AantalWoonlagen}
		var tuin = function() {if(this.Tuin != null){return this.Tuin}else {return 'Geen tuin'}}


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
	}
}());

var list = (function() {
	var list = [];
	var init = function() {
		render();
		events();
	}
	var events =  function() {
		var cross = document.querySelectorAll('.cross');
		for(var i = 0; i < cross.length; i++) {
			cross[i].addEventListener("click", remove);
		}
	}
	var getStorage = function() {
		// Check if an object is saved in local storage
		var storage = JSON.parse(localStorage.getItem('list'));
		if (storage) {
			// If the object exists, render the list
			list = storage;
			render();
		};
	};
	var add = function(object) {
		list.push(object);

		// Put the object in local storage
		localStorage.setItem('list', JSON.stringify(list));
	}
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
	}
	var render = function() {
		// Declare all functions to get data from object
		var photo = function() {return this.FotoMedium}
		var street = function() {return this.Adres}
		var city = function() {return this.Woonplaats}
		var price = function() {return '€ '+this.Koopprijs}
		var href = function() {return '#detail/'+this.Id}

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

		for (var i = 0; i < list.length; i++) {
			var data = list[i];
			el.list.children[i].querySelector('.cross').data = data;
		};

		// New crosses have been made, so new events should be made
		events();
	}
	// Return public functions
	return {
		init: init,
		add: add,
		getStorage: getStorage
	}
}());

app.init();