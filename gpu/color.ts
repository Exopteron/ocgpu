function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
export class Vec3 {
    public x: number;
    public y: number;
    public z: number;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    public negate() : Vec3 {
        let x = -this.x;
        let y = -this.y;
        let z = -this.z;
        return new Vec3(x, y, z);
    }
    public multVec(other: Vec3) : Vec3 {
        let x = other.x * this.x;
        let y = other.y * this.y;
        let z = other.z * this.z;
        return new Vec3(x, y, z);
    }
    public add(other: Vec3) : Vec3 {
        let x = other.x + this.x;
        let y = other.y + this.y;
        let z = other.z + this.z;
        return new Vec3(x, y, z);
    }
    public mult(other: number) : Vec3 {
        let x = this.x * other;
        let y = this.y * other;
        let z = this.z * other;
        return new Vec3(x, y, z);

    }
    public div(other: number) : Vec3 {
        let x = this.x / other;
        let y = this.y / other;
        let z = this.z / other;
        return new Vec3(x, y, z);
    }
    public minus(other: Vec3) : Vec3 {
        let x = this.x - other.x;
        let y = this.y - other.y;
        let z = this.z - other.z;
        return new Vec3(x, y, z);
    } 
    public max(other: Vec3) : Vec3 {
        let otherSum = other.x + other.y + other.z;
        let thisSum = this.x + this.y + this.z;
        if (otherSum > thisSum) {
            return other;
        } else {
            return this;
        }
    }
    public mag() : number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    public dot(other: Vec3) : number {
        return (this.x * other.x) + (this.y * other.y) + (this.z * other.z);
    }
    public normalize() : void {
        let m = this.mag();
        if (m > 0) {
            let self = this.div(m);
            this.x = self.x;
            this.y = self.y;
            this.z = self.z;
        }
    }
    public normalized() : Vec3 {
        let self = new Vec3(this.x, this.y, this.z);
        self.normalize();
        return self;
    }
}
export class Color {
    public red: number;
    public green: number;
    public blue: number;
    constructor(red: number, green: number, blue: number) {
        this.red = Math.min(Math.max(red, 0), 255);
        this.green = Math.min(Math.max(green, 0), 255);
        this.blue = Math.min(Math.max(blue, 0), 255);
    }
    public toHex(): number {
        return (Math.floor(this.blue) + (256 * Math.floor(this.green)) + (256 * 256 * Math.floor(this.red)));
    }
    public static fromHex(number: number): Color {
        let red = number / (256 * 256);
        let blue = (number - red * 256 * 256) / 256;
        let green = number % 256;
        return new Color(red, green, blue);
    }
    public clone(): Color {
        return new Color(this.red, this.green, this.blue);
    }
    public static random(): Color {
        return new Color(getRandomInt(255), getRandomInt(255), getRandomInt(255));
    }
}

export class HSVColor {
    public hue: number;
    public saturation: number;
    public value: number;
    constructor(hue: number, saturation: number, value: number) {
        this.hue = hue;
        this.saturation = saturation;
        this.value = value;
    }
    public toRGB(): Color {
        let h = this.hue;
        let s = this.saturation;
        let v = this.value;
        if (h < 0) h = 0;
        if (s < 0) s = 0;
        if (v < 0) v = 0;
        if (h >= 360) h = 359;
        if (s > 100) s = 100;
        if (v > 100) v = 100;
        s /= 100.0;
        v /= 100.0;
        let C = v * s;
        let hh = h / 60.0;
        let X = C * (1.0 - Math.abs((hh % 2) - 1.0));
        let r = 0;
        let g = 0;
        let b = 0;
        if (hh >= 0 && hh < 1) {
            r = C;
            g = X;
        }
        else if (hh >= 1 && hh < 2) {
            r = X;
            g = C;
        }
        else if (hh >= 2 && hh < 3) {
            g = C;
            b = X;
        }
        else if (hh >= 3 && hh < 4) {
            g = X;
            b = C;
        }
        else if (hh >= 4 && hh < 5) {
            r = X;
            b = C;
        }
        else {
            r = C;
            b = X;
        }
        let m = v - C;
        r += m;
        g += m;
        b += m;
        r *= 255.0;
        g *= 255.0;
        b *= 255.0;
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        return new Color(r, g, b);
    }
}