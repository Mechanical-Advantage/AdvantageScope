Improvements to live logging:
* Added timeouts on the input stream. After three seconds without new data, the connection is closed and restarted.
* Added support for heartbeats on the output stream. This is required for robot projects based on Advantage Kit v1.4.0 or later.
* Improved the handling of timestamp syncronization. This means that the stream of live data should appear smoother (especially on unreliable connections).