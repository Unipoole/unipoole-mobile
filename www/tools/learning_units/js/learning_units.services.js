'use strict';

synthMobile.factory('LearningUnitsService',
	['$q', 'filterFilter', 'DataService','UserSession','LoggerService',
	 function($q,filterFilter, DataService, UserSession, LoggerService) {
		
		// A reference to a logger
		var LOG = LoggerService('LearningUnitsService');

		function LearningUnitsService() {
		}
		
		LearningUnitsService.prototype._getData = function(){
			return DataService.getMergedToolData(UserSession.activeModule, "learning_units");
		};
		

		/**
		 * Gets the forums
		 */
		LearningUnitsService.prototype.getUnits = function() {
			return this.getSectionsForParent(null);
		};

		
		LearningUnitsService.prototype.getSectionsForParent = function(parent_tt_id, recursive) {
			var self = this;
			var sections = new Array();
			var previousSection = null;
			// Find all the children that has the tt_parent_id as the tt_id
			function getChildren(data, tt_id){
				// Filters only work with arrays, units is not an array
				for(var key in data){
					if(data[key].tt_parent_id == tt_id){
						// Push this child, and then recursively get its children
						var section = data[key];
						sections.push(section);
						if (recursive){
							getChildren(data, section.tt_id)
						}
					}
				}
			}
			
			return self._getData().then(function(data){
				getChildren(data, parent_tt_id);
				return sections;
			});
		};
		
		/**
		 * Gets a section
		 */
		LearningUnitsService.prototype.getSection = function(id) {
			return this._getData().then(function(units){
				return units[id];
			});
		};
		
		/**
		 * Gets a section
		 */
		LearningUnitsService.prototype.getSections = function(id, recursive) {
		
			var self = this;
			function getChildrenPromise(section){
				return self.getSectionsForParent(section.tt_id, recursive);
			}
			
			return this.getSection(id).then(getChildrenPromise);
		};

		return new LearningUnitsService();
	}
]);
