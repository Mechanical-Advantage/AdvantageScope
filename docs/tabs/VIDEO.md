# 🎬 Video

_[< Return to homepage](/docs/INDEX.md)_

The video tab allows for the log data to be compared side-by-side with a match video that was separately recorded. The steps below show how to load a video and synchronize it with the log.

## Step 1: Load the Video

To load a video, select the box labeled "\<Click Here\>" under "Source". Most common video formats are supported. After choosing a file, the timeline on the bottom right begins turning blue to indicate the frames that have been cached (this step is necessary for smooth playback).

> Note: This feature is intended for match-length videos. Due to the frame conversion required, loading a much longer video may have a negative impact on performance.

![Loading a video](/docs/resources/video/video-1.gif)

## Step 2: Navigate the Video

When a video is initially loaded and has not yet been synchronized with the log data, the playback controls for the video and log are still independent. Use the timeline and buttons on the bottom right to control the video playback. The following keyboard shortcuts are also supported:

- **/** = toggle playback
- **→** = move forward one frame
- **←** = move backward one frame
- **>** = skip forward five seconds
- **<** = skip backward five seconds

Use these controls to navigate to a known location in the match, typically the start of auto or teleop.

![Navigating a video](/docs/resources/video/video-2.gif)

## Step 3: Synchronize With the Log

Select the time in the log file that aligns with the current frame of the video. The timeline at the top of the video tab is often sufficient for quick alignment, but we recommend using another tab like the table or line graph to select a timestamp more precisely (as shown below).

Once the video and log are aligned, click the lock icon next to the video timeline (or press **cmd/ctrl + ↑ or ↓**). The video controls are now disabled. Click the lock icon again to unlock the video playback.

![Synchronizing with a log](/docs/resources/video/video-3.gif)

## Step 4: Playback

Once locked, the video playback stays aligned with the selected time in the log. To view the video alongside other tabs, click the "Add Window" icon just below the navigation/playback controls. For example, the video can be compared to the robot's odometry data as seen below.

> Note: Sound playback is not supported. The original video is converted to a frame-by-frame representation to support log synchronization.

![Video playback with odometry](/docs/resources/video/video-4.gif)
