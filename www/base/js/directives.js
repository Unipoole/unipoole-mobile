/**
 * Directive to create the menu of the application
 */
synthMobile.directive('synthMenu', 
['$window', 'UserSession', 'AppSyncStatus',
 function($window, UserSession, AppSyncStatus) {
	return {
		'restrict': 'E',
		'scope': false,
		'templateUrl': 'base/partials/directives/menu.html',
		'link' : function(scope, element, attr){
			
			scope.menuOpen = false;
			
			scope.toggleMenu = function(){
				scope.menuOpen = !scope.menuOpen;
			};
			
			
			// Open sync page if user is registered
			scope.openSync = function(){
				// Make sure the close the menu that could maybe be open
				scope.menuOpen = false;
				
				if(UserSession.registered){
					$window.location="#/sync";
				}
			};
			
			
			// Get the class to apply for the current sync status
			scope.getSyncClass = function(){
				if(AppSyncStatus.downloading){
					return "glyphicon-cloud-download outSync syncBusy";
				}
				else if(AppSyncStatus.uploading){
					return "glyphicon-cloud-upload outSync syncBusy";
				}
				else if(AppSyncStatus.inSync){
					return "glyphicon-cloud inSync";
				}
				else{
					return "glyphicon-cloud outSync";
				}
			};
		}
	};
}])
/**
 * Directive to create the footer for the application
 */
.directive('synthFooter', function() {
	return {
		'restrict' : 'E',
		'scope' : false,
		'templateUrl' : 'base/partials/directives/footer.html'
	};
})
/**
 * Directive to create the footer for the application
 */
.directive('synthModuleDropdown',
['$window','UserSession', 
 function($window, UserSession) {
	return {
		'restrict' : 'A',
		'templateUrl' : 'base/partials/directives/moduleDropdown.html',
		'link': function (scope, element, attr){
			
			// Function to change the current module
			scope.changeModule = function(module){
				$window.location="#/boot/"+module.id;
			}
			
			// Function to get the number of modules
			scope.numberModules = function(){
				if(UserSession.modules == null){
					return 0;
				}
				return Object.keys(UserSession.modules).length;
			};
			
		}
	};
}])

/**
 * Directive to display a button with a list of attachments
 */
.directive('synthAttachments', ['$filter', function($filter) {
	return {
		'restrict' : 'E',
		'templateUrl' : 'base/partials/directives/attachments.html',
		'scope' : {
			'attachments' : '='
		},
		/*'replace' : true,*/
		'link': function (scope, element, attr){
			
			
			// Open an attachment natively on the device
			scope.openAttachment = function(attachment){
				
			window.plugins.fileOpener.open(attachment.downloadPath,
				function(){
				
				},
				function(error){
					alert(error);
				});
			};
			
			// The attachments we need to handle
			scope.attachments = $filter('attachments')(scope.attachments);
			
			// If the button needs to be pulled in a direction
			if (attr.pull){
				if (attr.pull === 'right'){
					scope.buttonPull="pull-right";
				}
				else if (attr.pull === 'left'){
						scope.buttonPull="pull-left";
				}else{
					scope.buttonPull=null;
				}
			}else{
				scope.buttonPull=null;
			}
		}
	};
}])

/**
 * Directive to create the footer for the application
 */
.directive('bootSpinner', function() {
	return {
		'restrict' : 'E',
		'scope' : false,
		/*'replace' : true,*/
		'link': function (scope, element, attr){
			var opts = {
					  lines: 15, // The number of lines to draw
					  length: 0, // The length of each line
					  width: 30, // The line thickness
					  radius: 90, // The radius of the inner circle
					  corners: 1, // Corner roundness (0..1)
					  rotate: 0, // The rotation offset
					  direction: 1, // 1: clockwise, -1: counterclockwise
					  color: '#000', // #rgb or #rrggbb or array of colors
					  speed: 1, // Rounds per second
					  trail: 35, // Afterglow percentage
					  shadow: false, // Whether to render a shadow
					  hwaccel: true, // Whether to use hardware acceleration
					  className: 'spinner', // The CSS class to assign to the spinner
					  zIndex: 2e9, // The z-index (defaults to 2000000000)
					  top: '50%', // Top position relative to parent
					  left: '50%' // Left position relative to parent
					};
					var spinner = new Spinner(opts).spin(element[0]);
		}
	};
});