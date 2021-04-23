class MVTLayer {
    constructor(mVTSource, options) {
        this.mVTSource = mVTSource;
        this.map = mVTSource.map;
        this.lineClickTolerance = 2;
        this.getIDForLayerFeature = options.getIDForLayerFeature || function (feature) {
            return feature.properties.id;
        };
        this.style = options.style;
        this.name = options.name;
        this._filter = options.filter || false;
        this._layerOrdering = options.layerOrdering || false;                
        this._mVTFeatures = {};
        this._tileCanvas = [];
        this._features = {};
        this._featuresWithLabels = [];
    }

    parseVectorTileLayer(vectorTileFeatures, tileContext) {                
        this._tileCanvas[tileContext.id] = tileContext.canvas;
        this._mVTFeatures[tileContext.id] = [];        
        for (var i = 0, len = vectorTileFeatures.length; i < len; i++) {
            var vectorTileFeature = vectorTileFeatures[i];
            this._parseVectorTileFeature(vectorTileFeature, tileContext, i);
        }

        if (this._layerOrdering) {
            this._mVTFeatures[tileContext.id] = this._mVTFeatures[tileContext.id].sort(function (a, b) {
                return -(b.properties.zIndex - a.properties.zIndex)
            });
        }
        
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(vectorTileFeature, tileContext, i) {
        if (this._filter && typeof this._filter === 'function') {
            if (this._filter(vectorTileFeature, tileContext) === false) {
                return;
            }
        }

        if (this._layerOrdering && typeof layerOrdering === 'function') {
            this._layerOrdering(vectorTileFeature, tileContext);
        }

        var featureId = this.getIDForLayerFeature(vectorTileFeature) || i;
        var mVTFeature = this._features[featureId];
        if (!mVTFeature) {
            var style = this.style(vectorTileFeature);
            mVTFeature = new MVTFeature(this, vectorTileFeature, tileContext, style);
            this._features[featureId] = mVTFeature;
            if (style && style.dynamicLabel && typeof style.dynamicLabel === 'function') {
                this._featuresWithLabels.push(mVTFeature);
            }
        } else {
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }

        this._mVTFeatures[tileContext.id].push(mVTFeature);
    }

    drawTile(tileContext) {
        var features = this._mVTFeatures[tileContext.id];
        if (!features) return;
        var selectedFeatures = [];
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (feature.selected) {
                selectedFeatures.push(feature);
            } else {
                feature.draw(tileContext);
            }
        }
        for (var i = 0; i < selectedFeatures.length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    deleteTile(id) {
        delete this._mVTFeatures[id];
        delete this._tileCanvas[id];
    }

    clearFeaturesAtNonVisibleZoom() {
        var zoom = this.mVTSource.map.getZoom();
        for (var featureId in this._features) {
            var mVTFeature = this._features[featureId];
            mVTFeature.clearTiles(zoom);
        }
    }

    getCanvas(id) {
        return this._tileCanvas[id];
    }

    setStyle(styleFn) {
        this.style = styleFn;
        for (var id in this._features) {
            var feature = this._features[id];
            feature.setStyle(styleFn);
        }

        for (var id in this._tileCanvas) {            
            this.drawTile(id);
        }
    }

    setFilter(filterFunction) {
        this._filter = filterFunction
    }
   

    handleClickEvent(evt, callbackFunction) {
        var tileID = evt.tileID;
        var zoom = evt.tileID.split(":")[0];
        var canvas = this._tileCanvas[tileID];        
        if (!canvas) {            
            callbackFunction(evt);
            return;
        }

        var tilePoint = evt.tilePoint;
        var features = this._mVTFeatures[evt.tileID];

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
                        if (MERCATOR.in_circle(paths[j][0].x, paths[j][0].y, radius, x, y)) {
                            nearest = feature;
                            minDistance = 0;
                        }
                    }
                    break;

                case 2: //LineString
                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        if (feature.style) {
                            var distance = MERCATOR.getDistanceFromLine(tilePoint, paths[j]);
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
                        if (MERCATOR.isPointInPolygon(tilePoint, paths[j])) {
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
        callbackFunction(evt);
    }

    
    linkedLayer() {
        if (this.mVTSource.layerLink) {
            var linkName = this.mVTSource.layerLink(this.name);
            return this.mVTSource.layers[linkName];
        }
        else {
            return null;
        }
    }

    featureWithLabelAdded(feature) {
        this._featuresWithLabels.push(feature);
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
