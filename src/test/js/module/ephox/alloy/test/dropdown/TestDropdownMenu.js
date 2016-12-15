define(
  'ephox.alloy.test.dropdown.TestDropdownMenu',

  [
    'ephox.alloy.api.behaviour.Representing'
  ],

  function (Representing) {
    return function (store) {
      return {
        members: {
          menu: {
            munge: function (menuSpec) {
              return {
                dom: {
                  tag: 'container',
                  classes: [ 'menu' ]
                },
                components: [
                  { uiType: 'placeholder', name: '<alloy.menu.items>', owner: 'menu' }
                ]
              };
            }
          },
          item: {
            munge: function (itemSpec) {
              return {
                dom: {
                  tag: 'li',
                  classes: [ 'item' ],
                  innerHtml: itemSpec.data.text
                },
                components: [ ]
              };
            }
          }
        },
        markers: {
          item: 'item',
          selectedItem: 'selected-item',
          menu: 'menu',
          selectedMenu: 'selected-menu',
          'backgroundMenu': 'background-menu'
        },
        onExecute: function (dropdown, item) {
          var v = Representing.getValue(item);
          return store.adderH('dropdown.menu.execute: ' + v.value)();
        }
      };
    };
  }
);