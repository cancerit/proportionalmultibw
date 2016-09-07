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
                {"color": "#4747ff","url": "A.volvox-proportionalMultiBw.bw","name": "C"},
                {"color": "#d5bb04","url": "A.volvox-proportionalMultiBw.bw","name": "G"},
                {"color": "#f00","url": "A.volvox-proportionalMultiBw.bw","name": "T"},
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
                {"color": "#00BF00","url": "A.volvox-proportionalMultiBw.bw","name": "A"},
                {"color": "#4747ff","url": "A.volvox-proportionalMultiBw.bw","name": "C"},
                {"color": "#d5bb04","url": "A.volvox-proportionalMultiBw.bw","name": "G"},
                {"color": "#f00","url": "A.volvox-proportionalMultiBw.bw","name": "T"},
            ],
            counts: { "name": "counts","color": "black","urlTemplate": "volvox-proportionalMultiBw.bw" }
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

        it('get bigwig values', function() {
            var a_a = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="A"; })
            var a_c = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="C"; })
            var a_g = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="G"; })
            var a_t = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="T"; })
            var c = array.filter(features, function(f) { return f.get('score')<0&&f.get('source')=="counts"; })
            expect(a_a.length).toEqual(22);
            expect(a_c.length).toEqual(22);
            expect(a_g.length).toEqual(22);
            expect(a_t.length).toEqual(22);
            expect(c.length).toEqual(22);
        });

    });


});

