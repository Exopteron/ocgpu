import { Exception, HashMultiSet, prev_permutation, sleep_for } from "tstl";
import { GPU } from "./constants";
import { Color, Vec3 } from "./gpu/color";
import { DrawMode, DrawPrimitive } from "./gpu/mode";
import { ThreadPool } from "./threadpool";
const INF: number = 100000;
export class Matrix {
    public matrix: Vertex[] = [];
    constructor(matrix: number[][]) {
        for (let i = 0; i < 4; i++) {
            this.matrix.unshift(new Vertex(matrix[i][0], matrix[i][1], matrix[i][2], matrix[i][3]));
        }
    }
    private toArray(): number[][] {
        let arr: number[][] = [];
        for (let i = 0; i < 4; i++) {
            arr.unshift([this.matrix[i].x, this.matrix[i].y, this.matrix[i].z, this.matrix[i].w]);
        }
        return arr;
    }
    public multiply(v: Vertex): Vertex {
        let b = this.toArray();
        let a = [v.x, v.y, v.z, v.w];
        let aNumRows = 1;
        let aNumCols = 4;
        let bNumRows = 4;
        let bNumCols = 4;

        let m: number[][] = [];
        for (let r = 0; r < aNumRows; r++) {
            m[r] = [];
            for (let c = 0; c < bNumCols; c++) {
                m[r][c] = 0;
                for (let i = 0; i < aNumCols; i++) {
                    m[r][c] += (a[i] * b[i][c]);
                }
            }
        }
        return new Vertex(m[0][0], m[0][1], m[0][2], m[0][3]);
    }
    public static createFrustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
        let sx = 2 * near / (right - left);
        let sy = 2 * near / (top - bottom);

        let c2 = - (far + near) / (far - near);
        let c1 = 2 * near * far / (near - far);

        let tx = -near * (left + right) / (right - left);
        let ty = -near * (bottom + top) / (top - bottom);
        return new Matrix([
            [sx, 0, 0, tx],
            [0, sy, 0, ty],
            [0, 0, c2, c1],
            [0, 0, -1, 0],
        ]);
    }
    public static toRadians(num: number): number {
        return num * 0.017453292519943295;
    }
    public static createPerspective(fovy: number, aspect: number, near: number, far: number): Matrix {
        let half_fovy = this.toRadians(fovy) / 2;
        let top = near * Math.tan(half_fovy);
        let bottom = -top;
        let right = top * aspect;
        let left = -right;
        return this.createFrustum(left, right, bottom, top, near, far);
    }
}
export class Vertex {
    public x: number;
    public y: number;
    public z: number;
    public w: number;
    constructor(x: number, y: number, z: number, w: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    public toVec3() : Vec3 {
        return new Vec3(this.x, this.y, this.z);
    }
    public minus(other: Vertex) : Vertex {
        return new Vertex(this.x - other.x, this.y - other.y, this.z - other.z, this.w - other.w);
    }
    public idx(n: number): number {
        switch (n) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            case 3:
                return this.w;
        }
        return null;
    }
    public mult(num: number) {
        this.x *= num;
        this.y *= num;
        this.z *= num;
    }
    public multVert(vert: Vertex) {
        this.x *= vert.x;
        this.y *= vert.y;
        this.z *= vert.z;
    }
    public clone(): Vertex {
        return new Vertex(this.x, this.y, this.z, this.w);
    }
    public getX(): number {
        return this.x;
    }
    public getY(): number {
        return this.y;
    }
    public setX(num: number): void {
        this.x = num;
    }
    public setY(num: number): void {
        this.y = num;
    }
    static onSegment(p: Vertex, q: Vertex, r: Vertex): boolean {
        if (q.x <= Math.max(p.x, r.x) &&
            q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) &&
            q.y >= Math.min(p.y, r.y)) {
            return true;
        }
        return false;
    }
    static orientation(p: Vertex, q: Vertex, r: Vertex): number {
        let val: number = (q.y - p.y) * (r.x - q.x)
            - (q.x - p.x) * (r.y - q.y);

        if (val == 0) {
            return 0; // collinear
        }
        return (val > 0) ? 1 : 2; // clock or counterclock wise
    }
    public toString(): string {
        return "(" + this.x + ", " + this.y + ", " + this.z + ", " + this.w + ")"
    }
    public static isInsideNew(polygon: Triangle, point: Point): boolean {
        return this.isInside2(polygon.a.x, polygon.a.y, polygon.b.x, polygon.b.y, polygon.c.x, polygon.c.y, point.x, point.y);
    }
    /* A function to check whether point P(x, y) lies 
   inside the triangle formed by A(x1, y1), 
   B(x2, y2) and C(x3, y3) */
    static isInside2(x1: number, y1: number, x2: number,
        y2: number, x3: number, y3: number, x: number, y: number): boolean {
        /* Calculate area of triangle ABC */
        let A = Vertex.area(x1, y1, x2, y2, x3, y3);

        /* Calculate area of triangle PBC */
        let A1 = Vertex.area(x, y, x2, y2, x3, y3);

        /* Calculate area of triangle PAC */
        let A2 = Vertex.area(x1, y1, x, y, x3, y3);

        /* Calculate area of triangle PAB */
        let A3 = Vertex.area(x1, y1, x2, y2, x, y);

        /* Check if sum of A1, A2 and A3 is same as A */
        return (A == A1 + A2 + A3);
    }
    /* A utility function to calculate area of triangle  
   formed by (x1, y1) (x2, y2) and (x3, y3) */
    static area(x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number): number {
        return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) +
            x3 * (y1 - y2)) / 2.0);
    }
    // The function that returns true if
    // line segment 'p1q1' and 'p2q2' intersect.
    static doIntersect(p1: Vertex, q1: Vertex,
        p2: Vertex, q2: Vertex): boolean {
        // Find the four orientations needed for
        // general and special cases
        let o1 = Vertex.orientation(p1, q1, p2);
        let o2 = Vertex.orientation(p1, q1, q2);
        let o3 = Vertex.orientation(p2, q2, p1);
        let o4 = Vertex.orientation(p2, q2, q1);

        // General case
        if (o1 != o2 && o3 != o4) {
            return true;
        }

        // Special Cases
        // p1, q1 and p2 are collinear and
        // p2 lies on segment p1q1
        if (o1 == 0 && Vertex.onSegment(p1, p2, q1)) {
            return true;
        }

        // p1, q1 and p2 are collinear and
        // q2 lies on segment p1q1
        if (o2 == 0 && Vertex.onSegment(p1, q2, q1)) {
            return true;
        }

        // p2, q2 and p1 are collinear and
        // p1 lies on segment p2q2
        if (o3 == 0 && Vertex.onSegment(p2, p1, q2)) {
            return true;
        }

        // p2, q2 and q1 are collinear and
        // q1 lies on segment p2q2
        if (o4 == 0 && Vertex.onSegment(p2, q1, q2)) {
            return true;
        }

        // Doesn't fall in any of the above cases
        return false;
    }
    // Returns true if the point p lies
    // inside the polygon[] with n vertices
    public static isInside(polygon: Vertex[], p: Vertex): boolean {
        let n = polygon.length;
        // There must be at least 3 vertices in polygon[]
        if (n < 3) {
            return false;
        }

        // Create a point for line segment from p to infinite
        let extreme = new Vertex(INF, p.y, INF, 0.);
        let extreme2 = new Vertex(p.x, INF, INF, 0.);
        // Count intersections of the above line
        // with sides of polygon
        let count = 0, i = 0;
        do {
            let next = (i + 1) % n;

            // Check if the line segment from 'p' to
            // 'extreme' intersects with the line
            // segment from 'polygon[i]' to 'polygon[next]'
            if (Vertex.doIntersect(polygon[i], polygon[next], p, extreme)) {
                // If the point 'p' is collinear with line
                // segment 'i-next', then check if it lies
                // on segment. If it lies, return true, otherwise false
                if (Vertex.orientation(polygon[i], p, polygon[next]) == 0) {
                    return Vertex.onSegment(polygon[i], p,
                        polygon[next]);
                }

                count++;
            }
            i = next;
        } while (i != 0);

        // Return true if count is odd, false otherwise
        return (count % 2 == 1); // Same as (count%2 == 1)
    }
    public offsets(): Vertex[] {
        let offsets: Vertex[] = [];
        offsets.push(new Vertex(this.x - 1, this.y, this.z, this.w));
        offsets.push(new Vertex(this.x + 1, this.y, this.z, this.w));
        offsets.push(new Vertex(this.x, this.y - 1, this.z, this.w));
        offsets.push(new Vertex(this.x, this.y + 1, this.z, this.w));
        return offsets;
    }
}
export class Vec2 {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }
    public static dbIdx(x: number, y: number): string {
        return "(" + x + ", " + y + ")";
    }
    public clone(): Vec2 {
        return new Vec2(this.x, this.y);
    }
}
export class Point extends Vertex {
    constructor(x: number, y: number, z: number, w: number) {
        super(x, y, z, w);
    }
}
export class VertexShader {
    public fn: (input: Vertex, color: Color) => [Vertex, Color, number[][]];
    constructor(fn: (input: Vertex, color: Color) => [Vertex, Color, number[][]]) {
        this.fn = fn;
    }
}

export class FragmentShader {
    public fn: (input: Point, polygon: Triangle, vsout: number[][]) => Color;
    constructor(fn: (input: Point, polygon: Triangle, vsout: number[][]) => Color) {
        this.fn = fn;
    }
}
export class OpenisGL {
    private static vertexBuffer: [Vertex, Color][] = [];
    private static drawPrimitive: DrawPrimitive = DrawPrimitive.TRIANGLES;
    private static drawMode: DrawMode = DrawMode.TRIANGLE;
    public static vertShader: VertexShader = null;
    public static fragShader: FragmentShader = null;
    private static queuedColor: Color = new Color(255, 255, 255);
    private static VBOArray: number[] = [];
    private static doubleBufferLoc: number = null;
    public static depthBuffer: number[] = [];
    private static triangleCount: number = 0;
    private static matrix: Matrix = null;
    public static setMatrix(matrix: Matrix) {
        this.matrix = matrix;
    }
    public static prepareBuffers(): void {
        if (this.doubleBufferLoc != null) {
            GPU.freeBuffer(this.doubleBufferLoc);
        }
        this.doubleBufferLoc = GPU.allocateBuffer();
        GPU.setActiveBuffer(this.doubleBufferLoc);
    }
    public static setDrawMode(mode: DrawMode) {
        if (mode != null) {
            this.drawMode = mode;
        }
    }
    public static getDrawMode(): DrawMode {
        return this.drawMode;
    }
    public static setDrawPrimitive(mode: DrawPrimitive) {
        if (mode != null) {
            this.drawPrimitive = mode;
        }
    }
    public static getDrawPrimitive(): DrawPrimitive {
        return this.drawPrimitive;
    }
    public static clear(): void {
        let [w, h] = GPU.getResolution();
        GPU.fill(1, 1, w, h, " ");
    }
    public static setVertexShader(shader: VertexShader) {
        this.vertShader = shader;
    }
    public static clearVertexShader() {
        this.vertShader = null;
    }
    public static setFragShader(shader: FragmentShader) {
        this.fragShader = shader;
    }
    public static clearFragShader() {
        this.fragShader = null;
    }
    public static setVertexArray(idx: number) {
        if (this.VBOArray[idx] == undefined) {
            this.VBOArray[idx] = GPU.allocateBuffer();
        }
        GPU.setActiveBuffer(this.VBOArray[idx]);
    }
    public static copyVertexArray(idx: number) {
        let [w, h] = GPU.getResolution();
        GPU.bitblt(this.doubleBufferLoc, 1, 1, w, h, this.VBOArray[idx], 1, 1);
        GPU.setActiveBuffer(this.doubleBufferLoc);
    }
    public static closeVertexArray() {
        GPU.setActiveBuffer(this.doubleBufferLoc);
    }
    public static begin(): void {
        //print("Begin");
        this.depthBuffer = [];
        this.vertexBuffer = [];
        this.triangleCount = 0;
    }
    public static setColor(c: Color) {
        if (c != null) {
            this.queuedColor = c;
        }
    }
    public static drawString(pos: Point, string: string) {
        GPU.set(pos.x, pos.y, string);
    }
    public static vertex(v: Vertex): void {
        this.vertexC(v, this.queuedColor);
    }
    public static greatestZ: number = 0.0;
    public static lowestZ: number = 100000.0;
    public static vertexC(v: Vertex, c: Color): void {
        let vert = v.clone();
        if (this.matrix != null) {
            vert = this.matrix.multiply(vert);
        }
        if (vert.z > this.greatestZ) {
            this.greatestZ = vert.z;
        }
        if (vert.z < this.lowestZ) {
            this.lowestZ = vert.z;
        }
        this.vertexBuffer.push([vert, c]);
    }
    public static polyToScreen(p: Triangle): Triangle {
        p.a = this.coordinatesToScreenV(p.a);
        p.b = this.coordinatesToScreenV(p.b);
        p.c = this.coordinatesToScreenV(p.c);
        return p;
    }
    public static coordinatesToScreenV(v: Vertex): Vertex {
        let [w, h] = GPU.getResolution();
        v.x += (w / 2);
        v.y = ((v.y * 0.5) + (h / 2));
        return v;
    }
    public static coordinatesToScreen(v: Vec2): Vec2 {
        let [w, h] = GPU.getResolution();
        v.x += (w / 2);
        v.y = ((v.y * 0.5) + (h / 2));
        return v;
    }
    private static fill(polygon: Triangle) {
        let [w, h] = GPU.getResolution();
        for (let x = 0; x <= w; x++) {
            for (let y = 0; y <= h; y++) {
                let vertex = new Point(x, y, 0, 0);
                if (Vertex.isInsideNew(polygon, vertex)) {
                    if (this.fragShader != null) {
                        GPU.setBackground(this.fragShader.fn(vertex, polygon, []).toHex());
                    }
                    OpenisGL.plot(vertex.getX(), vertex.getY());
                } else {
                    //print("Not nside");
                }
            }
        }
    }
    public static toTriangles(vertices: Vertex[], indices: number[]): Triangle[] {
        let arr = [];
        for (let i = 2; i < indices.length; i += 3) {
            let poly = new Triangle(vertices[indices[i - 2] - 1], vertices[indices[i - 1] - 1], vertices[indices[i] - 1], this.queuedColor, this.queuedColor, this.queuedColor);
            arr.push(poly);
        }
        return arr;
    }
    public static triangleAmount(): number {
        return this.triangleCount;
    }
    public static plotPolygon(polygon: Triangle, vsout: number[][][]) {
        this.triangleCount++;
        switch (this.drawPrimitive) {
            case DrawPrimitive.TRIANGLES: {
                BarycentricFill.fillPolygon(polygon, vsout);
                break;
            }
            case DrawPrimitive.LINES: {
                let poly = Polygon2D.from3D(polygon.clone());
                poly.callbackOnVertex((vec) => {
                    let poly = OpenisGL.coordinatesToScreen(vec);
                    return poly;
                });
                OpenisGL.plotLinePoly(poly.a.x, poly.a.y, poly.b.x, poly.b.y, polygon.clone());
                OpenisGL.plotLinePoly(poly.b.x, poly.b.y, poly.c.x, poly.c.y, polygon.clone());
                OpenisGL.plotLinePoly(poly.c.x, poly.c.y, poly.a.x, poly.a.y, polygon.clone());
                break;
            }
        }
        //BresenhamLine.plotLine(polygon.a, polygon.b, polygon.clone());
        //BresenhamLine.plotLine(polygon.b, polygon.c, polygon.clone());
        //BresenhamLine.plotLine(polygon.c, polygon.a, polygon.clone());
    }
    private static end_triangleLoop(): void {
        let i = 0;
        while (this.vertexBuffer.length != 0) {
            //OpenisGL.plotPolygon(new Polygon(this.vertexBuffer[i][0], this.vertexBuffer[i + 1][0], this.vertexBuffer[i + 2][0]));
            this.vertexBuffer.shift();
            i += 3;
        }
    }
    public static end(): void {
        switch (this.drawMode) {
            case DrawMode.TRIANGLE: {
                //print("End");
                for (let i = 2; i < this.vertexBuffer.length; i += 3) {
                    let vsout = [];
                    if (this.vertShader != null) {
                        for (let x = 0; x <= 2; x++) {
                            let [vert, color, vs] = this.vertShader.fn(this.vertexBuffer[i - x][0], this.vertexBuffer[i - x][1]);
                            this.vertexBuffer[i - x][0] = vert;
                            this.vertexBuffer[i - x][1] = color;
                            vsout.unshift(vs);
                        }
                        /*                 this.vertexBuffer[i - 1][0] = this.vertShader.fn(this.vertexBuffer[i - 1][0]);
                                        this.vertexBuffer[i - 2][0] = this.vertShader.fn(this.vertexBuffer[i - 2][0]); */
                    }
                    OpenisGL.plotPolygon(new Triangle(this.vertexBuffer[i - 2][0], this.vertexBuffer[i - 1][0], this.vertexBuffer[i][0], this.vertexBuffer[i - 2][1], this.vertexBuffer[i - 1][1], this.vertexBuffer[i][1]), vsout);
                }
                break;
            }
            case DrawMode.TRIANGLE_LOOP: {
                this.end_triangleLoop();
                break;
            }
        }
        /*         let previousVertex: Vertex = null;
                let first: Vertex = null;
                this.vertexBuffer[this.vertexBuffer.length] = this.vertexBuffer[0];
                let length = this.vertexBuffer.length;
                let fillBuffer: Vertex[] = [];
                for (let i = 0; i < this.vertexBuffer.length; i++) {
                    let vertex = this.vertexBuffer[i];
                    if (previousVertex == null) {
                        //print("Null");
                        previousVertex = vertex;
                    } else {
                        fillBuffer.push(vertex);
                        if (fillBuffer.length >= 2) {
                            OpenisGL.fill(fillBuffer);
                            fillBuffer = [];
                        }
                        OpenisGL.plotLine(previousVertex.getX(), previousVertex.getY(), vertex.getX(), vertex.getY());
                        previousVertex = vertex;
                    }
                } */
        //print("End is over");
    }
    public static plotLinePoly(x1: number, y1: number, x2: number, y2: number, poly: Triangle) {
        BresenhamWiki.plotLine(new Point(x1, y1, 0, 0), new Point(x2, y2, 0, 0), poly.clone());
        return;
        /*         for (let x = x1; x <= x2; x++) {
                    let y = y1 + dy * (x - x1) / dx;
                    OpenisGL.plot(x, y);
                } */
    }
    public static plotLine(x1: number, y1: number, x2: number, y2: number) {
        //let x1 = largest(ix1, ix2);
        //let y1 = largest(iy1, iy2);
        //let x2 = smallest(ix1, ix2);
        //let y2 = smallest(iy1, iy2);
        //print("Plotting line between " + x1 + " " + y1 + " and " + x2 + " " + y2);
        let dx = x2 - x1;
        let dy = y2 - y1;
        let step;
        if (Math.abs(dx) >= Math.abs(dy)) {
            step = Math.abs(dx);
        } else {
            step = Math.abs(dy);
        }
        dx = dx / step;
        dy = dy / step;
        let x = x1;
        let y = y1;
        let i = 1;
        while (i <= step) {
            OpenisGL.plot(x, y);
            x += dx;
            y += dy;
            i += 1;
        }
        /*         for (let x = x1; x <= x2; x++) {
                    let y = y1 + dy * (x - x1) / dx;
                    OpenisGL.plot(x, y);
                } */
    }
    public static plot(x: number, y: number) {
        GPU.set(x, y, "⠀");
    }
    public static swapBuffers(): void {
        GPU.bitblt();
        GPU.freeBuffer();
        GPU.setActiveBuffer(0);
    }
}
function smallest(a: number, b: number): number {
    if (a < b) {
        return a;
    }
    return b;
}
function largest(a: number, b: number): number {
    if (a < b) {
        return b;
    }
    return a;
}
function chunkArrayInGroups(arr: any[], size: number): any[][] {
    let myArray: any[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        const slice = arr.slice(i, i + size);
        //print("Slice: " + slice[0]);
        myArray.push(slice);
    }
    //print("Arr: " + myArray[0][0]);
    return myArray;
}
export class Polygon2D {
    public a: Vec2;
    public b: Vec2;
    public c: Vec2;
    public aColor: Color;
    public bColor: Color;
    public cColor: Color;
    constructor(a: Vec2, b: Vec2, c: Vec2, aColor: Color, bColor: Color, cColor: Color) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.aColor = aColor;
        this.bColor = bColor;
        this.cColor = cColor;
    }
    static matrix: Matrix = null;
    private static calcMatrix() {
        if (this.matrix == null) {
            let [w, h] = GPU.getResolution();
            let div = w / h;
            this.matrix = Matrix.createPerspective(2, 1, 0.5, 10.0);;
        }
    }
    public static perspectiveProject(v: Vertex): Vertex {
        this.calcMatrix();
        let p = this.matrix.multiply(v);
        p.x /= p.w;
        p.y /= p.w;
        p.z /= p.w;
        p.w = 1;
        return p;
    }
    public static from3D(poly: Triangle): Polygon2D {
        this.calcMatrix();
        let gons = [poly.a, poly.b, poly.c];
        let outgons: Vec2[] = [];
        for (let i = 0; i < gons.length; i++) {
            let p = gons[i];
            p = this.matrix.multiply(p);
            p.x /= p.w;
            p.y /= p.w;
            p.z /= p.w;
            outgons.push(new Vec2(p.x, p.y));
            // let mult = 1;
            // if (p.z != 0) {
            //     mult = 1 / ((p.z * 0.2) + 1);
            // }
            // if (mult < 0.01) {
            //     OpenisGL.drawString(new Point(5, 9, 0, 0), "mult: " + mult + " is less");
            //     //mult = 0;
            // }
            // OpenisGL.drawString(new Point(5, 8, 0, 0), "mult: " + mult);
            // outgons.push(new Vec2(p.x * mult, p.y * mult));
        }
        return new Polygon2D(outgons[0], outgons[1], outgons[2], poly.aColor, poly.bColor, poly.cColor);
    }
    public callbackOnVertex(c: (v: Vec2) => Vec2) {
        this.a = c(this.a);
        this.b = c(this.b);
        this.c = c(this.c);
    }
    public clone(): Polygon2D {
        return new Polygon2D(this.a.clone(), this.b.clone(), this.c.clone(), this.aColor.clone(), this.bColor.clone(), this.cColor.clone());
    }
}
export class Triangle {
    public a: Vertex;
    public b: Vertex;
    public c: Vertex;
    public aColor: Color;
    public bColor: Color;
    public cColor: Color;
    constructor(a: Vertex, b: Vertex, c: Vertex, aColor: Color, bColor: Color, cColor: Color) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.aColor = aColor;
        this.bColor = bColor;
        this.cColor = cColor;
    }
    public clone(): Triangle {
        return new Triangle(this.a.clone(), this.b.clone(), this.c.clone(), this.aColor.clone(), this.bColor.clone(), this.cColor.clone());
    }
    public area(): number {
        let area = 0,
            i,
            j,
            point1,
            point2;
        let points = [this.a, this.b, this.c];
        for (i = 0, j = points.length - 1; i < points.length; j = i, i++) {
            point1 = points[i];
            point2 = points[j];
            area += point1.x * point2.y;
            area -= point1.y * point2.x;
        }
        area /= 2;
        return area;
    }
    public center(): Point {
        let x = 0,
            y = 0,
            i,
            j,
            f,
            point1,
            point2;
        let points = [this.a, this.b, this.c];
        for (i = 0, j = points.length - 1; i < points.length; j = i, i++) {
            point1 = points[i];
            point2 = points[j];
            f = point1.x * point2.y - point2.x * point1.y;
            x += (point1.x + point2.x) * f;
            y += (point1.y + point2.y) * f;
        }

        f = this.area() * 6;

        return new Point(x / f, y / f, 0, 0);
    }
    public sortVerticesAscendingByY() {
        let vTmp: Vertex;
        let vt1 = this.a;
        let vt2 = this.b;
        let vt3 = this.c;
        if (vt1.y > vt2.y) {
            vTmp = vt1;
            vt1 = vt2;
            vt2 = vTmp;
        }
        /* here v1.y <= v2.y */
        if (vt1.y > vt3.y) {
            vTmp = vt1;
            vt1 = vt3;
            vt3 = vTmp;
        }
        /* here v1.y <= v2.y and v1.y <= v3.y so test v2 vs. v3 */
        if (vt2.y > vt3.y) {
            vTmp = vt2;
            vt2 = vt3;
            vt3 = vTmp;
        }
        this.a = vt1;
        this.b = vt2;
        this.c = vt3;
    }
    public static crossProduct(v1: Vec2, v2: Vec2): number {
        return Math.floor(v1.x * v2.y - v1.y * v2.x);
    }
    public normal() : Vec3 {
        let u = this.b.minus(this.a).toVec3();
        let v = this.c.minus(this.a).toVec3();

        let x = (u.y * v.z) - (u.z * v.y);
        let y = (u.z * v.x) - (u.x * v.z);
        let z = (u.x * v.y) - (u.y * v.x);

        return new Vec3(x, y, z);
    }
    public toProjected(): Triangle {
        return new Triangle(Polygon2D.perspectiveProject(this.a), Polygon2D.perspectiveProject(this.b), Polygon2D.perspectiveProject(this.c), this.aColor, this.bColor, this.cColor);
    }
    public toPlane(): [number, number, number, number] {
        let a = ((this.b.y - this.a.y) * (this.c.z - this.a.z)) - ((this.c.y - this.a.y) * (this.b.z - this.a.z));
        let b = ((this.b.z - this.a.z) * (this.c.x - this.a.x)) - ((this.c.z - this.a.z) * (this.b.x - this.a.x));
        let c = ((this.b.x - this.a.x) * (this.c.y - this.a.y)) - ((this.c.x - this.a.x) * (this.b.y - this.a.y));
        let d = -((a * this.a.x) + (b * this.a.y) + (c * this.a.z));
        return [a, b, c, d];
    }
}
class Interpolator {
    public static interpolate(input_a: number[], input_b: number[], input_c: number[], poly: Triangle, point: Point): number[] {
        let w_v1 = (((poly.b.y - poly.c.y) * (point.x - poly.c.x)) + (poly.c.x - poly.b.x) * (point.y - poly.c.y)) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

        let w_v2 = (((poly.c.y - poly.a.y) * (point.x - poly.c.x)) + ((poly.a.x - poly.c.x) * (point.y - poly.c.y))) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

        let w_v3 = 1 - w_v1 - w_v2;
        let output = [];
        for (let i = 0; i < input_a.length; i++) {
            let v = (w_v1 * input_a[i] + w_v2 * input_b[i] + w_v3 * input_c[i]) / (w_v1 + w_v2 + w_v3);
            output.push(v);
        }
        return output;
    }
}
class BarycentricFill {
    public static fillPolygon(p: Triangle, vsout: number[][][]) {
        let poly = Polygon2D.from3D(p.clone());
        let origp = p;
        p = p.toProjected();
        let bad = false;
        poly.callbackOnVertex((vec) => {
            let poly = OpenisGL.coordinatesToScreen(vec);
            if (poly.x == 0 && poly.y == 0) {
                bad = true;
            }
            return poly;
        });
        // if (bad) {
        //     return;
        // }
        let vt1 = poly.a;
        let vt2 = poly.b;
        let vt3 = poly.c;
        //throw Error("balls: " + Math.ceil(Math.max(vt1.x, Math.max(vt2.x, vt3.x))));
        let maxX = math.tointeger(Math.round(Math.max(vt1.x, Math.max(vt2.x, vt3.x))));
        //maxX = math.tointeger(Math.floor(maxX));
        let minX = math.tointeger(Math.round(Math.min(vt1.x, Math.min(vt2.x, vt3.x))));
        //minX = math.tointeger(Math.floor(minX));
        let maxY = math.tointeger(Math.round(Math.max(vt1.y, Math.max(vt2.y, vt3.y))));
        //maxY = math.tointeger(Math.floor(maxY));
        let minY = math.tointeger(Math.round(Math.min(vt1.y, Math.min(vt2.y, vt3.y))));
        if (minX == null || maxX == null || minY == null || maxY == null) {
            return;
        }
        //minY = math.tointeger(Math.floor(minY));
        //throw Error("maxx " + maxX + " minx " + minX + " maxy" + maxY + " minY " + minY);
        let v1 = new Vec2(vt2.x - vt1.x, vt2.y - vt1.y);
        let v2 = new Vec2(vt3.x - vt1.x, vt3.y - vt1.y);
        let pool = new ThreadPool(256);
        let screenSpace = OpenisGL.polyToScreen(p.clone());
        const sclPerThread: number = 64;
        let [a, b, c, d] = p.clone().toProjected().toPlane();
        let v1v2cp = Triangle.crossProduct(v1, v2);;
        for (let xv = minX; xv <= maxX; xv += sclPerThread) {
            let xa = xv;
            pool.execute(() => {
                for (let x = xa; x <= xa + sclPerThread; x++) {
                    for (let y = minY; y < maxY; y++) {
                        // let startTime = os.clock() * 1000;
                        let q = new Vec2(x - vt1.x, y - vt1.y);
                        let s = Triangle.crossProduct(q, v2) / v1v2cp;
                        let t = Triangle.crossProduct(v1, q) / v1v2cp;

                        if ((s >= 0.0) && (t >= 0.0) && (s + t <= 1.0)) {
                            let zValue = 0;
                            if (c != 0) {
                                zValue = -((a * x) + (b * y) + d) / c;
                            }
                            let dbidx = Vec2.dbIdx(x, y);
                            let v = OpenisGL.depthBuffer[dbidx];
                            //print("Z value of " + new Vec2(x, y).toString() + " is " + zValue + ", a, b, c, d is: " + a + ", " + b + ", " + c + ", " + d);
                            if (v == null) {
                                OpenisGL.depthBuffer[dbidx] = zValue; // TODO: get correct depth value 
                            } else {
                                if (zValue > v) {
                                    continue;
                                }
                            }
                            if (OpenisGL.fragShader != null) {
                                let interpolated: number[][] = [];
                                for (let i = 0; i < vsout[0].length; i++) {
                                    let inter = Interpolator.interpolate(vsout[0][i], vsout[1][i], vsout[2][i], screenSpace.clone(), new Point(x, y, 0, 0));
                                    interpolated.push(inter);
                                }
                                GPU.setBackground(OpenisGL.fragShader.fn(new Point(x, y, 0, 0), screenSpace.clone(), interpolated).toHex());
                                // GPU.setBackground(new Color(255, 0, 0).toHex());
                            }
                            OpenisGL.plot(x, y);
                            // let end = os.clock() * 1000;
                            // throw Error("time: " + (end - startTime) + " end " + end + " start " + startTime);
                        }
                    }
                }
            });
        }
        pool.wait();
    }
}
class BresenhamWiki {
    public static plotLine(pa: Point, pb: Point, poly: Triangle): void {
        /*         let x0 = pa.x;
                let x1 = pb.x;
                let y0 = pa.y;
                let y1 = pb.y;
                let dx = Math.abs(x1 - x0);
                let sx = x0 < x1 ? 1 : -1;
                let dy = -Math.abs(y1 - y0);
                let sy = y0 < y1 ? 1 : -1;
                let err = dx + dy;
                while (true) {
                    if (OpenisGL.fragShader != null) {
                        GPU.setBackground(OpenisGL.fragShader.fn(new Point(x0, y0), poly).toHex());
                    }
                    OpenisGL.plot(x0, y0);
                    if (x0 == x1 && y0 == y1) break;
                    let e2 = 2 * err;
                    if (e2 >= dy) {
                        err += dy;
                        x0 = sx;
                    }
                    if (e2 <= dx) {
                        err += dx;
                        y0 += sy;
                    }
                } */
        if (Math.abs(pb.y - pa.y) < Math.abs(pb.x - pa.x)) {
            if (pa.x > pb.x) {
                this.plotLineLow(pb, pa, poly.clone());
            } else {
                this.plotLineLow(pa, pb, poly.clone());
            }
        } else {
            if (pa.y > pb.y) {
                this.plotLineHigh(pb, pa, poly.clone());
            } else {
                this.plotLineHigh(pa, pb, poly.clone());
            }
        }
    }
    private static plotLineHigh(pa: Point, pb: Point, poly: Triangle): void {
        let x0 = Math.floor(pa.x);
        let x1 = Math.floor(pb.x);
        let y0 = Math.floor(pa.y);
        let y1 = Math.floor(pb.y);
        let dx = x1 - x0;
        let dy = y1 - y0;
        let xi = 1;
        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }
        let D = (2 * dx) - dy;
        let x = x0;
        for (let y = y0; y <= y1; y++) {
            if (OpenisGL.fragShader != null) {
                GPU.setBackground(OpenisGL.fragShader.fn(new Point(x, y, 0, pb.w), poly, []).toHex());
            }
            OpenisGL.plot(x, y);
            if (D > 0) {
                x = x + xi;
                D = D + (2 * (dx - dy));
            } else {
                D = D + 2 * dx;
            }
        }
    }
    private static plotLineLow(pa: Point, pb: Point, poly: Triangle): void {
        let x0 = Math.floor(pa.x);
        let x1 = Math.floor(pb.x);
        let y0 = Math.floor(pa.y);
        let y1 = Math.floor(pb.y);
        let dx = x1 - x0;
        let dy = y1 - y0;
        let yi = 1;
        if (dy < 0) {
            yi = -1;
            dy = -dy;
        }
        let D = (2 * dy) - dx;
        let y = y0;
        for (let x = x0; x <= x1; x++) {
            if (OpenisGL.fragShader != null) {
                GPU.setBackground(OpenisGL.fragShader.fn(new Point(x, y, 0, pb.w), poly, []).toHex());
            }
            OpenisGL.plot(x, y);
            if (D > 0) {
                y = y + yi;
                D = D + (2 * (dy - dx))
            } else {
                D = D + 2 * dy;
            }
        }
    }
}
class BresenhamLine {
    public static plotLine(pa: Point, pb: Point, poly: Triangle) {
        let m_new = 2 * (pb.y - pa.y);
        m_new = Math.floor(m_new);
        let slope_error_new = m_new - (pb.x - pa.x);
        slope_error_new = Math.floor(slope_error_new);
        for (let x = pa.x, y = pa.y; x <= pb.x; x++) {
            slope_error_new += m_new;
            slope_error_new = Math.floor(slope_error_new);
            if (OpenisGL.fragShader != null) {
                GPU.setBackground(OpenisGL.fragShader.fn(new Point(x, y, 0, pb.w), poly, []).toHex());
            }
            OpenisGL.plot(x, y);
            if (slope_error_new >= 0) {
                y++;
                slope_error_new -= 2 * (pb.x - pa.x);
                slope_error_new = Math.floor(slope_error_new);
            }
        }
    }
}
class StandardFill {
    public static fillPolygon(p: Triangle) {
        let polygon = p.clone();
        polygon.sortVerticesAscendingByY();
        if (polygon.b.y == polygon.c.y) {
            this.fillBottomFlatTriangle(polygon.a, polygon.b, polygon.c, p.clone());
        } else if (polygon.a.y == polygon.b.y) {
            this.fillTopFlatTriangle(polygon.a, polygon.b, polygon.c, p.clone());
        } else {
            let vTmp: Vertex = new Vertex((polygon.a.x + ((polygon.b.y - polygon.a.y) / (polygon.c.y - polygon.a.y)) * (polygon.c.x - polygon.a.x)), polygon.b.y, 0, polygon.a.w);
            this.fillBottomFlatTriangle(polygon.a, polygon.b, vTmp, p.clone());
            this.fillTopFlatTriangle(polygon.b, vTmp, polygon.c, p.clone());
        }
    }
    private static fillBottomFlatTriangle(v1: Vertex, v2: Vertex, v3: Vertex, poly: Triangle) {
        let invslope1 = (v2.x - v1.x) / (v2.y - v1.y);
        let invslope2 = (v3.x - v1.x) / (v3.y - v1.y);
        let curx1 = v1.x;
        let curx2 = v1.x;

        for (let scanlineY = v1.y; scanlineY <= v2.y; scanlineY++) {
            OpenisGL.plotLinePoly(curx1, scanlineY, curx2, scanlineY, poly);
            curx1 += invslope1;
            curx2 += invslope2;
        }
    }
    private static fillTopFlatTriangle(v1: Vertex, v2: Vertex, v3: Vertex, poly: Triangle) {
        let invslope1 = (v3.x - v1.x) / (v3.y - v1.y);
        let invslope2 = (v3.x - v2.x) / (v3.y - v2.y);

        let curx1 = v3.x;
        let curx2 = v3.x;

        for (let scanlineY = v3.y; scanlineY > v1.y; scanlineY--) {
            OpenisGL.plotLinePoly(curx1, scanlineY, curx2, scanlineY, poly);
            curx1 -= invslope1;
            curx2 -= invslope2;
        }
    }
}

class FasterFill {
    public static fillPolygon(polygon: Triangle) {
        let [maxx, minx, maxy, miny] = this.getBounds(polygon);
        for (let x = minx; x <= maxx; x++) {
            for (let y = miny; y < maxy; y++) {
                let vertex = new Point(x, y, 0, polygon.a.w);
                if (Vertex.isInsideNew(polygon, vertex)) {
                    if (OpenisGL.fragShader != null) {
                        GPU.setBackground(OpenisGL.fragShader.fn(vertex, polygon, []).toHex());
                    }
                    OpenisGL.plot(vertex.getX(), vertex.getY());
                }
            }
        }
    }
    private static getBounds(polygon: Triangle): [number, number, number, number] {
        let maxx = Math.max(polygon.a.x, polygon.b.x, polygon.c.x);
        let maxy = Math.max(polygon.a.y, polygon.b.y, polygon.c.y);
        let minx = Math.min(polygon.a.x, polygon.b.x, polygon.c.x);
        let miny = Math.min(polygon.a.y, polygon.b.y, polygon.c.y);
        return [maxx, minx, maxy, miny];
    }
}