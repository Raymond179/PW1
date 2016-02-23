var app = (function() {
	var init = function() {
		el.init();
		states.init();
		overview.init();
	}

	// Return public functions
	return {
		init: init
	}
}());

// Object where elements are declared
var el = (function() {
	var init = function() {
		this.house = document.getElementById('house');
		this.circleYes = document.getElementById('yes');
		this.circleNo = document.getElementById('no');
		this.list = document.getElementById('list');
	}
	// Return public functions
	return {
		init: init
	}
}());

// Navigation
var states = (function() {
	// Declare all routes
	var routes = ['overview', 'list']
	var init = function() {
		// Fire router function on hash change and on refresh
		window.addEventListener("hashchange", render, false);
		window.addEventListener("load", render, false);
	}
	var render = function() {
		// Declare hash as the current hash without #
		var hash = window.location.hash.replace('#', '');

		// Remove everything after the slash. Source: http://stackoverflow.com/questions/5631384/remove-everything-after-a-certain-character
		var s = hash;
		var n = s.indexOf('/');
		hash = s.substring(0, n != -1 ? n : s.length);

		// If no hash, set the hash to #search
		if (!hash) {
			window.location.hash = 'overview';
		} else if (hash == 'detail') {
			// If the hash is detail load the id after the slash and send it detail.pushToArray to render the right information
			// var id = window.location.hash.replace('#detail/', '')
			// detail.pushToArray(id);
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
    	}
	}
	// Return public functions
	return {
		init: init
	}
}());

// Object for rendering data by filter
var overview = (function() {
	var clickNumber = 0;
	var searchResults = [];

	var init = function() {
		pushToArray();
		events();
	}
	var events = function() {
		el.circleYes.addEventListener("click", yes);
		el.circleNo.addEventListener("click", no);
	}
	var yes = function() {
		var object = searchResults.Objects[clickNumber];
		list.add(object);
		list.init();

		clickNumber++
		render(clickNumber);
	}
	var no = function() {
		clickNumber++
		render(clickNumber);
	}
	var apiCall = function(search) {
		// Declare new Promise function
		var promise = new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();

			var key = 'e2d60e885b8742d4b0648300e3703bd7';

			var location = 'amsterdam';
			var rooms = 4;
			var minPrice = 150000;
			var maxPrice = 250000;
			var opp = 50;

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
	var pushToArray = function(search) {
		// Fire apiCall with the search string
		apiCall()
			.then(function (object) {
				// When the data is succesfully received, object = searchResults. Then render and display the list
				searchResults = object;
				render(0);
			})
			// .catch(function() {
			// 	// If an error occurred, alert there is something wrong
			// 	alert('Something went wrong')
			// })
	}
	var render = function(num) {
		// Declare all functions to get data from object
		var photo = function() {return this.FotoMedium}
		var street = function() {return this.Adres}
		var city = function() {return this.Woonplaats}
		var price = function() {return '€ '+this.Koopprijs}

		// Object to let Transparency know what values to give which element
		var directives = {
			house_img: {src: photo},
			house_street: {text: street},
			house_city: {text: city},
			house_price: {text: price}
		};

		// Render
		Transparency.render(el.house, searchResults.Objects[num], directives);
	}
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
	var add = function(object) {
		list.push(object);
	}
	var remove = function() {
		// Delete the object from the array
		// Source: http://stackoverflow.com/questions/5767325/remove-a-particular-element-from-an-array-in-javascript
		var remove = this.data;
		var index = list.indexOf(remove);
		if (index > -1) {
		    list.splice(index, 1);
		};
		render()
	}
	var render = function() {
		// Declare all functions to get data from object
		var photo = function() {return this.FotoMedium}
		var street = function() {return this.Adres}
		var city = function() {return this.Woonplaats}
		var price = function() {return '€ '+this.Koopprijs}

		// Object to let Transparency know what values to give which element
		var directives = {
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
	}
	// Return public functions
	return {
		init: init,
		add: add
	}
}());

app.init();