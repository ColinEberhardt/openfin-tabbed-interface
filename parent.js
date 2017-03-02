
// saves me a bit of typing ;-)
const { main, Window, Application, InterApplicationBus } = fin.desktop;


main(() => {

  var childIndex = 0;

  const application = Application.getCurrent();
  const window = Window.getCurrent();

  const childWindowClosed = () => {
    application.getChildWindows(children => {
      if (children.length === 0) {
        window.close();
      }
    });
  }

  const createChildWindow = (config) => {
    const child = new Window({
      name: "child" + childIndex++,
      url: "child.html",
      autoShow: true
    }, () => {
      if (config) {
        child.moveTo(config.position[0], config.position[1]);
      }
      child.addEventListener('closed', childWindowClosed);
    });
  }

  InterApplicationBus.subscribe(
      application.uuid,
      'createChildWindow',
      createChildWindow
  );

  createChildWindow();
});
