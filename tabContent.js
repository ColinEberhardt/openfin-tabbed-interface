const createTab = (tabItem, active = false) =>
  $('<li>', {
    'role': 'presentation',
    'class': active ? 'active' : '',
    'data-target': '#' + tabItem.id,
    'html': $('<a>', {
        'role': 'tab',
        'data-toggle': 'tab',
        'draggable': true,
        'data-target': '#' + tabItem.id
      })
      .text(tabItem.title)
      .click(function (e) {
        e.preventDefault()
        $(this).tab('show')
      })
  })
  .data('model', tabItem);

const createTabContent = (tabItem, active = false) =>
  $('<div>', {
    'role': 'tabpanel',
    'id': tabItem.id,
    'class': 'tab-pane ' + (active? 'active' : '')
  }).html(tabItem.content);
