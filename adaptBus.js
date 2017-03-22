/* exported adaptBus */
/* globals fin */

// adapts the InterApplicationBus, adding the given applocation UUID to each send / subscribe
// and optionally filtering messages by window name
const adaptBus = (applicationUUID, windowName) => ({
  send: (eventName, message = {}) => {
    if (windowName) {
      message.windowName = windowName;
    }
    fin.desktop.InterApplicationBus.send(applicationUUID, eventName, message);
  },
  subscribe: (eventName, callback) =>
    fin.desktop.InterApplicationBus.subscribe(applicationUUID, eventName, (message) => {
      if (!windowName || (windowName && message.windowName === windowName)) {
        callback(message);
      }
    })
});
