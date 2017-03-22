// adapts the InterApplicationBus, adding the given applocation UUID to each send / subscribe
// and optionally filtering messages by window name
const adaptBus = (applicationUUID, windowName) => ({
  send: (eventName, message = {}) => {
    if (windowName) {
      message.windowName = windowName;
    }
    InterApplicationBus.send(applicationUUID, eventName, message);
  },
  subscribe: (eventName, callback) =>
    InterApplicationBus.subscribe(applicationUUID, eventName, (message) => {
      if (!windowName || (windowName && message.windowName === windowName)) {
        callback(message);
      }
    })
});
