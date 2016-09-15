require([
    'dojo/_base/declare',
    'dojo/_base/array',
    'JBrowse/Browser',
    'ProportionalMultiBw/View/Track/ProportionalWiggle/ProportionalXYPlot',
    'ProportionalMultiBw/Store/SeqFeature/ProportionalMultiBw'
],
function(
    declare,
    array,
    Browser,
    ProportionalXYPlot,
    ProportionalMultiBwStore
) {

    describe('Can initialize track', function() {

        var track = new ProportionalXYPlot({
            browser: new Browser({unitTestMode: true}),
            config: {
                labels: {"counts": "Depth"},
                counts: { "name": "counts","color": "black","urlTemplate": "volvox-proportionalMultiBw.bw" },
                urlTemplates: [
                {"color": "#00BF00","url": "A.volvox-proportionalMultiBw.bw","name": "A"},
                {"color": "#4747ff","url": "C.volvox-proportionalMultiBw.bw","name": "C"},
                {"color": "#d5bb04","url": "G.volvox-proportionalMultiBw.bw","name": "G"},
                {"color": "#f00","url": "T.volvox-proportionalMultiBw.bw","name": "T"},
                ],
                label: "testtrack"
            }
        });
        it('track', function() {
            expect(track).toBeTruthy();
        });

    });

/*
  "maxExportSpan": 500000,
  "autoscale": "local",
  "logScaleOption": true,
  "maxRefFrac": 0.9,
  "matchRef": true,
  "yScalePosition": "right",
  "scale": "linear",
  "style": {
    "origin_color": "#888",
    "height": 100
  },
  "showTooltips": true,
  "metadata": {}
*/

    describe('Can initialize store', function() {

        var store = new ProportionalMultiBwStore({
            browser: new Browser({unitTestMode: true}),
            urlTemplates: [
                {"color": "black",   "url": "../data/volvox-proportionalMultiBw.bw",   "name": "counts"},
                {"color": "#00BF00", "url": "../data/A.volvox-proportionalMultiBw.bw", "name": "A"},
                {"color": "#4747ff", "url": "../data/C.volvox-proportionalMultiBw.bw", "name": "C"},
                {"color": "#d5bb04", "url": "../data/G.volvox-proportionalMultiBw.bw", "name": "G"},
                {"color": "#f00",    "url": "../data/T.volvox-proportionalMultiBw.bw", "name": "T"},
            ]
        });

        var features = [];
        beforeEach(function(done) {
                store.getFeatures({ref: "ctgA", start: 1, end: 1000}, function(feature) {
                    features.push(feature);
                }, function() {
                    done();
                }, function() {
                    console.error(error);
                    done();
                });
            });
        it('store', function() {
            expect(store).toBeTruthy();
        });

        it('get bigwig values - A', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="A"; })
          expect(bwarr.length).toEqual(538);
        });
        it('get bigwig values - C', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="C"; })
          expect(bwarr.length).toEqual(741);
        });
        it('get bigwig values - G', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="G"; })
          expect(bwarr.length).toEqual(964);
        });
        it('get bigwig values - T', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="T"; })
          expect(bwarr.length).toEqual(1365);
        });
        it('get bigwig values - Counts', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="counts"; })
          expect(bwarr.length).toEqual(1188);
        });

    });


});

