# Debugging
This page will explain how you can debug the application running on a mobile device.
The loglevel for the application is set in app.config.js
```javascript
{
/*
 * Logging level
 * DEBUG : 1,
 * INFO  : 2
 * WARN  : 3
 * ERROR : 4
 * NONE  : 5
 */
'logLevel'          : 1,
 
// Should we log to console
'logToConsole' : true,
 
// Should we log to file
'logToFile' : true,
 
// Max size of the log file in bytes
'logFileSize' : 1000000,
 
// Number of log files to keep
'logFileCount' : 5,
}
```

## iOS
For this you will require a device with iOS 7 or later installed.

1. Make sure the "Developer" features are enabled for safari (both on the Mac and on the iOS device)
2. Open the unipoole mobile application on the iOS device while being connected to the Mac
3. Open Safari on the Mac and find your device on the "Develop" tab.
4. You will now have a normal web inspector.

## Android
Debugging on Android is only possible if the device is running Android 4.4 or later. It is highly recommended that you have a Android 4.4 device when developing.

1. Connect the device to your computer (make sure it displayes when you type "adb devices" on the command line)
2. Install and open the Google Chrome browser on your computer
3. Navigate to chrome://inspect/#devices
4. On this page you will also see Android devices that are connected and ready to be debugged
5. Open the Unipoole Mobile application on the mobile device
6. In the list in Chrome will appear an entry for the Unipoole Mobile app
7. Click on the "Inspect" blue text. You will now have a normal web inspector, where you can fix the content as being rendered, debug javascript, view styles sheets, view logging, and much more.
