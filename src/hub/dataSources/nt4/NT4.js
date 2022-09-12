import { serialize, deserialize } from "./msgpack";

var typestrIdxLookup = {
  NT4_TYPESTR: 0,
  double: 1,
  int: 2,
  float: 3,
  string: 4,
  json: 4,
  raw: 5,
  rpc: 5,
  msgpack: 5,
  protobuf: 5,
  "boolean[]": 16,
  "double[]": 17,
  "int[]": 18,
  "float[]": 19,
  "string[]": 20
};

class NT4_TYPESTR {
  static BOOL = "boolean";
  static FLOAT_64 = "double";
  static INT = "int";
  static FLOAT_32 = "float";
  static STR = "string";
  static JSON = "json";
  static BIN_RAW = "raw";
  static BIN_RPC = "rpc";
  static BIN_MSGPACK = "msgpack";
  static BIN_PROTOBUF = "protobuf";
  static BOOL_ARR = "boolean[]";
  static FLOAT_64_ARR = "double[]";
  static INT_ARR = "int[]";
  static FLOAT_32_ARR = "float[]";
  static STR_ARR = "string[]";
}

export class NT4_ValReq {
  prefixes = new Set();

  toGetValsObj() {
    return {
      prefixes: Array.from(this.prefixes)
    };
  }
}

export class NT4_Subscription {
  prefixes = new Set();
  options = new NT4_SubscriptionOptions();
  uid = -1;

  toSubscribeObj() {
    return {
      prefixes: Array.from(this.prefixes),
      options: this.options.toObj(),
      subuid: this.uid
    };
  }

  toUnSubscribeObj() {
    return {
      subuid: this.uid
    };
  }
}

export class NT4_SubscriptionOptions {
  immediate = false;
  logging = false;
  periodicRate_s = 0.1;

  toObj() {
    return {
      immediate: this.immediate,
      periodic: this.periodicRate_s,
      logging: this.logging
    };
  }
}

export class NT4_Topic {
  name = "";
  type = "";
  id = 0;
  properties = new NT4_TopicProperties();

  toPublishObj() {
    return {
      name: this.name,
      type: this.type
    };
  }

  toUnPublishObj() {
    return {
      name: this.name
    };
  }

  toPropertiesObj() {
    return {
      name: this.name,
      update: this.properties.toUpdateObj()
    };
  }

  getTypeIdx() {
    return typestrIdxLookup[this.type];
  }
}

export class NT4_TopicProperties {
  isPersistent = false;

  toUpdateObj() {
    return {
      persistent: this.isPersistent
    };
  }
}

export class NT4_Client {
  constructor(
    serverAddr,
    onTopicAnnounce_in, // Gets called when server announces enough topics to form a new signal
    onTopicUnAnnounce_in, // Gets called when server unannounces any part of a signal
    onNewTopicData_in, // Gets called when any new data is available
    onConnect_in, // Gets called once client completes initial handshake with server
    onDisconnect_in
  ) {
    // Gets called once client detects server has disconnected

    this.onTopicAnnounce = onTopicAnnounce_in;
    this.onTopicUnAnnounce = onTopicUnAnnounce_in;
    this.onNewTopicData = onNewTopicData_in;
    this.onConnect = onConnect_in;
    this.onDisconnect = onDisconnect_in;

    this.subscriptions = new Map();
    this.subscription_uid_counter = 0;

    this.clientPublishedTopics = new Map();
    this.serverTopics = new Map();

    this.timeSyncBgEvent = setInterval(this.ws_sendTimestamp.bind(this), 5000);

    // WS Connection State (with defaults)
    this.serverBaseAddr = serverAddr;
    this.clientIdx = 0;
    this.useSecure = false;
    this.serverAddr = "";
    this.serverConnectionActive = false;
    this.serverConnectionRequested = false;
    this.serverTimeOffset_us = 0;
  }

  //////////////////////////////////////////////////////////////
  // PUBLIC API

  // Starts the connection
  connect() {
    if (!this.serverConnectionRequested) {
      this.serverConnectionRequested = true;
      this.ws_connect();
    }
  }

  // Terminates the connection
  disconnect() {
    if (this.serverConnectionRequested) {
      this.serverConnectionRequested = false;
      if (this.serverConnectionActive) {
        this.ws.close();
      }
    }
  }

  // Add a new subscription. Returns a subscription object
  subscribeImmediate(topicPatterns) {
    var newSub = new NT4_Subscription();
    newSub.uid = this.getNewSubUID();
    newSub.options.immediate = true;
    newSub.options.periodicRate_s = 0;
    newSub.prefixes = new Set(topicPatterns);
    newSub.options.logging = false;

    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub;
  }

  // Add a new subscription. Returns a subscription object
  subscribePeriodic(topicPatterns, period) {
    var newSub = new NT4_Subscription();
    newSub.uid = this.getNewSubUID();
    newSub.options.immediate = false;
    newSub.options.periodicRate_s = period;
    newSub.prefixes = new Set(topicPatterns);
    newSub.options.logging = false;

    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub;
  }

  // Add a new subscription. Returns a subscription object
  subscribeLogging(topicPatterns) {
    var newSub = new NT4_Subscription();
    newSub.uid = this.getNewSubUID();
    newSub.options.immediate = false;
    newSub.prefixes = new Set(topicPatterns);
    newSub.options.logging = true;

    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub;
  }

  // Requests latest value of a set of topics
  getValues(topicPatterns) {
    var newValReq = new NT4_ValReq();
    newValReq.prefixes = new Set(topicPatterns);
    if (this.serverConnectionActive) {
      this.ws_getvalues(newValReq);
    }
  }

  // Given an existing subscription, unsubscribe from it.
  unSubscribe(sub) {
    this.subscriptions.delete(sub.uid);
    if (this.serverConnectionActive) {
      this.ws_unsubscribe(sub);
    }
  }

  // Unsubscribe from all current subscriptions
  clearAllSubscriptions() {
    for (const sub of this.subscriptions.values()) {
      this.unSubscribe(sub);
    }
  }

  // Set the properties of a particular topic
  setProperties(topic, isPersistent) {
    topic.properties.isPersistent = isPersistent;
    if (this.serverConnectionActive) {
      this.ws_setproperties(topic);
    }
  }

  // Publish a new topic from this client with the provided name and type
  publishNewTopic(name, type) {
    var newTopic = new NT4_Topic();
    newTopic.name = name;
    newTopic.type = type;

    this.clientPublishedTopics.set(newTopic.name, newTopic);
    if (this.serverConnectionActive) {
      this.ws_publish(newTopic);
    }

    return newTopic;
  }

  // UnPublish a previously-published topic from this client.
  unPublishTopic(oldTopic) {
    this.clientPublishedTopics.delete(oldTopic.name);
    if (this.serverConnectionActive) {
      this.ws_unpublish(oldTopic);
    }
  }

  // Send some new value to the server
  // Timestamp is whatever the current time is.
  addSample(topic, value) {
    var timestamp = this.getServerTime_us();
    this.addSample(topic, timestamp, value);
  }

  // Send some new timestamped value to the server
  addSample(topic, timestamp, value) {
    if (typeof topic === "string") {
      var topicFound = false;
      // Slow-lookup - strings are assumed to be topic names for things the server has already announced.
      for (const topicIter of this.serverTopics.values()) {
        if (topicIter.name === topic) {
          topic = topicIter;
          topicFound = true;
          break;
        }
      }
      if (!topicFound) {
        throw "Topic " + topic + " not found in announced server topics!";
      }
    }

    var txData = serialize([topic.id, timestamp, topic.getTypeIdx(), value]);

    this.ws_sendBinary(txData);
  }

  //////////////////////////////////////////////////////////////
  // Server/Client Time Sync Handling

  getClientTime_us() {
    return new Date().getTime() * 1000;
  }

  getServerTime_us() {
    return this.getClientTime_us() + this.serverTimeOffset_us;
  }

  ws_sendTimestamp() {
    var timeTopic = this.serverTopics.get(-1);
    if (timeTopic) {
      var timeToSend = this.getClientTime_us();
      this.addSample(timeTopic, 0, timeToSend);
      console.log("[NT4] Sending time " + timeToSend / 1000000.0);
      console.log("[NT4] ========================================");
    }
  }

  ws_handleReceiveTimestamp(serverTimestamp, clientTimestamp) {
    var rxTime = this.getClientTime_us();

    console.log("[NT4] Got Response from time " + clientTimestamp / 1000000.0);
    console.log("[NT4] serverTime = " + serverTimestamp / 1000000.0);

    // Recalculate server/client offset based on round trip time
    var rtt = rxTime - clientTimestamp;
    var serverTimeAtRx = serverTimestamp - rtt / 2.0;
    this.serverTimeOffset_us = serverTimeAtRx - rxTime;

    console.log("[NT4] New server time estimate: " + (this.getServerTime_us() / 1000000.0).toString());
  }

  //////////////////////////////////////////////////////////////
  // Websocket Message Send Handlers

  ws_subscribe(sub) {
    this.ws_sendJSON("subscribe", sub.toSubscribeObj());
  }

  ws_getvalues(gv) {
    this.ws_sendJSON("getvalues", gv.toGetValsObj());
  }

  ws_unsubscribe(sub) {
    this.ws_sendJSON("unsubscribe", sub.toUnSubscribeObj());
  }

  ws_publish(topic) {
    this.ws_sendJSON("publish", topic.toPublishObj());
  }

  ws_unpublish(topic) {
    this.ws_sendJSON("unpublish", topic.toUnPublishObj());
  }

  ws_setproperties(topic) {
    this.ws_sendJSON("setproperties", topic.toPropertiesObj());
  }

  ws_sendJSON(method, params) {
    if (this.ws.readyState === WebSocket.OPEN) {
      var txObj = [
        {
          method: method,
          params: params
        }
      ];
      var txJSON = JSON.stringify(txObj);
      this.ws.send(txJSON);
    }
  }

  ws_sendBinary(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  //////////////////////////////////////////////////////////////
  // Websocket connection Maintenance

  ws_onOpen() {
    // Trying to subscribe immediately after the server starts appears to be broken, so add a short delay.
    setTimeout(() => {
      // Set the flag allowing general server communication
      this.serverConnectionActive = true;

      // Sync timestamps
      var timeTopic = new NT4_Topic();
      timeTopic.name = "Time";
      timeTopic.id = -1;
      timeTopic.type = NT4_TYPESTR.INT;
      this.serverTopics.set(timeTopic.id, timeTopic);
      this.ws_sendTimestamp();

      // Publish any existing topics
      for (const topic of this.clientPublishedTopics.values()) {
        this.ws_publish(topic);
        this.ws_setproperties(topic);
      }

      // Subscribe to existing subscriptions
      for (const sub of this.subscriptions.values()) {
        this.ws_subscribe(sub);
      }

      // User connection-opened hook
      this.onConnect();
    }, 100);
  }

  ws_onClose(e) {
    // Clear flags to stop server communication
    this.ws = null;
    this.serverConnectionActive = false;

    // User connection-closed hook
    this.onDisconnect();

    // Clear out any local cache of server state
    this.serverTopics.clear();

    console.log("[NT4] Socket is closed.", e.reason);
    if (this.serverConnectionRequested) {
      console.log("[NT4] Reconnect will be attempted in 0.5 second.");
      setTimeout(this.ws_connect.bind(this), 500);
    }

    if (!e.wasClean) {
      console.error("[NT4] Socket encountered error!");
      // TODO - based on error, handle the expected ones (secure failure, 409 conflict, etc.) by updating internal state before the next reconnect.
      this.useSecure = !this.useSecure;
    }
  }

  ws_onError(e) {
    this.ws.close();
  }

  ws_onMessage(e) {
    if (typeof e.data === "string") {
      // JSON array
      JSON.parse(e.data).forEach((msg) => {
        // Validate proper format of message
        if (typeof msg !== "object") {
          console.log("[NT4] Ignoring text message, JSON parsing did not produce an object.");
          return;
        }

        if (!("method" in msg) || !("params" in msg)) {
          console.log("[NT4] Ignoring text message, JSON parsing did not find all required fields.");
          return;
        }

        var method = msg["method"];
        var params = msg["params"];

        if (typeof method !== "string") {
          console.log('[NT4] Ignoring text message, JSON parsing found "method", but it wasn\'t a string.');
          return;
        }

        if (typeof params !== "object") {
          console.log('[NT4] Ignoring text message, JSON parsing found "params", but it wasn\'t an object.');
          return;
        }

        // Message validates reasonably, switch based on supported methods
        if (method === "announce") {
          var newTopic = new NT4_Topic();
          newTopic.name = params.name;
          newTopic.id = params.id;
          newTopic.type = params.type;
          newTopic.properties.isPersistent = params.properties.persistent;
          this.serverTopics.set(newTopic.id, newTopic);
          this.onTopicAnnounce(newTopic);
        } else if (method === "unannounce") {
          var removedTopic = this.serverTopics.get(params.id);
          if (!removedTopic) {
            console.log("[NT4] Ignorining unannounce, topic was not previously announced.");
            return;
          }
          this.serverTopics.delete(removedTopic.id);
          this.onTopicUnAnnounce(removedTopic);
        } else {
          console.log("[NT4] Ignoring text message - unknown method " + method);
          return;
        }
      });
    } else {
      // MSGPack
      deserialize(e.data, { multiple: true }).forEach((unpackedData) => {
        var topicID = unpackedData[0];
        var timestamp_us = unpackedData[1];
        var typeIdx = unpackedData[2];
        var value = unpackedData[3];

        if (topicID >= 0) {
          var topic = this.serverTopics.get(topicID);
          this.onNewTopicData(topic, timestamp_us, value);
        } else if (topicID === -1) {
          this.ws_handleReceiveTimestamp(timestamp_us, value);
        } else {
          console.log("[NT4] Ignoring binary data - invalid topic id " + topicID.toString());
        }
      });
    }
  }

  ws_connect() {
    this.clientIdx = Math.floor(Math.random() * 99999999); // Not great, but using it for now

    var port = 5810; // fallback - unsecured
    var prefix = "ws://";
    if (this.useSecure) {
      prefix = "wss://"; // Use secure if requested.
      port = 5811;
    }

    this.serverAddr =
      prefix + this.serverBaseAddr + ":" + port.toString() + "/nt/" + "AdvantageScope_" + this.clientIdx.toString();

    this.ws = new WebSocket(this.serverAddr, "networktables.first.wpi.edu");
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = this.ws_onOpen.bind(this);
    this.ws.onmessage = this.ws_onMessage.bind(this);
    this.ws.onclose = this.ws_onClose.bind(this);
    this.ws.onerror = this.ws_onError.bind(this);

    console.log("[NT4] Connected with idx " + this.clientIdx.toString());
  }

  //////////////////////////////////////////////////////////////
  // General utilties

  getNewSubUID() {
    this.subscription_uid_counter++;
    return this.subscription_uid_counter + this.clientIdx;
  }
}
