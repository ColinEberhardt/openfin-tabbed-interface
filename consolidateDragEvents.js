/* exported consolidateDragEvents */

// the dragleave event is fired for when the mouse moves over a child element, making it hard
// to track enter / leave on the parent. The following function counts the number of enter /
// leave events in order to only fire enter / leave once on the parent.
const consolidateDragEvents = (selector) => {
  let counter = 0;
  $(selector)
    .on('dragleave', ({currentTarget}) => {
      counter--;
      if (counter === 0) {
        $(currentTarget).trigger('consolidatedDragLeave');
      }
    })
    .on('dragenter', ({currentTarget}) => {
      counter++;
      if (counter === 1) {
        $(currentTarget).trigger('consolidatedDragEnter');
      }
    })
    .on('drop dragstart', () => {
      counter = 0;
    });
};
