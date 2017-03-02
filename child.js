var model = {
  tabs: [
    { id: 'message', title: 'Messages', content: 'foo bar '},
    { id: 'profile', title: 'Profile', content: 'foo bar 2'},
    { id: 'settings', title: 'Settings', content: 'foo bar 3'}
  ],
  selectedTabIndex: 1
}

function renderModel() {

  var tabs = $('.nav-tabs');
  var tabContent = $('.tab-content');
  tabs.empty();
  tabContent.empty();
  model.tabs.forEach(function(tabItem, index) {
    $('<li>', {
      'role': 'presentation',
      'class': index === model.selectedTabIndex ? 'active' : '',
      'html': $('<a>', {
        'role': 'tab',
        'data-toggle': 'tab',
        'draggable': true,
        'data-target': '#' + tabItem.id
      }).text(tabItem.title)
    }).appendTo(tabs);
    $('<div>', {
      'role': 'tabpanel',
      'id': tabItem.id,
      'class': 'tab-pane ' + (index === model.selectedTabIndex ? 'active' : '')
    }).text(tabItem.content).appendTo(tabContent);
  });
}

renderModel();

$('.tabs a').click(function (e) {
  e.preventDefault()
  $(this).tab('show')
})

var dragSrcEl = null;

function handleDragStart(e) {
  this.style.opacity = '0.4';  // this / e.target is the source node.

  dragSrcEl = this;

  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text', 'fishy');
}

function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault(); // Necessary. Allows us to drop.
  }

  e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

  return false;
}

function handleDragEnter(e) {
  this.classList.add('over');
}

function handleDragLeave(e) {
  this.classList.remove('over');
}

function handleDrop(e) {
  // this / e.target is current target element.
  if (e.stopPropagation) {
    e.stopPropagation(); // stops the browser from redirecting.
  }

  // Don't do anything if dropping the same column we're dragging.
  if (dragSrcEl != this) {
    console.log(e.dataTransfer.getData('text'));
  }

  return false;
}

function greet() {
  return "I am a child!";
}

function handleDragEnd(e) {
  // this/e.target is the source node.
  this.style.opacity = '1.0';

  console.log(e.screenX, e.screenY);

  [].forEach.call(cols, function (col) {
    col.classList.remove('over');
  });

  fin.desktop.InterApplicationBus.send(
      fin.desktop.Application.getCurrent().uuid,
      'createChildWindow',
      { position: [e.screenX, e.screenY] }
  );
}

var cols = document.querySelectorAll('.tabs li');
[].forEach.call(cols, function(col) {
  col.addEventListener('dragstart', handleDragStart, false);
  col.addEventListener('dragenter', handleDragEnter, false)
  col.addEventListener('dragover', handleDragOver, false);
  col.addEventListener('dragleave', handleDragLeave, false);
  col.addEventListener('drop', handleDrop, false);
  col.addEventListener('dragend', handleDragEnd, false);
});

fin.desktop.main(function() {
  console.log('desktop initialised');
});
