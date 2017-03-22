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

  // if all the child windows close, the terminate the app
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

  var dragOver = {};

  // track drag enter / drag leave so that we know where the drop occured
  subscribe('dragEnter', (message) => {
    dragOver[message.windowName] = true;
  });

  subscribe('dragLeave', (message) => {
    delete dragOver[message.windowName];
  });

  subscribe('dragEnd', (message) => {
    // if the end drag location isn't over any of our windows, create a new one
    if (Object.keys(dragOver).length === 0) {
      send('removeTab', message);
      createChildWindow(message);
    } else {
      // if the end is not the source, remove from the old
      const endWindow = Object.keys(dragOver)[0];
      if (endWindow !== message.windowName) {
        send('removeTab', message);
      }
    }
    dragOver = {};
  });

  // create the first app window
  createChildWindow({model});
});
