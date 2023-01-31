/*
 *  Created by Jes�s Barrio on 04/2021
 */

export class MVTFeature {
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
      divisor: vectorTileFeature.extent / tileContext.tileSize,
      context2d: false,
      paths2d: false,
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
    for (const id in this.tiles) {
      this.mVTSource.deleteTileDrawn(id);
      const idObject = this.mVTSource.getTileObject(id);
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
    const tile = this.tiles[tileContext.id];
    let style = this.style;
    if (this.selected && this.style.selected) {
      style = this.style.selected;
    }

    this._draw(tileContext, tile, style, this);
  }

  defaultDraw(tileContext, tile, style) {
    switch (this.type) {
      case 1: // Point
        this.drawPoint(tileContext, tile, style);
        break;

      case 2: // LineString
        this.drawLineString(tileContext, tile, style);
        break;

      case 3: // Polygon
        this.drawPolygon(tileContext, tile, style);
        break;
    }
  }

  drawPoint(tileContext, tile, style) {
    const coordinates = tile.vectorTileFeature.coordinates[0][0];
    const point = this.getPoint(coordinates, tileContext, tile.divisor);
    const radius = style.radius || 3;
    const context2d = this.getContext2d(tileContext.canvas, style);
    context2d.beginPath();
    context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
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
    tile.context2d = this.getContext2d(tileContext.canvas, style);
    this.drawCoordinates(tileContext, tile);
    tile.paths2d.closePath();

    if (style.fillStyle) {
      tile.context2d.fill(tile.paths2d);
    }
    if (style.strokeStyle) {
      tile.context2d.stroke(tile.paths2d);
    }
  }

  drawCoordinates(tileContext, tile) {
    const coordinates = tile.vectorTileFeature.coordinates;
    tile.paths2d = new Path2D();
    for (let i = 0, length1 = coordinates.length; i < length1; i++) {
      const coordinate = coordinates[i];
      const path2 = new Path2D();
      for (let j = 0, length2 = coordinate.length; j < length2; j++) {
        const point = this.getPoint(coordinate[j], tileContext, tile.divisor);
        if (j == 0) {
          path2.moveTo(point.x, point.y);
        } else {
          path2.lineTo(point.x, point.y);
        }
      }
      tile.paths2d.addPath(path2);
    }
  }

  getPaths(tileContext) {
    const paths = [];
    const tile = this.tiles[tileContext.id];
    const coordinates = tile.vectorTileFeature.coordinates;
    for (let i = 0, length1 = coordinates.length; i < length1; i++) {
      const path = [];
      const coordinate = coordinates[i];
      for (let j = 0, length2 = coordinate.length; j < length2; j++) {
        const point = this.getPoint(coordinate[j], tileContext, tile.divisor);
        path.push(point);
      }
      if (path.length > 0) {
        paths.push(path);
      }
    }
    return paths;
  }

  getContext2d(canvas, style) {
    const context2d = canvas.getContext('2d');
    for (const key in style) {
      if (key === 'selected') {
        continue;
      }
      context2d[key] = style[key];
    }
    return context2d;
  }

  getPoint(coords, tileContext, divisor) {
    let point = {
      x: coords.x / divisor,
      y: coords.y / divisor,
    };

    if (tileContext.parentId) { // TODO likely a bug: needs to check for nullish value, not falsy
      point = this._getOverzoomedPoint(point, tileContext);
    }
    return point;
  }

  _getOverzoomedPoint(point, tileContext) {
    const parentTile = this.mVTSource.getTileObject(tileContext.parentId);
    const currentTile = this.mVTSource.getTileObject(tileContext.id);
    const zoomDistance = currentTile.zoom - parentTile.zoom;

    const scale = Math.pow(2, zoomDistance);

    const xScale = point.x * scale;
    const yScale = point.y * scale;

    const xtileOffset = currentTile.x % scale;
    const ytileOffset = currentTile.y % scale;

    point.x = xScale - (xtileOffset * tileContext.tileSize);
    point.y = yScale - (ytileOffset * tileContext.tileSize);

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
