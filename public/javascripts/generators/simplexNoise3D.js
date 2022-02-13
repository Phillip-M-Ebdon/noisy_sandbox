const { rejects } = require("assert");
import { Permutation } from "./Permutation.js";

let generator = new SimplexGenerator();
let canvasContext = document.getElementsByTagName("canvas")[0].getContext("2d");

const TAU = 2 * Math.PI;

function cylinderNoise(x, y) {
    const angle = TAU * x;
    return generator.getNoise3D(123+Math.cos(angle) / TAU, 132+Math.sin(angle) / TAU, 321+y)
}

function generateHeightGrid(width, height, offset) {
    let heights = [];
    for (let y = 0; y < width; y++) {
        heights.push([]);
        for (let x = 0; x < height; x++) {
            let f = 1 / 500
            let total = 0.0;
            let a = 1;
            let octaveCount = 2
            let finalMultiplier = 0.0;
            for (let octave = 0; octave < octaveCount; octave++) {
                let value = a * cylinderNoise((x+offset) * f, y * f);
                finalMultiplier += a;
                total += value;
                a *= 0.5;
                f *= 2;
            }

            total *= 1 / finalMultiplier;

            let rgb = Math.round(total * 255);
            // console.log(rgb, rgb % step, rgb - rgb % step)
            heights[y].push(rgb);
        }
    }
    return heights;
}

function drawNoise2D(map, offset) {
    // draw map of a cylinder (looping), showing the loop (I hope?)
    for(let x = 0; x < 1000; x++) {
        for(let y = 0; y < 1000; y++) {
            // let value = cylinderNoise(x, y);
            let value = map[x][(y+offset)%1000]
            canvasContext.fillStyle = `rgb(${value},${value},${value})`
            canvasContext.fillRect(x, y, 1, 1);
        }
    }   
}

function animate2D() {
    let offset = 0;
    let rgbMap = generateHeightGrid(1000,1000, offset);
    setInterval(() => {
        drawNoise2D(rgbMap, offset);
        offset += 10;
    }, 0.1)
}

// let rgbMap = generateHeightGrid(1000,1000, 1);
// drawNoise3D(rgbMap, 1)

function draw3D() {
    
}

function animate3D() {

}

function setup() {
    createCanvas(1000, 1000, WEBGL)
}

function draw() {
    background(200)
    rect
}