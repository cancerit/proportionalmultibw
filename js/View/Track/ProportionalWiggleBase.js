define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/_base/event',
  'dojo/dom-construct',
  'dojo/on',
  'dojo/mouse',
  'JBrowse/View/Track/WiggleBase',
  'ProportionalMultiBw/View/Dialog/MaxRefFracDialog',
  'ProportionalMultiBw/View/Dialog/MinRefFracDialog'
],
function(
  declare,
  array,
  lang,
  domEvent,
  dom,
  on,
  mouse,
  WiggleBase,
  MaxRefFracDialog,
  MinRefFracDialog
) {
  return declare(WiggleBase, {

    constructor: function(args) {
      this.labels = args.config.urlTemplates;
      if(args.config.hasOwnProperty('counts')) {
        this.labels.push(args.config.counts);
      }
    },

    fillBlock: function(args) {
      var thisB = this;
      this.heightUpdate(this._canvasHeight(), args.blockIndex);

      // hook updateGraphs onto the end of the block feature fetch
      var oldFinish = args.finishCallback || function() {};
      args.finishCallback = function() {
        thisB.updateGraphs(args, oldFinish);
      };

      // get the features for this block, and then set in motion the
      // updating of the graphs
      this._getBlockFeatures(args);
    },

    _calculatePixelScores: function(canvasWidth, features, featureRects) {

      var nameMap = {};
      for (var k = 0; k < this.labels.length; k++) {
        nameMap[this.labels[k].name] = k;
      }
      var pxPerBp = this.browser.view.pxPerBp;
      var pixelValues = new Array(canvasWidth);
      array.forEach(features, function(f, i) {
        if(pxPerBp < 1 && f.get('source') !== 'counts') return;
        var k = nameMap[f.get('source')];
        var fRect = featureRects[i];
        var jEnd = fRect.r;
        var score = f.get('score');
        for (var j = Math.round(fRect.l); j < jEnd; j++) {
          if (!pixelValues[j]) {
            pixelValues[j] = new Array(this.labels.length);
          }
          if (!pixelValues[j][k]) {
            pixelValues[j][k] = { score: score, feat: f };
          }
        }
      }, this);

      return pixelValues;
    },
    _trackMenuOptions: function() {
      var options = this.inherited(arguments);
      var track = this;
      options.push({
        label: 'Set min reference fraction',
        onClick: function() {
          new MinRefFracDialog({
            setCallback: function(filterInt) {
              track.config.minRefFrac = filterInt;
              track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
            },
            minRefFrac: track.config.minRefFrac || 0.0
          }).show();
        }
      });
      options.push({
        label: 'Set max reference fraction',
        onClick: function() {
          new MaxRefFracDialog({
            setCallback: function(filterInt) {
              track.config.maxRefFrac = filterInt;
              track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
            },
            maxRefFrac: track.config.maxRefFrac || 0.9
          }).show();
        }
      });

      return options;
    },
    _trackDetailsContent: function() {
      var ret = '';
      if (this.config.colorizeAbout) {
        array.forEach(this.labels, function(elt) {
          ret += '<div style="display: block; clear:both;"><div class="colorsquare" style="background: ' + elt.color + '"></div>' + elt.name;
        }, this);
      } else {
        ret = this.inherited(arguments);
      }
      return ret;
    },
    mouseover: function(bpX, evt) {
      if(bpX === undefined) {
        var thisB = this;
        thisB.scoreDisplay.flag.style.display = 'none';
        thisB.scoreDisplay.pole.style.display = 'none';
      }
      else {
        var block;
        array.some(this.blocks, function(b) {
          if(b && b.startBase <= bpX && b.endBase >= bpX) {
            block = b;
            return true;
          }
          return false;
        });

        if(!(block && block.canvas && block.pixelScores && evt)) return;

        var pixelValues = block.pixelScores;
        var canvas = block.canvas;
        var cPos = dojo.position(canvas);
        var cx = evt.pageX - cPos.x;

        if(this._showPixelValue(this.scoreDisplay.flag, pixelValues[ Math.round(cx) ])) {
          this.scoreDisplay.flag.style.display = 'block';
          this.scoreDisplay.pole.style.display = 'block';

          this.scoreDisplay.flag.style.left = evt.clientX+'px';
          this.scoreDisplay.flag.style.top  = parseInt(cPos.y + (canvas.height/2))+'px';
          this.scoreDisplay.pole.style.left = evt.clientX+'px';
          this.scoreDisplay.pole.style.height = cPos.h+'px';
        }
      }
    },
    _showPixelValue: function(scoreDisplay, scores) {
      if(scores) {
        var labels = this.config.labels;

        // don't do alleles when zoomed out
        var scale;
        for(var j=0; this.blocks.length; j++) {
          if(this.blocks[j] != null && this.blocks[j].hasOwnProperty('scale')) {
            scale = this.blocks[j].scale;
            break;
          }
        }
        var map = {};
        for(var j=0; j<scores.length; j++) {
          if(scores[j] == null) continue;
          if(scores[j].feat.data.source === 'counts') {
            map[ scores[j].feat.data.source ] = this.pad(scores[j].score, ' ', 5);
          }
          else {
            map[ scores[j].feat.data.source ] = this.pad(parseFloat(scores[j].score*100).toFixed(2), ' ', 5);
          }
        }

        var countLabel = 'counts';
        if(labels.hasOwnProperty('counts')) countLabel = labels['counts'];

        if(scale < 1) {
          scoreDisplay.innerHTML = countLabel + ': ' + map['counts'];
        }
        else {
          scoreDisplay.style.cssText = scoreDisplay.style.cssText + ' white-space: pre-wrap;'
          scoreDisplay.innerHTML = countLabel + ': ' + map['counts'];

          var keys = Object.keys(map).sort();
          for(var k=0; k<keys.length; k++) {
            var key = keys[k];
            if(key === 'counts') continue;
            var display = key;
            if(labels.hasOwnProperty(key)) display = labels[key];
            scoreDisplay.innerHTML +=  '\n' + this.pad(display, ' ', 5) + ': ' + map[key];
          }
        }
        return true;
      }
      return false;
    },
    pad: function(value, pval, length) {
      return (value.toString().length < length) ? this.pad(pval+value, pval, length):value;
    },
  });
});
