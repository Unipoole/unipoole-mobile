/* 
 * base/js/services/services.LoggerService.js
 */
(function(synthMobile){
'use strict';

/**
 * Create factory for the DataService
 */
synthMobile.factory('LoggerService',
	['$q', '$log','$injector', 'SynthConfig','SynthQLoop',
	function($q, $log, $injector, SynthConfig, SynthQLoop){
		
		// Map of loggers created
		var loggers = {};
		
		// Contants for log levels
		var LEVELS = {
			'DEBUG' : 1,
			'INFO'  : 2,
			'WARN'  : 3,
			'ERROR' : 4,
			'NONE'  : 5
		};
		
		// Set the current log level from the SynthConfig
		var log_level = SynthConfig.logLevel;
		
		// Should we log to console
		var logToConsole = SynthConfig.logToConsole;
		
		// Should we log to a file
		var logToFile = SynthConfig.logToFile;
		
		// Number of log files to keep
		var numFiles = SynthConfig.logFileCount;
		
		var deviceReady = false;
		
		
		/**
		 * Returns a promise that will be resolved when the cordova thinks
		 * the device is ready and you can use the API
		 */
		function cordovaReady(){
			var deferred = $q.defer();
			
			if (deviceReady === true){
				deferred.resolve();
			}
			else{
				document.addEventListener("deviceready", function(){
					deviceReady = true;
					deferred.resolve();
				},false);
			}
			return deferred.promise;
		};
		
		/**
		 * Get the directory entry where the logs are stored
		 */
		function getLogsDirectory(){
			return cordovaReady()
			.then(function(){
				var defer = $q.defer();
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
				
				function gotFS(fileSystem) {
					fileSystem.root.getDirectory(SynthConfig.dataDir, {create: true, exclusive : false}, 
						function(directory){
							defer.resolve(directory);
						},fail
					);
				}
				function fail(error) {
					$log.warn("Failed to get filesystem, code:" + error.code);
					defer.reject(error);
				}
				return defer.promise;
			})
			// Ensure log directory exists
			.then(function(rootDirectoryEntry){
				var defer = $q.defer();
				rootDirectoryEntry.getDirectory("logs", {create: true}, function(dirEntry) {
					defer.resolve(dirEntry);
				});
				return defer.promise;
			});
		}
		
		/**
		 * Gets a log entry for the specified logfile name
		 */
		function getLogFileEntry(logFileName){
			return getLogsDirectory()
			// Get the log file
			.then(function(logDirEntry){
				var defer = $q.defer();
				logDirEntry.getFile(logFileName, {create:true},
					function(fileEntry){
						defer.resolve(fileEntry);
					},
					function(error){
						deferred.reject(error);
					}
				);
				return defer.promise;
			});
		}
		
		/**
		 * Removes the last log file
		 */
		function removeFileLastLog(){
			var defer = $q.defer();
			getLogFileEntry("log." + numFiles + ".txt")
				.then(function(fileEntry){
					fileEntry.remove(function(){
						defer.resolve();
					},
					function(error){
						defer.reject(error);
					});
				});
			return defer.promise;
		}
		
		function shiftLog(idx){
			var defer = $q.defer();
			
			function fail(error){
				defer.reject(error);
			}
			
			getLogFileEntry("log." + idx + ".txt")
			.then(function(fileEntry){
				fileEntry.getParent(function(parentEntry){
					// move the directory to a new directory and rename it
					fileEntry.moveTo(parentEntry, "log." + (idx+1) + ".txt", function(newEntry){
						defer.resolve(newEntry);
					}, fail);
				}, fail)
			});
			return defer.promise;
		}
		
		/**
		 * Rotate the log files
		 */
		function rotateLogs(){
			var idx=(numFiles-1);
			function getShiftLogPromise(){
				// If we have done the last one allready
				if(idx<0){
					return null;
				}
				return shiftLog(idx--);
			}
			
			function getNewLogPromise(){
				return getLogFileEntry("log.0.txt");
			}
			
			// Delete last log file
			return removeFileLastLog()
			// Shift remaining files
			.then(function(){return SynthQLoop(getShiftLogPromise);})
			.then(getNewLogPromise);
		}
		
		/**
		 * Get the log file entry
		 */
		function initService(){
			rotateLogs().then(function(newFileEntry){
				return newFileEntry;
			});
		}
		
		
		
		function writeToFile(logString){
			getLogFileEntry("log.0.txt").then(function(logFileEntry){
				var defer = $q.defer();
					logFileEntry.createWriter(onWriterReady, fail);

					// Writer is ready to write
					function onWriterReady(writer) {
						writer.onwriteend = function() {
							defer.resolve();
						};
						// Seek to the endo of the file
						writer.seek(writer.length);
						writer.write(logString + "\n");
					}
					// Function for when an IO action fails
					function fail(error) {
						$log.warn("Failed while trying to write to file, error: " + error);
						deferred.reject(error);
					}
				return defer.promise;
			});
		}

		/**
		 * Constructor
		 */
		function LoggerService(name){
			 this.name = name;
		}
	
		LoggerService.prototype.debug = function(message){
			if (this.isDEBUG()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + " " + this.name + ' (DEBUG) : ' + message;
				logToConsole && $log.log(logString);
				logToFile    && writeToFile(logString);
			}
		};
		
		LoggerService.prototype.warn = function(message){
			if (this.isWARN()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + " " + this.name + ' (WARN) : ' + message;
				logToConsole && $log.warn(logString);
				logToFile    && writeToFile(logString);
			}
		};
		
		LoggerService.prototype.info = function(message){
			if (this.isINFO()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + " " + this.name + ' (INFO) : ' + message;
				logToConsole && $log.info(logString);
				logToFile    && writeToFile(logString);
			}
		};
		
		LoggerService.prototype.error = function(message){
			if (this.isERROR()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + " " + this.name + ' (ERROR) : ' + message;
				logToConsole && $log.error(logString);
				logToFile    && writeToFile(logString);
			}
		};
		
		/**
		 * Returns true if ERROR level should be logged
		 */
		LoggerService.prototype.isERROR = function(){
			return log_level <= LEVELS.ERROR;
		};
		
		/**
		 * Returns true if INFO should be logged
		 */
		LoggerService.prototype.isINFO = function(){
			return log_level <= LEVELS.INFO;
		};
		
		/**
		 * Returns true if WARN should be logged
		 */
		LoggerService.prototype.isWARN = function(){
			return log_level <= LEVELS.WARN;
		};
		
		/**
		 * Returns true if DEBUG should be logged
		 */
		LoggerService.prototype.isDEBUG = function(){
			return log_level <= LEVELS.DEBUG;
		};
		
		LoggerService.prototype.levels = LEVELS;
		
		var systemLogger = new LoggerService("SYSTEM");
		
		// Replace console.log with system logger
		window.console.log 				= function(message){systemLogger.debug(message);};
		window.console.warn 			= function(message){systemLogger.warn(message);};
		window.console.error			= function(message){systemLogger.error(message);};
		window.console.info				= function(message){systemLogger.info(message);};
		window.console.exception		= window.console.log;
		window.console.trace 			= window.console.log;
		window.console.group 			= window.console.log;
		window.console.groupCollapsed	= window.console.log;

		//------------------------------------------------------------------------------
		window.console.table = function(data, columns) {
		    console.log("%o", data);
		};
		
		// Initialise this service by rotating previous logs
		initService();
		return function(name){
			if (loggers[name] === undefined){
				loggers[name] = new LoggerService(name);
			}
			return loggers[name]; 
		}
    }
]);
})(synthMobile);
