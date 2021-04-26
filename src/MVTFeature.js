class MVTFeature {
    constructor(mVTLayer, vectorTileFeature, tileContext, style) {
        this.mVTLayer = mVTLayer;
        this.toggleEnabled = true;
        this.selected = false;
        this.divisor = vectorTileFeature.extent / tileContext.tileSize; 
        this.extent = vectorTileFeature.extent;
        this.tileSize = tileContext.tileSize;
        this.tileInfos = {};
        this.style = style;
        for (var key in vectorTileFeature) {
            this[key] = vectorTileFeature[key];
        }        
        this.addTileFeature(vectorTileFeature, tileContext);
    }

    addTileFeature(vectorTileFeature, tileContext) {
        this.tileInfos[tileContext.id] = {
            vectorTileFeature: vectorTileFeature,
            paths: []
        };
    }

    setStyle(styleFunction) {
        this.style = styleFunction(this, null);        
    }

    draw (tileContext) {
        var vectorTileFeature = this.tileInfos[tileContext.id].vectorTileFeature;
        var style = this.style;
        if (this.selected) {
            var style = this.style.selected || this.style;
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

    getPathsForTile(id) {
        return this.tileInfos[id].paths;
    }

    clearTiles(zoom) {
        for (var key in this.tileInfos) {
            if (key.split(":")[0] != zoom) {
                delete this.tileInfos[key];
            }
        }
    }

    redrawTiles() {
        for (var id in this.tileInfos) {
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

    _drawPoint(tileContext, coordinates, style) {
        var radius = 1;
        if (typeof style.radius === 'function') {
            radius = style.radius(tileContext.zoom);
        }
        else {
            radius = style.radius;
        }

        var context2d = tileContext.canvas.getContext('2d')
        context2d.beginPath();
        context2d.fillStyle = style.color;
        var point = this.getPoint(coordinates[0][0]);
        context2d.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context2d.closePath();
        context2d.fill();

        if (style.lineWidth && style.strokeStyle) {
            context2d.lineWidth = style.lineWidth;
            context2d.strokeStyle = style.strokeStyle;
            context2d.stroke();
        }

        context2d.restore();
        this.tileInfos[tileContext.id].paths.push([point]);
    }

    _drawLineString(tileContext, coordinates, style) {
        var context2d = tileContext.canvas.getContext('2d');
        context2d.strokeStyle = style.color;
        context2d.lineWidth = style.size;
        context2d.beginPath();

        var projCoords = [];
        for (var i in coordinates) {
            var coordinate = coordinates[i];
            for (var j = 0; j < coordinate.length; j++) {
                var method = (j === 0 ? 'move' : 'line') + 'To';
                var point = this.getPoint(coordinate[j]);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }

        context2d.stroke();
        context2d.restore();
        this.tileInfos[tileContext.id].paths.push(projCoords);
    }

    _drawPolygon(tileContext, coordinates, style) {
        var context2d = tileContext.canvas.getContext('2d');
        var outline = style.outline;

        if (typeof style.color === 'function') {
            context2d.fillStyle = style.color(context2d);
        } else {
            context2d.fillStyle = style.color;
        }

        if (outline) {
            context2d.strokeStyle = outline.color;
            context2d.lineWidth = outline.size;
        }
        var projCoords = [];
        context2d.beginPath();

        for (var i = 0; i < coordinates.length; i++) {
            var j = coordinates[i];
            for (var k = 0; k < j.length; k++) {
                var coordinate = j[k];
                var method = (k === 0 ? 'move' : 'line') + 'To';
                var point = this.getPoint(coordinate);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }

        context2d.closePath();
        context2d.fill();
        if (outline) {
            context2d.stroke();
        }
        this.tileInfos[tileContext.id].paths.push(projCoords);
    }

    getPoint(coords) {
        return {
            x: coords.x / this.divisor,
            y: coords.y / this.divisor
        };
    }
}