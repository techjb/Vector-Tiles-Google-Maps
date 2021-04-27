function VectorTile(buffer, end) {
    this.layers = {};
    this._buffer = buffer;
    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 3) {
            var layer = this._readLayer();
            if (layer.length) {
                this.layers[layer.name] = layer;
            }
        } else {
            buffer.skip(val);
        }
    }
    this.parseGeometries();
}

VectorTile.prototype._readLayer = function () {
    var buffer = this._buffer,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        layer = new VectorTileLayer(buffer, end);

    buffer.pos = end;
    return layer;
};

VectorTile.prototype.parseGeometries = function () {
    for (var key in this.layers) {
        var layer = this.layers[key];
        layer.parsedFeatures = [];
        var featuresLength = layer._features.length;
        for (var i = 0, len = featuresLength; i < len; i++) {
            var feature = layer.feature(i);
            feature.coordinates = feature.loadGeometry();
            layer.parsedFeatures.push(feature);
        }
    }
}