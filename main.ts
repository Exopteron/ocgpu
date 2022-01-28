// Copyright (c) Exopteron 2022
import { GPU } from "./constants";
import { FragmentShader, OpenisGL, Point, Polygon, Vertex, VertexShader } from "./gpu";
import { Color, HSVColor } from "./gpu/color";
import { DrawPrimitive } from "./gpu/mode";


class ObjFile {
    public indices: number[] = [];
    public vertices: Vertex[] = [];
    constructor(path: string) {
        let file = io.open(path, "r");
        let read: string = file.read("*a");
        let lines = read.split("\n");
        for (let i = 0; i < lines.length; i++) {
            let string = lines[i];
            if (string[0] == "#") {
                continue;
            }
            if (string[0] == "v" && string[1] == " ") {
                let v = string.split(" ");
                v.shift();
                // ->  <-
                print("V zero: " + v[0]);
                this.vertices.push(new Vertex(Math.round(parseFloat(v[0])), Math.round(parseFloat(v[1])), Math.round(parseFloat(v[2]))));
            }
            if (string[0] == "f") {
                let v = string.split(" ");
                v.shift();
                for (let x = 0; x < v.length; x++) {
                    let str = v[x];
                    //this.indices.push(parseInt(str));
                    let arr = str.split("/");
                    this.indices.push(parseInt(arr[0]));
                }
            }
        }
    }
}

let x = true;
/* print("Gas");
let offset = 0;
let point = new Point(4, 2);
let poly = new Polygon(new Vertex(1, 2), new Vertex(3, 5), new Vertex(9, 0), new Color(0, 0, 0), new Color(0, 0, 0), new Color(0, 0, 0));
let w_v1 = (((poly.b.y - poly.c.y) * (point.x - poly.c.x)) + (poly.c.x - poly.b.x) * (point.y - poly.c.y)) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

let w_v2 = (((poly.c.y - poly.a.y) * (point.x - poly.c.x)) + ((poly.a.x - poly.c.x) * (point.y - poly.c.y))) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

let w_v3 = 1 - w_v1 - w_v2;
print("w_v1: " + w_v1);
print("w_v2: " + w_v2);
print('w_v3: ' + w_v3); */
let timer = 0;
let circle = plotCircle(30, 40, 0);
for (let i = 0; i < circle.length; i++) {
    //print("Vert: " + circle[i].toString());
}
print("Cosinema Dick: " + Math.cos(90));
let file = new ObjFile("/home/cube.obj");
for (let i = 0; i < file.vertices.length; i++) {
    file.vertices[i].mult(12);
    file.vertices[i].z += 12;

    print("Vertex: " + file.vertices[i].toString());
}
print("Indices length: " + file.indices.length);
for (let i = 0; i < file.indices.length; i++) {
    //print("Index: " + file.indices[i]);
}
//throw Error("ass");
//OpenisGL.wireframe = true;
let steps = 0;
let timer2 = 0;
let fps = 0;
OpenisGL.prepareBuffers();
OpenisGL.setFragShader(new FragmentShader((point, poly) => {
    let w_v1 = (((poly.b.y - poly.c.y) * (point.x - poly.c.x)) + (poly.c.x - poly.b.x) * (point.y - poly.c.y)) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

    let w_v2 = (((poly.c.y - poly.a.y) * (point.x - poly.c.x)) + ((poly.a.x - poly.c.x) * (point.y - poly.c.y))) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

    let w_v3 = 1 - w_v1 - w_v2;

    w_v1 = Math.max(w_v1, 0);
    w_v2 = Math.max(w_v2, 0);
    w_v3 = Math.max(w_v3, 0);
    //let color = (w_v1 * poly.aColor.toHex() + w_v2 * poly.bColor.toHex() + w_v3 * poly.cColor.toHex()) / (w_v1 + w_v2 + w_v3);
    let red = (w_v1 * poly.aColor.red + w_v2 * poly.bColor.red + w_v3 * poly.cColor.red) / (w_v1 + w_v2 + w_v3);
    let green = (w_v1 * poly.aColor.green + w_v2 * poly.bColor.green + w_v3 * poly.cColor.green) / (w_v1 + w_v2 + w_v3);
    let blue = (w_v1 * poly.aColor.blue + w_v2 * poly.bColor.blue + w_v3 * poly.cColor.blue) / (w_v1 + w_v2 + w_v3);
    return new Color(red, green, blue);
}));
/* OpenisGL.setFragShader(new FragmentShader((point, poly) => {
    return new Color(255, 0, 0);
})); */
OpenisGL.setDrawPrimitive(DrawPrimitive.TRIANGLES);
let zval = 0;
let zflag = false;
try {
    while (true) {
        //break;
        let current_ticks = os.clock();
        OpenisGL.prepareBuffers();
        //if (OpenisGL.wireframe == false) {
        //OpenisGL.wireframe = true;
        //} else {
        //OpenisGL.wireframe = false;
        //}
        //break;
        GPU
        let [w, h] = GPU.getResolution();
        GPU.setForeground(0x000000);
        GPU.setBackground(0xFFFFFF);
        OpenisGL.begin();
        /*     OpenisGL.setVertexShader(new VertexShader((vert, c) => {
                //vert.setX(vert.getX() + 25);
                return [vert, c];
                //return vert;
            })); */
        //let i = 0;
        //GPU.setBackground(0xFF0000);
        /*         const SQUARE: number = 20;
                OpenisGL.vertex(new Vertex(-0.71 * SQUARE, -1 * SQUARE, 0.71 * SQUARE));
                OpenisGL.vertex(new Vertex(-0.71 * SQUARE, 1 * SQUARE, 0.71 * SQUARE));
                OpenisGL.vertex(new Vertex(0 * SQUARE, 1 * SQUARE, 0 * SQUARE));
                OpenisGL.vertex(new Vertex(0 * SQUARE, 1 * SQUARE, 0 * SQUARE));
                OpenisGL.vertex(new Vertex(0 * SQUARE, -1 * SQUARE, 0 * SQUARE));
                OpenisGL.vertex(new Vertex(-0.71 * SQUARE, -1 * SQUARE, 0.71 * SQUARE)); */
        /*                  OpenisGL.vertex(new Vertex(-20, 0, 3));
                        OpenisGL.vertex(new Vertex(20, 0, 3));
                        OpenisGL.vertex(new Vertex(0, 1.7 * -20, 0)); */

        const SQUARE: number = 45;
        OpenisGL.setColor(new Color(255, 255, 255));
        OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 6));         //top left
        OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 6));          //bottom left
        OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
        OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 6));        //top left
        OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
        OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 1));        //top right

        OpenisGL.setColor(new Color(255, 0, 0));
        const ADDAM: number = 2 * SQUARE;
        OpenisGL.vertex(new Vertex(-SQUARE + ADDAM, -SQUARE, 1));         //top left
        OpenisGL.vertex(new Vertex(-SQUARE + ADDAM, SQUARE, 1));          //bottom left
        OpenisGL.vertex(new Vertex(SQUARE + ADDAM, SQUARE, 6));          //bottom right
        OpenisGL.vertex(new Vertex(-SQUARE + ADDAM, -SQUARE, 1));        //top left
        OpenisGL.vertex(new Vertex(SQUARE + ADDAM, SQUARE, 6));          //bottom right
        OpenisGL.vertex(new Vertex(SQUARE + ADDAM, -SQUARE, 6));        //top right


        /*         // FRONT
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1));         //top left
                OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 1));          //bottom left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1));        //top left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
                OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 1));        //top right
        
                // BACK
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 3));         //top left
                OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 3));          //bottom left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 3));          //bottom right
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 3));        //top left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 3));          //bottom right
                OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 3));        //top right */

        /*         // RIGHT
                OpenisGL.vertex(new Vertex(-1.0, -1.0, 0.0));
                OpenisGL.vertex(new Vertex(1.0, -1.0, 0.0));
                OpenisGL.vertex(new Vertex(1.0, 1.0, 0.0));
                OpenisGL.vertex(new Vertex(-1.0, 1.0, 0.0)); */
        /*                 const SQUARE: number = 45;
        OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1.5));         //top left
        OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 1.5));          //bottom left
        OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 0.5));          //bottom right
        OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1.5));        //top left
        OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 0.5));          //bottom right
        OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 0.5));        //top right   */
        /*         circle = plotCircle(30, 9, timer2);
                //hrow Error("len: " + circle.length);
                for (let i = 0; i < circle.length; i++) {
                    if (i == 2) {
                        //circle[i][0].z = 3;
                    }
                    //circle[i][0].x += 15;
                    //circle[i][0].y += 15;
                    circle[i][0].z = zval;
                    //OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
                    OpenisGL.vertexC(circle[i][0], circle[i][1]);
                }
        
                 const SQUARE: number = 45;
                let HSV = new HSVColor(60, 100, 100);
                OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1));         //top left
                OpenisGL.setColor(new HSVColor(90 + timer % 360, 100, 100).toRGB());
                OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 1));          //bottom left
                OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
                OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1));        //top left
                OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
                OpenisGL.setColor(new HSVColor(180 + timer % 360, 100, 100).toRGB());
                OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 1));        //top right   */
        const SQUARE2: number = 150;
        let HSV = new HSVColor(60, 100, 100);
        OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        OpenisGL.vertex(new Vertex(-SQUARE2, -SQUARE2, 6));         //top left
        OpenisGL.setColor(new HSVColor(90 + timer % 360, 100, 100).toRGB());
        OpenisGL.vertex(new Vertex(-SQUARE2, SQUARE2, 6));          //bottom left
        OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
        OpenisGL.vertex(new Vertex(SQUARE2, SQUARE2, 6));          //bottom right
        OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        OpenisGL.vertex(new Vertex(-SQUARE2, -SQUARE2, 6));        //top left
        OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
        OpenisGL.vertex(new Vertex(SQUARE2, SQUARE2, 6));          //bottom right
        OpenisGL.setColor(new HSVColor(180 + timer % 360, 100, 100).toRGB());
        OpenisGL.vertex(new Vertex(SQUARE2, -SQUARE2, 6));        //top right
        //OpenisGL.plotLine(10, 10, 20, 10);
        //OpenisGL.plotLine(20, 10, 15, 20);
        //OpenisGL.plotLine(15, 20, 10, 10);
        //GPU.setBackground(0xFF0000);
        //OpenisGL.plotPolygon(new Polygon(new Vertex(0 + offset, 20), new Vertex(0 + offset, 30), new Vertex(20 + offset, 20)));
        //GPU.setBackground(0x0000FF);
        //OpenisGL.plotPolygon(new Polygon(new Vertex(20 + offset, 20), new Vertex(20 + offset, 30), new Vertex(0 + offset, 30)));
        //OpenisGL.plotPolygon(new Polygon(new Vertex(30, 30), new Vertex(20, 30), new Vertex(30, 20)));


        //OpenisGL.vertex(new Vertex(-10, -10));
        //OpenisGL.vertex(new Vertex(-10, 10));
        //OpenisGL.vertex(new Vertex(10, 10));
        //OpenisGL.vertex(new Vertex(10, 10));
        //OpenisGL.vertex(new Vertex(10, 1));
        //OpenisGL.vertex(new Vertex(0, 30));
        // OpenisGL.vertex(new Vertex(40, 10));
        // OpenisGL.vertex(new Vertex(40, 10));
        //OpenisGL.copyVertexArray(0);
        //OpenisGL.drawFromVI(file.vertices, file.indices);
        OpenisGL.end();
        OpenisGL.drawString(new Point(5, 5, 0), "Last frame took: " + fps);
        OpenisGL.drawString(new Point(5, 6, 0), "FPS: " + (1 / fps));
        /*     if (x) {
                x = false;
                GPU.fill(1, 1, w / 2, h / 2, " ");
                GPU.copy(1, 1, w / 2, h / 2, w / 2, h / 2);
            } else {
                x = true;
                GPU.fill(w / 2, 1, w - 1, h / 2, " ");
                GPU.copy(w / 2, 1, w - 1, h / 2, -(w / 2) - 1, h / 2);
            } */
        //OpenisGL.plotLine(0, 0, 10, 10);
        OpenisGL.swapBuffers();
        os.sleep(2);
        timer += 4;
        steps += 1;
        steps %= 50;
        timer2 += 1;
        if (!zflag) {
            zval += 0.1;
            if (zval > 2) {
                zflag = true;
            }
        } else {
            zval -= 0.1;
            if (zval <= 0) {
                zflag = false;
            }
        }
        let delta_ticks = os.clock() - current_ticks;
        if (delta_ticks > 0) {
            fps = delta_ticks;
        }
        //os.sleep(1 / (8 - fps));
    }
} catch (e) {
    OpenisGL.swapBuffers();
    OpenisGL.clear();
    print("Error: " + e);
}

function plotCircle(r: number, s: number, offset: number): [Vertex, Color][] {
    let steps = Math.max(s, 3);
    let vertices: [Vertex, Color][] = [];
    for (let i = 0; i < steps; i++) {
        let theta = (i + (0.1 * offset)) * 2 * Math.PI / steps;
        let thetaprime = (i + (0.1 * offset) + 1) * 2 * Math.PI / steps
        vertices.push([new Vertex(r * Math.cos(theta), r * Math.sin(theta), 0), new HSVColor((i * theta * 180 / Math.PI) % 360, 100, 100).toRGB()]);
        let v2 = new Vertex(r * Math.cos(thetaprime), r * Math.sin(thetaprime), 0);
        if (Math.abs(v2.y) < 0.1) {
            v2.y = 0;
        }
        vertices.push([v2, new HSVColor((thetaprime * 180 / Math.PI) % 360, 100, 100).toRGB()]);
        vertices.push([new Vertex(0, 0, 0), new HSVColor((i * theta * 180 / Math.PI) % 360, 100, 100).toRGB()]);
    }
    for (let i = 0; i < vertices.length; i++) {
        vertices[i][0].x = Math.floor(vertices[i][0].x);
        vertices[i][0].y = Math.floor(vertices[i][0].y);
    }
    return vertices;
}

function drawSquare(topLeft: Vertex, bottomLeft: Vertex, topRight: Vertex, bottomRight: Vertex, color: Color): void {
    OpenisGL.vertex(topLeft.clone());         //top left
    OpenisGL.vertex(bottomLeft.clone());          //bottom left
    OpenisGL.vertex(bottomRight.clone());          //bottom right
    OpenisGL.vertex(topLeft.clone());        //top left
    OpenisGL.vertex(bottomRight.clone());          //bottom right
    OpenisGL.vertex(topRight.clone());        //top right
}
