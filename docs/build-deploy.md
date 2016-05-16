# Build and deploy
This section will explain how to build and deploy the application on a mobile device.
You can open the source code in Eclipse, by opening it as a normal eclipse project (NOT maven, and NOT an Android project)


## Android
+ Go to the root directory of your unipoole-mobile checkout

  ```bash
  cordova build android
  ```
+  This should complete without errors
* Now make sure your android device is connected with debugging enabled on the device.
* You can query connected devices by running the following command
  
  ```bash
  adb devices
  ```
   You should see your device in the list. If it is not there, you either don't have debugging enabled on your device, or the USB driver for your device needs to be installed
* To build and run the application on your device, run the following command
  
  ```bash
  cordova run android
  ```
  The application should start on your device in a while. If it complains about certificates you need to install the existing application on your device.

## iOS
* Go to the root directory of your unipoole-mobile checkout
  
  ```bash
  cordova build ios
  ```
  This should complete without errors
* Next open the xCode project in `platforms/ios` (if you've opened the project in xCode before, just open xCode and it should display in your list of recent projects)
* Click on the root of the project on the left navigation
* Select a device from the list in xCode (simulator or actual device)
* Hit the "play" button to build and run the application on your target
* If you have made code changes, you have to run `cordova build ios` again, and relaunch the application within xCode
