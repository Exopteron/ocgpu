export class Color {
    public red: number;
    public green: number;
    public blue: number;
    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
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
    public clone() : Color {
        return new Color(this.red, this.green, this.blue);
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