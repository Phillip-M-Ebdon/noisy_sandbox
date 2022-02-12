import { percentBetween } from "./helpers/percentBetween.js"
import { mapValue } from "./helpers/mapValue.js"

const rowSlider = document.getElementById("rowSlider");
const textureMode = document.getElementById("textureMode")
const cellRadius = document.getElementById("cellRadius")

const BIOME_COLOURS = {
    snow: "rgb(255, 255, 255)",
    borealForest: "rgb(14, 56, 46)",
    forest: "rgb(0, 51, 20)",
    rainForest: "rgb(34, 140, 34)",
    tropicalForest: "rgb(125, 186, 7)",
    grassland: "rgb(198, 204, 81)",
    savanna: "rgb(251, 208, 116)",
    desert: "rgb(222, 189, 149)",
    mountain: "rgb(168, 171, 180)",
    waterShallow: "rgb(80, 127, 169)",
    waterDeep: "rgb(10, 70, 107)",
};


export default class WorleyGenerator2D {

    constructor(width, height, cellRows, cellColumns) {
        // setup initial grid
        this.width = width
        this.height = height
        this.grid = []
        for(let i = 0; i < this.width; i++){
            this.grid.push([])
            for(let j = 0; j < this.height; j++){
                this.grid[i].push(0)
            }
        }
        // setup overlay of cells
        // user indicates number of desired cells by row and column. size of cell is rounded down based on width and height
        this.cellWidth = Math.floor(width / cellColumns)
        this.cellHeight = Math.floor(height / cellRows)
        // number of cells, the final cells may not reach the edge if values are chosen with remainder
        this.cellRows = Math.floor(height / this.cellHeight)
        this.cellColumns = Math.floor(width / this.cellWidth)

        
        this.reseed();
    }

    reseed() {
        this.cellGrid = []
        for(let i = 0; i < this.cellRows; i++){
            this.cellGrid.push([])
            for(let j = 0; j < this.cellColumns; j++){
                // randomise point coordinates in this particular cell
                this.cellGrid[i].push([Math.random() * this.cellWidth, Math.random() * this.cellHeight])
            }
        }
        this.calculateGrid();
    }

    calculateGrid() {
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                let min = null;
                let max = null;

                // find cell centered around
                let cellRow = Math.floor(x / this.cellWidth)
                let cellColumn = Math.floor(y / this.cellHeight)                 

                // TODO check all cells in 9x9 grid
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {

                        if (cellRow + i < 0 || cellRow + i >= this.cellRows) continue;
                        if (cellColumn + j < 0 || cellColumn + j >= this.cellColumns) continue;

                        
                        let cell = this.cellGrid[cellRow+i][cellColumn+j];

                        // pythag yo!
                        let dist = Math.sqrt(((x%this.cellWidth) - (cell[0] + (i * this.cellWidth)))**2 + ((y%this.cellHeight) - (cell[1] + (j * this.cellHeight)))**2);
                        // track min and max values
                        min = min == null || min >= dist ? dist : min;
                        max = max == null || max <= dist ? dist : max;
                    }
                }
                this.grid[x][y] = min * Math.sqrt(this.cellRows * cellRadius.value)
            }
        }
    }

    getNoise2D() {
        return this.grid;
    }

    animate() {
        for(let i = 0; i < this.cellRows; i++){
            for(let j = 0; j < this.cellColumns; j++){
                
                this.cellGrid[i][j] = [
                    Math.min(this.cellWidth, Math.max(0, this.cellGrid[i][j][0] + (Math.random() - 0.5) * 5 )), 
                    Math.min(this.cellWidth, Math.max(0, this.cellGrid[i][j][1] + (Math.random() - 0.5) * 5 ))
                ]
            }
        }
        this.calculateGrid();
    }

}


function generatorBuilder() {
    return new WorleyGenerator2D(500, 500, rowSlider.value, rowSlider.value)
}

let generator = generatorBuilder();


function generateTemperatureGrid(heightGrid) {
    let tempGenerator = generatorBuilder();
    tempGenerator.reseed()
    tempGenerator.calculateGrid()
    let temperatures = [];
    for(let x = 0; x < heightGrid.length; x++) {
        temperatures.push([])
        for (let y = 0; y < heightGrid[x].length; y++){
            const altitude = heightGrid[y][x];
            const maxTemp = 40 - 10 * percentBetween(altitude, 0, 255); // yeah this sucks, should be using constants or variables. whoops.
            let total = tempGenerator.grid[x][y]
            total = mapValue(total, [0, 255], [-10, maxTemp]);
            temperatures[x].push(total)
        }
    }
    return temperatures;
}

function generateMoistureGrid(tempGrid) {
    let moiGenerator = generatorBuilder()
    moiGenerator.reseed()
    moiGenerator.calculateGrid()
    let moistures = [];
    for(let x = 0; x < tempGrid.length; x++) {
        moistures.push([])
        for (let y = 0; y < tempGrid[x].length; y++){
            const temp = tempGrid[y][x];
            let total = moiGenerator.grid[x][y]
            const maxMoisture = percentBetween(temp, -10, 40) * 100;
            const moisture = mapValue(total, [0, 255], [0, maxMoisture]);
            moistures[x].push(moisture);
        }
    }
    return moistures
}

function simulateBiomes(heightGrid) {
    const width = heightGrid[0].length;
    const height = heightGrid.length;
    let tempGrid = generateTemperatureGrid(heightGrid);
    let moiGrid = generateMoistureGrid(tempGrid);

    console.log(Math.min);

    const max = Math.max(...[].concat(...tempGrid));
    const min = Math.min(...[].concat(...tempGrid));
    console.log(max);
    console.log(min);

    console.log(heightGrid, tempGrid, moiGrid);

    let rgbMap = [];
    for (let y = 0; y < width; y++) {
        rgbMap.push([]);
        for (let x = 0; x < height; x++) {
            let alt = heightGrid[y][x];
            let moi = moiGrid[y][x];
            let temp = tempGrid[y][x];
            let biome;

            // overrides
            if (alt > 200 || alt < 90) {
                // mountains
                if (alt > 225) biome = "snow";
                else if (alt > 200) biome = "mountain";
                // water
                else if (alt > 50) biome = "waterShallow";
                else biome = "waterDeep";
            } else {
                // cold
                if (temp <= 0) {
                    // but enough moisture
                    if (moi > 15) biome = "borealForest";
                    // nothing but ice
                    else biome = "snow";
                }

                // temperate
                else if (temp > 0 && temp < 20) {
                    // just right, but a little drier
                    if (moi < 20) biome = "grassland";
                    // enought moisture for something more
                    else biome = "forest";
                }

                // hot
                else {
                    // and dry
                    if (moi < 20) biome = "desert";
                    // a little mositure
                    else if (moi < 40) biome = "savanna";
                    // a lot of moisture
                    else if (moi < 70) biome = "rainForest";
                    // welcome to the tropics
                    else biome = "tropicalForest";
                }
            }
            // rgbMap[y].push(`rgb(${alt},${temp},${moi})`)
            rgbMap[y].push(BIOME_COLOURS[biome]);
        }
    }
    return rgbMap;
}

/**
 * Output a grid of RGB values acting as a texture for a heightGrid
 * colours chosen to roughly mimic a world-map / atlas style diagram
 * @param {*} heightGrid
 * @returns
 */
function generateAtlasMap(heightGrid) {
    const width = heightGrid[0].length;
    const height = heightGrid.length;
    let rgbMap = [];
    for (let y = 0; y < width; y++) {
        rgbMap.push([]);
        for (let x = 0; x < height; x++) {
            let alt = heightGrid[y][x];
            if (alt < 75) {
                rgbMap[y].push(
                    `rgb(${157},${200 + percentBetween(alt, 0, 74) * 25},${255}`
                );
            } else if (alt < 90) {
                rgbMap[y].push(
                    `rgb(${195},${210 + percentBetween(alt, 0, 90) * 25},${255}`
                );
            } else if (alt < 100) {
                rgbMap[y].push(
                    `rgb(${255},${210 + percentBetween(alt, 90, 100) * 40},${
                        190 + percentBetween(alt, 90, 100) * 10
                    }`
                );
            } else if (alt < 125) {
                rgbMap[y].push(
                    `rgb(${180},${220 + percentBetween(alt, 100, 124) * 30},${
                        180 + percentBetween(alt, 100, 124) * 20
                    }`
                );
            } else if (alt < 150) {
                rgbMap[y].push(
                    `rgb(${170},${200 + percentBetween(alt, 125, 149) * 10},${
                        170 + percentBetween(alt, 125, 149) * 10
                    }`
                );
            } else if (alt < 200) {
                rgbMap[y].push(
                    `rgb(${
                        200 + percentBetween(alt, 150, 199) * 55
                    },${180},${150}`
                );
            } else
                rgbMap[y].push(
                    `rgb(${250 + percentBetween(alt, 250, 255) * 5},${
                        250 + percentBetween(alt, 250, 255) * 5
                    },${250 + percentBetween(alt, 250, 255) * 5}`
                );
        }
    }
    return rgbMap;
}

/**
 * Return the appropriate grid of RGB values to be interpreted as a texture
 * @param {*} heightGrid
 * @returns
 */
function heightToRGB(heightGrid) {
    const mode = textureMode.value;

    switch (mode) {
        case "atlas":
            // some arbitrary colours in a switch to emulate an Atlas or world map
            return generateAtlasMap(heightGrid);
            break;

        case "simulate":
            // whack
            return simulateBiomes(heightGrid);
            break;

        default:
            // output greyscale
            let rgbMap = [];
            const width = heightGrid[0].length;
            const height = heightGrid.length;
            for (let y = 0; y < width; y++) {
                rgbMap.push([]);
                for (let x = 0; x < height; x++) {
                    let alt = heightGrid[y][x];
                    rgbMap[y].push(`rgb(${alt},${alt},${alt}`);
                }
            }
            return rgbMap;
            break;
    }
}

let canvas = document.getElementsByTagName("canvas")[0].getContext("2d");

function draw2D() {
    // let freqSlider = document.getElementById("freqSlider").value;
    // let colSlider = document.getElementById("colSlider").value;
    let rgbMap = heightToRGB(generator.grid);
    for (let y = 0; y < generator.grid.length; y++) {
        for (let x = 0; x < generator.grid[y].length; x++) {
            canvas.fillStyle = rgbMap[y][x];
            canvas.fillRect(x, y, 1, 1);
        }
    }
}

const reseedButton = document.getElementById("reseedButton");

reseedButton.onclick = function () {
    generator = generatorBuilder();
    generator.reseed();
    draw2D();
}

rowSlider.onchange = function () {
    generator = generatorBuilder();
    generator.reseed();
    document.getElementById("rowValue").innerText = rowSlider.value;
    draw2D();
};

cellRadius.onchange = function () {
    document.getElementById("cellRadiusValue").innerText = cellRadius.value;
    generator.calculateGrid();
    draw2D();
};

textureMode.onchange = function () {
    generator.calculateGrid();
    draw2D();
}

draw2D();

// setInterval(() => {
//     generator.animate();
//     draw2D();
//     },
//     75
// )
