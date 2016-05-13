/**
 * Class for utility methods.
 * This class should only be used for simple utility methods.
 * DO NOT use this class to call services or to do tool specific
 * manipulations - these kind of functionality should be written in controllers or services
 * for the tool
 */
(function(window){
	
	var DATE_FORMAT = "YYYY-MM-DD h:mm a";
	
	/**
	 * Constructor
	 */
	function Utilities(){
		
	}
	
	/**
	 * Gets the number of properties an object has
	 */
	Utilities.prototype.getNumberOfProperties = function(object, field){
		if (object === undefined){
			return 0;
		}
		var toTest = object;
		if (field){
			toTest = object[field];
		}
		return Object.keys(toTest).length;
	};

	/**
	 * Add the utilities to the window
	 */
	window.synth = window.synth || {};
	window.synth.utilities = new Utilities();;
	
})(window);

