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