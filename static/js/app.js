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
// Run the application
app.init();