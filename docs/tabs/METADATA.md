# 🔍 Metadata

_[< Return to homepage](/docs/INDEX.md)_

The metadata tab shows values published to the hidden "/Metadata" table or through AdvantageKit. The metadata keys are displayed to the left, and the columns separate data from different sources (e.g. real and replay when using AdvantageKit).

![Overview of metadata tab](/docs/resources/metadata/metadata-1.png)

The example code below shows how to log metadata using WPILib. The values must be logged to the "/Metadata" table as strings.

```java
// NetworkTables (also saved to DataLog by default)
StringPublisher publisher = NetworkTableInstance.getDefault()
    .getStringTopic("/Metadata/MyKey").publish();
publisher.set("MyValue");

// DataLog (not published to NetworkTables)
StringLogEntry entry = new StringLogEntry(DataLogManager.getLog(), "/Metadata/MyKey");
entry.append("MyValue");
```

To save metadata using AdvantageKit, call the method below before starting the logger. Metadata is stored separately when running in real and replay for easy comparison.

```java
Logger.getInstance().recordMetadata("MyKey", "MyValue");
```
