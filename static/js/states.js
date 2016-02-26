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