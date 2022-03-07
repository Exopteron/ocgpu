// Copyright (c) Exopteron 2022
import { min_element, randint } from "tstl";
import { ArrayReverseIterator } from "tstl/internal/iterator/ArrayReverseIterator";
import { GPU } from "./constants";
import { FragmentShader, Matrix, OpenisGL, Point, Polygon2D, Triangle, Vertex, VertexShader } from "./gpu";
import { Color, HSVColor, Vec3 } from "./gpu/color";
import { DrawPrimitive } from "./gpu/mode";
import { ThreadPool } from "./threadpool";


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
                this.vertices.push(new Vertex(Math.round(parseFloat(v[0])), Math.round(parseFloat(v[1])), Math.round(parseFloat(v[2])), 1));
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
let matrix = new Matrix([
    [1, 2, 2, -5],
    [6, 2, 8, 1],
    [1, 3, 7, 3],
    [5, -10, 8, 0],
]);
let vector = new Vertex(1, 6, 2, 3);
//print("Dick " + matrix.multiply(vector).toString());
//throw Error("balls " + 1 * -5);
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
// let c = plotCircle(30, 3, 0);
// let start = os.clock();
// OpenisGL.plotPolygon(new Triangle(c[0][0], c[1][0], c[2][0], c[0][1], c[1][1], c[2][1]));
// let end = os.clock();
// print("Took: " + (end - start) + " " + end + " " + start);
// let pool = new ThreadPool(2);
// pool.execute(() => {
//     os.sleep(3);
//     print("Cock");
// });
// pool.execute(() => {
//     os.sleep(3);
//     print("Balls");
// });
// pool.wait();
//os.exit();


let timer = 0;
let circle = plotCircle(30, 40, 0);
for (let i = 0; i < circle.length; i++) {
    //print("Vert: " + circle[i].toString());
}
//print("Cosinema Dick: " + Math.cos(90));
let file = new ObjFile("/home/cube.obj");
for (let i = 0; i < file.vertices.length; i++) {

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
// OpenisGL.setFragShader(new FragmentShader((p, po) => {
//     return po.aColor;
// }));
// OpenisGL.setFragShader(new FragmentShader((point, poly) => {
//     return new Color(255, 0, 0);
// }));
let flagepic = false;

function rotate(x: number, y: number, radians: number) : [number, number] {
    let center = [0, 0];
    let xRot = Math.cos(radians) * (x - center[0]) - Math.sin(radians) * (y - center[1]) + center[0];
    let yRot = Math.sin(radians) * (x - center[0]) + Math.cos(radians) * (y - center[1]) + center[1];
    return [xRot, yRot];
}

let sunX = -25;
let sunY = -25;
OpenisGL.setFragShader(new FragmentShader((point, poly, vsout) => {
    let lightPos = new Vec3(sunX, sunY, 0);
    let norm = poly.normal();
    if (norm.z >= 1) {
        norm = norm.negate().normalized();
        //flagepic = false;
    } else {
        norm = norm.normalized();
        //flagepic = true;
    }
    let [x,y,z] = vsout[0];
    let fragpos = new Vec3(x, y, z);

    let lightDir = (lightPos.minus(fragpos)).normalized();
    let diff = Math.max(norm.dot(lightDir), 0.0);
    let ambientStrength = 0.01;
    let lightColor = new Vec3(255, 255, 255);
    let objectColor = new Vec3(128, 128, 128);

    let diffuse = lightColor.mult(diff);

    let ambient = lightColor.mult(ambientStrength);
    let result = (ambient.add(diffuse)).multVec(objectColor);
    if (result.x < 0.01) {
        result.x = 0;
    }
    if (result.y < 0.01) {
        result.y = 0;
    }
    if (result.z < 0.01) {
        result.z = 0;
    }
    result = result.mult(0.1);
    return new Color(result.x, result.y, result.z);
    // let w_v1 = (((poly.b.y - poly.c.y) * (point.x - poly.c.x)) + (poly.c.x - poly.b.x) * (point.y - poly.c.y)) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

    // let w_v2 = (((poly.c.y - poly.a.y) * (point.x - poly.c.x)) + ((poly.a.x - poly.c.x) * (point.y - poly.c.y))) / (((poly.b.y - poly.c.y) * (poly.a.x - poly.c.x)) + ((poly.c.x - poly.b.x) * (poly.a.y - poly.c.y)));

    // let w_v3 = 1 - w_v1 - w_v2;

    // // w_v1 = Math.max(w_v1, 0);
    // // w_v2 = Math.max(w_v2, 0);
    // // w_v3 = Math.max(w_v3, 0);
    // //let color = (w_v1 * poly.aColor.toHex() + w_v2 * poly.bColor.toHex() + w_v3 * poly.cColor.toHex()) / (w_v1 + w_v2 + w_v3);
    // let red = (w_v1 * poly.aColor.red + w_v2 * poly.bColor.red + w_v3 * poly.cColor.red) / (w_v1 + w_v2 + w_v3);
    // let green = (w_v1 * poly.aColor.green + w_v2 * poly.bColor.green + w_v3 * poly.cColor.green) / (w_v1 + w_v2 + w_v3);
    // let blue = (w_v1 * poly.aColor.blue + w_v2 * poly.bColor.blue + w_v3 * poly.cColor.blue) / (w_v1 + w_v2 + w_v3);
    // //print(`Red ${red} Green ${green} Blue ${blue}`);
    // let [r,g,b] = vsout[0];
    // //print("Val: " + vsout[0][0]);
    // return new Color(r,g,b);
}));
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
OpenisGL.setVertexShader(new VertexShader((v, c) => {
    //os.exit();
    //v.z += 2.5;
    // while (true) {
    //     if (v.z < 0.01) {
    //         v.z += 0.5;
    //     } else {
    //         break;
    //     }
    // }
    // v.z = Math.max(v.z, 0);
    // v.x += 10;
    // v.y += 10;
    let v2 = Polygon2D.perspectiveProject(v.clone());
    let vsout = [[v2.x, v2.y, v2.z]];
    return [v, c, vsout];
}));
/* OpenisGL.setFragShader(new FragmentShader((point, poly) => {
    return new Color(255, 0, 0);
})); */
OpenisGL.setDrawPrimitive(DrawPrimitive.TRIANGLES);
let zval = 0;
let zflag = false;
let spin: number = 0.0;
/* 

x axis = 
let matrixSpin = new Matrix([
    [1, 0, 0],
    [0, Math.cos(spin), -Math.sin(spin)],
    [0, Math.sin(spin), Math.cos(spin)],
]);

y axis = 
        let matrixSpin = new Matrix([
            [Math.cos(spin), 0, Math.sin(spin)],
            [0, 1, 0],
            [-Math.sin(spin), 0, Math.cos(spin)]
        ]);



*/

function degrees_to_radians(degrees) {
    let pi = Math.PI;
    return degrees * (pi / 180);
}
let switcher = 0;
let flag = false;
let cubeMoveZ = 0;
let cubeMoveFlag = true;
try {
    while (true) {


        // switcher++;
        // if (switcher > 5) {NZ

        //     } else {
        //         OpenisGL.setDrawPrimitive(DrawPrimitive.TRIANGLES);
        //         flag = true;
        //     }
        //     switcher = 0;
        // }


        // let matrixSpin = new Matrix([
        //     [0.71, 0, 0.71, 0],
        //     [0, 1, 0, 0],
        //     [-0.71, 0, 0.71, 0],
        //     [0, 0, 0, 1]
        // ]);
        // OpenisGL.setMatrix(matrixSpin);
        //let spin = degrees_to_radians(15);
        // let matrixSpin = new Matrix([
        //     [Math.cos(spin), 0, Math.sin(spin), 0],
        //     [0, 1, 0, 0],
        //     [-Math.sin(spin), 0, Math.cos(spin), 0],
        //     [0, 0, 0, 1]
        // ]);



        //OpenisGL.setMatrix(matrixSpin);
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
        // const S: number = 60;
        // OpenisGL.setColor(new Color(255, 0, 255));
        // OpenisGL.vertex(new Vertex(-S, -S, -S));
        // OpenisGL.vertex(new Vertex(-S, S, -S));
        // OpenisGL.vertex(new Vertex(S, S, -S));

        // OpenisGL.vertex(new Vertex(S, S, -S));
        // OpenisGL.vertex(new Vertex(-S, -S, -S));
        // OpenisGL.vertex(new Vertex(S, -S, -S));


        // OpenisGL.setColor(new Color(255, 255, 0));
        // OpenisGL.vertex(new Vertex(-S, -S, S));
        // OpenisGL.vertex(new Vertex(-S, S, S));
        // OpenisGL.vertex(new Vertex(S, S, S));

        // OpenisGL.vertex(new Vertex(S, S, S));
        // OpenisGL.vertex(new Vertex(-S, -S, S));
        // OpenisGL.vertex(new Vertex(S, -S, S));

        // OpenisGL.setColor(new Color(255, 255, 255));
        // OpenisGL.vertex(new Vertex(-S, -S, -S));
        // OpenisGL.vertex(new Vertex(-S, -S, S));
        // OpenisGL.vertex(new Vertex(S, -S, -S));

        // OpenisGL.vertex(new Vertex(S, -S, -S));
        // OpenisGL.vertex(new Vertex(-S, -S, S));
        // OpenisGL.vertex(new Vertex(-S, -S, S));


        // OpenisGL.setColor(new Color(0, 255, 255));
        // OpenisGL.vertex(new Vertex(-S, S, -S));
        // OpenisGL.vertex(new Vertex(-S, S, S));
        // OpenisGL.vertex(new Vertex(S, S, -S));

        // OpenisGL.vertex(new Vertex(S, S, -S));
        // OpenisGL.vertex(new Vertex(-S, S, S));
        // OpenisGL.vertex(new Vertex(-S, S, S));



        // OpenisGL.setColor(new Color(0, 0, 255));
        // OpenisGL.vertex(new Vertex(S, -S, -S));
        // OpenisGL.vertex(new Vertex(S, S, -S));
        // OpenisGL.vertex(new Vertex(S, S, S));

        // OpenisGL.vertex(new Vertex(S, S, S));
        // OpenisGL.vertex(new Vertex(S, -S, -S));
        // OpenisGL.vertex(new Vertex(S, -S, S));


        // OpenisGL.setColor(new Color(255, 0, 0));
        // OpenisGL.vertex(new Vertex(-S, -S, -S));
        // OpenisGL.vertex(new Vertex(-S, S, -S));
        // OpenisGL.vertex(new Vertex(-S, S, S));

        // OpenisGL.vertex(new Vertex(-S, S, S));
        // OpenisGL.vertex(new Vertex(-S, -S, -S));
        // OpenisGL.vertex(new Vertex(-S, -S, S));
        /*     OpenisGL.setVertexShader(new VertexShader((vert, c) => {
                //vert.setX(vert.getX() + 25);
                return [vert, c];
                //return vert;
            })); */
        //let i = 0;
        //GPU.setBackground(0xFF0000);
        // const SQUARE: number = 20;
        // OpenisGL.vertex(new Vertex(-0.71 * SQUARE, -1 * SQUARE, 0.71 * SQUARE));
        // OpenisGL.vertex(new Vertex(-0.71 * SQUARE, 1 * SQUARE, 0.71 * SQUARE));
        // OpenisGL.vertex(new Vertex(0 * SQUARE, 1 * SQUARE, 0 * SQUARE));
        // OpenisGL.vertex(new Vertex(0 * SQUARE, 1 * SQUARE, 0 * SQUARE));
        // OpenisGL.vertex(new Vertex(0 * SQUARE, -1 * SQUARE, 0 * SQUARE));
        // OpenisGL.vertex(new Vertex(-0.71 * SQUARE, -1 * SQUARE, 0.71 * SQUARE));
        /*                  OpenisGL.vertex(new Vertex(-20, 0, 3));
                        OpenisGL.vertex(new Vertex(20, 0, 3));
                        OpenisGL.vertex(new Vertex(0, 1.7 * -20, 0)); 

        // const SQUARE: number = 45;
        // OpenisGL.setColor(new Color(255, 255, 255));
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 6));         //top left
        // OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 6));          //bottom left
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 6));        //top left
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
        // OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 1));        //top right

        // OpenisGL.setColor(new Color(255, 0, 0));
        // const ADDAM: number = 2 * SQUARE;
        // OpenisGL.vertex(new Vertex(-SQUARE + ADDAM, -SQUARE, 1));         //top left
        // OpenisGL.vertex(new Vertex(-SQUARE + ADDAM, SQUARE, 1));          //bottom left
        // OpenisGL.vertex(new Vertex(SQUARE + ADDAM, SQUARE, 6));          //bottom right
        // OpenisGL.vertex(new Vertex(-SQUARE + ADDAM, -SQUARE, 1));        //top left
        // OpenisGL.vertex(new Vertex(SQUARE + ADDAM, SQUARE, 6));          //bottom right
        // OpenisGL.vertex(new Vertex(SQUARE + ADDAM, -SQUARE, 6));        //top right


        /*         // FRONT
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1));         //top left
                OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 1));          //bottom left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1));        //top left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1));          //bottom right
                OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 1));        //top right
        
                //hat'enisGL.vertex(new Vertex(SQUARE, SQUARE, 3));          //bottom right
                OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 3));        //top left
                OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 3));          //bottom right
                OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 3));        //top right */

        /*         // RIGHT
                OpenisGL.vertex(new Vertex(-1.0, -1.0, 0.0));
                OpenisGL.vertex(new Vertex(1.0, -1.0, 0.0));
                OpenisGL.vertex(new Vertex(1.0, 1.0, 0.0));
                OpenisGL.vertex(new Vertex(-1.0, 1.0, 0.0)); */

        const OFFSET: number = 0;
        const SQUARE: number = 4;
        class temparr {
            public arr: [Vertex, Color][] = [];
            public color: Color = new Color(255, 255, 255);
            public push(vertex: Vertex) {
                this.arr.push([vertex, this.color]);
            }
            public setColor(c: Color) {
                this.color = c;
            }
        }
        let arr: temparr = new temparr();
        // let triangles = OpenisGL.toTriangles(file.vertices, file.indices);
        // for (let triangle of triangles) {
        //     arr.push(triangle.a);
        //     arr.push(triangle.b);
        //     arr.push(triangle.c);
        // } 
                const S: number = 4;
        arr.setColor(new Color(255, 0, 255));
        arr.push(new Vertex(-S, -S, -S, 1));
        arr.push(new Vertex(-S, S, -S, 1));
        arr.push(new Vertex(S, S, -S, 1));

        arr.push(new Vertex(S, S, -S, 1));
        arr.push(new Vertex(S, -S, -S, 1));
        arr.push(new Vertex(-S, -S, -S, 1));


        arr.setColor(new Color(255, 255, 0));
        arr.push(new Vertex(-S, -S, S, 1));
        arr.push(new Vertex(-S, S, S, 1));
        arr.push(new Vertex(S, S, S, 1));

        arr.push(new Vertex(S, S, S, 1));
        arr.push(new Vertex(S, -S, S, 1));
        arr.push(new Vertex(-S, -S, S, 1));

        arr.setColor(new Color(255, 255, 255));
        arr.push(new Vertex(-S, -S, -S, 1));
        arr.push(new Vertex(-S, -S, S, 1));
        arr.push(new Vertex(S, -S, -S, 1));

        arr.push(new Vertex(S, -S, -S, 1));
        arr.push(new Vertex(S, -S, S, 1));
        arr.push(new Vertex(-S, -S, S, 1));


        arr.setColor(new Color(0, 255, 255));
        arr.push(new Vertex(-S, S, -S, 1));
        arr.push(new Vertex(-S, S, S, 1));
        arr.push(new Vertex(S, S, -S, 1));

        arr.push(new Vertex(S, S, -S, 1));
        arr.push(new Vertex(S, S, S, 1));
        arr.push(new Vertex(-S, S, S, 1));



        arr.setColor(new Color(0, 0, 255));
        arr.push(new Vertex(S, -S, -S, 1));
        arr.push(new Vertex(S, S, -S, 1));
        arr.push(new Vertex(S, S, S, 1));

        arr.push(new Vertex(S, S, S, 1));
        arr.push(new Vertex(S, -S, S, 1));
        arr.push(new Vertex(S, -S, -S, 1));


        arr.setColor(new Color(255, 0, 0));
        arr.push(new Vertex(-S, -S, -S, 1));
        arr.push(new Vertex(-S, S, -S, 1));
        arr.push(new Vertex(-S, S, S, 1));

        arr.push(new Vertex(-S, S, S, 1));
        arr.push(new Vertex(-S, -S, S, 1));
        arr.push(new Vertex(-S, -S, -S, 1));
        // let circle = plotCircle(8, 9, timer2);
        // for (let i = 0; i < circle.length; i++) {
        //     arr.push(circle[i][0]);
        // }
        // arr.push(new Vertex(-SQUARE, -SQUARE, 0 + OFFSET, 1));         //top left
        // arr.push(new Vertex(-SQUARE, SQUARE, 0 + OFFSET, 1));          //bottom left
        // arr.push(new Vertex(SQUARE, SQUARE, 0 - OFFSET, 1));          //bottom right
        // arr.push(new Vertex(-SQUARE, -SQUARE, 0 + OFFSET, 1));        //top left
        // arr.push(new Vertex(SQUARE, SQUARE, 0 - OFFSET, 1));          //bottom right
        // arr.push(new Vertex(SQUARE, -SQUARE, 0 - OFFSET, 1));        //top right   
        let spin2 = degrees_to_radians(spin);
        let matrixSpin = new Matrix([
            [Math.cos(spin2), 0, Math.sin(spin2), 0],
            [0, 1, 0, 0],
            [-Math.sin(spin2), 0, Math.cos(spin2), 0],
            [0, 0, 0, 1]
        ]);
        let matrixSpin2 = new Matrix([
            [1, 0, 0, 0],
            [0, Math.cos(spin2), -Math.sin(spin2), 0],
            [0, Math.sin(spin2), Math.cos(spin2), 0],
            [0, 0, 0, 1],
        ]);
        let vertices: Vertex[] = [];
        let colors: Color[] = [];
        colors.push(new Color(255, 0, 0));

        colors.push(new Color(0, 255, 0));

        colors.push(new Color(0, 0, 255));

        colors.push(new Color(255, 255, 0));

        colors.push(new Color(255, 0, 255));

        colors.push(new Color(0, 255, 255));
        if (cubeMoveFlag) {
            cubeMoveZ++;
            if (cubeMoveZ > 10) {
                cubeMoveFlag = false;
            }
        } else {
            cubeMoveZ--;
            if (cubeMoveZ == -5) {
                cubeMoveFlag = true;
            }
        }
        let idx = 0;
        for (let [element, color] of arr.arr) {
            //let mult = element;
            let mult = matrixSpin2.multiply(element);
            mult = matrixSpin.multiply(mult);
            mult.z += 16;
            mult.z += -5;
            OpenisGL.vertexC(mult, Color.random());
        }
        let [newsx, newsy] = rotate(sunX, sunY, degrees_to_radians(5));
        sunX = newsx;
        sunY = newsy;

        // const OFFSET: number = 0;
        // const SQUARE: number = 4;
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1 + OFFSET, 1));         //top left
        // OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 1 + OFFSET, 1));          //bottom left
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1 - OFFSET, 1));          //bottom right
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1 + OFFSET, 1));        //top left
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 1 - OFFSET, 1));          //bottom right
        // OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 1 - OFFSET, 1));        //top right   



        //                 const SQUARE: number = 45;
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1.5, 1));         //top left
        // OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 1.5, 1));          //bottom left
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 0.5, 1));          //bottom right
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 1.5, 1));        //top left
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 0.5, 1));          //bottom right
        // OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 0.5, 1));        //top right   
        // circle = plotCircle(30, 9, timer2); // 2.4
        // //hrow Error("len: " + circle.length);
        // for (let i = 0; i < circle.length; i++) {
        //     if (i == 2) {
        //         //circle[i][0].z = 3;
        //     }
        //     //circle[i][0].x += 15;
        //     //circle[i][0].y += 15;
        //     circle[i][0].z = zval;
        //     //circle[i][0] = matrixSpin.multiply(circle[i][0]);
        //     //OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        //     OpenisGL.vertexC(circle[i][0], circle[i][1]);
        // }

        // const SQUARE: number = 45;
        // let HSV = new HSVColor(60, 100, 100);
        // OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 12));         //top left
        // OpenisGL.setColor(new HSVColor(90 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(-SQUARE, SQUARE, 12));          //bottom left
        // OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 12));          //bottom right
        // OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(-SQUARE, -SQUARE, 12));        //top left
        // OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(SQUARE, SQUARE, 12));          //bottom right
        // OpenisGL.setColor(new HSVColor(180 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(SQUARE, -SQUARE, 12));        //top right   
        // const SQUARE2: number = 150;
        // let HSV = new HSVColor(60, 100, 100);
        // OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(-SQUARE2, -SQUARE2, 6));         //top left
        // OpenisGL.setColor(new HSVColor(90 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(-SQUARE2, SQUARE2, 6));          //bottom left
        // OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(SQUARE2, SQUARE2, 6));          //bottom right
        // OpenisGL.setColor(new HSVColor(0 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(-SQUARE2, -SQUARE2, 6));        //top left
        // OpenisGL.setColor(new HSVColor(270 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(SQUARE2, SQUARE2, 6));          //bottom right
        // OpenisGL.setColor(new HSVColor(180 + timer % 360, 100, 100).toRGB());
        // OpenisGL.vertex(new Vertex(SQUARE2, -SQUARE2, 6));        //top right
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
        OpenisGL.drawString(new Point(5, 5, 0, 0), "Last frame took: " + fps);
        OpenisGL.drawString(new Point(5, 6, 0, 0), "FPS: " + (1 / fps));
        OpenisGL.drawString(new Point(5, 7, 0, 0), "Triangles: " + OpenisGL.triangleAmount());
        OpenisGL.drawString(new Point(5, 8, 0, 0), "Greatest Z:" + OpenisGL.greatestZ);
        OpenisGL.drawString(new Point(5, 9, 0, 0), "Lowest Z:" + OpenisGL.lowestZ);
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
        //os.sleep(2);
        timer += 4;
        steps += 1;
        steps %= 50;
        timer2 += 1;
        if (!zflag) {
            zval += 0.1;
            if (zval > 1) {
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
        spin += 15;
        if (spin >= 360) {
            spin = 1;
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
        vertices.push([new Vertex(r * Math.cos(theta), r * Math.sin(theta), 0, 1), new HSVColor((i * theta * 180 / Math.PI) % 360, 100, 100).toRGB()]);
        let v2 = new Vertex(r * Math.cos(thetaprime), r * Math.sin(thetaprime), 0, 1);
        if (Math.abs(v2.y) < 0.1) {
            v2.y = 0;
        }
        vertices.push([v2, new HSVColor((thetaprime * 180 / Math.PI) % 360, 100, 100).toRGB()]);
        vertices.push([new Vertex(0, 0, 0, 1), new HSVColor((i * theta * 180 / Math.PI) % 360, 100, 100).toRGB()]);
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
