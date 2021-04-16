!function (t) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else { var i; i = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, i.Pbf = t() } }(function () { return function t(i, e, r) { function s(o, h) { if (!e[o]) { if (!i[o]) { var a = "function" == typeof require && require; if (!h && a) return a(o, !0); if (n) return n(o, !0); var u = new Error("Cannot find module '" + o + "'"); throw u.code = "MODULE_NOT_FOUND", u } var f = e[o] = { exports: {} }; i[o][0].call(f.exports, function (t) { var e = i[o][1][t]; return s(e ? e : t) }, f, f.exports, t, i, e, r) } return e[o].exports } for (var n = "function" == typeof require && require, o = 0; o < r.length; o++)s(r[o]); return s }({ 1: [function (t, i, e) { "use strict"; function r(t) { this.buf = ArrayBuffer.isView && ArrayBuffer.isView(t) ? t : new Uint8Array(t || 0), this.pos = 0, this.type = 0, this.length = this.buf.length } function s(t, i, e) { var r, s, n = e.buf; if (s = n[e.pos++], r = (112 & s) >> 4, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 3, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 10, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 17, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (127 & s) << 24, s < 128) return o(t, r, i); if (s = n[e.pos++], r |= (1 & s) << 31, s < 128) return o(t, r, i); throw new Error("Expected varint not more than 10 bytes") } function n(t) { return t.type === r.Bytes ? t.readVarint() + t.pos : t.pos + 1 } function o(t, i, e) { return e ? 4294967296 * i + (t >>> 0) : 4294967296 * (i >>> 0) + (t >>> 0) } function h(t, i) { var e, r; if (t >= 0 ? (e = t % 4294967296 | 0, r = t / 4294967296 | 0) : (e = ~(-t % 4294967296), r = ~(-t / 4294967296), 4294967295 ^ e ? e = e + 1 | 0 : (e = 0, r = r + 1 | 0)), t >= 0x10000000000000000 || t < -0x10000000000000000) throw new Error("Given varint doesn't fit into 10 bytes"); i.realloc(10), a(e, r, i), u(r, i) } function a(t, i, e) { e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos++] = 127 & t | 128, t >>>= 7, e.buf[e.pos] = 127 & t } function u(t, i) { var e = (7 & t) << 4; i.buf[i.pos++] |= e | ((t >>>= 3) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t | ((t >>>= 7) ? 128 : 0), t && (i.buf[i.pos++] = 127 & t))))) } function f(t, i, e) { var r = i <= 16383 ? 1 : i <= 2097151 ? 2 : i <= 268435455 ? 3 : Math.ceil(Math.log(i) / (7 * Math.LN2)); e.realloc(r); for (var s = e.pos - 1; s >= t; s--)e.buf[s + r] = e.buf[s] } function d(t, i) { for (var e = 0; e < t.length; e++)i.writeVarint(t[e]) } function p(t, i) { for (var e = 0; e < t.length; e++)i.writeSVarint(t[e]) } function c(t, i) { for (var e = 0; e < t.length; e++)i.writeFloat(t[e]) } function l(t, i) { for (var e = 0; e < t.length; e++)i.writeDouble(t[e]) } function w(t, i) { for (var e = 0; e < t.length; e++)i.writeBoolean(t[e]) } function F(t, i) { for (var e = 0; e < t.length; e++)i.writeFixed32(t[e]) } function b(t, i) { for (var e = 0; e < t.length; e++)i.writeSFixed32(t[e]) } function v(t, i) { for (var e = 0; e < t.length; e++)i.writeFixed64(t[e]) } function g(t, i) { for (var e = 0; e < t.length; e++)i.writeSFixed64(t[e]) } function x(t, i) { return (t[i] | t[i + 1] << 8 | t[i + 2] << 16) + 16777216 * t[i + 3] } function V(t, i, e) { t[e] = i, t[e + 1] = i >>> 8, t[e + 2] = i >>> 16, t[e + 3] = i >>> 24 } function y(t, i) { return (t[i] | t[i + 1] << 8 | t[i + 2] << 16) + (t[i + 3] << 24) } function M(t, i, e) { for (var r = "", s = i; s < e;) { var n = t[s], o = null, h = n > 239 ? 4 : n > 223 ? 3 : n > 191 ? 2 : 1; if (s + h > e) break; var a, u, f; 1 === h ? n < 128 && (o = n) : 2 === h ? (a = t[s + 1], 128 === (192 & a) && (o = (31 & n) << 6 | 63 & a, o <= 127 && (o = null))) : 3 === h ? (a = t[s + 1], u = t[s + 2], 128 === (192 & a) && 128 === (192 & u) && (o = (15 & n) << 12 | (63 & a) << 6 | 63 & u, (o <= 2047 || o >= 55296 && o <= 57343) && (o = null))) : 4 === h && (a = t[s + 1], u = t[s + 2], f = t[s + 3], 128 === (192 & a) && 128 === (192 & u) && 128 === (192 & f) && (o = (15 & n) << 18 | (63 & a) << 12 | (63 & u) << 6 | 63 & f, (o <= 65535 || o >= 1114112) && (o = null))), null === o ? (o = 65533, h = 1) : o > 65535 && (o -= 65536, r += String.fromCharCode(o >>> 10 & 1023 | 55296), o = 56320 | 1023 & o), r += String.fromCharCode(o), s += h } return r } function S(t, i, e) { for (var r, s, n = 0; n < i.length; n++) { if (r = i.charCodeAt(n), r > 55295 && r < 57344) { if (!s) { r > 56319 || n + 1 === i.length ? (t[e++] = 239, t[e++] = 191, t[e++] = 189) : s = r; continue } if (r < 56320) { t[e++] = 239, t[e++] = 191, t[e++] = 189, s = r; continue } r = s - 55296 << 10 | r - 56320 | 65536, s = null } else s && (t[e++] = 239, t[e++] = 191, t[e++] = 189, s = null); r < 128 ? t[e++] = r : (r < 2048 ? t[e++] = r >> 6 | 192 : (r < 65536 ? t[e++] = r >> 12 | 224 : (t[e++] = r >> 18 | 240, t[e++] = r >> 12 & 63 | 128), t[e++] = r >> 6 & 63 | 128), t[e++] = 63 & r | 128) } return e } i.exports = r; var B = t("ieee754"); r.Varint = 0, r.Fixed64 = 1, r.Bytes = 2, r.Fixed32 = 5; var k = 4294967296, P = 1 / k; r.prototype = { destroy: function () { this.buf = null }, readFields: function (t, i, e) { for (e = e || this.length; this.pos < e;) { var r = this.readVarint(), s = r >> 3, n = this.pos; this.type = 7 & r, t(s, i, this), this.pos === n && this.skip(r) } return i }, readMessage: function (t, i) { return this.readFields(t, i, this.readVarint() + this.pos) }, readFixed32: function () { var t = x(this.buf, this.pos); return this.pos += 4, t }, readSFixed32: function () { var t = y(this.buf, this.pos); return this.pos += 4, t }, readFixed64: function () { var t = x(this.buf, this.pos) + x(this.buf, this.pos + 4) * k; return this.pos += 8, t }, readSFixed64: function () { var t = x(this.buf, this.pos) + y(this.buf, this.pos + 4) * k; return this.pos += 8, t }, readFloat: function () { var t = B.read(this.buf, this.pos, !0, 23, 4); return this.pos += 4, t }, readDouble: function () { var t = B.read(this.buf, this.pos, !0, 52, 8); return this.pos += 8, t }, readVarint: function (t) { var i, e, r = this.buf; return e = r[this.pos++], i = 127 & e, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 7, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 14, e < 128 ? i : (e = r[this.pos++], i |= (127 & e) << 21, e < 128 ? i : (e = r[this.pos], i |= (15 & e) << 28, s(i, t, this))))) }, readVarint64: function () { return this.readVarint(!0) }, readSVarint: function () { var t = this.readVarint(); return t % 2 === 1 ? (t + 1) / -2 : t / 2 }, readBoolean: function () { return Boolean(this.readVarint()) }, readString: function () { var t = this.readVarint() + this.pos, i = M(this.buf, this.pos, t); return this.pos = t, i }, readBytes: function () { var t = this.readVarint() + this.pos, i = this.buf.subarray(this.pos, t); return this.pos = t, i }, readPackedVarint: function (t, i) { var e = n(this); for (t = t || []; this.pos < e;)t.push(this.readVarint(i)); return t }, readPackedSVarint: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSVarint()); return t }, readPackedBoolean: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readBoolean()); return t }, readPackedFloat: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFloat()); return t }, readPackedDouble: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readDouble()); return t }, readPackedFixed32: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFixed32()); return t }, readPackedSFixed32: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSFixed32()); return t }, readPackedFixed64: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readFixed64()); return t }, readPackedSFixed64: function (t) { var i = n(this); for (t = t || []; this.pos < i;)t.push(this.readSFixed64()); return t }, skip: function (t) { var i = 7 & t; if (i === r.Varint) for (; this.buf[this.pos++] > 127;); else if (i === r.Bytes) this.pos = this.readVarint() + this.pos; else if (i === r.Fixed32) this.pos += 4; else { if (i !== r.Fixed64) throw new Error("Unimplemented type: " + i); this.pos += 8 } }, writeTag: function (t, i) { this.writeVarint(t << 3 | i) }, realloc: function (t) { for (var i = this.length || 16; i < this.pos + t;)i *= 2; if (i !== this.length) { var e = new Uint8Array(i); e.set(this.buf), this.buf = e, this.length = i } }, finish: function () { return this.length = this.pos, this.pos = 0, this.buf.subarray(0, this.length) }, writeFixed32: function (t) { this.realloc(4), V(this.buf, t, this.pos), this.pos += 4 }, writeSFixed32: function (t) { this.realloc(4), V(this.buf, t, this.pos), this.pos += 4 }, writeFixed64: function (t) { this.realloc(8), V(this.buf, t & -1, this.pos), V(this.buf, Math.floor(t * P), this.pos + 4), this.pos += 8 }, writeSFixed64: function (t) { this.realloc(8), V(this.buf, t & -1, this.pos), V(this.buf, Math.floor(t * P), this.pos + 4), this.pos += 8 }, writeVarint: function (t) { return t = +t || 0, t > 268435455 || t < 0 ? void h(t, this) : (this.realloc(4), this.buf[this.pos++] = 127 & t | (t > 127 ? 128 : 0), void (t <= 127 || (this.buf[this.pos++] = 127 & (t >>>= 7) | (t > 127 ? 128 : 0), t <= 127 || (this.buf[this.pos++] = 127 & (t >>>= 7) | (t > 127 ? 128 : 0), t <= 127 || (this.buf[this.pos++] = t >>> 7 & 127))))) }, writeSVarint: function (t) { this.writeVarint(t < 0 ? 2 * -t - 1 : 2 * t) }, writeBoolean: function (t) { this.writeVarint(Boolean(t)) }, writeString: function (t) { t = String(t), this.realloc(4 * t.length), this.pos++; var i = this.pos; this.pos = S(this.buf, t, this.pos); var e = this.pos - i; e >= 128 && f(i, e, this), this.pos = i - 1, this.writeVarint(e), this.pos += e }, writeFloat: function (t) { this.realloc(4), B.write(this.buf, t, this.pos, !0, 23, 4), this.pos += 4 }, writeDouble: function (t) { this.realloc(8), B.write(this.buf, t, this.pos, !0, 52, 8), this.pos += 8 }, writeBytes: function (t) { var i = t.length; this.writeVarint(i), this.realloc(i); for (var e = 0; e < i; e++)this.buf[this.pos++] = t[e] }, writeRawMessage: function (t, i) { this.pos++; var e = this.pos; t(i, this); var r = this.pos - e; r >= 128 && f(e, r, this), this.pos = e - 1, this.writeVarint(r), this.pos += r }, writeMessage: function (t, i, e) { this.writeTag(t, r.Bytes), this.writeRawMessage(i, e) }, writePackedVarint: function (t, i) { this.writeMessage(t, d, i) }, writePackedSVarint: function (t, i) { this.writeMessage(t, p, i) }, writePackedBoolean: function (t, i) { this.writeMessage(t, w, i) }, writePackedFloat: function (t, i) { this.writeMessage(t, c, i) }, writePackedDouble: function (t, i) { this.writeMessage(t, l, i) }, writePackedFixed32: function (t, i) { this.writeMessage(t, F, i) }, writePackedSFixed32: function (t, i) { this.writeMessage(t, b, i) }, writePackedFixed64: function (t, i) { this.writeMessage(t, v, i) }, writePackedSFixed64: function (t, i) { this.writeMessage(t, g, i) }, writeBytesField: function (t, i) { this.writeTag(t, r.Bytes), this.writeBytes(i) }, writeFixed32Field: function (t, i) { this.writeTag(t, r.Fixed32), this.writeFixed32(i) }, writeSFixed32Field: function (t, i) { this.writeTag(t, r.Fixed32), this.writeSFixed32(i) }, writeFixed64Field: function (t, i) { this.writeTag(t, r.Fixed64), this.writeFixed64(i) }, writeSFixed64Field: function (t, i) { this.writeTag(t, r.Fixed64), this.writeSFixed64(i) }, writeVarintField: function (t, i) { this.writeTag(t, r.Varint), this.writeVarint(i) }, writeSVarintField: function (t, i) { this.writeTag(t, r.Varint), this.writeSVarint(i) }, writeStringField: function (t, i) { this.writeTag(t, r.Bytes), this.writeString(i) }, writeFloatField: function (t, i) { this.writeTag(t, r.Fixed32), this.writeFloat(i) }, writeDoubleField: function (t, i) { this.writeTag(t, r.Fixed64), this.writeDouble(i) }, writeBooleanField: function (t, i) { this.writeVarintField(t, Boolean(i)) } } }, { ieee754: 2 }], 2: [function (t, i, e) { e.read = function (t, i, e, r, s) { var n, o, h = 8 * s - r - 1, a = (1 << h) - 1, u = a >> 1, f = -7, d = e ? s - 1 : 0, p = e ? -1 : 1, c = t[i + d]; for (d += p, n = c & (1 << -f) - 1, c >>= -f, f += h; f > 0; n = 256 * n + t[i + d], d += p, f -= 8); for (o = n & (1 << -f) - 1, n >>= -f, f += r; f > 0; o = 256 * o + t[i + d], d += p, f -= 8); if (0 === n) n = 1 - u; else { if (n === a) return o ? NaN : (c ? -1 : 1) * (1 / 0); o += Math.pow(2, r), n -= u } return (c ? -1 : 1) * o * Math.pow(2, n - r) }, e.write = function (t, i, e, r, s, n) { var o, h, a, u = 8 * n - s - 1, f = (1 << u) - 1, d = f >> 1, p = 23 === s ? Math.pow(2, -24) - Math.pow(2, -77) : 0, c = r ? 0 : n - 1, l = r ? 1 : -1, w = i < 0 || 0 === i && 1 / i < 0 ? 1 : 0; for (i = Math.abs(i), isNaN(i) || i === 1 / 0 ? (h = isNaN(i) ? 1 : 0, o = f) : (o = Math.floor(Math.log(i) / Math.LN2), i * (a = Math.pow(2, -o)) < 1 && (o--, a *= 2), i += o + d >= 1 ? p / a : p * Math.pow(2, 1 - d), i * a >= 2 && (o++, a /= 2), o + d >= f ? (h = 0, o = f) : o + d >= 1 ? (h = (i * a - 1) * Math.pow(2, s), o += d) : (h = i * Math.pow(2, d - 1) * Math.pow(2, s), o = 0)); s >= 8; t[e + c] = 255 & h, c += l, h /= 256, s -= 8); for (o = o << s | h, u += s; u > 0; t[e + c] = 255 & o, c += l, o /= 256, u -= 8); t[e + c - l] |= 128 * w } }, {}] }, {}, [1])(1) });

function VectorTile(buffer, end) {

    this.layers = {};
    this._buffer = buffer;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 3) {
            var layer = this.readLayer();
            if (layer.length) this.layers[layer.name] = layer;
        } else {
            buffer.skip(val);
        }
    }
}

VectorTile.prototype.readLayer = function () {
    var buffer = this._buffer,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        layer = new VectorTileLayer(buffer, end);

    buffer.pos = end;

    return layer;
};

function VectorTileFeature(buffer, end, extent, keys, values) {

    this.properties = {};

    // Public
    this.extent = extent;
    this.type = 0;

    // Private
    this._buffer = buffer;
    this._geometry = -1;

    end = end || buffer.length;

    while (buffer.pos < end) {
        var val = buffer.readVarint(),
            tag = val >> 3;

        if (tag == 1) {
            this._id = buffer.readVarint();

        } else if (tag == 2) {
            var tagLen = buffer.readVarint(),
                tagEnd = buffer.pos + tagLen;

            while (buffer.pos < tagEnd) {
                var key = keys[buffer.readVarint()];
                var value = values[buffer.readVarint()];
                this.properties[key] = value;
            }

        } else if (tag == 3) {
            this.type = buffer.readVarint();

        } else if (tag == 4) {
            this._geometry = buffer.pos;
            buffer.skip(val);

        } else {
            buffer.skip(val);
        }
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();

            if (cmd === 1) {
                // moveTo
                if (line) {
                    lines.push(line);
                }
                line = [];
            }

            line.push(new Point(x, y));
        } else if (cmd === 7) {
            // closePolygon
            line.push(line[0].clone());
        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function () {
    var buffer = this._buffer;
    buffer.pos = this._geometry;

    var bytes = buffer.readVarint(),
        end = buffer.pos + bytes,

        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (buffer.pos < end) {
        if (!length) {
            var cmd_length = buffer.readVarint();
            cmd = cmd_length & 0x7;
            length = cmd_length >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += buffer.readSVarint();
            y += buffer.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

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

    var val, tag;

    end = end || buffer.length;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag === 15) {
            this.version = buffer.readVarint();
        } else if (tag === 1) {
            this.name = buffer.readString();
        } else if (tag === 5) {
            this.extent = buffer.readVarint();
        } else if (tag === 2) {
            this.length++;
            this._features.push(buffer.pos);
            buffer.skip(val);

        } else if (tag === 3) {
            this._keys.push(buffer.readString());
        } else if (tag === 4) {
            this._values.push(this.readFeatureValue());
        } else {
            buffer.skip(val);
        }
    }
}

VectorTileLayer.prototype.readFeatureValue = function () {
    var buffer = this._buffer,
        value = null,
        bytes = buffer.readVarint(),
        end = buffer.pos + bytes,
        val, tag;

    while (buffer.pos < end) {
        val = buffer.readVarint();
        tag = val >> 3;

        if (tag == 1) {
            value = buffer.readString();
        } else if (tag == 2) {
            throw new Error('read float');
        } else if (tag == 3) {
            value = buffer.readDouble();
        } else if (tag == 4) {
            value = buffer.readVarint();
        } else if (tag == 5) {
            throw new Error('read uint');
        } else if (tag == 6) {
            value = buffer.readSVarint();
        } else if (tag == 7) {
            value = Boolean(buffer.readVarint());
        } else {
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

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function () { return new Point(this.x, this.y); },

    add: function (p) { return this.clone()._add(p); },
    sub: function (p) { return this.clone()._sub(p); },
    mult: function (k) { return this.clone()._mult(k); },
    div: function (k) { return this.clone()._div(k); },
    rotate: function (a) { return this.clone()._rotate(a); },
    matMult: function (m) { return this.clone()._matMult(m); },
    unit: function () { return this.clone()._unit(); },
    perp: function () { return this.clone()._perp(); },
    round: function () { return this.clone()._round(); },

    mag: function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function (p) {
        return this.x === p.x &&
            this.y === p.y;
    },

    dist: function (p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function (p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function () {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function (b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function (b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
    angleWithSep: function (x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function (m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function (p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function (p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function (k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function (k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _unit: function () {
        this._div(this.mag());
        return this;
    },

    _perp: function () {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function (angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function () {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};
/**
 * Created by Ryan Whitley, Daniel Duarte, and Nicholas Hallahan
 *    on 6/03/14.
 */
//var Util = require('./MVTUtil');
//var StaticLabel = require('./StaticLabel/StaticLabel.js');

//module.exports = MVTFeature;

function MVTFeature(mvtLayer, vtf, ctx, id, style) {
    if (!vtf) return null;

    // Apply all of the properties of vtf to this object.
    for (var key in vtf) {
        this[key] = vtf[key];
    }

    this.mvtLayer = mvtLayer;
    this.mvtSource = mvtLayer.mvtSource;
    this.map = mvtLayer.mvtSource.map;

    this.id = id;

    this.layerLink = this.mvtSource.layerLink;
    this.toggleEnabled = true;
    this.selected = false;

    // how much we divide the coordinate from the vector tile
    this.divisor = vtf.extent / ctx.tileSize;
    this.extent = vtf.extent;
    this.tileSize = ctx.tileSize;

    //An object to store the paths and contexts for this feature
    this.tiles = {};

    this.style = style;

    //Add to the collection
    this.addTileFeature(vtf, ctx);

    var self = this;
    //this.map.on('zoomend', function() {
    //  self.staticLabel = null;
    //});

    //this.map.addListener("zoom_changed", () => {
    //    self.staticLabel = null;
    //});

    //this.globalCompositeOperation = 'source-in';

    if (style && style.dynamicLabel && typeof style.dynamicLabel === 'function') {
        this.dynamicLabel = this.mvtSource.dynamicLabel.createFeature(this);
    }

    ajax(self);
}


function ajax(self) {
    var style = self.style;
    if (style && style.ajaxSource && typeof style.ajaxSource === 'function') {
        var ajaxEndpoint = style.ajaxSource(self);
        if (ajaxEndpoint) {
            Util.getJSON(ajaxEndpoint, function (error, response, body) {
                if (error) {
                    throw ['ajaxSource AJAX Error', error];
                } else {
                    ajaxCallback(self, response);
                    return true;
                }
            });
        }
    }
    return false;
}

function ajaxCallback(self, response) {
    self.ajaxData = response;

    /**
     * You can attach a callback function to a feature in your app
     * that will get called whenever new ajaxData comes in. This
     * can be used to update UI that looks at data from within a feature.
     *
     * setStyle may possibly have a style with a different ajaxData source,
     * and you would potentially get new contextual data for your feature.
     *
     * TODO: This needs to be documented.
     */
    if (typeof self.ajaxDataReceived === 'function') {
        self.ajaxDataReceived(self, response);
    }

    self._setStyle(self.mvtLayer.style);
    redrawTiles(self);
}

MVTFeature.prototype._setStyle = function (styleFn) {
    this.style = styleFn(this, this.ajaxData);

    // The label gets removed, and the (re)draw,
    // that is initiated by the MVTLayer creates a new label.
    this.removeLabel();
};

MVTFeature.prototype.setStyle = function (styleFn) {
    this.ajaxData = null;
    this.style = styleFn(this, null);
    var hasAjaxSource = ajax(this);
    if (!hasAjaxSource) {
        // The label gets removed, and the (re)draw,
        // that is initiated by the MVTLayer creates a new label.
        this.removeLabel();
    }
};

MVTFeature.prototype.draw = function (canvasID, redraw) {
    //Get the info from the tiles list
    var tileInfo = this.tiles[canvasID];    

    var vtf = tileInfo.vtf;
    var ctx = tileInfo.ctx;

    //Get the actual canvas from the parent layer's _tiles object.
    var xy = canvasID.split(":").slice(1, 3).join(":");
    ctx.canvas = this.mvtLayer._tiles[xy];

    //  This could be used to directly compute the style function from the layer on every draw.
    //  This is much less efficient...
    //  this.style = this.mvtLayer.style(this);

    if (this.selected) {
        var style = this.style.selected || this.style;
    } else {
        var style = this.style;
    }
    switch (vtf.type) {
        case 1: //Point
            this._drawPoint(ctx, vtf.coordinates, style, redraw);
            if (!this.staticLabel && typeof this.style.staticLabel === 'function') {
                if (this.style.ajaxSource && !this.ajaxData) {
                    break;
                }
                this._drawStaticLabel(ctx, vtf.coordinates, style);
            }
            break;

        case 2: //LineString
            this._drawLineString(ctx, vtf.coordinates, style, redraw);
            break;

        case 3: //Polygon
            this._drawPolygon(ctx, vtf.coordinates, style, redraw);
            break;

        default:
            throw new Error('Unmanaged type: ' + vtf.type);
    }

};

MVTFeature.prototype.getPathsForTile = function (canvasID) {
    //Get the info from the parts list
    return this.tiles[canvasID].paths;
};

MVTFeature.prototype.addTileFeature = function (vtf, ctx) {
    //Store the important items in the tiles list

    //We only want to store info for tiles for the current map zoom.  If it is tile info for another zoom level, ignore it
    //Also, if there are existing tiles in the list for other zoom levels, expunge them.
    var zoom = this.map.getZoom();

    if (ctx.zoom != zoom) {
        return;
    }
    this.clearTileFeatures(zoom); //TODO: This iterates thru all tiles every time a new tile is added.  Figure out a better way to do this.

    this.tiles[ctx.id] = {
        ctx: ctx,
        vtf: vtf,
        paths: []
    };

};


/**
 * Clear the inner list of tile features if they don't match the given zoom.
 *
 * @param zoom
 */
MVTFeature.prototype.clearTileFeatures = function (zoom) {
    //If stored tiles exist for other zoom levels, expunge them from the list.
    for (var key in this.tiles) {
        if (key.split(":")[0] != zoom) {            
            delete this.tiles[key];
        }
    }
};

/**
 * Redraws all of the tiles associated with a feature. Useful for
 * style change and toggling.
 *
 * @param self
 */
function redrawTiles(self) {
    //Redraw the whole tile, not just this vtf
    var tiles = self.tiles;
    var mvtLayer = self.mvtLayer;
    var mapZoom = self.map.getZoom();
    for (var id in tiles) {
        var tileZoom = parseInt(id.split(':')[0]);
        if (tileZoom === mapZoom) {
            //Redraw the tile
            mvtLayer.clearTile(id);            
            mvtLayer.redrawTile(id);            
        }
    }
}

//function redrawFeatureInAllTiles(self) {
//    //Redraw the whole tile, not just this vtf
//    var tiles = self.tiles;
//    var mvtLayer = self.mvtLayer;
//    var mapZoom = self.map.getZoom();
//    for (var id in tiles) {
//        var tileZoom = parseInt(id.split(':')[0]);
//        if (tileZoom != mapZoom) {
//            continue;
//        }
//        mvtLayer.redrawFeature(id, self);
//    }
//}

MVTFeature.prototype.toggle = function () {
    if (this.selected) {
        this.deselect();
    } else {
        this.select();
    }
};

MVTFeature.prototype.select = function () {
    this.selected = true;
    this.mvtSource.featureSelected(this);
    redrawTiles(this);
    //redrawFeatureInAllTiles(this);
    var linkedFeature = this.linkedFeature();
    if (linkedFeature && linkedFeature.staticLabel && !linkedFeature.staticLabel.selected) {
        linkedFeature.staticLabel.select();
    }
};

MVTFeature.prototype.deselect = function () {
    this.selected = false;
    this.mvtSource.featureDeselected(this);
    redrawTiles(this);
    //redrawFeatureInAllTiles(this);
    var linkedFeature = this.linkedFeature();
    if (linkedFeature && linkedFeature.staticLabel && linkedFeature.staticLabel.selected) {
        linkedFeature.staticLabel.deselect();
    }
};

MVTFeature.prototype.on = function (eventType, callback) {
    this._eventHandlers[eventType] = callback;
};

MVTFeature.prototype._drawPoint = function (ctx, coordsArray, style, redraw) {
    if (!style) return;
    if (!ctx || !ctx.canvas) return;

    var tile = this.tiles[ctx.id];

    //Get radius
    var radius = 1;
    if (typeof style.radius === 'function') {
        radius = style.radius(ctx.zoom); //Allows for scale dependent rednering
    }
    else {
        radius = style.radius;
    }

    var p = this._tilePoint(coordsArray[0][0]);
    var c = ctx.canvas;
    var ctx2d;
    try {
        ctx2d = c.getContext('2d');
    }
    catch (e) {
        console.log("_drawPoint error: " + e);
        return;
    }

    if (redraw)
    {
        ctx2d.globalCompositeOperation = this.globalCompositeOperation;
    } 
    
    ctx2d.beginPath();
    ctx2d.fillStyle = style.color;
    ctx2d.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx2d.closePath();
    ctx2d.fill();

    if (style.lineWidth && style.strokeStyle) {
        ctx2d.lineWidth = style.lineWidth;
        ctx2d.strokeStyle = style.strokeStyle;
        ctx2d.stroke();
    }

    ctx2d.restore();
    tile.paths.push([p]);
};

MVTFeature.prototype._drawLineString = function (ctx, coordsArray, style, redraw) {
    if (!style) return;
    if (!ctx || !ctx.canvas) return;

    var ctx2d = ctx.canvas.getContext('2d');
    if (redraw) {
        ctx2d.globalCompositeOperation = this.globalCompositeOperation;
    }    
    ctx2d.strokeStyle = style.color;
    ctx2d.lineWidth = style.size;
    ctx2d.beginPath();

    var projCoords = [];
    var tile = this.tiles[ctx.id];

    for (var gidx in coordsArray) {
        var coords = coordsArray[gidx];

        for (i = 0; i < coords.length; i++) {
            var method = (i === 0 ? 'move' : 'line') + 'To';
            var proj = this._tilePoint(coords[i]);
            projCoords.push(proj);
            ctx2d[method](proj.x, proj.y);
        }
    }

    ctx2d.stroke();
    ctx2d.restore();

    tile.paths.push(projCoords);
};

MVTFeature.prototype._drawPolygon = function (ctx, coordsArray, style, redraw) {
    if (!style) return;
    if (!ctx || !ctx.canvas) return;
    var ctx2d = ctx.canvas.getContext('2d');

    if (redraw) {
        ctx2d.globalCompositeOperation = this.globalCompositeOperation;
    }
    var outline = style.outline;

    // color may be defined via function to make choropleth work right
    if (typeof style.color === 'function') {
        ctx2d.fillStyle = style.color(ctx2d);
    } else {
        ctx2d.fillStyle = style.color;
    }

    if (outline) {
        ctx2d.strokeStyle = outline.color;
        ctx2d.lineWidth = outline.size;
    }    
    ctx2d.beginPath();

    var projCoords = [];
    var tile = this.tiles[ctx.id];

    var featureLabel = this.dynamicLabel;
    if (featureLabel) {
        featureLabel.addTilePolys(ctx, coordsArray);
    }

    for (var gidx = 0, len = coordsArray.length; gidx < len; gidx++) {
        var coords = coordsArray[gidx];

        for (var i = 0; i < coords.length; i++) {
            var coord = coords[i];
            var method = (i === 0 ? 'move' : 'line') + 'To';
            var proj = this._tilePoint(coords[i]);
            projCoords.push(proj);
            ctx2d[method](proj.x, proj.y);
        }
    }

    ctx2d.closePath();
    ctx2d.fill();
    if (outline) {
        ctx2d.stroke();
    }

    tile.paths.push(projCoords);

};

MVTFeature.prototype._drawStaticLabel = function (ctx, coordsArray, style) {
    if (!style) return;
    if (!ctx) return;

    // If the corresponding layer is not on the map, 
    // we dont want to put on a label.
    if (!this.mvtLayer._map) return;

    var vecPt = this._tilePoint(coordsArray[0][0]);

    // We're making a standard Leaflet Marker for this label.
    var p = this._project(vecPt, ctx.tile.x, ctx.tile.y, this.extent, this.tileSize); //vectile pt to merc pt
    var mercPt = L.point(p.x, p.y); // make into leaflet obj
    var latLng = this.map.unproject(mercPt); // merc pt to latlng

    this.staticLabel = new StaticLabel(this, ctx, latLng, style);
    this.mvtLayer.featureWithLabelAdded(this);
};

MVTFeature.prototype.removeLabel = function () {
    if (!this.staticLabel) return;
    this.staticLabel.remove();
    this.staticLabel = null;
};

/**
 * Projects a vector tile point to the Spherical Mercator pixel space for a given zoom level.
 *
 * @param vecPt
 * @param tileX
 * @param tileY
 * @param extent
 * @param tileSize
 */
MVTFeature.prototype._project = function (vecPt, tileX, tileY, extent, tileSize) {
    var xOffset = tileX * tileSize;
    var yOffset = tileY * tileSize;
    return {
        x: Math.floor(vecPt.x + xOffset),
        y: Math.floor(vecPt.y + yOffset)
    };
};

/**
 * Takes a coordinate from a vector tile and turns it into a Leaflet Point.
 *
 * @param ctx
 * @param coords
 * @returns {eGeomType.Point}
 * @private
 */
MVTFeature.prototype._tilePoint = function (coords) {
    //return new L.Point(coords.x / this.divisor, coords.y / this.divisor);
    return {
        x: coords.x / this.divisor,
        y: coords.y / this.divisor
    };
};

MVTFeature.prototype.linkedFeature = function () {
    var linkedLayer = this.mvtLayer.linkedLayer();
    if (linkedLayer) {
        var linkedFeature = linkedLayer.features[this.id];
        return linkedFeature;
    } else {
        return null;
    }
};


/**
 * Created by Jes�s Barrio on 04/2021.
 */

class MVTLayer {
    constructor(mvtSource, options) {
        this.map = mvtSource.map;
        this.options = {
            debug: false,
            isHiddenLayer: false,
            getIDForLayerFeature: function () { },
            tileSize: 256,
            lineClickTolerance: 2,
            getIDForLayerFeature: options.getIDForLayerFeature || false,
            filter: options.filter || false,
            layerOrdering: options.layerOrdering || false,
            asynch: options.asynch || true
        };
        this._featureIsClicked = {};
        this.mvtSource = mvtSource;
        this.style = options.style;
        this.name = options.name;
        this._canvasIDToFeatures = {};
        this.features = {};
        this.featuresWithLabels = [];
        this._highestCount = 0;
        this._tiles = [];
    }

    // todo: sometimes it does not work properly
    _isPointInPoly(pt, poly) {
        if (poly && poly.length) {
            for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
                ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
                    && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
                    && (c = !c);
            }                
            return c;
        }
    }

    _getDistanceFromLine(pt, pts) {
        var min = Number.POSITIVE_INFINITY;
        if (pts && pts.length > 1) {
            pt = L.point(pt.x, pt.y);
            for (var i = 0, l = pts.length - 1; i < l; i++) {
                var test = this._projectPointOnLineSegment(pt, pts[i], pts[i + 1]);
                if (test.distance <= min) {
                    min = test.distance;
                }
            }
        }
        return min;
    }

    _projectPointOnLineSegment(p, r0, r1) {
        var lineLength = r0.distanceTo(r1);
        if (lineLength < 1) {
            return { distance: p.distanceTo(r0), coordinate: r0 };
        }
        var u = ((p.x - r0.x) * (r1.x - r0.x) + (p.y - r0.y) * (r1.y - r0.y)) / Math.pow(lineLength, 2);
        if (u < 0.0000001) {
            return { distance: p.distanceTo(r0), coordinate: r0 };
        }
        if (u > 0.9999999) {
            return { distance: p.distanceTo(r1), coordinate: r1 };
        }
        var a = L.point(r0.x + u * (r1.x - r0.x), r0.y + u * (r1.y - r0.y));
        return { distance: p.distanceTo(a), point: a };
    }

    //onAdd(map) {
    //    var self = this;
    //    self.map = map;
    //    L.TileLayer.Canvas.prototype.onAdd.call(this, map);
    //    map.on('layerremove', function (e) {
    //        // we only want to do stuff when the layerremove event is on this layer
    //        if (e.layer._leaflet_id === self._leaflet_id) {
    //            removeLabels(self);
    //        }
    //    });
    //}

    //drawTile(canvas, tilePoint, zoom) {

    //    var ctx = {
    //        canvas: canvas,
    //        tile: tilePoint,
    //        zoom: zoom,
    //        tileSize: this.options.tileSize
    //    };

    //    ctx.id = Util.getContextID(ctx);

    //    if (!this._canvasIDToFeatures[ctx.id]) {
    //        this._initializeFeaturesHash(ctx);
    //    }
    //    if (!this.features) {
    //        this.features = {};
    //    }
    //}

    _initializeFeaturesHash(ctx) {
        this._canvasIDToFeatures[ctx.id] = {};
        this._canvasIDToFeatures[ctx.id].features = [];
        this._canvasIDToFeatures[ctx.id].canvas = ctx.canvas;
    }

    //_draw(ctx) {
    //    //Draw is handled by the parent MVTSource object
    //}

    getCanvas(parentCtx) {
        //This gets called if a vector tile feature has already been parsed.
        //We've already got the geom, just get on with the drawing.
        //Need a way to pluck a canvas element from this layer given the parent layer's id.
        //Wait for it to get loaded before proceeding.
        var tilePoint = parentCtx.tile;
        var ctx = this._tiles[tilePoint.x + ":" + tilePoint.y];

        if (ctx) {
            parentCtx.canvas = ctx;
            this.redrawTile(parentCtx.id);
            return;
        }

        var self = this;

        ctx = self._tiles[tilePoint.x + ":" + tilePoint.y];
        parentCtx.canvas = ctx;
        self.redrawTile(parentCtx.id);

        ////This is a timer that will wait for a criterion to return true.
        ////If not true within the timeout duration, it will move on.
        //waitFor(function () {
        //    ctx = self._tiles[tilePoint.x + ":" + tilePoint.y];
        //    if (ctx) {
        //        return true;
        //    }
        //},
        //    function () {
        //        //When it finishes, do this.
        //        ctx = self._tiles[tilePoint.x + ":" + tilePoint.y];
        //        parentCtx.canvas = ctx;
        //        self.redrawTile(parentCtx.id);

        //    }, //when done, go to next flow
        //    2000); //The Timeout milliseconds.  After this, give up and move on

    }

    parseVectorTileLayer(vtl, ctx) {
        var self = this;
        var tilePoint = ctx.tile;
        var layerCtx = { canvas: null, id: ctx.id, tile: ctx.tile, zoom: ctx.zoom, tileSize: ctx.tileSize };

        //See if we can pluck the child tile from this PBF tile layer based on the master layer's tile id.
        self._tiles[tilePoint.x + ":" + tilePoint.y] = ctx.canvas;
        layerCtx.canvas = self._tiles[tilePoint.x + ":" + tilePoint.y];
        //layerCtx.canvas = ctx.canvas;

        //Initialize this tile's feature storage hash, if it hasn't already been created.  Used for when filters are updated, and features are cleared to prepare for a fresh redraw.
       
        if (!this._canvasIDToFeatures[layerCtx.id]) {
            this._initializeFeaturesHash(layerCtx);
        } else {
            //Clear this tile's previously saved features.
            this.clearTileFeatureHash(layerCtx.id);
        }

        var features = vtl.parsedFeatures;
        for (var i = 0, len = features.length; i < len; i++) {
            var vtf = features[i]; //vector tile feature
            vtf.layer = vtl;

            //if(vtf.properties.id != 135){
            //    continue;
            //}


            /**
            * Apply filter on feature if there is one. Defined in the options object
            * of TileLayer.MVTSource.js
            */
            var filter = self.options.filter;
            if (typeof filter === 'function') {
                if (filter(vtf, layerCtx) === false) continue;
            }            

            var getIDForLayerFeature;
            if (typeof self.options.getIDForLayerFeature === 'function') {
                getIDForLayerFeature = self.options.getIDForLayerFeature;
            } else {
                getIDForLayerFeature = Util.getIDForLayerFeature;
            }
            var uniqueID = self.options.getIDForLayerFeature(vtf) || i;            
            var mvtFeature = self.features[uniqueID];

            /**
            * Use layerOrdering function to apply a zIndex property to each vtf.  This is defined in
            * TileLayer.MVTSource.js.  Used below to sort features.npm
            */
            var layerOrdering = self.options.layerOrdering;
            if (typeof layerOrdering === 'function') {
                layerOrdering(vtf, layerCtx); //Applies a custom property to the feature, which is used after we're thru iterating to sort
            }

            //Create a new MVTFeature if one doesn't already exist for this feature.            
            if (!mvtFeature) {
                //Get a style for the feature - set it just once for each new MVTFeature
                var style = self.style(vtf);

                //create a new feature
                self.features[uniqueID] = mvtFeature = new MVTFeature(self, vtf, layerCtx, uniqueID, style);
                if (style && style.dynamicLabel && typeof style.dynamicLabel === 'function') {
                    self.featuresWithLabels.push(mvtFeature);
                }
            } else {
                //Add the new part to the existing feature
                mvtFeature.addTileFeature(vtf, layerCtx);
            }

            //Associate & Save this feature with this tile for later
            if (layerCtx && layerCtx.id) self._canvasIDToFeatures[layerCtx.id]['features'].push(mvtFeature);

        }

        /**
            * Apply sorting (zIndex) on feature if there is a function defined in the options object
            * of TileLayer.MVTSource.js
            */
        var layerOrdering = self.options.layerOrdering;
        if (layerOrdering) {
            //We've assigned the custom zIndex property when iterating above.  Now just sort.
            self._canvasIDToFeatures[layerCtx.id].features = self._canvasIDToFeatures[layerCtx.id].features.sort(function (a, b) {
                return -(b.properties.zIndex - a.properties.zIndex)
            });
        }
        self.redrawTile(layerCtx.id);
    }

    setStyle(styleFn) {
        // refresh the number for the highest count value
        // this is used only for choropleth
        this._highestCount = 0;

        // lowest count should not be 0, since we want to figure out the lowest
        this._lowestCount = null;

        this.style = styleFn;
        for (var key in this.features) {
            var feat = this.features[key];
            feat.setStyle(styleFn);
        }

        var z = this.map.getZoom();
        for (var key in this._tiles) {
            var id = z + ':' + key;
            this.redrawTile(id);
        }
    }

    /**
    * As counts for choropleths come in with the ajax data,
    * we want to keep track of which value is the highest
    * to create the color ramp for the fills of polygons.
    * @param count
    */
    setHighestCount(count) {
        if (count > this._highestCount) {
            this._highestCount = count;
        }
    }

    /**
    * Returns the highest number of all of the counts that have come in
    * from setHighestCount. This is assumed to be set via ajax callbacks.
    * @returns {number}
    */
    getHighestCount() {
        return this._highestCount;
    }

    setLowestCount(count) {
        if (!this._lowestCount || count < this._lowestCount) {
            this._lowestCount = count;
        }
    }

    getLowestCount() {
        return this._lowestCount;
    }

    setCountRange(count) {
        this.setHighestCount(count);
        this.setLowestCount(count);
    }

    //This is the old way.  It works, but is slow for mouseover events.  Fine for click events.
    handleClickEvent(evt, cb) {
        //Click happened on the GroupLayer (Manager) and passed it here
        var tileID = evt.tileID.split(":").slice(1, 3).join(":");
        var zoom = evt.tileID.split(":")[0];
        var canvas = this._tiles[tileID];
        if (!canvas) {
            //break out
            cb(evt);
            return;
        }

        var tilePoint = evt.tilePoint;        
        var features = this._canvasIDToFeatures[evt.tileID].features;

        var minDistance = Number.POSITIVE_INFINITY;
        var nearest = null;
        var j, paths, distance;

        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            switch (feature.type) {

                case 1: //Point - currently rendered as circular paths.  Intersect with that.

                    //Find the radius of the point.
                    var radius = 3;
                    if (typeof feature.style.radius === 'function') {
                        radius = feature.style.radius(zoom); //Allows for scale dependent rednering
                    }
                    else {
                        radius = feature.style.radius;
                    }

                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        //Builds a circle of radius feature.style.radius (assuming circular point symbology).
                        if (in_circle(paths[j][0].x, paths[j][0].y, radius, x, y)) {
                            nearest = feature;
                            minDistance = 0;
                        }
                    }
                    break;

                case 2: //LineString
                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        if (feature.style) {
                            var distance = this._getDistanceFromLine(tilePoint, paths[j]);
                            var thickness = (feature.selected && feature.style.selected ? feature.style.selected.size : feature.style.size);
                            if (distance < thickness / 2 + this.options.lineClickTolerance && distance < minDistance) {
                                nearest = feature;
                                minDistance = distance;
                            }
                        }
                    }
                    break;

                case 3: //Polygon
                    paths = feature.getPathsForTile(evt.tileID);
                    for (j = 0; j < paths.length; j++) {
                        if (this._isPointInPoly(tilePoint, paths[j])) {
                            nearest = feature;
                            minDistance = 0; // point is inside the polygon, so distance is zero
                        }
                    }
                    break;
            }
            if (minDistance == 0) break;
        }

        if (nearest && nearest.toggleEnabled) {
            nearest.toggle();
        }
        //else {
        //    return;
        //}
        
        evt.feature = nearest;
        cb(evt);
    }

    _drawSmallDot(canvas, x, y) {
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, 2 * Math.PI);
        ctx.fill();
    }

    clearTile(id, ctx) {
        //id is the entire zoom:x:y.  we just want x:y.
        var ca = id.split(":");
        var canvasId = ca[1] + ":" + ca[2];
        if (typeof this._tiles[canvasId] === 'undefined') {
            console.error("typeof this._tiles[canvasId] === 'undefined'");
            return;
        }
        var canvas = this._tiles[canvasId];

        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);        
    }

    clearTileFeatureHash(canvasID) {
        this._canvasIDToFeatures[canvasID] = { features: [] }; //Get rid of all saved features
    }

    clearLayerFeatureHash() {
        this.features = {};
    }

    redrawTile(canvasID) {
        //First, clear the canvas
        //this.clearTile(canvasID);
        

        // If the features are not in the tile, then there is nothing to redraw.
        // This may happen if you call redraw before features have loaded and initially
        // drawn the tile.
        var featfeats = this._canvasIDToFeatures[canvasID];
        if (!featfeats) {            
            return;
        }

        //Get the features for this tile, and redraw them.
        var features = featfeats.features;

        // we want to skip drawing the selected features and draw them last
        var selectedFeatures = [];

        // drawing all of the non-selected features        
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            if (feature.selected) {
                selectedFeatures.push(feature);
            } else {
                feature.draw(canvasID);
            }
        }

        // drawing the selected features last
        for (var j = 0, len2 = selectedFeatures.length; j < len2; j++) {
            var selFeat = selectedFeatures[j];
            selFeat.draw(canvasID);
        }
    }

    //redrawFeature(canvasID,  mvtFeature) {
    //    var featfeats = this._canvasIDToFeatures[canvasID];
    //    if (!featfeats) {
    //        return;
    //    }
    //    var features = featfeats.features;
    //    for (var i = 0; i < features.length; i++) {
    //        var feature = features[i];
    //        if (feature === mvtFeature) {
    //            feature.draw(canvasID, true);
    //        }
    //    }
    //}

    _resetCanvasIDToFeatures(canvasID, canvas) {

        this._canvasIDToFeatures[canvasID] = {};
        this._canvasIDToFeatures[canvasID].features = [];
        this._canvasIDToFeatures[canvasID].canvas = canvas;

    }

    linkedLayer() {
        if (this.mvtSource.layerLink) {
            var linkName = this.mvtSource.layerLink(this.name);
            return this.mvtSource.layers[linkName];
        }
        else {
            return null;
        }
    }

    featureWithLabelAdded(feature) {
        this.featuresWithLabels.push(feature);
    }
};


function removeLabels(self) {
    var features = self.featuresWithLabels;
    for (var i = 0, len = features.length; i < len; i++) {
        var feat = features[i];
        feat.removeLabel();
    }
    self.featuresWithLabels = [];
}

function in_circle(center_x, center_y, radius, x, y) {
    var square_dist = Math.pow((center_x - x), 2) + Math.pow((center_y - y), 2);
    return square_dist <= Math.pow(radius, 2);
}
/**
 * See https://github.com/ariya/phantomjs/blob/master/examples/waitfor.js
 *
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()), //< defensive code
        interval = setInterval(function () {
            if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof (testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if (!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    clearInterval(interval); //< Stop this interval
                    typeof (onReady) === "string" ? eval(onReady) : onReady('timeout'); //< Do what it's supposed to do once the condition is fulfilled
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    clearInterval(interval); //< Stop this interval
                    typeof (onReady) === "string" ? eval(onReady) : onReady('success'); //< Do what it's supposed to do once the condition is fulfilled
                }
            }
        }, 50); //< repeat check every 50ms
};
class MVTSource {
    constructor(map, options) {
        var self = this;
        this.map = map;
        this.options = {
            debug: options.debug || false,
            url: options.url || "", //URL TO Vector Tile Source,
            getIDForLayerFeature: options.getIDForLayerFeature || function () { },
            tileSize: options.tileSize || 256,
            visibleLayers: options.visibleLayers || [],
            xhrHeaders: {},
            clickableLayers: options.clickableLayers || false,            
            filter: options.filter || false,
            mutexToggle: options.mutexToggle || false
        };
        
        this.tileSize = new google.maps.Size(this.options.tileSize, this.options.tileSize);
        this.layers = {}; //Keep a list of the layers contained in the PBFs
        //this.processedTiles = {}; //Keep a list of tiles that have been processed already
        this._eventHandlers = {};
        this._triggerOnTilesLoadedEvent = true; //whether or not to fire the onTilesLoaded event when all of the tiles finish loading.
        this._url = this.options.url;


        // tiles currently in the viewport
        this.activeTiles = {};

        // thats that have been loaded and drawn
        this.loadedTiles = {};

        /**
         * For some reason, Leaflet has some code that resets the
         * z index in the options object. I'm having trouble tracking
         * down exactly what does this and why, so for now, we should
         * just copy the value to this.zIndex so we can have the right
         * number when we make the subsequent MVTLayers.
         */
        this.zIndex = this.options.zIndex;

        if (typeof options.style === 'function') {
            this.style = options.style;
        }

        if (typeof options.ajaxSource === 'function') {
            this.ajaxSource = options.ajaxSource;
        }

        this.layerLink = options.layerLink;
        this._eventHandlers = {};
        //this._tilesToProcess = 0; //store the max number of tiles to be loaded.  Later, we can use this count to count down PBF loading.

        //this.map.addListener("click", function(e) {
        //    self._onClick(e);
        //});
    }

    getTile(coord, zoom, ownerDocument) {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = this.tileSize.width;
        canvas.height = this.tileSize.height;
        var tilePoint = {
            x: coord.x,
            y: coord.y
        }
        this.drawTile(canvas, tilePoint, zoom);
        return canvas;
    }

    releaseTile(tile) {
    }


    style(feature) {
        var style = {};

        var type = feature.type;
        switch (type) {
            case 1: //'Point'
                style.color = 'rgba(49,79,79,1)';
                style.radius = 5;
                style.selected = {
                    color: 'rgba(255,255,0,0.5)',
                    radius: 6
                };
                break;
            case 2: //'LineString'
                style.color = 'rgba(161,217,155,0.8)';
                style.size = 3;
                style.selected = {
                    color: 'rgba(255,25,0,0.5)',
                    size: 4
                };
                break;
            case 3: //'Polygon'
                style.color = 'rgba(49,79,79,1)';
                style.outline = {
                    color: 'rgba(161,217,155,0.8)',
                    size: 1
                };
                style.selected = {
                    color: 'rgba(255,140,0,0.3)',
                    outline: {
                        color: 'rgba(255,140,0,1)',
                        size: 2
                    }
                };
                break;
        }
        return style;
    }


    //onAdd(map) {
    //    console.log("onadd")
    //    var self = this;
    //    self.map = map;
    //    L.TileLayer.Canvas.prototype.onAdd.call(this, map);

    //    var mapOnClickCallback = function (e) {
    //        self._onClick(e);
    //    };

    //    map.on('click', mapOnClickCallback);

    //    map.on("layerremove", function (e) {
    //        // check to see if the layer removed is this one
    //        // call a method to remove the child layers (the ones that actually have something drawn on them).
    //        if (e.layer._leaflet_id === self._leaflet_id && e.layer.removeChildLayers) {
    //            e.layer.removeChildLayers(map);
    //            map.off('click', mapOnClickCallback);
    //        }
    //    });

    //    self.addChildLayers(map);

    //    if (typeof DynamicLabel === 'function') {
    //        this.dynamicLabel = new DynamicLabel(map, this, {});
    //    }

    //}

    drawTile(canvas, tilePoint, zoom) {
        var ctx = {
            id: [zoom, tilePoint.x, tilePoint.y].join(":"),
            canvas: canvas,
            tile: tilePoint,
            zoom: zoom,
            tileSize: this.options.tileSize
        };

        //Capture the max number of the tiles to load here. this._tilesToProcess is an internal number we use to know when we've finished requesting PBFs.
        //if (this._tilesToProcess < this._tilesToLoad) {
        //    this._tilesToProcess = this._tilesToLoad;
        //}

        var id = ctx.id = Util.getContextID(ctx);
        this.activeTiles[id] = ctx;

        //if (!this.processedTiles[ctx.zoom]) {
        //    this.processedTiles[ctx.zoom] = {};
        //}

        this.drawDebugInfo(ctx);
        this._draw(ctx);        
    }

    setOpacity(opacity) {
        this._setVisibleLayersStyle('opacity', opacity);
    }

    setZIndex(zIndex) {
        this._setVisibleLayersStyle('zIndex', zIndex);
    }

    _setVisibleLayersStyle(style, value) {
        for (var key in this.layers) {
            this.layers[key]._tileContainer.style[style] = value;
        }
    }

    drawDebugInfo(ctx) {
        if (this.options.debug) {
            this._drawDebugInfo(ctx);
        }
    }
    _drawDebugInfo(ctx) {
        var max = this.options.tileSize;
        var g = ctx.canvas.getContext('2d');
        g.strokeStyle = '#000000';
        g.fillStyle = '#FFFF00';
        g.strokeRect(0, 0, max, max);
        g.font = "12px Arial";
        g.fillRect(0, 0, 5, 5);
        g.fillRect(0, max - 5, 5, 5);
        g.fillRect(max - 5, 0, 5, 5);
        g.fillRect(max - 5, max - 5, 5, 5);
        g.fillRect(max / 2 - 5, max / 2 - 5, 10, 10);
        g.strokeText(ctx.zoom + ' ' + ctx.tile.x + ' ' + ctx.tile.y, max / 2 - 30, max / 2 - 10);
    }

    _draw(ctx) {
        var self = this;

        //    //This works to skip fetching and processing tiles if they've already been processed.
        //    var vectorTile = this.processedTiles[ctx.zoom][ctx.id];
        //    //if we've already parsed it, don't get it again.
        //    if(vectorTile){
        //      console.log("Skipping fetching " + ctx.id);
        //      self.checkVectorTileLayers(parseVT(vectorTile), ctx, true);
        //      self.reduceTilesToProcessCount();
        //      return;
        //    }

        if (!this._url) return;
        var src = this._url
            .replace("{z}", ctx.zoom)
            .replace("{x}", ctx.tile.x)
            .replace("{y}", ctx.tile.y);

        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            if (xhr.status == "200") {
                if (!xhr.response) return;

                var arrayBuffer = new Uint8Array(xhr.response);
                var buf = new Pbf(arrayBuffer);
                var vt = new VectorTile(buf);
                //Check the current map layer zoom.  If fast zooming is occurring, then short circuit tiles that are for a different zoom level than we're currently on.
                if (self.map && self.map.getZoom() != ctx.zoom) {
                    return;
                }

                var vt = parseVT(vt);   
                self.checkVectorTileLayers(vt, ctx);
                //tileLoaded(self, ctx);
            }
           
            //either way, reduce the count of tilesToProcess tiles here
            //self.reduceTilesToProcessCount();
        };

        xhr.onerror = function () {
            console.log("xhr error: " + xhr.status)
        };

        xhr.open('GET', src, true); //async is true
        var headers = self.options.xhrHeaders;
        for (var header in headers) {
            xhr.setRequestHeader(header, headers[header])
        }
        xhr.responseType = 'arraybuffer';
        xhr.send();
    }

    //reduceTilesToProcessCount() {
    //    this._tilesToProcess--;        
    //    if (!this._tilesToProcess) {
    //        //Trigger event letting us know that all PBFs have been loaded and processed (or 404'd).
    //        if (this._eventHandlers["PBFLoad"]) this._eventHandlers["PBFLoad"]();
    //        this._pbfLoaded();
    //    }
    //}

    checkVectorTileLayers(vt, ctx, parsed) {
        var self = this;
        //Check if there are specified visible layers        
        if (self.options.visibleLayers && self.options.visibleLayers.length > 0) {
            //only let thru the layers listed in the visibleLayers array
            for (var i = 0; i < self.options.visibleLayers.length; i++) {
                var layerName = self.options.visibleLayers[i];
                if (vt.layers[layerName]) {
                    //Proceed with parsing
                    self.prepareMVTLayers(vt.layers[layerName], layerName, ctx, parsed);
                }
            }
        } else {
            //Parse all vt.layers
            for (var key in vt.layers) {
                self.prepareMVTLayers(vt.layers[key], key, ctx, parsed);
            }
        }
    }

    prepareMVTLayers(lyr, key, ctx, parsed) {
        var self = this;

        if (!self.layers[key]) {
            //Create MVTLayer or MVTPointLayer for user
            self.layers[key] = self.createMVTLayer(key, lyr.parsedFeatures[0].type || null);
        }
        if (parsed) {
            //We've already parsed it.  Go get canvas and draw.
            self.layers[key].getCanvas(ctx, lyr);
        } else {
            self.layers[key].parseVectorTileLayer(lyr, ctx);
        }
    }

    createMVTLayer(key, type) {
        var self = this;

        var getIDForLayerFeature;
        if (typeof self.options.getIDForLayerFeature === 'function') {
            getIDForLayerFeature = self.options.getIDForLayerFeature;
        } else {
            getIDForLayerFeature = Util.getIDForLayerFeature;
        }

        var options = {
            getIDForLayerFeature: getIDForLayerFeature,
            filter: self.options.filter,
            layerOrdering: self.options.layerOrdering,
            style: self.style,
            name: key,
            asynch: true
        };        

        if (self.options.zIndex) {
            options.zIndex = self.zIndex;
        }

        //Take the layer and create a new MVTLayer or MVTPointLayer if one doesn't exist.
        //var layer = new MVTLayer(self, options).addTo(self.map);
        var layer = new MVTLayer(self, options);

        return layer;
    }

    getLayers() {
        return this.layers;
    }

    hideLayer(id) {
        if (this.layers[id]) {
            this.map.removeLayer(this.layers[id]);
            if (this.options.visibleLayers.indexOf("id") > -1) {
                this.visibleLayers.splice(this.options.visibleLayers.indexOf("id"), 1);
            }
        }
    }

    showLayer(id) {
        if (this.layers[id]) {
            this.map.addLayer(this.layers[id]);
            if (this.options.visibleLayers.indexOf("id") == -1) {
                this.visibleLayers.push(id);
            }
        }
        //Make sure manager layer is always in front
        this.bringToFront();
    }

    removeChildLayers(map) {
        //Remove child layers of this group layer
        for (var key in this.layers) {
            var layer = this.layers[key];
            map.removeLayer(layer);
        }
    }

    addChildLayers(map) {
        var self = this;
        if (self.options.visibleLayers.length > 0) {
            //only let thru the layers listed in the visibleLayers array
            for (var i = 0; i < self.options.visibleLayers.length; i++) {
                var layerName = self.options.visibleLayers[i];
                var layer = this.layers[layerName];
                if (layer) {
                    //Proceed with parsing
                    map.addLayer(layer);
                }
            }
        } else {
            //Add all layers
            for (var key in this.layers) {
                var layer = this.layers[key];
                // layer is set to visible and is not already on map
                if (!layer.map) {
                    map.addLayer(layer);
                }
            }
        }
    }

    bind(eventType, callback) {
        this._eventHandlers[eventType] = callback;
    }

    onClick(evt, callbackFunction) {
        //Here, pass the event on to the child MVTLayer and have it do the hit test and handle the result.
        var self = this;
        
        var clickableLayers = self.options.clickableLayers;
        var layers = self.layers;
        var zoom = this.map.getZoom();

        evt.tileID = getTileURL(evt.latLng, zoom, this.options.tileSize);
        evt.tilePoint = MERCATOR.fromLatLngToTilePoint(map, evt, zoom);
        
        // We must have an array of clickable layers, otherwise, we just pass
        // the event to the public onClick callback in options.

        if (!clickableLayers) {
            clickableLayers = Object.keys(self.layers);
            
        }
        if (clickableLayers && clickableLayers.length > 0) {
            for (var i = 0, len = clickableLayers.length; i < len; i++) {
                var key = clickableLayers[i];
                var layer = layers[key];
                if (layer) {
                    layer.handleClickEvent(evt, function (evt) {
                        if (typeof callbackFunction === 'function') {
                            callbackFunction(evt);
                        }
                    });
                }
            }
        } else {
            if (typeof callbackFunction === 'function') {
                callbackFunction(evt);
            }
        }
    }

    setFilter(filterFunction, layerName) {
        //take in a new filter function.
        //Propagate to child layers.

        //Add filter to all child layers if no layer is specified.
        for (var key in this.layers) {
            var layer = this.layers[key];

            if (layerName) {
                if (key.toLowerCase() == layerName.toLowerCase()) {
                    layer.options.filter = filterFunction; //Assign filter to child layer, only if name matches
                    //After filter is set, the old feature hashes are invalid.  Clear them for next draw.
                    layer.clearLayerFeatureHash();
                    //layer.clearTileFeatureHash();
                }
            }
            else {
                layer.options.filter = filterFunction; //Assign filter to child layer
                //After filter is set, the old feature hashes are invalid.  Clear them for next draw.
                layer.clearLayerFeatureHash();
                //layer.clearTileFeatureHash();
            }
        }
    }

    /**
     * Take in a new style function and propogate to child layers.
     * If you do not set a layer name, it resets the style for all of the layers.
     * @param styleFunction
     * @param layerName
     */
    setStyle(styleFn, layerName) {
        for (var key in this.layers) {
            var layer = this.layers[key];
            if (layerName) {
                if (key.toLowerCase() == layerName.toLowerCase()) {
                    layer.setStyle(styleFn);
                }
            } else {
                layer.setStyle(styleFn);
            }
        }
    }

    deselectFeature() {
        if (this._selectedFeature) {
            this._selectedFeature.deselect();
            this._selectedFeature = false;
        }        
    }

    featureSelected(mvtFeature) {
        if (this.options.mutexToggle) {
            if (this._selectedFeature) {
                this._selectedFeature.deselect();
            }
            this._selectedFeature = mvtFeature;
        }
        if (this.options.onSelect) {
            this.options.onSelect(mvtFeature);
        }
    }

    featureDeselected(mvtFeature) {
        if (this.options.mutexToggle && this._selectedFeature) {
            this._selectedFeature = null;
        }
        if (this.options.onDeselect) {
            this.options.onDeselect(mvtFeature);
        }
    }

    //_pbfLoaded() {
    //    //Fires when all tiles from this layer have been loaded and drawn (or 404'd).

    //    //Make sure manager layer is always in front
    //    this.bringToFront();

    //    //See if there is an event to execute
    //    var self = this;
    //    var onTilesLoaded = self.options.onTilesLoaded;

    //    if (onTilesLoaded && typeof onTilesLoaded === 'function' && this._triggerOnTilesLoadedEvent === true) {
    //        onTilesLoaded(this);
    //    }
    //    self._triggerOnTilesLoadedEvent = true; //reset - if redraw() is called with the optinal 'false' parameter to temporarily disable the onTilesLoaded event from firing.  This resets it back to true after a single time of firing as 'false'.
    //}
}


if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

//function getTileURL(lat, lon, zoom) {
//    var xtile = parseInt(Math.floor((lon + 180) / 360 * (1 << zoom)));
//    var ytile = parseInt(Math.floor((1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1 << zoom)));
//    return "" + zoom + ":" + xtile + ":" + ytile;
//}

function getTileURL(latLng, zoom, tile_size) {
    const worldCoordinate = project(latLng, tile_size);
    const scale = 1 << zoom;
    const tileCoordinate = new google.maps.Point(
        Math.floor((worldCoordinate.x * scale) / tile_size),
        Math.floor((worldCoordinate.y * scale) / tile_size)
    );
    return "" + zoom + ":" + tileCoordinate.x + ":" + tileCoordinate.y;
}

function project(latLng, tile_size) {
    let siny = Math.sin((latLng.lat() * Math.PI) / 180);
    siny = Math.min(Math.max(siny, -0.9999), 0.9999);
    return new google.maps.Point(
        tile_size * (0.5 + latLng.lng() / 360),
        tile_size * (0.5 - Math.log((1 + siny) / (1 - siny)) / (4 * Math.PI))
    );
}

function tileToLatLng(x , y ,z) {
    var long = tile2long(x, z);
    var lat = tile2long(y, z);
    return {
        lat: lat, long: long
    }
}

function tile2long(x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
}

function tile2lat(y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

//function tileLoaded(pbfSource, ctx) {
//    pbfSource.loadedTiles[ctx.id] = ctx;
//}

function parseVT(vt) {
    for (var key in vt.layers) {
        var lyr = vt.layers[key];
        parseVTFeatures(lyr);
    }
    return vt;
}

function parseVTFeatures(vtl) {
    vtl.parsedFeatures = [];
    var features = vtl._features;
    for (var i = 0, len = features.length; i < len; i++) {
        var vtf = vtl.feature(i);
        vtf.coordinates = vtf.loadGeometry();
        vtl.parsedFeatures.push(vtf);
    }
    return vtl;
}
/**
 * Created by Nicholas Hallahan <nhallahan@spatialdev.com>
 *       on 8/15/14.
 */


function Util() {

}

Util.getContextID = function(ctx) {
  return [ctx.zoom, ctx.tile.x, ctx.tile.y].join(":");
};

/**
 * Default function that gets the id for a layer feature.
 * Sometimes this needs to be done in a different way and
 * can be specified by the user in the options for L.TileLayer.MVTSource.
 *
 * @param feature
 * @returns {ctx.id|*|id|string|jsts.index.chain.MonotoneChain.id|number}
 */
Util.getIDForLayerFeature = function(feature) {
  return feature.properties.id;
};

Util.getJSON = function(url, callback) {
  var xmlhttp = typeof XMLHttpRequest !== 'undefined' ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xmlhttp.onreadystatechange = function() {
    var status = xmlhttp.status;
    if (xmlhttp.readyState === 4 && status >= 200 && status < 300) {
      var json = JSON.parse(xmlhttp.responseText);
      callback(null, json);
    } else {
      callback( { error: true, status: status } );
    }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

MERCATOR = {
    fromLatLngToPoint: function (latLng) {
        var siny = Math.min(Math.max(Math.sin(latLng.lat() * (Math.PI / 180)),
            -.9999),
            .9999);
        return {
            x: 128 + latLng.lng() * (256 / 360),
            y: 128 + 0.5 * Math.log((1 + siny) / (1 - siny)) * -(256 / (2 * Math.PI))
        };
    },

    fromPointToLatLng: function (point) {
        return {
            lat: (2 * Math.atan(Math.exp((point.y - 128) / -(256 / (2 * Math.PI)))) -
                Math.PI / 2) / (Math.PI / 180),
            lng: (point.x - 128) / (256 / 360)
        };

    },

    getTileAtLatLng: function (latLng, zoom) {
        var t = Math.pow(2, zoom),
            s = 256 / t,
            p = this.fromLatLngToPoint(latLng);        
        return {
            x: Math.floor(p.x / s),
            y: Math.floor(p.y / s),
            z: zoom
        };
    },

    getTileBounds: function (tile) {
        tile = this.normalizeTile(tile);
        var t = Math.pow(2, tile.z),
            s = 256 / t,
            sw = {
                x: tile.x * s,
                y: (tile.y * s) + s
            },
            ne = {
                x: tile.x * s + s,
                y: (tile.y * s)
            };
        return {
            sw: this.fromPointToLatLng(sw),
            ne: this.fromPointToLatLng(ne)
        }
    },

    normalizeTile: function (tile) {
        var t = Math.pow(2, tile.z);
        tile.x = ((tile.x % t) + t) % t;
        tile.y = ((tile.y % t) + t) % t;
        return tile;
    },

    fromLatLngToPixels: function (map, latLng) {
        var bounds = map.getBounds();
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        var topRight = map.getProjection().fromLatLngToPoint(ne);
        var bottomLeft = map.getProjection().fromLatLngToPoint(sw);
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    },

    fromLatLngToTilePoint: function (map, evt, zoom) {
        var tile = this.getTileAtLatLng(evt.latLng, zoom);
        var tileBounds = this.getTileBounds(tile);
        var tileSwLatLng = new google.maps.LatLng(tileBounds.sw);
        var tileNeLatLng = new google.maps.LatLng(tileBounds.ne);
        var tileSwPixels = this.fromLatLngToPixels(map, tileSwLatLng);        
        var tileNePixels = this.fromLatLngToPixels(map, tileNeLatLng);         
        return {
            x: evt.pixel.x - tileSwPixels.x,
            y: evt.pixel.y - tileNePixels.y
        }
    }
}