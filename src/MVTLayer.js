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
        this._mVTFeatures = {};
        this._tileCanvas = [];
        this._features = {};
    }

    parseVectorTileLayer(vectorTileFeatures, tileContext) {
        this._tileCanvas[tileContext.id] = tileContext.canvas;
        this._mVTFeatures[tileContext.id] = [];
        for (var i = 0, len = vectorTileFeatures.length; i < len; i++) {
            var vectorTileFeature = vectorTileFeatures[i];
            this._parseVectorTileFeature(vectorTileFeature, tileContext, i);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(vectorTileFeature, tileContext, i) {
        if (this._filter && typeof this._filter === 'function') {
            if (this._filter(vectorTileFeature, tileContext) === false) {
                return;
            }
        }

        var featureId = this.getIDForLayerFeature(vectorTileFeature) || i;
        var mVTFeature = this._features[featureId];
        if (!mVTFeature) {
            var style = this.style(vectorTileFeature);
            mVTFeature = new MVTFeature(this, vectorTileFeature, tileContext, style);
            this._features[featureId] = mVTFeature;
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

    setStyle(styleFunction) {
        this.style = styleFunction;
        for (var id in this._features) {
            var feature = this._features[id];
            feature.setStyle(styleFunction);
        }
    }

    setFilter(filterFunction) {
        this._filter = filterFunction
    }


    handleClickEvent(event, callbackFunction) {
        var canvas = this._tileCanvas[event.id];
        var features = this._mVTFeatures[event.id];
        if (!canvas || !features) {
            return callbackFunction(event);
        }

        var minDistance = Number.POSITIVE_INFINITY;
        var zoom = event.id.split(":")[0];
        var selectedFeature = null;
        var j, paths, distance;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            switch (feature.type) {
                case 1: //Point - currently rendered as circular paths.  Intersect with that. Find the radius of the point.
                    var radius = 3;
                    if (typeof feature.style.radius === 'function') {
                        radius = feature.style.radius(zoom); //Allows for scale dependent rednering
                    }
                    else {
                        radius = feature.style.radius;
                    }

                    paths = feature.getPathsForTile(event.id);
                    for (j = 0; j < paths.length; j++) {
                        //Builds a circle of radius feature.style.radius (assuming circular point symbology).
                        if (MERCATOR.in_circle(paths[j][0].x, paths[j][0].y, radius, x, y)) {
                            selectedFeature = feature;
                            minDistance = 0;
                        }
                    }
                    break;

                case 2: //LineString
                    paths = feature.getPathsForTile(event.id);
                    for (j = 0; j < paths.length; j++) {
                        if (feature.style) {
                            var distance = MERCATOR.getDistanceFromLine(event.tilePoint, paths[j]);
                            var thickness = (feature.selected && feature.style.selected ? feature.style.selected.size : feature.style.size);
                            if (distance < thickness / 2 + this.lineClickTolerance && distance < minDistance) {
                                selectedFeature = feature;
                                minDistance = distance;
                            }
                        }
                    }
                    break;

                case 3: //Polygon
                    paths = feature.getPathsForTile(event.id);
                    for (j = 0; j < paths.length; j++) {
                        if (MERCATOR.isPointInPolygon(event.tilePoint, paths[j])) {
                            selectedFeature = feature;
                            minDistance = 0; // point is inside the polygon, so distance is zero
                        }
                    }
                    break;
            }
            if (minDistance == 0) {
                break;
            }
        }

        //if (feature && nearest.toggleEnabled) {
        if (selectedFeature) {
            selectedFeature.toggle();
        }
        event.feature = selectedFeature;
        callbackFunction(event);
    }
};