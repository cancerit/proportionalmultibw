define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'JBrowse/View/Track/WiggleBase',
//    'MultiBigWig/View/Dialog/MaxScoreDialog'
],
function(
    declare,
    array,
    lang,
    WiggleBase,
    MaxScoreDialog
) {
    return declare(WiggleBase, {

        constructor: function(args) {
            this.labels = args.config.urlTemplates;
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
                label: 'Set max score for global',
                onClick: function() {
                    new MaxScoreDialog({
                        setCallback: function(filterInt) {
                            track.config.max_score = filterInt;
                            track.config.autoscale = 'global';
                            track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
                        },
                        maxScore: track.config.max_score || 0
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
