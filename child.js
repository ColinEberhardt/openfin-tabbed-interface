const { main, Window, Application, InterApplicationBus } = fin.desktop;


main(() => {
  const application = Application.getCurrent();
  const window = Window.getCurrent();

  window.getOptions(({customData}) => {
    renderModel(customData);
  });

  // wrap the inter app message bus send, adding window name to all messages
  const busSend = (eventName, message = {}) => {
    message.windowName = window.name;
    InterApplicationBus.send(application.uuid, eventName, message);
  };

  // wrap the inter app message bus subscribe, filtering only messages for this window
  const busSubscribe = (eventName, callback) =>
    InterApplicationBus.subscribe(application.uuid, eventName, (message) => {
      if (message.windowName === window.name) {
        callback(message);
      }
    });

  busSubscribe('removeTab', (message) => {
      // remove from this model
      $(`.nav-tabs li[data-target='#${message.model.id}']`).remove();
      $(`.tab-content div[id='${message.model.id}']`).remove();

      // if we have no tabs left, close this window
      if ($('.nav-tabs li').length === 0) {
        window.close();
      }
    }
  );

  const dragStart = ({currentTarget, originalEvent}) => {
    $(currentTarget).addClass('dragged');

    originalEvent.dataTransfer.effectAllowed = 'move'
    originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
      model: $(currentTarget).data('model'),
      windowName: window.name
    }));
  }

  const drop = ({currentTarget, originalEvent}) => {
    const dropData = JSON.parse(originalEvent.dataTransfer.getData('text/plain'));

    // this is a local drop, so re-order tabs
    if (dropData.windowName === window.name) {

      const dropElement = $(currentTarget).attr('data-target')
          ? $(currentTarget)
          : $('.nav-tabs li').last();

      const dragElement = $(`.nav-tabs li[data-target='#${dropData.model.id}']`);

      if (dragElement.index() < dropElement.index()) {
        dropElement.after(dragElement);
      } else {
        dragElement.before(dropElement);
      }
    } else {
      // this is a drop from another window

      // TODO: Drop in the right location
      const modelObject = dropData.model;
      createTab(modelObject).appendTo($('.nav-tabs'));
      createTabContent(modelObject).appendTo($('.tab-content'));
    }

    $('.panel-heading ul, .panel-heading a').removeClass('drag-over');

    // this is necessary to disable the browsers defualt behaviour for
    // drag / drop of this specific element type
    return false;
  }

  const dragEnd = (e) => {
    $(e.currentTarget).removeClass('dragged');
    const dragModel = $(e.currentTarget).data('model');

    busSend('dragEnd', {
      windowName: window.name,
      position: [e.screenX, e.screenY],
      model: dragModel
    });

    // remove any highlights (drag-leave is not fired on the final drop target)
    $('.panel-heading ul, .panel-heading a').removeClass('drag-over');
  }


  $('.panel-heading')
    .on('dragstart', 'li', dragStart)
    .on('dragend', 'li', dragEnd)
    .on('drop', 'li, ul', drop)
    .on('dragleave', 'li, ul', ({target}) => $(target).removeClass('drag-over'))
    .on('dragenter', 'li, ul', ({target}) => $(target).addClass('drag-over'))
    .on('dragover', 'li, ul', () => false);

  // when drag enter / leave fires on the outer container, send this data to
  // the parent so that it can track where the dragged element finally ends up
  consolidateDragEvents('.panel-heading ul');
  $('.panel-heading ul')
    .on('consolidatedDragEnter', () => busSend('dragEnter'))
    .on('consolidatedDragLeave', () => busSend('dragLeave'));

  $('.close-button').on('click', () => window.close());

  const renderModel = (model) => {
    model.forEach(function(tabItem, index) {
      createTab(tabItem, index === 0).appendTo($('.nav-tabs'));
      createTabContent(tabItem, index === 0).appendTo($('.tab-content'));
    });
  }
});
