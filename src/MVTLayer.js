/**
 * Created by Jes�s Barrio on 04/2021.
 */

class MVTLayer {
    constructor(mvtSource, options) {
        this.map = mvtSource.map;
        //this.options = {
            
            
            //tileSize: 256,
        this.lineClickTolerance = 2;
        this.getIDForLayerFeature = options.getIDForLayerFeature || false;
        this.filter = options.filter || false;
        this.layerOrdering = options.layerOrdering || false;
        this.asynch = options.asynch || true;
        //};
        this._featureIsClicked = {};
        this.mvtSource = mvtSource;
        this.style = options.style;
        this.name = options.name;
        this._canvasIDToFeatures = {};
        this.features = {};
        this.featuresWithLabels = [];
        this._highestCount = 0;
        this._tiles = [];
    }

    // todo: sometimes it does not work properly
    _isPointInPoly(pt, poly) {
        if (poly && poly.length) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                    && (c = !c);
            }
            return c;
        }
    }

    _getDistanceFromLine(pt, pts) {
        var min = Number.POSITIVE_INFINITY;
        if (pts && pts.length > 1) {
            pt = L.point(pt.x, pt.y);
            for (var i = 0, l = pts.length - 1; i < l; i++) {
                var test = this._projectPointOnLineSegment(pt, pts[i], pts[i + 1]);
                if (test.distance <= min) {
                    min = test.distance;
                }
            }
        }
        return min;
    }

    _projectPointOnLineSegment(p, r0, r1) {
        var lineLength = r0.distanceTo(r1);
        if (lineLength < 1) {
            return { distance: p.distanceTo(r0), coordinate: r0 };
        }
        var u = ((p.x - r0.x) * (r1.x - r0.x) + (p.y - r0.y) * (r1.y - r0.y)) / Math.pow(lineLength, 2);
        if (u < 0.0000001) {
            return { distance: p.distanceTo(r0), coordinate: r0 };
        }
        if (u > 0.9999999) {
            return { distance: p.distanceTo(r1), coordinate: r1 };
        }
        var a = L.point(r0.x + u * (r1.x - r0.x), r0.y + u * (r1.y - r0.y));
        return { distance: p.distanceTo(a), point: a };
    }

    //onAdd(map) {
    //    var self = this;
    //    self.map = map;
    //    L.TileLayer.Canvas.prototype.onAdd.call(this, map);
    //    map.on('layerremove', function (e) {
    //        // we only want to do stuff when the layerremove event is on this layer
    //        if (e.layer._leaflet_id === self._leaflet_id) {
    //            removeLabels(self);
    //        }
    //    });
    //}

    //drawTile(canvas, tilePoint, zoom) {

    //    var ctx = {
    //        canvas: canvas,
    //        tile: tilePoint,
    //        zoom: zoom,
    //        tileSize: this.options.tileSize
    //    };

    //    ctx.id = Util.getContextID(ctx);

    //    if (!this._canvasIDToFeatures[ctx.id]) {
    //        this._initializeFeaturesHash(ctx);
    //    }
    //    if (!this.features) {
    //        this.features = {};
    //    }
    //}

    _initializeFeaturesHash(ctx) {
        this._canvasIDToFeatures[ctx.id] = {};
        this._canvasIDToFeatures[ctx.id].features = [];
        this._canvasIDToFeatures[ctx.id].canvas = ctx.canvas;
    }

    //_draw(ctx) {
    //    //Draw is handled by the parent MVTSource object
    //}

    getCanvas(parentCtx) {
        //This gets called if a vector tile feature has already been parsed.
        //We've already got the geom, just get on with the drawing.
        //Need a way to pluck a canvas element from this layer given the parent layer's id.
        //Wait for it to get loaded before proceeding.
        var tilePoint = parentCtx.tile;
        var ctx = this._tiles[tilePoint.x + ":" + tilePoint.y];

        
        
        if (ctx) {
            parentCtx.canvas = ctx;
            this.redrawTile(parentCtx.id);
        }
        else {
            ctx = this._tiles[tilePoint.x + ":" + tilePoint.y];
            parentCtx.canvas = ctx;
            this.redrawTile(parentCtx.id);
        }

        //var self = this;
       

        ////This is a timer that will wait for a criterion to return true.
        ////If not true within the timeout duration, it will move on.
        //waitFor(function () {
        //    ctx = self._tiles[tilePoint.x + ":" + tilePoint.y];
        //    if (ctx) {
        //        return true;
        //    }
        //},
        //    function () {
        //        //When it finishes, do this.
        //        ctx = self._tiles[tilePoint.x + ":" + tilePoint.y];
        //        parentCtx.canvas = ctx;
        //        self.redrawTile(parentCtx.id);

        //    }, //when done, go to next flow
        //    2000); //The Timeout milliseconds.  After this, give up and move on

    }

    parseVectorTileLayer(vtl, ctx) {        
        var self = this;
        var tilePoint = ctx.tile;
        var layerCtx = {
            canvas: null,
            id: ctx.id,
            tile: ctx.tile,
            zoom: ctx.zoom,
            tileSize: ctx.tileSize
        };

        //See if we can pluck the child tile from this PBF tile layer based on the master layer's tile id.
        self._tiles[tilePoint.x + ":" + tilePoint.y] = ctx.canvas;
        layerCtx.canvas = self._tiles[tilePoint.x + ":" + tilePoint.y];
        //layerCtx.canvas = ctx.canvas;

        //Initialize this tile's feature storage hash, if it hasn't already been created.  Used for when filters are updated, and features are cleared to prepare for a fresh redraw.

        if (!this._canvasIDToFeatures[layerCtx.id]) {
            this._initializeFeaturesHash(layerCtx);
        } else {
            //Clear this tile's previously saved features.
            this.clearTileFeatureHash(layerCtx.id);
        }

        var features = vtl.parsedFeatures;
        for (var i = 0, len = features.length; i < len; i++) {
            var vtf = features[i]; //vector tile feature
            vtf.layer = vtl;

            //if(vtf.properties.id != 135){
            //    continue;
            //}


            /**
            * Apply filter on feature if there is one. Defined in the options object
            * of TileLayer.MVTSource.js
            */
            var filter = self.filter;
            if (typeof filter === 'function') {
                if (filter(vtf, layerCtx) === false) continue;
            }

            var getIDForLayerFeature;
            if (typeof self.getIDForLayerFeature === 'function') {
                getIDForLayerFeature = self.getIDForLayerFeature;
            } else {
                getIDForLayerFeature = Util.getIDForLayerFeature;
            }
            var uniqueID = self.getIDForLayerFeature(vtf) || i;
            var mvtFeature = self.features[uniqueID];

            /**
            * Use layerOrdering function to apply a zIndex property to each vtf.  This is defined in
            * TileLayer.MVTSource.js.  Used below to sort features.npm
            */
            var layerOrdering = self.layerOrdering;
            if (typeof layerOrdering === 'function') {
                layerOrdering(vtf, layerCtx); //Applies a custom property to the feature, which is used after we're thru iterating to sort
            }

            //Create a new MVTFeature if one doesn't already exist for this feature.            
            if (!mvtFeature) {
                //Get a style for the feature - set it just once for each new MVTFeature
                var style = self.style(vtf);

                //create a new feature
                self.features[uniqueID] = mvtFeature = new MVTFeature(self, vtf, layerCtx, uniqueID, style);
                if (style && style.dynamicLabel && typeof style.dynamicLabel === 'function') {
                    self.featuresWithLabels.push(mvtFeature);
                }
            } else {
                //Add the new part to the existing feature
                mvtFeature.addTileFeature(vtf, layerCtx);
            }

            //Associate & Save this feature with this tile for later
            if (layerCtx && layerCtx.id) self._canvasIDToFeatures[layerCtx.id]['features'].push(mvtFeature);

        }

        /**
            * Apply sorting (zIndex) on feature if there is a function defined in the options object
            * of TileLayer.MVTSource.js
            */
        var layerOrdering = self.layerOrdering;
        if (layerOrdering) {
            //We've assigned the custom zIndex property when iterating above.  Now just sort.
            self._canvasIDToFeatures[layerCtx.id].features = self._canvasIDToFeatures[layerCtx.id].features.sort(function (a, b) {
                return -(b.properties.zIndex - a.properties.zIndex)
            });
        }
        self.redrawTile(layerCtx.id);
    }

    setStyle(styleFn) {
        // refresh the number for the highest count value
        // this is used only for choropleth
        this._highestCount = 0;

        // lowest count should not be 0, since we want to figure out the lowest
        this._lowestCount = null;

        this.style = styleFn;
        for (var key in this.features) {
            var feat = this.features[key];
            feat.setStyle(styleFn);
        }

        var z = this.map.getZoom();
        for (var key in this._tiles) {
            var id = z + ':' + key;
            this.redrawTile(id);
        }
    }

    /**
    * As counts for choropleths come in with the ajax data,
    * we want to keep track of which value is the highest
    * to create the color ramp for the fills of polygons.
    * @param count
    */
    setHighestCount(count) {
        if (count > this._highestCount) {
            this._highestCount = count;
        }
    }

    /**
    * Returns the highest number of all of the counts that have come in
    * from setHighestCount. This is assumed to be set via ajax callbacks.
    * @returns {number}
    */
    getHighestCount() {
        return this._highestCount;
    }

    setLowestCount(count) {
        if (!this._lowestCount || count < this._lowestCount) {
            this._lowestCount = count;
        }
    }

    getLowestCount() {
        return this._lowestCount;
    }

    setCountRange(count) {
        this.setHighestCount(count);
        this.setLowestCount(count);
    }

    //This is the old way.  It works, but is slow for mouseover events.  Fine for click events.
    handleClickEvent(evt, cb) {
        //Click happened on the GroupLayer (Manager) and passed it here
        var tileID = evt.tileID.split(":").slice(1, 3).join(":");
        var zoom = evt.tileID.split(":")[0];
        var canvas = this._tiles[tileID];        
        if (!canvas) {
            //break out
            cb(evt);
            return;
        }

        var tilePoint = evt.tilePoint;
        var features = this._canvasIDToFeatures[evt.tileID].features;

        var minDistance = Number.POSITIVE_INFINITY;
        var nearest = null;
        var j, paths, distance;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            switch (feature.type) {

                case 1: //Point - currently rendered as circular paths.  Intersect with that.

                    //Find the radius of the point.
                    var radius = 3;
                    if (typeof feature.style.radius === 'function') {
                        radius = feature.style.radius(zoom); //Allows for scale dependent rednering
                    }
                    else {
                        radius = feature.style.radius;
                    }

                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        //Builds a circle of radius feature.style.radius (assuming circular point symbology).
                        if (in_circle(paths[j][0].x, paths[j][0].y, radius, x, y)) {
                            nearest = feature;
                            minDistance = 0;
                        }
                    }
                    break;

                case 2: //LineString
                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        if (feature.style) {
                            var distance = this._getDistanceFromLine(tilePoint, paths[j]);
                            var thickness = (feature.selected && feature.style.selected ? feature.style.selected.size : feature.style.size);
                            if (distance < thickness / 2 + this.lineClickTolerance && distance < minDistance) {
                                nearest = feature;
                                minDistance = distance;
                            }
                        }
                    }
                    break;

                case 3: //Polygon
                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        if (this._isPointInPoly(tilePoint, paths[j])) {
                            nearest = feature;
                            minDistance = 0; // point is inside the polygon, so distance is zero
                        }
                    }
                    break;
            }
            if (minDistance == 0) break;
        }

        if (nearest && nearest.toggleEnabled) {
            nearest.toggle();
        }
        //else {
        //    return;
        //}

        evt.feature = nearest;
        cb(evt);
    }

    _drawSmallDot(canvas, x, y) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    clearTile(id, ctx) {
        //id is the entire zoom:x:y.  we just want x:y.
        var ca = id.split(":");
        var canvasId = ca[1] + ":" + ca[2];
        if (typeof this._tiles[canvasId] === 'undefined') {
            console.error("typeof this._tiles[canvasId] === 'undefined'");
            return;
        }
        var canvas = this._tiles[canvasId];

        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    clearTileFeatureHash(canvasID) {
        this._canvasIDToFeatures[canvasID] = { features: [] }; //Get rid of all saved features
    }

    clearLayerFeatureHash() {
        this.features = {};
    }

    redrawTile(canvasID) {
        
        //First, clear the canvas
        //if (clearTile) {
        this.clearTile(canvasID);
        //}

        // If the features are not in the tile, then there is nothing to redraw.
        // This may happen if you call redraw before features have loaded and initially
        // drawn the tile.
        var featfeats = this._canvasIDToFeatures[canvasID];
        if (!featfeats) {
            return;
        }

        //Get the features for this tile, and redraw them.
        var features = featfeats.features;

        // we want to skip drawing the selected features and draw them last
        var selectedFeatures = [];

        // drawing all of the non-selected features        
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (feature.selected) {
                selectedFeatures.push(feature);
            } else {
                feature.draw(canvasID);
            }
        }

        // drawing the selected features last
        for (var j = 0, len2 = selectedFeatures.length; j < len2; j++) {
            var selFeat = selectedFeatures[j];
            selFeat.draw(canvasID);
        }
    }

    //redrawFeature(canvasID,  mvtFeature) {
    //    var featfeats = this._canvasIDToFeatures[canvasID];
    //    if (!featfeats) {
    //        return;
    //    }
    //    var features = featfeats.features;
    //    for (var i = 0; i < features.length; i++) {
    //        var feature = features[i];
    //        if (feature === mvtFeature) {
    //            feature.draw(canvasID, true);
    //        }
    //    }
    //}

    _resetCanvasIDToFeatures(canvasID, canvas) {

        this._canvasIDToFeatures[canvasID] = {};
        this._canvasIDToFeatures[canvasID].features = [];
        this._canvasIDToFeatures[canvasID].canvas = canvas;

    }

    linkedLayer() {
        if (this.mvtSource.layerLink) {
            var linkName = this.mvtSource.layerLink(this.name);
            return this.mvtSource.layers[linkName];
        }
        else {
            return null;
        }
    }

    featureWithLabelAdded(feature) {
        this.featuresWithLabels.push(feature);
    }
};


function removeLabels(self) {
    var features = self.featuresWithLabels;
    for (var i = 0, len = features.length; i < len; i++) {
        var feat = features[i];
        feat.removeLabel();
    }
    self.featuresWithLabels = [];
}

function in_circle(center_x, center_y, radius, x, y) {
    var square_dist = Math.pow((center_x - x), 2) + Math.pow((center_y - y), 2);
    return square_dist <= Math.pow(radius, 2);
}
/**
 * See https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 *
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
//function waitFor(testFx, onReady, timeOutMillis) {
//    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
//        start = new Date().getTime(),
//        condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()), //< defensive code
//        interval = setInterval(function () {
//            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
//                // If not time-out yet and condition not yet fulfilled
//                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
//            } else {
//                if (!condition) {
//                    // If condition still not fulfilled (timeout but condition is 'false')
//                    console.log("'waitFor()' timeout");
//                    clearInterval(interval); //< Stop this interval
//                    typeof (onReady) === "string" ? eval(onReady) : onReady('timeout'); //< Do what it's supposed to do once the condition is fulfilled
//                } else {
//                    // Condition fulfilled (timeout and/or condition is 'true')
//                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
//                    clearInterval(interval); //< Stop this interval
//                    typeof (onReady) === "string" ? eval(onReady) : onReady('success'); //< Do what it's supposed to do once the condition is fulfilled
//                }
//            }
//        }, 50); //< repeat check every 50ms
//};