/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTFeature {
    constructor(options) {
        this.tileContext = options.tileContext;
        this.mVTSource = options.mVTSource;        
        this.selected = options.selected;
        this.featureId = options.featureId;
        this.tiles = {};
        this.style = options.style;
        for (var key in options.vectorTileFeature) {
            this[key] = options.vectorTileFeature[key];
        }
        this.addTileFeature(options.vectorTileFeature, this.tileContext);
        if (this.selected) {
            this.select();
        }
    }

    addTileFeature(vectorTileFeature, tileContext) {
        this.tiles[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            paths: [],
            divisor: vectorTileFeature.extent / tileContext.tileSize
        };
    }

    setStyle(style) {
        this.style = style;
    }

    setSelected(selected) {
        this.selected = selected;
    }

    getPathsForTile(id) {
        return this.tiles[id].paths;
    }

    redrawTiles() {
        var zoom = this.mVTSource.map.getZoom();
        for (var id in this.tiles) {
            this.mVTSource.deleteTileDrawn(id);
            if (id.split(":")[0] == zoom) {
                this.mVTSource.redrawTile(id);
            }
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
        this.mVTSource.featureSelected(this);
        this.redrawTiles();
    }

    deselect() {
        this.selected = false;
        this.mVTSource.featureDeselected(this);
        this.redrawTiles();
    }

    draw(tileContext) {
        var tile = this.tiles[tileContext.id];
        var vectorTileFeature = tile.vectorTileFeature;
        var style = this.style;
        if (this.selected && this.style.selected) {
            style = this.style.selected;
        }
        switch (vectorTileFeature.type) {
            case 1: //Point
                this._drawPoint(tileContext, tile, style);
                break;

            case 2: //LineString
                this._drawLineString(tileContext, tile, style);
                break;

            case 3: //Polygon
                this._drawPolygon(tileContext, tile, style);
                break;
        }
    }

    _drawPoint(tileContext, tile, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);
        var radio = style.radio || 3;
        context2d.beginPath();
        var point = this._getPoint(tile.vectorTileFeature.coordinates[0][0], tileContext, tile.divisor);
        context2d.arc(point.x, point.y, radio, 0, Math.PI * 2);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();
        this.tiles[tileContext.id].paths.push([point]);
    }

    _drawLineString(tileContext, tile, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);
        var projCoords = this._drawCoordinates(tileContext, context2d, tile);
        context2d.stroke();
        this.tiles[tileContext.id].paths.push(projCoords);
    }

    _drawPolygon(tileContext, tile, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);
        var projCoords = this._drawCoordinates(tileContext, context2d, tile);
        context2d.closePath();
        if (style.fillStyle) {
            context2d.fill();
        }

        if (style.strokeStyle) {
            context2d.stroke();
        }

        this.tiles[tileContext.id].paths.push(projCoords);
    }

    _drawCoordinates(tileContext, context2d, tile) {
        var projCoords = [];
        context2d.beginPath();
        var coordinates = tile.vectorTileFeature.coordinates;
        for (var i = 0; i < coordinates.length; i++) {
            var coordinate = coordinates[i];
            for (var j = 0; j < coordinate.length; j++) {
                var method = (j === 0 ? 'move' : 'line') + 'To';
                var point = this._getPoint(coordinate[j], tileContext, tile.divisor);
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

    _getPoint(coords, tileContext, divisor) {
        var point = {
            x: coords.x / divisor,
            y: coords.y / divisor
        };

        if (tileContext.parentId) {
            var parentTile = this.mVTSource._getTile(tileContext.parentId);
            var currentTile = this.mVTSource._getTile(tileContext.id);
            var zoomDistance = currentTile.zoom - parentTile.zoom;

            const scale = Math.pow(2, zoomDistance);

            let xScale = point.x * scale;
            let yScale = point.y * scale;

            let xtileOffset = currentTile.x % scale;
            let ytileOffset = currentTile.y % scale;

            point.x = xScale - (xtileOffset * this.tileContext.tileSize);
            point.y = yScale - (ytileOffset * this.tileContext.tileSize);
        }
        return point;
    }
}