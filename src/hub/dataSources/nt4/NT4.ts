import { serialize, deserialize } from "./msgpack";

const typestrIdxLookup: { [id: string]: number } = {
  boolean: 0,
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

export class NT4_Subscription {
  uid = -1;
  topics = new Set();
  options = new NT4_SubscriptionOptions();

  toSubscribeObj() {
    return {
      topics: Array.from(this.topics),
      subuid: this.uid,
      options: this.options.toObj()
    };
  }

  toUnSubscribeObj() {
    return {
      subuid: this.uid
    };
  }
}

export class NT4_SubscriptionOptions {
  periodic = 0.1;
  all = false;
  topicsOnly = false;
  prefix = false;

  toObj() {
    return {
      periodic: this.periodic,
      all: this.all,
      topicsonly: this.topicsOnly,
      prefix: this.prefix
    };
  }
}

export class NT4_Topic {
  uid = -1;
  pubuid = -1;
  name = "";
  type = "";
  properties = new NT4_TopicProperties();

  toPublishObj() {
    return {
      name: this.name,
      type: this.type,
      pubuid: this.pubuid,
      properties: this.properties.toUpdateObj()
    };
  }

  toUnpublishObj() {
    return {
      pubuid: this.pubuid
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
  isRetained = false;

  toUpdateObj() {
    return {
      persistent: this.isPersistent,
      retrained: this.isRetained
    };
  }
}

export class NT4_Client {
  private appName: string;
  private onTopicAnnounce: (topic: NT4_Topic) => void;
  private onTopicUnannounce: (topic: NT4_Topic) => void;
  private onNewTopicData: (topic: NT4_Topic, timestamp_us: number, value: unknown) => void;
  private onConnect: () => void;
  private onDisconnect: () => void;

  private serverBaseAddr;
  private ws: WebSocket | null = null;
  private clientIdx = 0;
  private useSecure = false;
  private serverAddr = "";
  private serverConnectionActive = false;
  private serverConnectionRequested = false;
  private serverTimeOffset_us = 0;

  private uidCounter = 0;
  private subscriptions: Map<number, NT4_Subscription> = new Map();
  private clientPublishedTopics: Map<number, NT4_Topic> = new Map();
  private serverTopics: Map<number, NT4_Topic> = new Map();

  /**
   * Creates a new NT4 client without connecting.
   * @param serverAddr Network address of NT4 server
   * @param appName Identifier for this client (does not need to be unique).
   * @param onTopicAnnounce Gets called when server announces enough topics to form a new signal
   * @param onTopicUnannounce Gets called when server unannounces any part of a signal
   * @param onNewTopicData Gets called when any new data is available
   * @param onConnect Gets called once client completes initial handshake with server
   * @param onDisconnect Gets called once client detects server has disconnected
   */
  constructor(
    serverAddr: string,
    appName: string,
    onTopicAnnounce: (topic: NT4_Topic) => void,
    onTopicUnannounce: (topic: NT4_Topic) => void,
    onNewTopicData: (topic: NT4_Topic, timestamp_us: number, value: unknown) => void,
    onConnect: () => void, //
    onDisconnect: () => void
  ) {
    this.serverBaseAddr = serverAddr;
    this.appName = appName;
    this.onTopicAnnounce = onTopicAnnounce;
    this.onTopicUnannounce = onTopicUnannounce;
    this.onNewTopicData = onNewTopicData;
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;

    setInterval(() => this.ws_sendTimestamp(), 5000);
  }

  //////////////////////////////////////////////////////////////
  // PUBLIC API

  /** Starts the connection. The client will reconnect automatically when disconnected. */
  connect() {
    if (!this.serverConnectionRequested) {
      this.serverConnectionRequested = true;
      this.ws_connect();
    }
  }

  /** Terminates the connection. */
  disconnect() {
    if (this.serverConnectionRequested) {
      this.serverConnectionRequested = false;
      if (this.serverConnectionActive && this.ws) {
        this.ws.close();
      }
    }
  }

  /**
   * Add a new subscription, reading data at the specified frequency.
   * @param topicPatterns A list of topics or prefixes to include in the subscription.
   * @param prefixMode If true, use patterns as prefixes. If false, only subscribe to topics that are an exact match.
   * @param period The period to return data in seconds.
   * @returns A subscription object.
   */
  subscribePeriodic(topicPatterns: string[], prefixMode: boolean, period: number) {
    let newSub = new NT4_Subscription();
    newSub.uid = this.getNewUID();
    newSub.topics = new Set(topicPatterns);
    newSub.options.prefix = prefixMode;
    newSub.options.periodic = period;

    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub;
  }

  /**
   * Add a new subscription, reading all value updates.
   * @param topicPatterns A list of topics or prefixes to include in the subscription.
   * @param prefixMode If true, use patterns as prefixes. If false, only subscribe to topics that are an exact match.
   * @returns A subscription object.
   */
  subscribeAll(topicPatterns: string[], prefixMode: boolean) {
    let newSub = new NT4_Subscription();
    newSub.uid = this.getNewUID();
    newSub.topics = new Set(topicPatterns);
    newSub.options.prefix = prefixMode;
    newSub.options.all = true;

    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub;
  }

  /**
   * Add a new subscription, reading only topic announcements (not values).
   * @param topicPatterns A list of topics or prefixes to include in the subscription.
   * @param prefixMode If true, use patterns as prefixes. If false, only subscribe to topics that are an exact match.
   * @returns A subscription object.
   */
  subscribeTopicsOnly(topicPatterns: string[], prefixMode: boolean): NT4_Subscription {
    let newSub = new NT4_Subscription();
    newSub.uid = this.getNewUID();
    newSub.topics = new Set(topicPatterns);
    newSub.options.prefix = prefixMode;
    newSub.options.topicsOnly = true;

    this.subscriptions.set(newSub.uid, newSub);
    if (this.serverConnectionActive) {
      this.ws_subscribe(newSub);
    }
    return newSub;
  }

  /** Given an existing subscription, unsubscribe from it. */
  unsubscribe(subscription: NT4_Subscription) {
    this.subscriptions.delete(subscription.uid);
    if (this.serverConnectionActive) {
      this.ws_unsubscribe(subscription);
    }
  }

  /** Unsubscribe from all current subscriptions. */
  clearAllSubscriptions() {
    for (const sub of this.subscriptions.values()) {
      this.unsubscribe(sub);
    }
  }

  /** Set the properties of a particular topic. */
  setProperties(topic: NT4_Topic, isPersistent: boolean, isRetained: boolean) {
    topic.properties.isPersistent = isPersistent;
    topic.properties.isRetained = isRetained;
    if (this.serverConnectionActive) {
      this.ws_setproperties(topic);
    }
  }

  /** Publish a new topic from this client with the provided name and type. Returns a topic object. */
  publishNewTopic(name: string, type: string): NT4_Topic {
    let newTopic = new NT4_Topic();
    newTopic.pubuid = this.getNewUID();
    newTopic.name = name;
    newTopic.type = type;

    this.clientPublishedTopics.set(newTopic.uid, newTopic);
    if (this.serverConnectionActive) {
      this.ws_publish(newTopic);
    }

    return newTopic;
  }

  /** Unpublish a previously-published topic from this client. */
  unpublishTopic(topic: NT4_Topic) {
    this.clientPublishedTopics.delete(topic.uid);
    if (this.serverConnectionActive) {
      this.ws_unpublish(topic);
    }
  }

  /** Send some new value to the server. The timestamp is whatever the current time is. */
  addSample(topic: NT4_Topic | string, value: any) {
    let timestamp = this.getServerTime_us();
    this.addTimestampedSample(topic, timestamp, value);
  }

  /** Send some new timestamped value to the server. */
  addTimestampedSample(topic: NT4_Topic | string, timestamp: number, value: any) {
    if (typeof topic === "string") {
      let topicFound = false;
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

    if (typeof topic !== "string") {
      if (topic.pubuid === -1) {
        throw 'Topic "' + topic.name + '" is not published by this client.';
      }
      let txData = serialize([topic.pubuid, timestamp, topic.getTypeIdx(), value]);
      this.ws_sendBinary(txData);
    }
  }

  //////////////////////////////////////////////////////////////
  // Server/Client Time Sync Handling

  /** Returns the current client time in microseconds. */
  getClientTime_us() {
    return new Date().getTime() * 1000;
  }

  /** Returns the current server time in microseconds. */
  getServerTime_us() {
    return this.getClientTime_us() + this.serverTimeOffset_us;
  }

  private ws_sendTimestamp() {
    let timeTopic = this.serverTopics.get(-1);
    if (timeTopic) {
      let timeToSend = this.getClientTime_us();
      let txData = serialize([-1, 0, typestrIdxLookup["int"], timeToSend]);
      this.ws_sendBinary(txData);
    }
  }

  private ws_handleReceiveTimestamp(serverTimestamp: number, clientTimestamp: number) {
    let rxTime = this.getClientTime_us();

    // Recalculate server/client offset based on round trip time
    let rtt = rxTime - clientTimestamp;
    let serverTimeAtRx = serverTimestamp + rtt / 2.0;
    this.serverTimeOffset_us = serverTimeAtRx - rxTime;

    console.log("[NT4] New server time estimate: " + (this.getServerTime_us() / 1000000.0).toString());
  }

  //////////////////////////////////////////////////////////////
  // Websocket Message Send Handlers

  private ws_subscribe(subscription: NT4_Subscription) {
    this.ws_sendJSON("subscribe", subscription.toSubscribeObj());
  }

  private ws_unsubscribe(subscription: NT4_Subscription) {
    this.ws_sendJSON("unsubscribe", subscription.toUnSubscribeObj());
  }

  private ws_publish(topic: NT4_Topic) {
    this.ws_sendJSON("publish", topic.toPublishObj());
  }

  private ws_unpublish(topic: NT4_Topic) {
    this.ws_sendJSON("unpublish", topic.toUnpublishObj());
  }

  private ws_setproperties(topic: NT4_Topic) {
    this.ws_sendJSON("setproperties", topic.toPropertiesObj());
  }

  private ws_sendJSON(method: string, params: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify([
          {
            method: method,
            params: params
          }
        ])
      );
    }
  }

  private ws_sendBinary(data: Uint8Array) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    }
  }

  //////////////////////////////////////////////////////////////
  // Websocket connection Maintenance

  private ws_onOpen() {
    // Set the flag allowing general server communication
    this.serverConnectionActive = true;

    // Sync timestamps
    this.ws_sendTimestamp();

    // Publish any existing topics
    for (const topic of this.clientPublishedTopics.values()) {
      this.ws_publish(topic);
      this.ws_setproperties(topic);
    }

    // Subscribe to existing subscriptions
    for (const subscription of this.subscriptions.values()) {
      this.ws_subscribe(subscription);
    }

    // User connection-opened hook
    this.onConnect();
  }

  private ws_onClose(event: CloseEvent) {
    // Clear flags to stop server communication
    this.ws = null;
    this.serverConnectionActive = false;

    // User connection-closed hook
    this.onDisconnect();

    // Clear out any local cache of server state
    this.serverTopics.clear();

    console.log("[NT4] Socket is closed: ", event.reason);
    if (this.serverConnectionRequested) {
      console.log("[NT4] Reconnect will be attempted in 0.5 second.");
      setTimeout(() => this.ws_connect(), 500);
    }

    if (!event.wasClean) {
      console.error("[NT4] Socket encountered error!");
      this.useSecure = !this.useSecure;
    }
  }

  private ws_onError() {
    if (this.ws) this.ws.close();
  }

  private ws_onMessage(event: MessageEvent) {
    if (typeof event.data === "string") {
      // JSON array
      let msgData = JSON.parse(event.data);
      if (!Array.isArray(msgData)) {
        console.log("[NT4] Ignoring text message, JSON parsing did not produce an array at the top level.");
        return;
      }

      msgData.forEach((msg) => {
        // Validate proper format of message
        if (typeof msg !== "object") {
          console.log("[NT4] Ignoring text message, JSON parsing did not produce an object.");
          return;
        }

        if (!("method" in msg) || !("params" in msg)) {
          console.log("[NT4] Ignoring text message, JSON parsing did not find all required fields.");
          return;
        }

        let method = msg["method"];
        let params = msg["params"];

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
          let newTopic = new NT4_Topic();
          newTopic.name = params.name;
          newTopic.uid = params.id;
          if ("pubuid" in params) {
            newTopic.pubuid = params.pubuid;
          }
          newTopic.type = params.type;
          newTopic.properties.isPersistent = params.properties.persistent;
          newTopic.properties.isRetained = params.properties.retained;
          this.serverTopics.set(newTopic.uid, newTopic);
          this.onTopicAnnounce(newTopic);
        } else if (method === "unannounce") {
          let removedTopic = this.serverTopics.get(params.id);
          if (!removedTopic) {
            console.log("[NT4] Ignoring unannounce, topic was not previously announced.");
            return;
          }
          this.serverTopics.delete(removedTopic.uid);
          this.onTopicUnannounce(removedTopic);
        } else {
          console.log("[NT4] Ignoring text message - unknown method " + method);
          return;
        }
      });
    } else {
      // MSGPack
      deserialize(event.data, { multiple: true }).forEach((unpackedData: number[]) => {
        let topicID = unpackedData[0];
        let timestamp_us = unpackedData[1];
        let typeIdx = unpackedData[2];
        let value = unpackedData[3];

        if (topicID >= 0) {
          let topic = this.serverTopics.get(topicID);
          if (topic) this.onNewTopicData(topic, timestamp_us, value);
        } else if (topicID === -1) {
          this.ws_handleReceiveTimestamp(timestamp_us, value);
        } else {
          console.log("[NT4] Ignoring binary data - invalid topic id " + topicID.toString());
        }
      });
    }
  }

  private ws_connect() {
    this.clientIdx = Math.floor(Math.random() * 99999999);

    let port = 5810;
    let prefix = "ws://";
    if (this.useSecure) {
      prefix = "wss://";
      port = 5811;
    }

    this.serverAddr =
      prefix + this.serverBaseAddr + ":" + port.toString() + "/nt/" + this.appName + "_" + this.clientIdx.toString();

    this.ws = new WebSocket(this.serverAddr, "networktables.first.wpi.edu");
    this.ws.binaryType = "arraybuffer";
    this.ws.addEventListener("open", () => this.ws_onOpen());
    this.ws.addEventListener("message", (event: MessageEvent) => this.ws_onMessage(event));
    this.ws.addEventListener("close", (event: CloseEvent) => this.ws_onClose(event));
    this.ws.addEventListener("error", () => this.ws_onError());

    console.log("[NT4] Connected with idx " + this.clientIdx.toString());
  }

  //////////////////////////////////////////////////////////////
  // General utilties

  private getNewUID() {
    this.uidCounter++;
    return this.uidCounter + this.clientIdx;
  }
}
