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
        this._canvasAndMVTFeatures = Object.create(null);
        this._mVTFeatures = Object.create(null);
    }

    parseVectorTileFeatures(mVTSource, vectorTileFeatures, tileContext) {
        const tileId = tileContext.id;
        const features = [];
        this._canvasAndMVTFeatures[tileId] = {
            canvas: tileContext.canvas,
            features: features
        };

        for (let i = 0, length = vectorTileFeatures.length; i < length; i++) {
            const feature = this._parseVectorTileFeature(mVTSource, vectorTileFeatures[i], tileContext, i);
            if (feature) features.push(feature);
        }
        this.drawTile(tileContext);
    }

    _parseVectorTileFeature(mVTSource, vectorTileFeature, tileContext, i) {
        if (this._filter && this._filter(vectorTileFeature, tileContext) === false) {
            return null;
        }

        const style = this.getStyle(vectorTileFeature);
        const featureId = this._getIDForLayerFeature(vectorTileFeature) || i;
        let mVTFeature = this._mVTFeatures[featureId];

        if (!mVTFeature) {
            mVTFeature = new MVTFeature({
                mVTSource: mVTSource,
                vectorTileFeature: vectorTileFeature,
                tileContext: tileContext,
                style: style,
                selected: mVTSource.isFeatureSelected(featureId),
                featureId: featureId,
                customDraw: this._customDraw
            });
            this._mVTFeatures[featureId] = mVTFeature;
        } else {
            mVTFeature.setStyle(style);
            mVTFeature.addTileFeature(vectorTileFeature, tileContext);
        }

        return mVTFeature;
    }

    drawTile(tileContext) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[tileContext.id];
        if (!canvasAndFeatures) return;

        const mVTFeatures = canvasAndFeatures.features;
        const selectedFeatures = [];

        for (let i = 0, length = mVTFeatures.length; i < length; i++) {
            const mVTFeature = mVTFeatures[i];
            if (mVTFeature.selected) {
                selectedFeatures.push(mVTFeature);
            } else {
                mVTFeature.draw(tileContext);
            }
        }

        for (let i = 0, length = selectedFeatures.length; i < length; i++) {
            selectedFeatures[i].draw(tileContext);
        }
    }

    getCanvas(id) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[id];
        return canvasAndFeatures ? canvasAndFeatures.canvas : null;
    }

    getStyle(feature) {
        return typeof this.style === 'function' ? this.style(feature) : this.style;
    }

    setStyle(style) {
        this.style = style;
        const features = this._mVTFeatures;
        for (const featureId in features) {
            features[featureId].setStyle(style);
        }
    }

    setSelected(featureId) {
        const feature = this._mVTFeatures[featureId];
        if (feature !== undefined) {
            feature.select();
        }
    }

    setFilter(filter) {
        this._filter = filter;
    }

    handleClickEvent(event, mVTSource) {
        const canvasAndFeatures = this._canvasAndMVTFeatures[event.tileContext.id];
        if (!canvasAndFeatures) return event;

        const mVTFeatures = canvasAndFeatures.features;
        if (!mVTFeatures) return event;

        event.feature = this._handleClickEvent(event, mVTFeatures, mVTSource);
        return event;
    }

    _handleClickEvent(event, mVTFeatures, mVTSource) {
        const tileContextId = event.tileContext.id;
        const currentSelectedFeaturesInTile = mVTSource.getSelectedFeaturesInTile(tileContextId);

        // Check selected features first
        let result = this._handleClickFeatures(event, currentSelectedFeaturesInTile);
        if (result) return result;

        // Check all features
        return this._handleClickFeatures(event, mVTFeatures);
    }

    _handleClickFeatures(event, mVTFeatures) {
        let selectedFeature = null;
        let minDistance = Number.POSITIVE_INFINITY;

        for (let i = mVTFeatures.length - 1; i >= 0; i--) {
            const result = this._handleClickFeature(event, mVTFeatures[i], minDistance);
            if (result && result.distance < minDistance) {
                selectedFeature = result.feature;
                minDistance = result.distance;
                if (minDistance === 0) return selectedFeature;
            }
        }

        return selectedFeature;
    }

    _handleClickFeature(event, mVTFeature, currentMinDistance) {
        // Polygon type
        if (mVTFeature.type === 3) {
            if (mVTFeature.isPointInPath(event.tilePoint, event.tileContext)) {
                return { feature: mVTFeature, distance: 0 };
            }
            return null;
        }

        // Point and LineString types
        const paths = mVTFeature.getPaths(event.tileContext);
        const tilePoint = event.tilePoint;
        const featureType = mVTFeature.type;
        let minDistance = currentMinDistance;
        let found = false;

        for (let j = paths.length - 1; j >= 0; j--) {
            const path = paths[j];

            if (featureType === 1) { // Point
                if (MERCATOR.in_circle(path[0].x, path[0].y, mVTFeature.style.radius, tilePoint.x, tilePoint.y)) {
                    return { feature: mVTFeature, distance: 0 };
                }
            } else if (featureType === 2) { // LineString
                const distance = MERCATOR.getDistanceFromLine(tilePoint, path);
                const style = mVTFeature.style;
                const thickness = (mVTFeature.selected && style.selected) ? style.selected.lineWidth : style.lineWidth;

                if (distance < thickness / 2 + this._lineClickTolerance && distance < minDistance) {
                    minDistance = distance;
                    found = true;
                }
            }
        }

        return found ? { feature: mVTFeature, distance: minDistance } : null;
    }
}