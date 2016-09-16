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

    describe('Can initialize track:', function() {

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

    describe('Can initialize store:', function() {

        var store = new ProportionalMultiBwStore({
            browser: new Browser({unitTestMode: true}),
            urlTemplates: [
                {"color": "black",   "url": "../data/counts.volvox-proportionalMultiBw.bw",   "name": "counts"},
                {"color": "#00BF00", "url": "../data/A.volvox-proportionalMultiBw.bw", "name": "A"},
                {"color": "#4747ff", "url": "../data/C.volvox-proportionalMultiBw.bw", "name": "C"},
                {"color": "#d5bb04", "url": "../data/G.volvox-proportionalMultiBw.bw", "name": "G"},
                {"color": "#f00",    "url": "../data/T.volvox-proportionalMultiBw.bw", "name": "T"},
            ]
        });
        // set required browser variables specific to ProportionalMultiBw
        store.browser.view = {pxPerBp: 1};

        it('store', function() {
            expect(store).toBeTruthy();
        });

    });

    describe('Checking pxPerBp >=1 counts:', function() {

        var store = new ProportionalMultiBwStore({
            browser: new Browser({unitTestMode: true}),
            urlTemplates: [
                {"color": "black",   "url": "../data/counts.volvox-proportionalMultiBw.bw",   "name": "counts"},
                {"color": "#00BF00", "url": "../data/A.volvox-proportionalMultiBw.bw", "name": "A"},
                {"color": "#4747ff", "url": "../data/C.volvox-proportionalMultiBw.bw", "name": "C"},
                {"color": "#d5bb04", "url": "../data/G.volvox-proportionalMultiBw.bw", "name": "G"},
                {"color": "#f00",    "url": "../data/T.volvox-proportionalMultiBw.bw", "name": "T"},
            ]
        });
        // set required browser variables specific to ProportionalMultiBw
        store.browser.view = {pxPerBp: 1};

        var features = [];
        beforeEach(function(done) {
          features = [];
          store.getFeatures({ref: "ctgA", start: 1, end: 100}, function(feature) {
            features.push(feature);
          }, function() {
            done();
          }, function() {
            console.error(error);
            done();
          });
        });

        // test values in files with:
        // bwcat -i some.bw -r ctgA:1-101 | grep -vcE '\t0.000000'
        it('get bigwig values - A', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="A"; })
          expect(bwarr.length).toEqual(25); // result is ctg:1-101 if testing on cmd
        });
        it('get bigwig values - C', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="C"; })
          expect(bwarr.length).toEqual(18);
        });
        it('get bigwig values - G', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="G"; })
          expect(bwarr.length).toEqual(24);
        });
        it('get bigwig values - T', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="T"; })
          expect(bwarr.length).toEqual(30);
        });
        it('get bigwig values - Counts', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="counts"; })
          expect(bwarr.length).toEqual(13);
        });


    });

    describe('Checking pxPerBp <1 counts:', function() {

        var store = new ProportionalMultiBwStore({
            browser: new Browser({unitTestMode: true}),
            urlTemplates: [
                {"color": "black",   "url": "../data/counts.volvox-proportionalMultiBw.bw",   "name": "counts"},
                {"color": "#00BF00", "url": "../data/A.volvox-proportionalMultiBw.bw", "name": "A"},
                {"color": "#4747ff", "url": "../data/C.volvox-proportionalMultiBw.bw", "name": "C"},
                {"color": "#d5bb04", "url": "../data/G.volvox-proportionalMultiBw.bw", "name": "G"},
                {"color": "#f00",    "url": "../data/T.volvox-proportionalMultiBw.bw", "name": "T"},
            ]
        });
        // set required browser variables specific to ProportionalMultiBw
        store.browser.view = {pxPerBp: 0.5};

        var features = [];
        beforeEach(function(done) {
          features = [];
          store.getFeatures({ref: "ctgA", start: 1, end: 100}, function(feature) {
            features.push(feature);
          }, function() {
            done();
          }, function() {
            console.error(error);
            done();
          });
        });

        // test values in files with:
        // bwcat -i some.bw -r ctgA:1-101 | grep -vcE '\t0.000000'
        it('get bigwig values - A', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="A"; })
          expect(bwarr.length).toEqual(0); // result is ctg:1-101 if testing on cmd
        });
        it('get bigwig values - C', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="C"; })
          expect(bwarr.length).toEqual(0);
        });
        it('get bigwig values - G', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="G"; })
          expect(bwarr.length).toEqual(0);
        });
        it('get bigwig values - T', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="T"; })
          expect(bwarr.length).toEqual(0);
        });
        it('get bigwig values - Counts', function() {
          var bwarr = array.filter(features, function(f) { return f.get('score')>0&&f.get('source')=="counts"; })
          expect(bwarr.length).toEqual(13);
        });


    });

});

