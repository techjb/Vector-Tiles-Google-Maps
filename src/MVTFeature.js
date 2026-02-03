/*
 *  Created by Jesús Barrio on 04/2021
 */

const TWO_PI = Math.PI * 2;

class MVTFeature {
    constructor(options) {
        this.mVTSource = options.mVTSource;
        this.selected = options.selected;
        this.featureId = options.featureId;
        this.tiles = Object.create(null); // Use object without prototype overhead
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
            divisor: vectorTileFeature.extent / tileContext.tileSize,
            context2d: null,
            paths2d: null,
            paths: null
        };
    }

    getTiles() {
        return this.tiles;
    }

    getTile(tileContext) {
        return this.tiles[tileContext.id];
    }

    setStyle(style) {
        this.style = style;
    }

    redrawTiles() {
        const zoom = this.mVTSource.map.getZoom();
        const mVTSource = this.mVTSource;
        const tiles = this.tiles;
        const tileKeys = Object.keys(tiles);

        for (let i = 0, len = tileKeys.length; i < len; i++) {
            const id = tileKeys[i];
            mVTSource.deleteTileDrawn(id);
            const idObject = mVTSource.getTileObject(id);
            if (idObject.zoom === zoom) { // Removed parseInt, assume zoom is already a number
                mVTSource.redrawTile(id);
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
        const tile = this.tiles[tileContext.id];
        const style = (this.selected && this.style.selected) ? this.style.selected : this.style;
        this._draw(tileContext, tile, style, this);
    }

    defaultDraw(tileContext, tile, style) {
        const type = this.type;

        if (type === 1) { // Point
            this.drawPoint(tileContext, tile, style);
        } else if (type === 2) { // LineString
            this.drawLineString(tileContext, tile, style);
        } else if (type === 3) { // Polygon
            this.drawPolygon(tileContext, tile, style);
        }
    }

    drawPoint(tileContext, tile, style) {
        const coordinates = tile.vectorTileFeature.coordinates[0][0];
        const point = this.getPoint(coordinates, tileContext, tile.divisor);
        const radius = style.radius || 3;
        const context2d = this.getContext2d(tileContext.canvas, style);
        context2d.beginPath();
        context2d.arc(point.x, point.y, radius, 0, TWO_PI);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();
    }

    drawLineString(tileContext, tile, style) {
        tile.context2d = this.getContext2d(tileContext.canvas, style);
        this.drawCoordinates(tileContext, tile);
        tile.context2d.stroke(tile.paths2d);
    }

    drawPolygon(tileContext, tile, style) {
        const context2d = this.getContext2d(tileContext.canvas, style);
        tile.context2d = context2d;
        this.drawCoordinates(tileContext, tile);

        const paths2d = tile.paths2d;
        paths2d.closePath();

        const hasFill = style.fillStyle;
        const hasStroke = style.strokeStyle;

        // Fixed logic bug: was checking hasStroke three times
        if (hasFill && hasStroke) {
            context2d.fill(paths2d);
            context2d.stroke(paths2d);
        } else if (hasFill) {
            context2d.fill(paths2d);
        } else if (hasStroke) {
            context2d.stroke(paths2d);
        }
    }

    drawCoordinates(tileContext, tile) {
        if (tile.paths2d) {
            return;
        }
        const coordinates = tile.vectorTileFeature.coordinates;
        const divisor = tile.divisor;
        const paths2d = new Path2D();
        const coordsLength = coordinates.length;

        for (let i = 0; i < coordsLength; i++) {
            const coordinate = coordinates[i];
            const coordLength = coordinate.length;

            if (coordLength > 0) {
                const path2 = new Path2D();
                const firstPoint = this.getPoint(coordinate[0], tileContext, divisor);
                path2.moveTo(firstPoint.x, firstPoint.y);

                for (let j = 1; j < coordLength; j++) {
                    const point = this.getPoint(coordinate[j], tileContext, divisor);
                    path2.lineTo(point.x, point.y);
                }
                paths2d.addPath(path2);
            }
        }

        tile.paths2d = paths2d;
    }

    getPaths(tileContext) {
        const tile = this.tiles[tileContext.id];
        if (tile.paths) {
            return tile.paths;
        }
        const coordinates = tile.vectorTileFeature.coordinates;
        const divisor = tile.divisor;
        const coordsLength = coordinates.length;
        const paths = new Array(coordsLength);
        let pathCount = 0;

        for (let i = 0; i < coordsLength; i++) {
            const coordinate = coordinates[i];
            const coordLength = coordinate.length;
            const path = new Array(coordLength);

            for (let j = 0; j < coordLength; j++) {
                path[j] = this.getPoint(coordinate[j], tileContext, divisor);
            }

            if (coordLength > 0) {
                paths[pathCount++] = path;
            }
        }

        paths.length = pathCount; // Trim array to actual size
        tile.paths = paths;
        return tile.paths;
    }

    getContext2d(canvas, style) {
        const context2d = canvas.getContext('2d');
        const keys = Object.keys(style);

        for (let i = 0, len = keys.length; i < len; i++) {
            const key = keys[i];
            if (key !== 'selected') {
                context2d[key] = style[key];
            }
        }
        return context2d;
    }

    getPoint(coords, tileContext, divisor) {
        let x = coords.x / divisor;
        let y = coords.y / divisor;

        const parentId = tileContext.parentId;
        if (parentId) {
            const mVTSource = this.mVTSource;
            const parentTile = mVTSource.getTileObject(parentId);
            const currentTile = mVTSource.getTileObject(tileContext.id);
            const zoomDistance = currentTile.zoom - parentTile.zoom;
            const scale = Math.pow(2, zoomDistance);
            const tileSize = tileContext.tileSize;

            x = x * scale - ((currentTile.x % scale) * tileSize);
            y = y * scale - ((currentTile.y % scale) * tileSize);
        }

        return { x, y };
    }

    _getOverzoomedPoint(point, tileContext) {
        const mVTSource = this.mVTSource;
        const parentTile = mVTSource.getTileObject(tileContext.parentId);
        const currentTile = mVTSource.getTileObject(tileContext.id);
        const zoomDistance = currentTile.zoom - parentTile.zoom;
        const scale = Math.pow(2, zoomDistance);
        const tileSize = tileContext.tileSize;

        point.x = point.x * scale - ((currentTile.x % scale) * tileSize);
        point.y = point.y * scale - ((currentTile.y % scale) * tileSize);

        return point;
    }

    isPointInPath(point, tileContext) {
        const tile = this.getTile(tileContext);
        const context2d = tile.context2d;
        const paths2d = tile.paths2d;

        if (!context2d || !paths2d) {
            return false;
        }
        return context2d.isPointInPath(paths2d, point.x, point.y);
    }
}