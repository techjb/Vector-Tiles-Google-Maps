/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTLayer {
    constructor(mVTSource, options) {
        this.mVTSource = mVTSource;        
        this._lineClickTolerance = 2;
        this._getIDForLayerFeature = options.getIDForLayerFeature;
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
        for (var i = 0; i < vectorTileFeatures.length; i++) {
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

        var featureId = this._getIDForLayerFeature(vectorTileFeature) || i;        
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
            this._features[featureId].clearTiles(zoom);
        }
    }

    getCanvas(id) {
        return this._tileCanvas[id];
    }

    setStyle(styleFunction) {
        this.style = styleFunction;
        for (var featureId in this._features) {            
            this._features[featureId].setStyle(styleFunction);
        }
    }

    setFilter(filterFunction) {
        this._filter = filterFunction;
    }

    handleClickEvent(event, callbackFunction) {
        var canvas = this._tileCanvas[event.id];
        var features = this._mVTFeatures[event.id];
        if (!canvas || !features) {
            return callbackFunction(event);
        }

        var minDistance = Number.POSITIVE_INFINITY;
        var selectedFeature = null;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var paths = feature.getPathsForTile(event.id);
            for (var j = 0; j < paths.length; j++) {
                var path = paths[j];
                switch (feature.type) {
                    case 1: // Point
                        if (MERCATOR.in_circle(path[0].x, path[0].y, feature.style.radio, event.tilePoint.x, event.tilePoint.y)) {
                            selectedFeature = feature;
                            minDistance = 0;
                        }
                        break;
                    case 2: // LineString
                        var distance = MERCATOR.getDistanceFromLine(event.tilePoint, path);
                        var thickness = (feature.selected && feature.style.selected ? feature.style.selected.lineWidth : feature.style.lineWidth);
                        if (distance < thickness / 2 + this._lineClickTolerance && distance < minDistance) {
                            selectedFeature = feature;
                            minDistance = distance;
                        }
                        break;
                    case 3: // Polygon
                        if (MERCATOR.isPointInPolygon(event.tilePoint, path)) {
                            selectedFeature = feature;
                            minDistance = 0;
                        }
                        break;
                }
            }
            if (minDistance == 0) {
                break;
            }
        }

        if (selectedFeature) {
            selectedFeature.toggle();
        }
        event.feature = selectedFeature;
        callbackFunction(event);
    }
};