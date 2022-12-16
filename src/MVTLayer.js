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
        this._customDraw = options.customDraw || false;
        this._canvasAndMVTFeatures = [];
        this._mVTFeatures = [];
    }

    parseVectorTileFeatures(mVTSource, vectorTileFeatures, tileContext) {
        this._canvasAndMVTFeatures[tileContext.id] = {
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
        var mVTFeature = this._mVTFeatures[featureId];
        if (!mVTFeature) {
            var selected = mVTSource.isFeatureSelected(featureId);
            var options = {
                mVTSource: mVTSource,
                vectorTileFeature: vectorTileFeature,
                tileContext: tileContext,
                style: style,
                selected: selected,
                featureId: featureId,
                customDraw: this._customDraw
            }
            mVTFeature = new MVTFeature(options);
            this._mVTFeatures[featureId] = mVTFeature;
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }
        this._canvasAndMVTFeatures[tileContext.id].features.push(mVTFeature);
    }

    drawTile(tileContext) {
        var mVTFeatures = this._canvasAndMVTFeatures[tileContext.id].features;
        if (!mVTFeatures) return;
        var selectedFeatures = [];
        for (var i = 0, length = mVTFeatures.length; i < length; i++) {
            var mVTFeature = mVTFeatures[i];
            if (mVTFeature.selected) {
                selectedFeatures.push(mVTFeature);
            } else {
                mVTFeature.draw(tileContext);
            }
        }
        for (var i = 0, length = selectedFeatures.length; i < length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    getCanvas(id) {
        return this._canvasAndMVTFeatures[id].canvas;
    }

    getStyle(feature) {
        if (typeof this.style === 'function') {
            return this.style(feature);
        }
        return this.style;
    }

    setStyle(style) {
        this.style = style;
        for (var featureId in this._mVTFeatures) {
            this._mVTFeatures[featureId].setStyle(style);
        }
    }

    setSelected(featureId) {
        if (this._mVTFeatures[featureId] !== undefined) {
            this._mVTFeatures[featureId].select();
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event, mVTSource) {
        var canvasAndFeatures = this._canvasAndMVTFeatures[event.tileContext.id];
        if (!canvasAndFeatures) return event;
        var canvas = canvasAndFeatures.canvas;
        var mVTFeatures = canvasAndFeatures.features;

        if (!canvas || !mVTFeatures) {
            return event;
        }
        event.feature = this._handleClickEvent(event, mVTFeatures, mVTSource);
        return event;
    }

    _handleClickEvent(event, mVTFeatures, mVTSource) {
        this.selectedFeature = null;

        var tileContextId = event.tileContext.id;
        var currentSelectedFeaturesInTile = mVTSource.getSelectedFeaturesInTile(tileContextId);
        this._handleClickFeatures(event, currentSelectedFeaturesInTile);

        if (this.selectedFeature != null) {
            return this.selectedFeature;
        }

        this._handleClickFeatures(event, mVTFeatures);
        if (this.selectedFeature != null) {
            return this.selectedFeature;
        }

        return this.selectedFeature;
    }

    _handleClickFeatures(event, mVTFeatures) {
        this.minDistance = Number.POSITIVE_INFINITY;

        for (var i = mVTFeatures.length - 1; i >= 0; i--) {
            var mVTFeature = mVTFeatures[i];
            this._handleClickFeature(event, mVTFeature);
            if (this.selectedFeature != null) {
                return this.selectedFeature;
            }
        }
    }

    _handleClickFeature(event, mVTFeature) {
        switch (mVTFeature.type) {
            case 3:// polygon
                this._handleClickFeaturePolygon(event, mVTFeature);
                break;
            default: {
                this._handleClickFeatureDefault(event, mVTFeature);
                break;
            }
        }        
    }

    _handleClickFeaturePolygon(event, mVTFeature) {
        if (mVTFeature.isPointInPath(event.tilePoint, event.tileContext)) {
            this.selectedFeature = mVTFeature;
            this.minDistance = 0;
        }
    }

    _handleClickFeatureDefault(event, mVTFeature) {
        var paths = mVTFeature.getPaths(event.tileContext);
        for (var j = paths.length - 1; j >= 0; j--) {
            var path = paths[j];
            switch (mVTFeature.type) {
                case 1: // Point
                    if (MERCATOR.in_circle(path[0].x, path[0].y, mVTFeature.style.radius, event.tilePoint.x, event.tilePoint.y)) {
                        this.selectedFeature = mVTFeature;
                        this.minDistance = 0;
                    }
                    break;
                case 2: // LineString
                    var distance = MERCATOR.getDistanceFromLine(event.tilePoint, path);
                    var thickness = (mVTFeature.selected && mVTFeature.style.selected ? mVTFeature.style.selected.lineWidth : mVTFeature.style.lineWidth);
                    if (distance < thickness / 2 + this._lineClickTolerance && distance < this.minDistance) {
                        this.selectedFeature = mVTFeature;
                        this.minDistance = distance;
                    }
                    break;
            }
            if (this.minDistance == 0) {
                return this.selectedFeature;
            }
        }
    }
};