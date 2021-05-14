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
            var feature = vectorTileFeatures[i];
            this._parseVectorTileFeature(feature, tileContext, i);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(feature, tileContext, i) {
        if (this._filter && typeof this._filter === 'function') {
            if (this._filter(feature, tileContext) === false) {
                return;
            }
        }

        var featureId = this._getIDForLayerFeature(feature) || i;
        var style = this.getStyle(feature);
        var mVTFeature = this._features[featureId];
        if (!mVTFeature) {            
            mVTFeature = new MVTFeature(this, feature, tileContext, style);
            this._features[featureId] = mVTFeature;
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(feature, tileContext);
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

    getStyle(feature) {
        if (typeof this.style === 'function') {
            return this.style(feature);
        }
        return this.style;
    }

    setStyle(style) {
        this.style = style;
        for (var featureId in this._features) {
            this._features[featureId].setStyle(style);
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event) {
        var canvas = this._tileCanvas[event.id];
        var features = this._mVTFeatures[event.id];
        if (!canvas || !features) {
            return event;
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
        event.feature = selectedFeature;
        return event;
    }
};