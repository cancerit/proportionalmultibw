define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/event',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/mouse',
    'JBrowse/View/Track/WiggleBase',
    'ProportionalMultiBw/View/Dialog/MaxRefFracDialog'
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
    MaxRefFracDialog
) {
    return declare(WiggleBase, {

        constructor: function(args) {
            this.labels = args.config.urlTemplates;
        },

    fillBlock: function( args ) {
        var thisB = this;
        this.heightUpdate( this._canvasHeight(), args.blockIndex );

        // hook updateGraphs onto the end of the block feature fetch
        var oldFinish = args.finishCallback || function() {};
        args.finishCallback = function() {
            thisB.updateGraphs( args, oldFinish );
        };

        // get the features for this block, and then set in motion the
        // updating of the graphs
        this._getBlockFeatures( args );
    },

        _calculatePixelScores: function(canvasWidth, features, featureRects) {
            var pixelValues = new Array(canvasWidth);
            array.forEach(features, function(f, i) {
                var fRect = featureRects[i];
                var jEnd = fRect.r;
                var score = f.get('score');
                for (var k = 0; k < this.labels.length; k++) {
                    if (this.labels[k].name === f.get('source')) {
                        break;
                    }
                }
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
                label: 'Autoscale global',
                onClick: function() {
                    track.config.autoscale = 'global';
                    track.browser.publish('/jbrowse/v1/v/tracks/replace', [track.config]);
                }
            });
            options.push({
                label: 'Autoscale local',
                onClick: function() {
                    track.config.autoscale = 'local';
                    track.config.max_score = null;
                    track.browser.publish('/jbrowse/v1/v/tracks/replace', [track.config]);
                }
            });
            options.push({
                label: 'Set max reference fraction',
                onClick: function() {
                    new MaxRefFracDialog({
                        setCallback: function(filterInt) {
                            track.config.maxRefFrac = filterInt;
                            track.config.autoscale = 'global';
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
        mouseover: function( bpX, evt ) {
          if( bpX === undefined) {
            var thisB = this;
              thisB.scoreDisplay.flag.style.display = 'none';
              thisB.scoreDisplay.pole.style.display = 'none';
          }
          else {
            var block;
            array.some(this.blocks, function(b) {
                     if( b && b.startBase <= bpX && b.endBase >= bpX ) {
                       block = b;
                       return true;
                     }
                     return false;
                   });

            if( !( block && block.canvas && block.pixelScores && evt ) )
              return;

            var pixelValues = block.pixelScores;
            var canvas = block.canvas;
            var cPos = dojo.position( canvas );
            var x = evt.pageX;
            var cx = evt.pageX - cPos.x;

            if( this._showPixelValue( this.scoreDisplay.flag,  pixelValues[ Math.round( cx ) ]) ) {
              this.scoreDisplay.flag.style.display = 'block';
              this.scoreDisplay.pole.style.display = 'block';

              this.scoreDisplay.flag.style.left = evt.clientX+'px';
              this.scoreDisplay.flag.style.top  = parseInt(cPos.y + (canvas.height/2))+'px';
              this.scoreDisplay.pole.style.left = evt.clientX+'px';
              this.scoreDisplay.pole.style.height = cPos.h+'px';
            }

          }
        },
        _showPixelValue: function( scoreDisplay, scores ) {
          if(scores) {
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
              if(scores[j].feat.data.source === 'depth') {
                map[ scores[j].feat.data.source ] = scores[j].score;
              }
              else {
                map[ scores[j].feat.data.source ] = parseFloat( scores[j].score*100 ).toFixed(2);
              }
            }
            if(scale < 1) {
              scoreDisplay.innerHTML = 'depth: ' + map['depth'];
            }
            else {
              if(!map.hasOwnProperty('A')) map['A'] = 0;
              if(!map.hasOwnProperty('C')) map['C'] = 0;
              if(!map.hasOwnProperty('G')) map['G'] = 0;
              if(!map.hasOwnProperty('T')) map['T'] = 0;

              scoreDisplay.style.cssText = scoreDisplay.style.cssText + ' white-space: pre-wrap;'
              scoreDisplay.innerHTML = 'depth: ' + map['depth'] + '\n' +
                                       'A: ' + map['A'] + '%\n' +
                                       'C: ' + map['C'] + '%\n' +
                                       'G: ' + map['G'] + '%\n' +
                                       'T: ' + map['T'] + '%';
            }
            return true;
          }
          return false;
        },
    });
});
