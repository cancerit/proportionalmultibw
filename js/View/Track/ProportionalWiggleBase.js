define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'JBrowse/View/Track/WiggleBase',
    'ProportionalMultiBw/View/Dialog/MaxRefFracDialog'
],
function(
    declare,
    array,
    lang,
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
        }
    });
});
