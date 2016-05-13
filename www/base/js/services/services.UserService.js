'use strict';

/**
 * Add the User Service to the base services module
 */
synthMobile.factory('UserService',
	['$q', 'DataService','SynthFail',
	 function($q, DataService, _SF){
		
    
    function UserService(){
    	this.PROGRESS_AUTHENTICATE = 0;
		this.PROGRESS_SELECT_MODULES = 1;
		this.PROGRESS_COMPLETED = 2;
    }
      
    UserService.prototype.getRegistrationProgress = function(){
    	var self = this;
    	return DataService
		.getRegistrationData()
		.then(function(data){
				// If there isn't even a user name yet
    			if(data.username == null){
    				return self.PROGRESS_AUTHENTICATE;
    			}
    			else if(data.modules == null || data.defaultModule == null){
    				return self.PROGRESS_SELECT_MODULES;
    			}
    			else if(data.defaultModule != null){
    				return self.PROGRESS_COMPLETED;
    			}
    			// This last bit should never happen, because then we dont know what state the user was at
    			else{
    				return UserService.PROGESS_AUTHENTICATE;
    			}
    		});
    };
    
    /**
     * Return true if the user is completely registered
     */
    UserService.prototype.isRegistrationComplete = function(){
    	var self = this;
    	return self.getRegistrationProgress().then(function(progress){
    		return self.PROGRESS_COMPLETED == progress;
    	});
    };
    
    return new UserService();
}]);
