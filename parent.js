/* globals lorem adaptBus fin */

const { main, Window, Application } = fin.desktop;

const model =
  [1, 2, 3, 4, 5]
    .map((_, i) => ({
      id: `tab${i}`,
      title: `Tab #${i}`,
      content: lorem.ipsum('p5')
    }));

main(() => {
  var childIndex = 0;

  const application = Application.getCurrent();
  const window = Window.getCurrent();

  const {send, subscribe} = adaptBus(application.uuid);

  // if all the child windows close, then terminate the app
  const childWindowClosed = () => {
    application.getChildWindows(children => {
      if (children.length === 0) {
        window.close();
      }
    });
  };

  const createChildWindow = (config = {}) => {
    const childId = 'child' + childIndex++;
    const child = new Window({
      name: childId,
      url: 'child.html',
      autoShow: true,
      saveWindowState: false,
      defaultLeft: config.position ? config.position[0] : undefined,
      defaultTop: config.position ? config.position[1] : undefined,
      customData: Array.isArray(config.model) ? config.model : [config.model],
      frame: false
    }, () => {
      child.addEventListener('closed', childWindowClosed);
      child.focus();
    });
  };

  let droppedWindow = null;

  subscribe('dragdrop', (message) => {
    droppedWindow = message.windowName;
  });

  subscribe('dragend', (message) => {
    // if we do not know where the tab was dropped, it must be outside of the app
    // so create a ne window
    if (!droppedWindow) {
      send('removeTab', message);
      createChildWindow(message);
    } else {
      // if the tab was dropped on a different window to the source
      // remove the tab
      if (droppedWindow !== message.windowName) {
        send('removeTab', message);
      }
    }
    droppedWindow = null;
  });

  // create the first app window
  createChildWindow({model});
});
