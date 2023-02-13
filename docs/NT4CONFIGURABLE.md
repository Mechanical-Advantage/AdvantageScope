# NT4 Configurable Subscriptions

Configurable subscribers using an imported json file.

## JSON Setup

The string at the beginning is either the full string of the network table value you want or the start of it if you have prefix mode set to true.

The first boolean is for prefix mode in which case you only have to include the base of your string example being "/FMSInfo/" should pass all FMSInfo.

The second boolean is for sendAll if set to true it will send every value the network table has stored for it, when set to false it only sends the most recent value.

Update Rate, the update rate is measured in seconds and determines how often data is updated, setting this to a larger value will result in slower updates but also less data use & when handling hundreds of values it will help to alleviate slow downs and latency spikes.

```json
"version":2.2.1,
"keys":[
  ["/DataString/Substring",bool,bool,Update Rate],
  ["/FMSInfo/FMSControlData", false, false, 2],
  ["/FMSInfo/IsRedAlliance", false, false, 0.1],
  ["/SmartDashboard/vision-main/EstTargetPoses3d", false, false, 0.02],
  ["/SmartDashboard/vision-main/RobotPose3d", false, false, 0.02]
]
```

## Importing

Click "File" > "Import NT4 Config..." & then select your config json

## Setting your Network Tables to configurable

Click "Help" > "Show Preferences..." > "Live Mode" & select "NetworkTables 4 (Configurable)" & then click the check mark.
