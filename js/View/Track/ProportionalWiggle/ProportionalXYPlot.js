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
                style: {
                    pos_color: 'blue',
                    neg_color: 'red',
                    origin_color: '#888',
                    variance_band_color: 'rgba(0,0,0,0.3)'
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
            var canvasHeight = canvas.height;

            var ratio = Util.getResolution(context, this.browser.config.highResolutionMode);
            var toY = lang.hitch(this, function(val) {
                return canvasHeight * (1 - dataScale.normalize(val)) / ratio;
            });
            var originY = toY(dataScale.origin);
            var map = {};

            array.forEach(pixels, function(p, i) {
                array.forEach(p, function(s) {
                    if (!s) {
                        return;
                    }
                    var score = toY(s.score);
                    var f = s.feat;
                    var source = f.get('source');
                    var elt = {};
                    for (var k = 0; k < this.labels.length; k++) {
                        if (this.labels[k].name == f.get('source')) {
                            elt = this.labels[k];
                            break;
                        }
                    }
                    var color = elt.color;
                    var nonCont = elt.nonCont;
                    if (score <= canvasHeight || score > originY) { // if the rectangle is visible at all
                        if (score <= originY) {
                            // bar goes upward
                            if (nonCont) {
                                context.fillStyle = color;
                                var height = 1;
                                if (elt.fill) {
                                    height = originY - score + 1;
                                }
                                thisB._fillRectMod(context, i, score, 1, height);
                            } else {
                                context.strokeStyle = color;
                                context.beginPath();
                                var x = (map[source] || {}).x || i;
                                var y = (map[source] || {}).y || score;
                                if (i === x + 1) {
                                    context.moveTo(x, y);
                                    context.lineTo(i, score);
                                } else if (i === x && i !== 0) {
                                    context.moveTo(x - 1, canvasHeight);
                                    context.lineTo(x, score);
                                } else {
                                    context.moveTo(x, y);
                                    context.lineTo(x + 1, canvasHeight);
                                    context.lineTo(i - 1, canvasHeight);
                                    context.lineTo(i, score);
                                }
                                context.stroke();
                                map[source] = {
                                    x: i,
                                    y: score
                                };
                            }
                        } else {
                            if (nonCont) {
                                context.fillStyle = color;

                                var top = score - 1;
                                var heightm = 1;
                                if (elt.fill) {
                                    top = originY;
                                    heightm = score - originY;
                                }
                                thisB._fillRectMod(context, i, top, 1,  heightm);
                            } else {
                                context.strokeStyle = color;
                                context.beginPath();
                                var x = (map[source] || {}).x || i;
                                var y = (map[source] || {}).y || score;
                                if (i === x + 1) {
                                    context.moveTo(x, y);
                                    context.lineTo(i, score);
                                } else if (i === x && i !== 0) {
                                    context.moveTo(x - 1, canvasHeight);
                                    context.lineTo(x, score);
                                } else {
                                    context.moveTo(x, y);
                                    context.lineTo(x + 1, canvasHeight);
                                    context.lineTo(i - 1, canvasHeight);
                                    context.lineTo(i, score);
                                }
                                context.stroke();
                                map[source] = {
                                    x: i,
                                    y: score
                                };
                            }
                        }
                    }
                }, this);
            }, this);
        }
    });
});
