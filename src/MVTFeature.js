class MVTFeature {
    constructor(mVTLayer, vectorTileFeature, tileContext, style, label) {
        this.mVTLayer = mVTLayer;
        this.selected = false;
        this.divisor = vectorTileFeature.extent / tileContext.tileSize;
        this.extent = vectorTileFeature.extent;
        this.tileSize = tileContext.tileSize;
        this.tileInfos = {};
        this.style = style;
        this.label = label;
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

    setLabel(labelFunction) {
        this.label = labelFunction(this);
    }

    draw(tileContext) {
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
        var context2d = this._getContext2d(tileContext.canvas, style);
        var radio = style.radio || 4;
        context2d.beginPath();        
        var point = this._getPoint(coordinates[0][0]);
        context2d.arc(point.x, point.y, radio, 0, Math.PI * 2);
        context2d.closePath();
        context2d.fill();
        context2d.stroke();        
        this._drawLabel(context2d, [point]);
        this.tileInfos[tileContext.id].paths.push([point]);
    }

    _drawLineString(tileContext, coordinates, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);        
        context2d.beginPath();
        var projCoords = [];
        for (var i in coordinates) {
            var coordinate = coordinates[i];
            for (var j = 0; j < coordinate.length; j++) {
                var method = (j === 0 ? 'move' : 'line') + 'To';
                var point = this._getPoint(coordinate[j]);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }

        context2d.stroke();        
        this._drawLabel(context2d, projCoords);
        this.tileInfos[tileContext.id].paths.push(projCoords);        
    }

    _drawPolygon(tileContext, coordinates, style) {
        var context2d = this._getContext2d(tileContext.canvas, style);       
        context2d.beginPath();
        var projCoords = [];

        for (var i = 0; i < coordinates.length; i++) {
            var coordinate = coordinates[i];
            for (var j = 0; j < coordinate.length; j++) {                
                var method = (j === 0 ? 'move' : 'line') + 'To';
                var point = this._getPoint(coordinate[j]);
                projCoords.push(point);
                context2d[method](point.x, point.y);
            }
        }

        context2d.closePath();
        context2d.fill();
        context2d.stroke();        
        this._drawLabel(context2d, projCoords);
        this.tileInfos[tileContext.id].paths.push(projCoords);        
    }

    _drawLabel(context2d, coordinates) {
        if (!this.label || !this.label.text) {
            return;
        }
        context2d.restore();
        for (var key in this.label) {
            if (key === 'text') {
                continue;
            }
            context2d[key] = this.label[key];
        }        
        var centroid = MERCATOR.get_centroid(coordinates);
        context2d.fillText(this.label.text, centroid.x, centroid.y);
    }

    _getContext2d(canvas, style) {
        var context2d = canvas.getContext('2d');
        for (var key in style) {
            if (key === 'selected' || key==='label') {
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