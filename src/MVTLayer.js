/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTLayer {
    constructor(options) {
        this._lineClickTolerance = 2;
        this._getIDForLayerFeature = options.getIDForLayerFeature;
        this.style = options.style;
        this.name = options.name;
        this._filter = options.filter || false;
        this._canvasAndFeatures = [];
        this._features = [];
    }

    parseVectorTileFeatures(mVTSource, vectorTileFeatures, tileContext) {
        this._canvasAndFeatures[tileContext.id] = {
            canvas: tileContext.canvas,
            features: []
        }
        for (var i = 0, length = vectorTileFeatures.length; i < length; i++) {
            var vectorTileFeature = vectorTileFeatures[i];
            this._parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i) {
        if (this._filter && typeof this._filter === 'function') {
            if (this._filter(vectorTileFeature, tileContext) === false) {
                return;
            }
        }

        var style = this.getStyle(vectorTileFeature);
        var featureId = this._getIDForLayerFeature(vectorTileFeature) || i;
        var mVTFeature = this._features[featureId];
        if (!mVTFeature) {
            var selected = mVTSource.isFeatureSelected(featureId);
            var options = {
                mVTSource: mVTSource,
                vectorTileFeature: vectorTileFeature,
                tileContext: tileContext,
                style: style,
                selected: selected,
                featureId: featureId
            }
            mVTFeature = new MVTFeature(options);
            this._features[featureId] = mVTFeature;
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }
        this._canvasAndFeatures[tileContext.id].features.push(mVTFeature);
    }

    drawTile(tileContext) {
        var features = this._canvasAndFeatures[tileContext.id].features;
        if (!features) return;
        var selectedFeatures = [];
        for (var i = 0, length = features.length; i < length; i++) {
            var feature = features[i];
            if (feature.selected) {
                selectedFeatures.push(feature);
            } else {
                feature.draw(tileContext);
            }
        }
        for (var i = 0, length = selectedFeatures.length; i < length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    getCanvas(id) {
        return this._canvasAndFeatures[id].canvas;
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

    setSelected(featureId) {
        if (this._features[featureId] !== undefined) {
            this._features[featureId].select();
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event) {
        var canvasAndFeatures = this._canvasAndFeatures[event.tileContext.id];
        if (!canvasAndFeatures) return event;
        var canvas = canvasAndFeatures.canvas;
        var features = canvasAndFeatures.features;

        if (!canvas || !features) {
            return event;
        }
        event.feature = this._getSelectedFeature(event, features);
        return event;
    }

    _getSelectedFeature(event, features) {
        var minDistance = Number.POSITIVE_INFINITY;
        var selectedFeature = null;

        for (var i = 0, length1 = features.length; i < length1; i++) {
            var feature = features[i];
            var paths = feature.getPaths(event.tileContext);

            for (var j = 0, length2 = paths.length; j < length2; j++) {
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

                if (minDistance == 0) {
                    return selectedFeature;
                }
            }
        }
        return selectedFeature;
    }
};