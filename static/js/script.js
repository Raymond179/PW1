// Put everything in an IFFE so there are no global variables
(function() {
	'use strict'; // Use strict mode so no global variables can be declared

	// The application object
	var app = (function() {
		var init = function() {
			el.init();
			states.init();
			search.init();
			watchlist.getStorage();
		}
		// Return public functions
		return {
			init: init
		}
	}());
	
	// Fire app.init
	app.init();
})();