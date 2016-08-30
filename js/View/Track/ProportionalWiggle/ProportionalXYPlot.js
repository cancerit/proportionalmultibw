define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/_base/Color',
  'dojo/on',
  'ProportionalMultiBw/View/Track/ProportionalWiggleBase',
  'JBrowse/View/Track/_YScaleMixin',
  'JBrowse/Util',
  'JBrowse/View/Track/Wiggle/_Scale'
],
function(
  declare,
  array,
  lang,
  Color,
  on,
  WiggleBase,
  YScaleMixin,
  Util,
  Scale
) {
  return declare([WiggleBase, YScaleMixin], {
    _defaultConfig: function() {
      return Util.deepUpdate(lang.clone(this.inherited(arguments)), {
        autoscale: 'local',
        maxRefFrac: 0.9,
        yScalePosition: 'right',
        scale: 'linear',
        style: {
          origin_color: '#888'
        }
      });
    },

    _getScaling: function(viewArgs, successCallback, errorCallback) {
      this._getScalingStats(viewArgs, dojo.hitch(this, function(stats) {
        if (!this.lastScaling || !this.lastScaling.sameStats(stats) || this.trackHeightChanged) {
          var scaling = new Scale(this.config, stats);

          // bump minDisplayed to 0 if it is within 0.5% of it
          if (Math.abs(scaling.min / scaling.max) < 0.005) {
            scaling.min = 0;
          }

          // update our track y-scale to reflect it
          this.makeYScale({
            fixBounds: true,
            min: scaling.min,
            max: scaling.max
          });

          // and finally adjust the scaling to match the ruler's scale rounding
          scaling.min = this.ruler.scaler.bounds.lower;
          scaling.max = this.ruler.scaler.bounds.upper;
          scaling.range = scaling.max - scaling.min;

          this.lastScaling = scaling;
          this.trackHeightChanged = false; // reset flag
        }

        successCallback(this.lastScaling);
      }), errorCallback);
    },

    updateStaticElements: function(coords) {
      this.inherited(arguments);
      this.updateYScaleFromViewDimensions(coords);
    },

    _drawFeatures: function(scale, leftBase, rightBase, block, canvas, pixels, dataScale) {
      var thisB = this;
      var context = canvas.getContext('2d');
      var bConfig = this.browser.config;
      var canvasHeight = canvas.height;

      if(scale < 1) {
        var background = new Image();
        background.src = bConfig.baseUrl + bConfig.plugins.ProportionalMultiBw.location + '/img/zoom_in.png';
        context.drawImage(background,0,parseInt((canvasHeight/2)-10));
      }

      var refBases = [];
      thisB.browser.getStore('refseqs', function(refSeqStore) {
        refSeqStore.getReferenceSequence(
          { ref: thisB.refSeq.name, start: leftBase, end: rightBase},
          dojo.hitch( this, function( seq ) {
            refBases = seq.split('');
          }),
          // end callback
          function() {},
          // error callback
          dojo.hitch( this, function() {
            console.log(this);
          })
        );
      });

console.log(scale);

      var alleles = ['A','C','G','T'];
      var maxRefFrac = thisB.config.maxRefFrac;

      var ratio = Util.getResolution(context, bConfig.highResolutionMode);
      var toY = lang.hitch(this, function(val) {
        return canvasHeight * (1 - dataScale.normalize(val)) / ratio;
      });
      var originY = toY(dataScale.origin);

      var colors = {};
      var templates = this.config.urlTemplates;
      for(var i=0; i<templates.length; i++) {
        colors[templates[i].name] = templates[i].color;
      }

      var lastXY = {};
      var bIdx = 0;
      var refBase;
      // iterate over pixels (scale pixels per base)
      array.forEach(pixels, function(p, i) {
        // move along the refBases array
        if(i % scale === 0) refBase = refBases[bIdx++];

        var stack = [];
        var depth;

        // iterate over stores
        array.forEach(p, function(s) {
          if (!s) {
            return;
          }
          var f = s.feat;
          var source = f.get('source');
          var score = s.score;

          if(source === 'depth') {
            depth = score;
          }
          else {
            if(scale >= 1) {
              stack.push({'allele': source, 'raw': score});
            }
          }
        }, this);

        var len = stack.length;
        if(stack.length > 0) {
          // test if we should show based on ref base divergence
          var show = 0;
          for(var j=0; j<stack.length; j++) {
            if(stack[j].allele === refBase && stack[j].raw <= maxRefFrac) {
              show = 1;
              break;
            }
          }

          if(show === 1) {
            // sort them by the raw value desc (or allele asc if equal)
            stack.sort(function(a,b) {
              if(a.raw === b.raw) {
                if(a.allele < b.allele) return -1;
                if(a.allele > b.allele) return 1;
              }
              return b.raw - a.raw;
            });

            var height = canvasHeight;
            for (var k = 0; k < len; k++) {
              context.fillStyle = colors[stack[k].allele];
              thisB._fillRectMod(context, i, 0, 1, height);
              height -= Math.round(canvasHeight * stack[k].raw);
            }
          }
        }

        // line drawing
        var score = toY(depth);
        context.fillStyle = 'black';

        //thisB._fillRectMod(context, i, score, 1, 1);
        context.beginPath();
        if(lastXY.hasOwnProperty('x')) {
          context.moveTo(lastXY.x, lastXY.y);
          context.lineTo(i, score);
          context.stroke();
        }
        lastXY = {x: i, y: score};

      }, this);
    }
  });
});
