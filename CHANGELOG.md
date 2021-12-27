Bug fixes for live logging:
* Added support for new protocol to improve reliability on some connections. Note that *only log servers based on Advantage Kit v0.0.5 or newer are supported*.
* The timestamp is syncronized on every cycle rather than just the intial connection. This guarantees syncronization between the latest timestamp when locked and the timestamp of the data being received.