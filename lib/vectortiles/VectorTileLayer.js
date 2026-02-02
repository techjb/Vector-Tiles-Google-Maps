function VectorTileLayer(buffer, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._buffer = buffer;
    this._keys = [];
    this._values = [];
    this._features = [];

    end = end || buffer.length;

    // Cache buffer.pos to avoid repeated property lookups
    var pos, val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        switch (tag) {
            case 15:
                this.version = buffer.readVarint();
                break;
            case 1:
                this.name = buffer.readString();
                break;
            case 5:
                this.extent = buffer.readVarint();
                break;
            case 2:
                this.length++;
                this._features.push(buffer.pos);
                buffer.skip(val);
                break;
            case 3:
                this._keys.push(buffer.readString());
                break;
            case 4:
                this._values.push(this.readFeatureValue());
                break;
            default:
                buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function () {
    var buffer = this._buffer,
        value = null,
        end = buffer.pos + buffer.readVarint(),
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        switch (tag) {
            case 1:
                value = buffer.readString();
                break;
            case 2:
                value = buffer.readFloat();
                break;
            case 3:
                value = buffer.readDouble();
                break;
            case 4:
            case 5:
                value = buffer.readVarint();
                break;
            case 6:
                value = buffer.readSVarint();
                break;
            case 7:
                value = Boolean(buffer.readVarint());
                break;
            default:
                buffer.skip(val);
        }
    }

    return value;
};

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function (i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._buffer.pos = this._features[i];
    var end = this._buffer.readVarint() + this._buffer.pos;

    return new VectorTileFeature(this._buffer, end, this.extent, this._keys, this._values);
};