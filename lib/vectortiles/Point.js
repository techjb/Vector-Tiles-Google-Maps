function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.clone = function () {
    return new Point(this.x, this.y);
};

Point.prototype.add = function (p) {
    return new Point(this.x + p.x, this.y + p.y);
};

Point.prototype.sub = function (p) {
    return new Point(this.x - p.x, this.y - p.y);
};

Point.prototype.mult = function (k) {
    return new Point(this.x * k, this.y * k);
};

Point.prototype.div = function (k) {
    return new Point(this.x / k, this.y / k);
};

Point.prototype.rotate = function (a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return new Point(cos * this.x - sin * this.y, sin * this.x + cos * this.y);
};

Point.prototype.matMult = function (m) {
    return new Point(m[0] * this.x + m[1] * this.y, m[2] * this.x + m[3] * this.y);
};

Point.prototype.unit = function () {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    return new Point(this.x / mag, this.y / mag);
};

Point.prototype.perp = function () {
    return new Point(-this.y, this.x);
};

Point.prototype.round = function () {
    return new Point(Math.round(this.x), Math.round(this.y));
};

Point.prototype.mag = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

Point.prototype.equals = function (p) {
    return this.x === p.x && this.y === p.y;
};

Point.prototype.dist = function (p) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
};

Point.prototype.distSqr = function (p) {
    const dx = p.x - this.x;
    const dy = p.y - this.y;
    return dx * dx + dy * dy;
};

Point.prototype.angle = function () {
    return Math.atan2(this.y, this.x);
};

Point.prototype.angleTo = function (b) {
    return Math.atan2(this.y - b.y, this.x - b.x);
};

Point.prototype.angleWith = function (b) {
    return Math.atan2(this.x * b.y - this.y * b.x, this.x * b.x + this.y * b.y);
};

Point.prototype.angleWithSep = function (x, y) {
    return Math.atan2(this.x * y - this.y * x, this.x * x + this.y * y);
};

Point.prototype._matMult = function (m) {
    const x = m[0] * this.x + m[1] * this.y;
    this.y = m[2] * this.x + m[3] * this.y;
    this.x = x;
    return this;
};

Point.prototype._add = function (p) {
    this.x += p.x;
    this.y += p.y;
    return this;
};

Point.prototype._sub = function (p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
};

Point.prototype._mult = function (k) {
    this.x *= k;
    this.y *= k;
    return this;
};

Point.prototype._div = function (k) {
    this.x /= k;
    this.y /= k;
    return this;
};

Point.prototype._unit = function () {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y);
    this.x /= mag;
    this.y /= mag;
    return this;
};

Point.prototype._perp = function () {
    const y = this.y;
    this.y = this.x;
    this.x = -y;
    return this;
};

Point.prototype._rotate = function (angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = cos * this.x - sin * this.y;
    this.y = sin * this.x + cos * this.y;
    this.x = x;
    return this;
};

Point.prototype._round = function () {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
};

Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};