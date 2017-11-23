define([
  'dojo/_base/declare',
  'dojo/dom-construct',
  'dojo/on',
  'dijit/focus',
  'dijit/form/NumberSpinner',
  'dijit/form/Button',
  'JBrowse/View/Dialog/WithActionBar'
],
function(
  declare,
  dom,
  on,
  focus,
  NumberSpinner,
  Button,
  ActionBarDialog
) {
  return declare(ActionBarDialog, {
    title: 'Set min reference fraction',

    constructor: function(args) {
      this.minRefFrac = args.minRefFrac || 0.00;
      this.browser     = args.browser;
      this.setCallback   = args.setCallback || function() {};
      this.cancelCallback  = args.cancelCallback || function() {};
    },

    _fillActionBar: function(actionBar) {
      new Button({
        label: 'OK',
        onClick: dojo.hitch(this, function() {
          var height = +this.minScoreSpinner.getValue();
          if (isNaN(height)) {
            return;
          }
          this.setCallback && this.setCallback(height);
          this.hide();
        })
      }).placeAt(actionBar);

      new Button({
        label: 'Cancel',
        onClick: dojo.hitch(this, function() {
          this.cancelCallback && this.cancelCallback();
          this.hide();
        })
      }).placeAt(actionBar);
    },

    show: function(/* callback */) {
      dojo.addClass(this.domNode, 'minRefFracDialog');

      this.minScoreSpinner = new NumberSpinner({
        value: this.minRefFrac,
        smallDelta: 0.01,
        constraints: {min:0, max:1}
      });

      this.set('content', [
        dom.create('label', { 'for': 'read_depth', innerHTML: '' }),
        this.minScoreSpinner.domNode,
        dom.create('span', { innerHTML: ' min ref frac' })
      ]);

      this.inherited(arguments);
    },

    hide: function() {
      this.inherited(arguments);
      window.setTimeout(dojo.hitch(this, 'destroyRecursive'), 500);
    }
  });
});
