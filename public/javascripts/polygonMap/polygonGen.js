import Delaunator from 'https://cdn.skypack.dev/delaunator@5.0.0';

class Node {

    constructor(x, y) {
        // cartesiantCoords
        this.x = x;
        this.y = y;
        this.edges = [];
    }    
}

class Edge {
    constructor(source, dest) {
        this.source = source
        this.dest = dest
    }
}

class PolygonGraph {

    /**
     * 
     * @param {*} width Width of Graph
     * @param {*} height Height of Graph
     * @param {*} spacing the interval that points are spaced over, forms a larger grid over the top.
     */
    constructor(width, height, spacing) {
        this.nodeGrid = [];
        this.spacing = spacing;
        this.width = width;
        this.height = height;

        for(let x = 0; x < width; x+=spacing) {
            this.nodeGrid.push([])
            for(let y = 0; y < height; y+=spacing) {
                let newNode = new Node(x + this.jitter(spacing), y + this.jitter(spacing));
                this.nodeGrid[x/spacing].push(newNode)
            }
        }

    }

    jitter(spacing) {
        return Math.random() * spacing;
    }

    nextHalfedge(e) { return (e % 3 === 2) ? e - 2 : e + 1; }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    render(context) {
        for(let x = 0; x <= this.width; x+=this.spacing) {
            context.moveTo(x, 0);
            context.lineTo(x, this.height)
            context.stroke()
        }

        for(let y = 0; y <= this.height; y+=this.spacing) {
            context.moveTo(0, y);
            context.lineTo(this.width, y)
            context.stroke()
        }

        this.nodeGrid.forEach((row) => {
            row.forEach((node) => {
                context.fillStyle = "red"
                context.beginPath();
                context.ellipse(node.x, node.y, 2, 2, 0, 0, 360);
                context.fill();
            })
        })

        let rowLength = this.width/this.spacing 
        let colLength = this.height/this.spacing 

        let nodes = [];
        for (let x = 0; x < rowLength; x++) {
            for (let y = 0; y < colLength; y++) {
                nodes.push([this.nodeGrid[x][y].x, this.nodeGrid[x][y].y])
            }
        }

        let delunated = Delaunator.from(nodes)
        let triangles = delunated.triangles;
        let halfedges = delunated.halfedges;

        this.triangles = triangles;
        this.halfedges = halfedges;

        console.log(triangles);

        for (let e = 0; e < this.triangles.length; e++) {
            if (e > this.halfedges[e]) {
                const p = nodes[this.triangles[e]];
                const q = nodes[this.triangles[this.nextHalfedge(e)]];
                context.moveTo(p[0], p[1]);
                context.lineTo(q[0], q[1]);
                context.stroke();
            }
        }

    }
}

let graph = new PolygonGraph(500, 500, 50);
let canvasContext = document.getElementsByTagName("canvas")[0].getContext("2d");
graph.render(canvasContext);