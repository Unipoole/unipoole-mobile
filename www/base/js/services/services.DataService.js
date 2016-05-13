/* 
 * base/js/services/services.DataService.js
 */
(function(synthMobile, angular){
'use strict';


/**
 * Create factory for the DataService
 */
synthMobile.factory('DataService',
    ['$q', '$http', 'LoggerService','SynthError', 'UserSession','SynthConfig',
    function($q, $http, LoggerService, SynthError, UserSession, SynthConfig){

    var LOG = LoggerService('DataService');
    /**
     * Constructor
     */
	function DataService(){
		this.deviceReady = false;
		this.cachedRouteFileSystem = null;
	}
	
	/**
	 * Convert an unknown jsonData type to an JSON Object
	 */
	function convertToObject(jsonData){
		if (typeof jsonData === 'string'){
			return JSON.parse(jsonData);
		}
		else if (typeof jsonData === 'object'){
			return jsonData;
		}
		else{
			LOG.warn("Invalid object type : " + typeof(jsonData));
			return null;
		}
	}
	
	/**
	 * Convert an unknown jsonData type to an JSON Object
	 */
	function convertToString(jsonData){
		if (typeof jsonData === 'string'){
			LOG.debug("Data type is string");
			return jsonData;
		}
		else if (typeof jsonData === 'object'){
			LOG.debug("Data type is object");
			return JSON.stringify(jsonData);
		}
		else{
			LOG.warn("Invalid object type : " + typeof(jsonData));
			return null;
		}
	}

	/**
	 * Returns a promise that will be resolved when the cordova thinks
	 * the device is ready and you can use the API
	 */
	DataService.prototype.cordovaReady = function(){
		var deferred = $q.defer();
		
		if (this.deviceReady === true){
			deferred.resolve();
		}
		else{
			var ds = this;
			document.addEventListener("deviceready", function(){
				ds.deviceReady = true;
				deferred.resolve();
			},false);
		}
		
		return deferred.promise;
	};

	/**
	 * Gets the root directory where the application is writing files
	 */
	DataService.prototype.getApplicationRoot = function(){
		var deferred = $q.defer();
		// TODO remove the false!
		if (false && this.cachedRouteFileSystem !== null){
			deferred.resolve(this.cachedRouteFileSystem);
		}
		else {
			var service = this;
			this.cordovaReady().then(function(){
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
				function gotFS(fileSystem) {
					fileSystem.root.getDirectory(SynthConfig.dataDir, {create: true, exclusive : false}, 
						function(directory){
							service.cachedRouteFileSystem = directory;
							deferred.resolve(directory);
						}, function(error){
							LOG.warn("Failed to get application root : " + error);
							deferred.reject(SynthError(1004, error.code));
						}
					);
				}
				function fail(error) {
					LOG.warn("Failed to get filesystem, code:" + error.code);
					deferred.reject(SynthError(1004, error.code));
				}
			});
		}
		return deferred.promise;
	};

	/**
	 * Checks if the specified path exists, and creates all parent directories
	 * if required.
	 * The path is created from the root of the application path
	 */
	DataService.prototype.checkAndCreateDirectory = function(path){
		var deferred = $q.defer();
		this.getApplicationRoot().then(
			function(root){
				
				// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
				function removeBlanks(folders){
					if (folders.length > 0 && (folders[0] === '.' || folders[0] === '')) {
						folders = folders.slice(1);
						return removeBlanks(folders); // Call again to check the next one too
					}
					else{
						return folders;
					}
				}
				
				function createDir (rootDirEntry, folders){
					folders = removeBlanks(folders);
					
					// If there are no more folders left, this is it
					if (folders.length === 0){
						deferred.resolve(rootDirEntry);
						return;
					}
					
					var folder = folders[0];
					folders = folders.slice(1);
					//LOG.debug("Creating directory : " + folder + " in parent: " + rootDirEntry.fullPath);
					rootDirEntry.getDirectory(folder, {create: true}, function(dirEntry) {
						// Recursively add the new subfolder (if we still have another to create).
						if (folders.length > 0) {
							createDir(dirEntry, folders);
						}else{
							deferred.resolve(dirEntry);
						}
					},
					// Error Creating directory
					function(error){
						LOG.warn("Error creating path " + path + " : " + error);
						deferred.reject(SynthError(1004, error));
					});
				}
				createDir(root, path ?  path.split('/') : []);
			});
		return deferred.promise;
	};
	
	/**
	 * Gets the full path of the root directory.
	 * The success of the promise will return a string of the full path
	 * to the application root directory.
	 */
	DataService.prototype.getLocalFilePath = function(){
		var deferred = $q.defer();
		this.getApplicationRoot().then(
			// Success
			function(root){
				deferred.resolve(root.fullPath);
			},
			// Failed
			function(error){
				deferred.reject(SynthError(1004, error));
			}
		);
		return deferred.promise;
	};

	/**
	 * Writes to the data file of a tool.
	 * NOTE: This function will replace the current data file of the tool
	 * 
	 * @param moduleId - Id of the module this tool is in.
	 * @param toolname - Name of the tool to write data to.
	 * @param jsonData - Either a JSON Object, or a JSON string that represents the data
	 * that should be written to the tool's data file
	 * @param isUploadData - Flag if the data is for the upload file of the tool (optional, default=false)
	 */
	DataService.prototype.writeToolData = function(moduleId, toolname, jsonData, isUploadData){
		var deferred = $q.defer();
		this.getDataDirectory(toolname, moduleId).then(
			// Success
			function(root){
				var filename = toolname + (isUploadData ? ".upload.json" : ".json"); 
				root.getFile(filename, {create: true, exclusive: false}, 
					function(fileEntry){
					fileEntry.createWriter(onWriterReady, fail);
				}, fail);

				function onWriterReady(writer) {
					writer.onwriteend = function() {
						deferred.resolve();
					};
					
					var dataString = convertToString(jsonData);
					if (dataString != null){
						writer.write(dataString);
					}else {
						LOG.warn("Failed while trying to write tool data, Invalid data type given to write as tool data");
						deferred.reject(SynthError(1000, 'Invalid data type given to write as tool data'));
					}
				}
				/**
				 * Function for when an IO action fails
				 */
				function fail(error) {
					LOG.warn("Failed while trying to write tool data, error : " + error);
					deferred.reject(SynthError(1004));
				}
			},
			// Fail
			function(){
				deferred.reject();
			}
		);
		return deferred.promise;
	};
	
	/**
	 * Write content to a file
	 * 
	 * @param directoryPath - Path of the directory to write in.
	 * @param filename - Name of the file to write in.
	 * @param data - Data to write to the file. The data can be a string or a JSON object
	 * which will be converted to a json string.
	 */
	DataService.prototype.writeToFile = function(directoryPath, filename, data){
		var deferred = $q.defer();
		this.checkAndCreateDirectory(directoryPath).then(
			// Success getting directory path
			function(directory){
				directory.getFile(filename, {create: true, exclusive: false}, 
						function(fileEntry){
						fileEntry.createWriter(onWriterReady, fail);
					}, fail);

					// Writer is ready to write
					function onWriterReady(writer) {
						writer.onwriteend = function() {
							deferred.resolve();
						};
						var outputData = convertToString(data);
						writer.write(outputData);
					}
					// Function for when an IO action fails
					function fail(error) {
						LOG.warn("Failed while trying to write to file, error: " + error);
						deferred.reject(SynthError(1004));
					}
			},
			// Failed to get directory path
			function(error){
				LOG.warn("Failed while trying to write to file, error: " + error);
				deferred.reject(SynthError(1004));
			});
		return deferred.promise;
	};
	
	
	/**
	 * Copies content from the web to a file
	 */
	DataService.prototype.copyFromWebToFile = function(webPath, directoryPath, filename){
		var deferred = $q.defer();
		var service = this;
		this.getWebData(webPath).then(
			// Success
			function(data){
				copyDataToFile(data);
			},
			// Failed
			function(error){
				LOG.warn("Failed to get web data : " + error);
				deferred.reject(SynthError(1004));
			});
		// Function to copy the web data to the file
		function copyDataToFile(data){
			service.writeToFile(directoryPath, filename, data).then(
				// Success
				function(){
					deferred.resolve();
				},
				// Failed
				function(error){
					LOG.warn("Failed while trying to copy file from web, error: " + error);
					deferred.reject(SynthError(1004));
				}
			);
		}
		return deferred.promise;
	};
	
	/**
	 * Merges data to a tool's data file.
	 * This will typically by used when downloading sync'd content and merge it to a file
	 * 
	 * @param moduleId - Module ID in which the tool is
	 * @param toolname - Name of the tool to write data too
	 * @param jsonData - Either a JSON String, or a JSON Object representing the data to write
	 * @param isUploadData - Flag if the data should be merged to the upload data of the tool
	 */
	DataService.prototype.mergeToToolData = function(moduleId, toolname, jsonData, isUploadData){
		var deferred = $q.defer();
		var service = this;
		this.getToolData(moduleId, toolname, isUploadData).then(
			// Success
			function(data){
				var jsonObject = convertToObject(jsonData);
				var writeObject = jQuery.extend(true, data, jsonObject);
				// Write the merged data to the file
				service.writeToolData(moduleId, toolname, writeObject, isUploadData).then(
					// Success
					function(directory){
						deferred.resolve();
					},
					//Fail
					function (){
						deferred.reject(SynthError(1004));
					}
				);
			},
			// Fail
			function(){
				
			});
		
		return deferred.promise;
	};
	
	
	
	/**
	 * Merge content to a file
	 */
	DataService.prototype.mergeToFile = function(directoryPath, filename, jsonObject){
		var deferred = $q.defer();
		var service = this;
		// Get the orginal contents of the file
		this.getFileData(directoryPath, filename).then(
				// Success
				function(data){
					// Merge the new data to the old data
					var writeData = jQuery.extend(true, data, jsonObject);
					
					// Write the merged data to the file
					service.writeToFile(directoryPath, filename, JSON.stringify(writeData)).then(
						// Success
						function(directory){
							deferred.resolve();
						},
						//Fail
						function (error){
							deferred.reject(error);
						}
					);
				},
				//Fail
				function (error){
					deferred.reject(error);
				}
			);
		return deferred.promise;
	};

	/**
	 * Gets the directory in which a tool lives
	 */
	DataService.prototype.getToolDirectory = function(moduleId, toolname){
		var deferred = $q.defer();
		var path = moduleId + ("base" === toolname ? "/base" : "/tools/"+toolname);
		this.checkAndCreateDirectory(path).then(
			// Success
			function(directory){
				deferred.resolve(directory);
			},
			//Fail
			function (error){
				deferred.reject(error);
			}
		);
		return deferred.promise;
	};
	
	/**
	 * Gets the directory in which a tool lives
	 */
	DataService.prototype.getDataDirectory = function(toolname, moduleId){
		var deferred = $q.defer();
		if(moduleId == null){
			moduleId = UserSession.activeModule;
		}
		
		var path = moduleId + ("base" === toolname ? "/base" : "/tools/"+toolname);
		this.checkAndCreateDirectory(path + "/data").then(
			// Success
			function(dirEntry){
				deferred.resolve(dirEntry);
			},
			//Fail
			function (error){
				deferred.reject(error);
			}
		);
		return deferred.promise;
	};
	
	
	/**
	 * Gets the directory in which a tool lives
	 */
	DataService.prototype.getFileInToolData = function(moduleId, toolname, filepath){
		var deferred = $q.defer();
		this.getDataDirectory(toolname,moduleId).then(
			// Success
			function(dirEntry){
				dirEntry.getFile(filepath, {create:false},
					function(fileEntry){
					 var reader = new FileReader();
			         reader.onloadend = function(evt) {
				           LOG.debug(evt.target.result);
				          deferred.resolve(evt.target.result);
				     	};
			        
			        fileEntry.file(function(file){
			        	reader.readAsDataURL(file);
			        },
			        function(){
			        	LOG.warn("Failed to get file from file entry");
						deferred.reject(SynthError(1004));
			        })
			        
					},
					function(error){
						LOG.warn("Fail while trying to get file in directory");
						deferred.reject(SynthError(1004));
					}
				);
			},
			//Fail
			function (error){
				deferred.reject(error);
			}
		);
		return deferred.promise;
	};
	
	
	/**
	 * Get data from a web json source
	 */
	DataService.prototype.getWebData = function(webPath){
	 	return $http({ 'method': 'GET', 'url': webPath})
	 		.then(function(response){
		 			return response.data;
		 		},function(){
		 			return $q.reject(SynthError(1004));
		 		});
	};
	
	/**
	 * Gets the JSON object from a file
	 */
	DataService.prototype.getFileData = function(directoryPath, filename){
		LOG.debug("Getting data for: directroy=" + directoryPath +", filename=" + filename);
		var deferred = $q.defer();
		var service = this;
		this.checkAndCreateDirectory(directoryPath).then(
			// Success
			function(directory){
				directory.getFile(filename, {create:true},
					function(fileEntry){
						service.getFileAsObject(fileEntry).then(
							// Success
							function(object){
								LOG.isDEBUG() && LOG.debug("Got data :" + JSON.stringify(object));
								deferred.resolve(object);
							},
							// Fail
							function(error){
								deferred.reject(error);
							}
						);
					},
					function(error){
						LOG.warn("Fail while trying to get file in directory");
						deferred.reject(SynthError(1004));
					}
				);
			
			},
			// Failed
			function(error){
				deferred.reject(error);
			});
		return deferred.promise;
	};
	
	/**
	 * Get the module data
	 */
	DataService.prototype.getModuleData = function(moduleId){
		return this.getFileData(moduleId, "module.json");
	};
	
	/**
	 * Get the registration data
	 */
	DataService.prototype.getRegistrationData = function(){
		return this.getFileData("", "registration.json");
	};
	
	/**
	 * Get the settings data
	 */
	DataService.prototype.getSettingsData = function(){
		return this.getFileData("", "settings.json");
	};
	
	/**
	 * Makes sure that the user's settings.json file has all the 
	 * setting of the base setting file, and returns the resulting 
	 * settings.
	 * The user's settings file will also be updated to disk if there was
	 * any changes.
	 */
	DataService.prototype.ensureSettingsData = function(){
		
		var currentSettings, baseSettings;
		var self = this;
		// Promise to get the base settings
		function getBaseSettingPromise(){
			return self.getWebData('base/data/settings.json').then(function(data){
				baseSettings = data;
			});
		}
		
		// Promise to get the current setting
		function getCurrentSettingsPromise(){
			return self.getSettingsData().then(function(data){
				currentSettings = data;
				return currentSettings;
			});
		}
		
		// Promise to merge the data
		function getMergeSettingsPromise(){
			currentSettings = jQuery.extend(true, baseSettings, currentSettings);
			return $q.when(currentSettings);
		}
		
		// Promise to persist the settings
		function getPersistSettingsPromise(){
			return self.mergeToSettingsData(currentSettings);
		}
		
		return getBaseSettingPromise()
			.then(getCurrentSettingsPromise)
			.then(getMergeSettingsPromise)
			.then(getPersistSettingsPromise)
			.then(getCurrentSettingsPromise);
	};
	
	/**
	 * Make sure the files exists that prevent the device from scanning for library
	 * content in the Application directory
	 */
	DataService.prototype.ensureNoMediaScanFiles = function(){
		return this.writeToFile("", ".nomedia");
	};
	
	/**
	 * Merge data to a module's data file.
	 * 
	 * @param moduleId - ID of the module to merge too
	 * @jsonData - Data to merge. Data can be a JSON string or a JSON object
	 */
	DataService.prototype.mergeToModuleData = function(moduleId, jsonData){
		return this.mergeToFile(moduleId, "module.json", jsonData);
	};
	
	/**
	 * Merge to registration.json
	 */
	DataService.prototype.mergeToRegistrationData = function(jsonData){
		return this.mergeToFile("", "registration.json", jsonData);
	};
	
	/**
	 * Merge to settings.json
	 */
	DataService.prototype.mergeToSettingsData = function(jsonData){
		return this.mergeToFile("", "settings.json", jsonData);
	};
	
	/**
	 * Gets a merge of the downloaded and (still-to) upload data for a tool
	 * 
	 * @param moduleId Module in which the tool is
	 * @param toolname Name of the tool
	 */
	DataService.prototype.getMergedToolData = function(moduleId, toolname){
		var toolData, toolUploadData;
		var self = this;
		function getToolDataPromise(){
			return self.getToolData(moduleId, toolname, true).then(function(data){ toolData = data; });
		}
		
		function getToolUploadDataPromise(){
			return self.getToolData(moduleId, toolname, false).then(function(data){ toolUploadData = data; });
		}
		
		function getMergedDataPromise(){
			var mergedData = jQuery.extend(true, toolData, toolUploadData);
			return $q.when(mergedData);
		}
		
		return getToolDataPromise()
			.then(getToolUploadDataPromise)
			.then(getMergedDataPromise);
	};
	
	/**
	 * Gets the size of the upload data
	 */
	DataService.prototype.getToolUploadDataSize = function(moduleId, toolname){
		var deferred = $q.defer();
		this.getDataDirectory(toolname,moduleId).then(
			// Success
			function(toolRoot){
				var filename = toolname + ".upload.json"; 
				/*
				 * TODO do we have to create the file ?!
				 * This will cause each tool to have an upload file
				 * even will it will always be empty, the file will get
				 * created when checking for sync
				 */ 
				toolRoot.getFile(filename, {create:true}, 
					function(fileEntry){
						fileEntry.file(
							function(file){
								deferred.resolve(file.size);
							},fail);
						
					},fail
				);
			},fail
		);
		
		function fail(error){
			deferred.reject(error);
		}
		
		return deferred.promise;
	};
	
	/**
	 * Delete the upload data file for a tool
	 */
	DataService.prototype.deleteToolUploadData = function(moduleId, toolname){
		var deferred = $q.defer();
		this.getToolDataFile(moduleId, toolname, true).then(
			// Success
			function(fileEntry){
				fileEntry.remove(
					function(){
						deferred.resolve();
					}, 
					function(error){
						LOG.warn("Error deleting upload file")
						deferred.reject(SynthError(1004, "Error deleting upload file"));
					});
			},
			//Fail
			function (error){
				deferred.reject(error);
			}
		);
		return deferred.promise;
	};
	
	
	/**
	 * Gets the file entry for a tool's data file
	 * @param moduleId - ID of the module for the tool
	 * @param toolname - Name of the tool to get data file of
	 * @param isUploadData - Flag if the data file should be the upload file
	 */
	DataService.prototype.getToolDataFile = function(moduleId, toolname, isUploadData){
		var deferred = $q.defer();
		var service = this;
		this.getDataDirectory(toolname, moduleId).then(
			// Success
			function(toolRoot){
				var filename = toolname + (isUploadData ? ".upload.json" : ".json"); 
				toolRoot.getFile(filename, {create:true},
					function(fileEntry){
						deferred.resolve(fileEntry);
					},
					function(error){
						LOG.warn("Error getting tool data file, error: " + error);
						deferred.reject(SynthError(1004));
					}
				);
			},
			//Fail
			function (error){
				deferred.reject(error);
			}
		);
		return deferred.promise;
	};
	
	/**
	 * Gets the data for a tool
	 * @param moduleId - ID of the module in which the tool is
	 * @param toolname - Name of the tool to get data of
	 * @param isUploadData - Indication if the data is the upload data (optional, default=false)
	 */
	DataService.prototype.getToolData = function(moduleId, toolname, isUploadData){
		LOG.debug("Getting data for tool : " + moduleId + " - " + toolname);
		var deferred = $q.defer();
		var service = this;
		this.getToolDataFile(moduleId, toolname, isUploadData)
			.then(
				// Success
				function(fileEntry){
					service
					.getFileAsObject(fileEntry)
					.then(
						// Success
						function(object){
							deferred.resolve(object);
						},fail);
				},fail);
		
		function fail(error){
			deferred.reject(error);
		}
		return deferred.promise;
	};
	
	DataService.prototype.getFileContentCDV = function(cdvFilePath){
		var deferred = $q.defer();
		
		window.resolveLocalFileSystemURL(cdvFilePath,
		// Got the local file
		function(fileEntry){
			fileEntry.file(function(file){
				var reader = new FileReader();
			    reader.onloadend = function (evt) {
			    	deferred.resolve(evt.target.result);
			    };
			    reader.readAsText(file);
			}, function(){
				deferred.reject(SynthError(1004));
			});
		},
		// Failed to get the file
		function(){
			deferred.reject(SynthError(1004));
		});
		return deferred.promise;
	};
	
	/**
	 * Get the contents of a file without any special conversions
	 */
	DataService.prototype.getFileContent = function(toolId, moduleId, filePath){
		var service = this;
		var dataDir = null;
		
		if(moduleId == null){
			moduleId = UserSession.activeModule;
		}
		
		// Returns a promise to get the tools data dir
		function getToolDataDirPromise(){
			return service.getDataDirectory(toolId, moduleId)
				.then(function(dir){
					dataDir = dir;
				});
		}
		
		// Returns a promise to get the content of the file
		function getContentPromise(){
			var deferred = $q.defer();
			LOG.debug("Getting content of file: " + dataDir.nativeURL + '/' + filePath);
			dataDir.getFile(filePath, null,
				// Got file
				function(fileEntry){
					fileEntry.file(function(file){
						var reader = new FileReader();
					    reader.onloadend = function (evt) {
					    	deferred.resolve(evt.target.result);
					    };
					    
					    reader.readAsText(file);
					}, function(){
						deferred.reject(SynthError(1004));
					});
				},
				// Failed to get file
				function(reason){
					deferred.reject(SynthError(1004));
				});
			return deferred.promise;
		}

		return getToolDataDirPromise()
			.then(getContentPromise);
	}
	;
	/**
	 * Gets a file as an object
	 */
	DataService.prototype.getFileAsObject = function(fileEntry){
		var deferred = $q.defer();
		fileEntry.file(function(file){
				var reader = new FileReader();
				reader.onloadend = function (evt) {
					if (evt.target.result === ''){
						deferred.resolve({});
					}
					else{
						try {
							deferred.resolve(angular.fromJson(evt.target.result));
						}
						catch(e){
							LOG.warn("Failed to create object from json string : \n" + evt.target.result);
							deferred.reject(SynthError(1004));
						}
					}
				};
				reader.readAsText(file);
			},fail);
		
		function fail(error) {
			LOG.warn("Failed getting file as object, error : " + error);
			deferred.reject(SynthError(1004, error));
		}
		return deferred.promise;
	};

	/**
	 * Checks if a file exist
	 */
	DataService.prototype.doesFileExist = function(filePath){
		var deferred = $q.defer();
		this.getApplicationRoot().then(
			// Success
			function(fileSystem){
				fileSystem.getFile(filePath, { create: false },
					// It exists
					function(){
						deferred.resolve(true);
					},
					// It does not exist
					function(){
						deferred.resolve(false);
					});
			},
			// Failed
			function(error){
				deferred.reject(error);
			}
		);
		
		return deferred.promise;
	};
	
	/**
	 * This method will delete ALL application data from the user's device.
	 */
	DataService.prototype.deleteAllApplicationData = function(){
		var deferred = $q.defer();
		UserSession.clearSession();
		this.getApplicationRoot().then(
			// Success
			function(dataDirectoryEntry){
				dataDirectoryEntry.removeRecursively(
					function(){
						deferred.resolve();
					},
					function(error){
						deferred.reject(SynthError(1004, "Error deleting all aplication data"));
					});
			},
			// Failed
			function(error){
				deferred.reject(error);
			});
		
		return deferred.promise;
	};
	
	
	/**
	 * Returns a unique ID immediately
	 */
	DataService.prototype.generateUID = function(){
		// TODO maybe move this somewhere else?
		return 'UNIPOOLE_xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	};
	
	
	
	return new DataService();
}]);
})(synthMobile, angular);