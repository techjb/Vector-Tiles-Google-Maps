/*
 *  Created by Jesús Barrio on 04/2021
 */

class MVTFeature {
    constructor(options) {
        this.mVTSource = options.mVTSource;
        this.selected = options.selected;
        this.featureId = options.featureId;
        this.tiles = [];
        this.style = options.style;
        this.type = options.vectorTileFeature.type;
        this.properties = options.vectorTileFeature.properties;
        this.addTileFeature(options.vectorTileFeature, options.tileContext);
        this._draw = options.customDraw || this.defaultDraw;

        if (this.selected) {
            this.select();
        }
    }

    addTileFeature(vectorTileFeature, tileContext) {
        this.tiles[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            divisor: vectorTileFeature.extent / tileContext.tileSize
        };
    }

    getTiles() {
        return this.tiles;
    }

    setStyle(style) {
        this.style = style;
    }

    redrawTiles() {
        var zoom = this.mVTSource.map.getZoom();
        for (var id in this.tiles) {
            this.mVTSource.deleteTileDrawn(id);
            var idObject = this.mVTSource.getTileObject(id);
            if (idObject.zoom == zoom) {
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

    setSelected(selected) {
        this.selected = selected;
    }

    draw(tileContext) {
        var tile = this.tiles[tileContext.id];
        var style = this.style;
        if (this.selected && this.style.selected) {
            style = this.style.selected;
        }

        this._draw(tileContext, tile, style, this);
    }

    defaultDraw(tileContext, tile, style) {
        switch (this.type) {
            case 1: //Point
                this.drawPoint(tileContext, tile, style);
                break;

            case 2: //LineString
                this.drawLineString(tileContext, tile, style);
                break;

            case 3: //Polygon
                this.drawPolygon(tileContext, tile, style);
                break;
        }
    }

    drawPoint(tileContext, tile, style) {
        var coordinates = tile.vectorTileFeature.coordinates[0][0];
        var point = this.getPoint(coordinates, tileContext, tile.divisor);
        var radius = style.radius || 3;
        var context2d = this.getContext2d(tileContext.canvas, style);
        context2d.beginPath();
        context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();
    }

    drawLineString(tileContext, tile, style) {
        var context2d = this.getContext2d(tileContext.canvas, style);
        this.drawCoordinates(tileContext, context2d, tile);
        context2d.stroke();
    }

    drawPolygon(tileContext, tile, style) {
        var context2d = this.getContext2d(tileContext.canvas, style);
        this.drawCoordinates(tileContext, context2d, tile);
        context2d.closePath();

        if (style.fillStyle) {
            context2d.fill();
        }
        if (style.strokeStyle) {
            context2d.stroke();
        }
    }

    drawCoordinates(tileContext, context2d, tile) {
        context2d.beginPath();
        var coordinates = tile.vectorTileFeature.coordinates;

        for (var i = 0, length1 = coordinates.length; i < length1; i++) {
            var coordinate = coordinates[i];
            for (var j = 0, length2 = coordinate.length; j < length2; j++) {
                var method = (j === 0 ? 'move' : 'line') + 'To';
                var point = this.getPoint(coordinate[j], tileContext, tile.divisor);
                context2d[method](point.x, point.y);
            }
        }
    }

    getPaths(tileContext) {
        var paths = [];
        var tile = this.tiles[tileContext.id];
        var coordinates = tile.vectorTileFeature.coordinates;
        for (var i = 0, length1 = coordinates.length; i < length1; i++) {
            var path = [];
            var coordinate = coordinates[i];
            for (var j = 0, length2 = coordinate.length; j < length2; j++) {
                var point = this.getPoint(coordinate[j], tileContext, tile.divisor);
                path.push(point);
            }
            if (path.length > 0) {
                paths.push(path);
            }
        }
        return paths;
    }

    getContext2d(canvas, style) {
        var context2d = canvas.getContext('2d');
        for (var key in style) {
            if (key === 'selected') {
                continue;
            }
            context2d[key] = style[key];
        }
        return context2d;
    }

    getPoint(coords, tileContext, divisor) {
        var point = {
            x: coords.x / divisor,
            y: coords.y / divisor
        };

        if (tileContext.parentId) {
            point = this._getOverzoomedPoint(point, tileContext);
        }
        return point;
    }

    _getOverzoomedPoint(point, tileContext) {
        var parentTile = this.mVTSource.getTileObject(tileContext.parentId);
        var currentTile = this.mVTSource.getTileObject(tileContext.id);
        var zoomDistance = currentTile.zoom - parentTile.zoom;

        const scale = Math.pow(2, zoomDistance);

        let xScale = point.x * scale;
        let yScale = point.y * scale;

        let xtileOffset = currentTile.x % scale;
        let ytileOffset = currentTile.y % scale;

        point.x = xScale - (xtileOffset * tileContext.tileSize);
        point.y = yScale - (ytileOffset * tileContext.tileSize);

        return point;
    }
}