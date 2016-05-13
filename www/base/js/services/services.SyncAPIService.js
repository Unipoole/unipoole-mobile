/* 
 * base/js/services/services.SyncAPIService.js
 */
(function(synthMobile){
'use strict';

/**
 * Define the factory for the SyncAPI Service
 * This service interfaces with a remote server.
 */
synthMobile.factory('SyncAPIService',
	['$q', '$http', '$filter', 'base64', 'DataService','UserSession',
	 'LoggerService','SynthError','SynthFail','SynthCheckResponseError','SynthConfig','AppSyncStatus','SynthQLoop',
	function($q, $http, $filter, base64, DataService, UserSession, 
			LoggerService, SynthError, _SF, CheckError, SynthConfig, appSyncStatus, SynthQLoop){
	
	var LOG = LoggerService('SyncAPIService');
	
	/**
	 * Constructor
	 */
	function SyncAPIService(){
	}
	
	function mapTool(toolname){
		//LOG.debug("Getting mapped name for : " + toolname + " : " + TOOLMAP[toolname] || toolname);
		return SynthConfig.toolMapping[toolname] || toolname;
	};
	
	
	function mapFieldTools(fieldName, object){
		var container = object[fieldName];
		for(var key in container){
			container[mapTool(key)] = container[key];
			delete container[key];
		}
	};
	
	
	/**
	 * Check the respos
	 */
	function checkInvalidPassword(){
		
	};
	
	
	/**
	 * Get the sync status without going online
	 */
	SyncAPIService.prototype.getSyncStatusOffline = function(moduleId){
		var deferred = $q.defer();
		
		// If a module id is not specified, we use the currently active module
		if(moduleId == null){
			moduleId = UserSession.activeModule;
		}
		
		
		var errorHandler = _SF(deferred);
		var self = this;
		var moduleData = {};
		// The response object that will be sent to the caller of this function
		var syncStatus = {
			'inSync' : true,
			'tools' : {}
		};
		
		
		var funcUpdateTool = function(toolId){
			LOG.debug("Checking offline sync status for toolId : " + toolId);
			var toolUpdateDeferred = $q.defer();
			var toolUpdateErrorHandler = _SF(toolUpdateDeferred);
			var toolLocal  = moduleData.toolsLocal[toolId];
			var toolRemote = moduleData.tools[toolId];
			// If there is no remote entry for the tool, we ignore this tool
			if (toolRemote == null) toolUpdateDeferred.resolve();;
			
			// Create a syncStatus entry for the tool
			syncStatus.tools[toolId] = {
				'codeDownloadSize' : 0,
				'contentDownloadSize' : 0,
				'contentUploadSize' : 0,
				'inSync' : true,
				'label' : moduleData.toolDescriptions[toolId].label
			};
			
			// Check for code download
			/* We ignore code sync for mobile
			if(toolLocal.clientCodeVersion !== toolRemote.currentCodeVersion){
				syncStatus[toolId].codeDownloadSize = toolRemote.codeSynchSize;
				syncStatus[toolId].inSync = false;
				syncStatus.inSync = false;
			}*/
			
			// Check for content download
			if(toolLocal.clientContentVersion !== toolRemote.currentContentVersion){
				syncStatus.tools[toolId].contentDownloadSize = toolRemote.contentSynchSize;
				syncStatus.tools[toolId].inSync = false;
				syncStatus.inSync = false;
			}
			
			// Check for local change
			
			self.getToolUploadSize(moduleId, toolId).then(function(size){
				if(size !== 0){
					syncStatus.tools[toolId].contentUploadSize = size;
					syncStatus.tools[toolId].inSync = false;
					syncStatus.inSync = false;
				}
				toolUpdateDeferred.resolve(syncStatus);
			},toolUpdateErrorHandler);
			
			return toolUpdateDeferred.promise;
		}
		
		
		
		DataService.getModuleData(moduleId).then(function(data){
			moduleData = data;
			// If we don't have tool we must be out of sync
			if(moduleData == null || moduleData.tools == null){
				syncStatus.inSync = false;
				deferred.resolve(syncStatus);
			}else{
				var idx = 0;
				var toolsArray = $filter("object2Array")(moduleData.toolsLocal);
				SynthQLoop(function(){
					var promise;
					// We have no more promises to update
					if (idx >= toolsArray.length){
						promise = null;
					}else{
						promise = funcUpdateTool(toolsArray[idx++].key);
					}
					return promise;
				}).then(function(){
					appSyncStatus.inSync = syncStatus.inSync;
					appSyncStatus.tools = syncStatus.tools;
					deferred.resolve(syncStatus);
				});
			}
		},errorHandler);
		return deferred.promise;
	};
	
	/**
	 * Get the module upload size and save it to module.json
	 */
	SyncAPIService.prototype.getToolUploadSize = function(moduleId, toolId){

		// Get promise to merge tool upload size to module.json
		function getMergeModuleDataPromise(size){
			// We also need to update our local file about the posible change of upload content
			var mergeData = { 'toolsLocal' : {} }
			mergeData.toolsLocal[toolId] = { 
					'localChange' : (size !== 0),
					'localChangeSize' : size
			};
			return DataService
				.mergeToFile(moduleId, "module.json", mergeData)
				.then(function(){
					return size;
				});
		}
		
		return DataService
			.getToolUploadDataSize(moduleId, toolId)
			.then(getMergeModuleDataPromise);
	};
	
	/**
	 * Update the sync status
	 */
	SyncAPIService.prototype.getSyncStatus = function(moduleId){
		
		// The response object that will be sent to the caller of this function
		var syncStatus = {
			'inSync' : true,
			'tools' : {}
		};
		
		// If a module id is not specified, we use the currently active module
		if(moduleId == null){
			moduleId = UserSession.activeModule;
		}
		var moduleData = null;
		var self = this;
		
		// Returns a promise to get the module data
		function getModuleDataPromise(){
			return DataService
				.getModuleData(moduleId)
				.then(function(mData){
					moduleData=mData;
				});
		}
		
		// Returns a promise to get the sync status from the remote server
		function getRequestSyncStatusPromise(){
			var deferred = $q.defer();
			// Data that will be sent with the sync status request
			var reqData = {
                    'deviceId'	: UserSession.deviceId,
                    'tools'		: {}
                };
			// Map mobile app tools to remote server tool names and add current versions
			for(var key in moduleData.toolsLocal){
				var mappedKey = mapTool(key);
				reqData.tools[mappedKey] = {
					'clientCodeVersion' : moduleData.toolsLocal[key].clientCodeVersion,
					'clientContentVersion' : moduleData.toolsLocal[key].clientContentVersion
				}
			}
			
			// Request changes from remote server
			var restURL = SynthConfig.baseURL + '/service-synch/synchStatus/'+UserSession.username+'/'+ moduleId;
			LOG.debug("Getting sync status calling REST URL : " + restURL);
			$http({
				method: 'POST', 
				url: restURL,
				data : reqData}).
				success(function(data, status, headers, config) {
					// Check if there is an error
					if (CheckError(deferred, data)) return;
					
					deferred.resolve(data.tools);
				}).
				error(function(data, status, headers, config) {
					deferred.reject(SynthError(1000));
				});
				return deferred.promise;
		}
		
		// Returns a promise to write the response data to the module.json file
		function getWriteDownloadResponsePromise(responseTools){
			var fileData = { 'tools' : {}};
			// Map service tools to local tool names
			for(var remoteKey in responseTools){
				var localKey = mapTool(remoteKey);
				// Data to write to file
				fileData.tools[localKey] = {
					'clientCodeVersion' : responseTools[remoteKey].clientCodeVersion,
					'clientContentVersion' : responseTools[remoteKey].clientContentVersion,
					'currentCodeVersion' : responseTools[remoteKey].currentCodeVersion,
					'currentContentVersion' : responseTools[remoteKey].currentContentVersion,
					'codeSynchSize' : responseTools[remoteKey].codeSynchSize,
					'contentSynchSize' : responseTools[remoteKey].contentSynchSize
				};
				
				// Data to send back caller of this function
				syncStatus.tools[localKey] = {
					'label' : moduleData.toolDescriptions[localKey].label,
					'codeDownloadSize' : 0, // Ignoring code sync for mobile
					'contentDownloadSize' : responseTools[remoteKey].contentSynchSize,
					'contentUploadSize' : 0,
					'inSync' : (responseTools[remoteKey].contentSynchSize === 0) // Ignoring code sync for mobile
				};
				syncStatus.download = ((syncStatus.download ? syncStatus.download : 0) + responseTools[remoteKey].contentSynchSize);// Ignoring code sync for mobile
				// If any tool has downloads, we are overall out of sync
				if (!syncStatus.tools[localKey].inSync){
					syncStatus.inSync = false;
				}
			}
			return DataService.mergeToModuleData(moduleId, fileData);
		}
		
		/**
		 * Gets a promise to check the upload size for a tool
		 */
		var uIdx=0;
		var toolsArray = null;
		function getUploadSizePromise(){
			
			// Create the array if we don't have it
			if(toolsArray == null){
				toolsArray = $filter("object2Array")(syncStatus.tools);
			}
			
			// If there are no more tools return null
			if(uIdx == toolsArray.length) return null;
			
			// Get the next tool id
			var toolId = toolsArray[uIdx++].key;
			
			syncStatus.tools[toolId] = syncStatus.tools[toolId] || {
				'codeDownloadSize' : 0,
				'contentDownloadSize' : 0,
				'contentUploadSize' : 0,
				'inSync' : true
			};
			syncStatus.tools[toolId].label= moduleData.toolDescriptions[toolId].label;
			
			return self
					.getToolUploadSize(moduleId, toolId)
					.then(function(size){
						syncStatus.tools[toolId].contentUploadSize = size;
						syncStatus.tools[toolId].inSync = (syncStatus.tools[toolId].inSync && (size === 0));
						syncStatus.upload = ((syncStatus.upload ? syncStatus.upload : 0) + size);
						syncStatus.inSync = (syncStatus.inSync && syncStatus.tools[toolId].inSync);
					});
		}
		
			// Get the module data
		return getModuleDataPromise()
			// Get sync status from remote server
			.then(getRequestSyncStatusPromise)
			// Write the response to the module file
			.then(getWriteDownloadResponsePromise)
			// Get the upload size
			.then(function(){
				return SynthQLoop(getUploadSizePromise);
			})
			.then(function(){
				syncStatus.total = ((syncStatus.download ? syncStatus.download : 0) + (syncStatus.upload ? syncStatus.upload : 0));
				
				appSyncStatus.inSync = syncStatus.inSync;
				appSyncStatus.tools = syncStatus.tools;
				return syncStatus; // Finally we are done!
			});
	};
	
	
	
	/**
	 * Updates a specific tool
	 */
	SyncAPIService.prototype.syncDownloadTool = function(moduleId, toolname){
		var moduleData = null;
		var service = this;
		var toolSyncResponse = {};
		var toolDataObject = {}; // The data synced for this tool
		var toolAttachments = []; // Attachments that has to be downloaded
		appSyncStatus.downloading = true;
		// Returns a promise to get the module data
		function getModuleDataPromise(){
			return DataService
				.getModuleData(moduleId)
				.then(function(mData){
					moduleData=mData;
				});
		}
		/*
		 * Returns a promise to get the tool's data
		 */
		function getToolDataPromise(){
			var deferredData = $q.defer();
			var toolVersion = moduleData.toolsLocal[toolname].clientContentVersion;
			var _toolname = mapTool(toolname);
			var restURL = SynthConfig.baseURL + '/service-synch/contentUpdateString/'+UserSession.username+'/'+UserSession.deviceId+ '/'+moduleId+'/'+_toolname+'/'+toolVersion;
			
			$http({
				method: 'POST', 
				url: restURL,
				data : {"authToken" : UserSession.authToken}})
				.success(function(data, status, headers, config){
					// Check if there is an error
					if (CheckError(deferredData, data)) return;
					
					toolSyncResponse = data;
					deferredData.resolve(data);
				})
				.error(function(data, status, headers, config){
					deferredData.reject(SynthError(1000));
				});
			return deferredData.promise;
		}
		
		
		/*
		 * When we get data from the server it is in base 64,
		 * this function will convert it to json format string
		 */
		 function getConvertFromBase64Promise (base64Data){
			try{
				toolDataObject = base64.decode(base64Data.content);
				LOG.debug("Got data for tool "+toolname+" : \n" + toolDataObject);
				toolDataObject = JSON.parse(toolDataObject);
				$q.when(toolDataObject);
			}
			catch(e){
				$q.reject(SynthError(1000));
			}
		}
		
		/*
		 * Replace the inline images with links to the downloaded content
		 * This function will use the registered SynthEmbeddedImageHandler for the tool if
		 * there was on registered
		 */
		function getFixImagesPromise(){
			var imageHandler = SynthEmbeddedImageHandler.getHandler(toolname);
			if (imageHandler){
				return DataService
				.getToolDirectory(moduleId, toolname)
				.then(function(dirEntry){
					toolDataObject = imageHandler(toolDataObject, "cdvfile://localhost/persistent"+dirEntry.fullPath);
				});
			}else{
				return $q.when([]);
			}
		}
		
		/*
		 * Replace all the embedded links with links that will open externally
		 */
		function getFixLinksPromise(){
			var linkHandler = SynthLinkHandler.getHandler(toolname);
			if (linkHandler){
				toolDataObject = linkHandler(toolDataObject);
			}
			return $q.when([]);
		}
		
		/*
		 * Mine for attachments in the tool data
		 */
		 function getMineAttachementsPromise(){
			var attachmentHandler = SynthAttachmentMiner.getHandler(toolname);
			if (attachmentHandler){
				return DataService
				.getDataDirectory(toolname, moduleId)
				.then(function(directoryEntry){
					toolAttachments = attachmentHandler(toolDataObject, "cdvfile://localhost/persistent" + directoryEntry.fullPath);
				});
			}else{
				return $.when([]);
			}
		}
		/*
		 * Merge the tool data to the tool's data file
		 */
		function getMergeToolDataPromise(){
			if(toolname == "base"){
				mapFieldTools('toolDescriptions', toolDataObject);
				return DataService.mergeToModuleData(moduleId, toolDataObject);
			}
			else{
				return DataService.mergeToToolData(moduleId, toolname, toolDataObject);
			}
		}
		
			
		/*
		 * Download the attachments
		 */
		function getDownloadAttachmentsPromise(){
			return service.getAttachementsFromServer(toolAttachments);
		}
		/*
		 * Update the tool version
		 */
		function getUpdateToolVersionPromise(){
			var versionData = { 
					'toolsLocal' : {},
					'tools' : {}
			};
			versionData.toolsLocal[toolname] = { 'clientContentVersion' : toolSyncResponse.version };
			versionData.tools[toolname] = { 
				'currentContentVersion' : toolSyncResponse.version,
				'clientContentVersion' : toolSyncResponse.version,
				'contentSynchSize' : 0
			};
			return DataService.mergeToModuleData(moduleId, versionData);
		}
		
		
		function fail(error){
			appSyncStatus.downloading = false;
			return $q.reject(error);
		}
			
			
		// Lets start the sync process
		return getModuleDataPromise()
			.then(getToolDataPromise)
			.then(getConvertFromBase64Promise)
			.then(getMineAttachementsPromise)
			.then(getDownloadAttachmentsPromise)
			.then(getFixImagesPromise)
			.then(getFixLinksPromise)
			.then(getMergeToolDataPromise)
			.then(getUpdateToolVersionPromise)
			.then(function(){
				appSyncStatus.downloading = false;
			}, fail);
			
			
	};
	
	/**
	 * Updates a specific tool
	 */
	SyncAPIService.prototype.syncUploadTool = function(moduleId, toolname){
		var toolUploadRequest = {}; // Data to upload for the tool
		var toolUploadResponse = {}; // Response for the upload
		var registrationData = {};
		appSyncStatus.uploading = true;
		/*
		 * Get the registration data for the user to get
		 * the device ID and username
		 */
		var funcGetRegistrationData = function(){
			return DataService
					.getRegistrationData()
					.then(function(data){
						registrationData=data;
					});
		},
		/*
		 * Get the data for the tool that should get uploaded
		 */
		funcGetToolUploadData = function(){
			return DataService
					.getToolData(moduleId, toolname, true)
					.then(function(uploadData){
						toolUploadRequest=uploadData;
					});
		},
		/*
		 * Upload the data to the SynthEngine
		 */
		funcUploadToolData = function(){
			var uploadDeferred = $q.defer();
			var restURL = SynthConfig.baseURL + '/service-synch/content/'+UserSession.username+'/'+UserSession.deviceId+'/'+moduleId+'/'+mapTool(toolname);
			$http({
					'method': 'PUT', 
					'url': restURL,
					'data' : {'authToken' : UserSession.authToken, 'content' : toolUploadRequest}
				})
			.success(function(responseData, status, headers, config) {
				// Check if there is an error
				if (CheckError(uploadDeferred, responseData)) return;
				toolUploadResponse=responseData.responseContent;
				uploadDeferred.resolve(toolUploadResponse);
			})
			.error(function(data, status, headers, config){
				uploadDeferred.reject(SynthError(1000));
			});
			
			return uploadDeferred.promise;
		},
		/*
		 * Delete the file containing the upload data.
		 */
		funcDeleteToolUploadData = function(){
			return DataService.deleteToolUploadData(moduleId, toolname);
		},
		/*
		 * Merge the data we uploaded with our current data file for the tool.
		 * If there is a handler that needs work with the upload data and the
		 * upload response, we will use that before merging the data
		 */
		funcMergeToolData = function(){
			// Check if there is an upload handler and use it
			var uploadResponseHandler = SynthUploadResponseHandler.getHandler(toolname);
			if(uploadResponseHandler){
				toolUploadRequest = uploadResponseHandler(toolUploadRequest, toolUploadResponse);
			}
			return DataService.mergeToToolData(moduleId, toolname, toolUploadRequest, false);
		};
		
		function fail(error){
			appSyncStatus.uploading = false;
			return $q.reject(error);
		}
		
		// Kick off the upload process
		return funcGetRegistrationData()
			.then(funcGetToolUploadData)
			.then(funcUploadToolData)
			.then(funcDeleteToolUploadData)
			.then(funcMergeToolData)
			.then(function(){
				appSyncStatus.uploading = false;
			}, fail);
	};
	
	/**
	 * Gets the sites allowed for this user
	 */
	SyncAPIService.prototype.getAllowedSites = function(){
		var restURL = SynthConfig.baseURL + '/service-auth/allowedSites/' + UserSession.username;
		return $http({
			'method': 'GET', 
			'url': restURL,
			'data' : {"authToken" : UserSession.authToken}})
			.then(function(response){
				var data = response.data;
				// Check if there is an error
				if (CheckError(null, data)) return $q.reject(SynthError(data));
				
				return data.modules;
			},
			function(){
				return $q.reject(SynthError(1000));
			});
	};
	
	/**
	 * Register the device to sync a module
	 */
	SyncAPIService.prototype.registerForModule = function(moduleId){
		var deferred = $q.defer();
		DataService.getModuleData(moduleId).then(function(moduleData){
			
			// Map toolname for external services
			var toolsLocal = {};
			for(var key in moduleData.toolsLocal){
				toolsLocal[mapTool(key)] = moduleData.toolsLocal[key];
			}
			
			// Data that we are going to send
			var postData = {
				'deviceId'	: UserSession.deviceId,
				'moduleId' 	: moduleId,
				'tools'		: toolsLocal,
				'authToken'	: UserSession.authToken
			};
			
			var restURL = SynthConfig.baseURL + '/service-auth/register/' + UserSession.username;
			LOG.debug("Registering user for module '" + moduleId + "' using REST URL : " + restURL);
			LOG.isDEBUG() && LOG.debug("Posting data : " + JSON.stringify(postData));
			$http({
				method: 'POST', 
				url: restURL,
				data : postData}).
			success(function(data, status, headers, config) {
				// Check if there is an error
				if (CheckError(deferred, data)) return;
				
				deferred.resolve(data);
			}).
			error(function(data, status, headers, config) {
				deferred.reject(SynthError(1000));
			});
			
		},_SF(deferred));
		return deferred.promise;
	};
	
	/**
	 * Update the Modules data file with the content from the remote server.
	 * This should only be called once per module, and only when the user
	 * registers for a module.
	 * 
	 * This function will also check that the tools returned are supported by
	 * this client, therefor it might only use a subset of the returned data.
	 * The allowed tools are determined by the base.json file which is used for
	 * the base data file for each module (looking at the toolsLocal ids)
	 *
	 */
	SyncAPIService.prototype.updateModuleData = function(moduleId){
		var deferred = $q.defer();
		
		var restURL = SynthConfig.baseURL + '/service-creator/clientData/' + moduleId;
		LOG.debug("Getting module data using REST URL : " + restURL);
		$http({
			method: 'GET', 
			url: restURL}).
		success(function(data, status, headers, config) {
			LOG.isDEBUG() && LOG.debug("Got response for module data : " + JSON.stringify(data, "\t", 4));
			
			// Check if there is an error
			if (CheckError(deferred, data)) return;
			
			DataService.getModuleData(moduleId).then(
				function(moduleData){
					LOG.isDEBUG() && LOG.debug("Got current module data : " + JSON.stringify(moduleData, "\t", 4));
					var mergeData = { 'toolDescriptions' : {}, 'tools' : {}};
					// Loop through all the toolsDescriptions from the remote server
					for(var toolKey in data.toolDescriptions){
						/*
						 * Update the toolDescriptions only if we support the tool.
						 */
						if(moduleData.toolDescriptions[mapTool(toolKey)] !== undefined){
							mergeData.toolDescriptions[mapTool(toolKey)] = {};
							mergeData.toolDescriptions[mapTool(toolKey)].label = data.toolDescriptions[toolKey].label;
							mergeData.toolDescriptions[mapTool(toolKey)].description = data.toolDescriptions[toolKey].description;
							mergeData.toolDescriptions[mapTool(toolKey)].menu = data.toolDescriptions[toolKey].menu;
							mergeData.toolDescriptions[mapTool(toolKey)].seq = data.toolDescriptions[toolKey].seq;
						}
					}
					
					/*
					 * Loop though all the tools, and check that we support the tool by looking at the list
					 * of toolDescriptions from the local file
					 */ 
					for(var toolKey in data.tools){
						// If we support the tool
						if(moduleData.toolDescriptions[mapTool(toolKey)] !== undefined){
							mergeData.tools[mapTool(toolKey)] = data.tools[toolKey];
						}
					}
					
					// Now merge the resulting data to our local file
					LOG.debug("We will now merge these : " + JSON.stringify(mergeData, "\t", 4));
					
					DataService.mergeToModuleData(moduleId, mergeData).then(
						// Success
						function(){
							deferred.resolve();
						},
						_SF(deferred));
				},_SF(deferred));
			
			
		}).
		error(function(data, status, headers, config) {
			LOG.warn("Failed to get module data from remote server");
			deferred.reject(SynthError(1000));
		});
		return deferred.promise;
	};
	
	
	
	
	/**
	 * Download an array of files from the remote server for a specific tool
	 */
	SyncAPIService.prototype.getAttachementsFromServer =  function(attachments) {
		var service = this;
		if (!attachments || attachments.length === 0){
			LOG.info("No need to download any attachments, an empty array was given");
			return $q.when({});
		}
		
		var idx = 0;
		function getAttachment(){
			// if there is no more to get return null
			if(attachments.length === idx){
				return null;
			}
			var promise = service.getFileFromServer(attachments[idx].downloadKey, attachments[idx].downloadPath);
			idx++;
			return promise;
		}
		
		return SynthQLoop(getAttachment);
	};
	
	
	/**
	 * Download a single frile from the remote server.
	 * 
	 * @param {type} downloadKey - Key of the file to download from the remote server
	 * @param {type} localPath - Full path to where the file should be saved locally on the device
	 */
	SyncAPIService.prototype.getFileFromServer = function (downloadKey, localPath) {
		var deferred = $q.defer();
		
		// First make sure that the local path exists
			var fileTransfer = new FileTransfer();
	 		var uri = encodeURI(SynthConfig.baseURL + '/service-creator/download/file/'+  downloadKey);
	 		LOG.debug("Downloading file with URL " + uri);
	 		
	 		// Send back progress
	 		fileTransfer.onprogress = function(progressEvent) {
	 			deferred.notify(progressEvent);
	 		};

	 		
	 		fileTransfer.download(
	 			uri,
	 			localPath,
	 			function(entry) {
	 				LOG.debug("Download is complete");
	 				deferred.resolve();
	 			},
	 			function(error) {
	 				LOG.warn("Failed to download file!");
	 				LOG.warn("download error source " + error.source);
	 				LOG.warn("download error target " + error.target);
	 				LOG.warn("upload error code" + error.code);
	 				deferred.reject(SynthError(1004));
	 			},
	 			false,
	 			{
	 				// No options
	 			}
	 		);
	   
		return deferred.promise;
	};
	
	/**
	 * Authenticates a user to the remote server
	 */
	SyncAPIService.prototype.authenticateUser = function (username, password) {
		var restURL = SynthConfig.baseURL + '/service-auth/login/' + username;
		LOG.debug("Authenticating user with URL : " + restURL);
		var requestData = {'password' : password};
		
		/*
		 * Get the promise to authenticate the user to the remote side
		 */
		function getAuthenticatePromise(){
			return $http({
				'method': 'POST', 
				'url'	: restURL,
				'data'	: requestData})
				.then(function(response){
					var data = response.data;
					
					// Authentication failed
					if (data.errorCode == '1005'){
						return {
								'authenticated' : false,
								'message' : data.message,
								'errorCode' : data.errorCode,
								'instruction' : data.instruction
								};
					}
					
					// Check if there is an error
					if (CheckError(null, data)) return $q.reject(SynthError(data));
					
					return {
						'authenticated' : true,
						'authToken' : data.authToken
					}
				},function(){
					return $q.reject(SynthError(1000));
				});
		}
		
		/*
		 * Get promise to update the user's auth token if there is one
		 */
		function getUpdateTokenPromise(successData){
			if(successData.authToken){
				var newData = {
						'username' : username,
						'authToken' : successData.authToken
					};
				
				UserSession.updateSession(newData);
				return DataService.mergeToRegistrationData(newData).then(function(){
					return $q.when(successData);
				});
			}else{
				return $q.when(successData);
			}
		}
		
		return getAuthenticatePromise()
			.then(getUpdateTokenPromise);
	};
	
	return new SyncAPIService();
  }]);
})(synthMobile);
