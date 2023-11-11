# 🔍 Metadata

_[< Return to homepage](/docs/INDEX.md)_

The metadata tab shows AdvantageKit metadata from the real robot and replay (if applicable). This tab is nonfunctional when viewing log data not produced by AdvantageKit. The metadata keys are displayed to the left, and the columns separate data from the real robot and replay.

![Overview of metadata tab](/docs/resources/metadata/metadata-1.png)

To save metadata using AdvantageKit, call the method below before starting the logger.

```java
Logger.getInstance().recordMetadata(key, value);
```
