/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTFeature {
    constructor(mVTLayer, vectorTileFeature, tileContext, style) {
        this.mVTLayer = mVTLayer;
        this.selected = false;
        this.divisor = vectorTileFeature.extent / tileContext.tileSize;
        this.tiles = {};
        this.style = style;
        for (var key in vectorTileFeature) {
            this[key] = vectorTileFeature[key];
        }
        this.addTileFeature(vectorTileFeature, tileContext);
    }

    addTileFeature(vectorTileFeature, tileContext) {
        this.tiles[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            paths: []
        };
    }

    setStyle(style) {
        this.style = style;
    }

    getPathsForTile(id) {
        return this.tiles[id].paths;
    }

    clearTiles(zoom) {
        for (var key in this.tiles) {
            if (key.split(":")[0] != zoom) {
                delete this.tiles[key];
            }
        }
    }

    redrawTiles() {
        for (var id in this.tiles) {
            this.mVTLayer.mVTSource.redrawTile(id);
        }
    }

    toggle() {
        if (this.selected) {
            this.deselect();
        } else {
            this.select();
        }
    }

    select() {
        this.selected = true;
        this.mVTLayer.mVTSource.featureSelected(this);
        this.redrawTiles();
    }

    deselect() {
        this.selected = false;
        this.mVTLayer.mVTSource.featureDeselected(this);
        this.redrawTiles();
    }

    draw(tileContext) {
        var vectorTileFeature = this.tiles[tileContext.id].vectorTileFeature;
        var style = this.style;
        if (this.selected && this.style.selected) {
            style = this.style.selected;
        }
        switch (vectorTileFeature.type) {
            case 1: //Point
                this._drawPoint(tileContext, vectorTileFeature.coordinates, style);
                break;

            case 2: //LineString
                this._drawLineString(tileContext, vectorTileFeature.coordinates, style);
                break;

            case 3: //Polygon
                this._drawPolygon(tileContext, vectorTileFeature.coordinates, style);
                break;
        }
    }

    _drawPoint(tileContext, coordinates, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);
        var radio = style.radio || 3;
        context2d.beginPath();
        var point = this._getPoint(coordinates[0][0]);
        context2d.arc(point.x, point.y, radio, 0, Math.PI * 2);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();
        this.tiles[tileContext.id].paths.push([point]);
    }

    _drawLineString(tileContext, coordinates, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);
        var projCoords = this._drawCoordinates(context2d, coordinates);
        context2d.stroke();
        this.tiles[tileContext.id].paths.push(projCoords);
    }

    _drawPolygon(tileContext, coordinates, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);
        var projCoords = this._drawCoordinates(context2d, coordinates);
        context2d.closePath();
        if (style.fillStyle) {
            context2d.fill();
        }

        if (style.strokeStyle) {
            context2d.stroke();
        }

        this.tiles[tileContext.id].paths.push(projCoords);
    }

    _drawCoordinates(context2d, coordinates) {
        var projCoords = [];
        context2d.beginPath();
        for (var i = 0; i < coordinates.length; i++) {
            var coordinate = coordinates[i];
            for (var j = 0; j < coordinate.length; j++) {
                var method = (j === 0 ? 'move' : 'line') + 'To';
                var point = this._getPoint(coordinate[j]);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }
        return projCoords;
    }

    _getContext2d(canvas, style) {
        var context2d = canvas.getContext('2d');
        for (var key in style) {
            if (key === 'selected') {
                continue;
            }
            context2d[key] = style[key];
        }
        return context2d;
    }

    _getPoint(coords) {
        return {
            x: coords.x / this.divisor,
            y: coords.y / this.divisor
        };
    }
}