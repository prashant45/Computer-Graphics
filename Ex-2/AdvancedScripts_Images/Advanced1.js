"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

var polygon = new Polygon([new Point(50, 10),
                           new Point(150, 10),
                           new Point(190, 150),
                           new Point(10, 190),
                           new Point(10, 100)], 5,
                           new Color(255, 255, 0));

/////////////////////
//// edge table  ////
/////////////////////

// edge table entry
function EdgeTableEntry(edge) {
    var dx = 0;
    var dy = 0;
    if (edge.startPoint.y < edge.endPoint.y) {
        this.y_lower = edge.startPoint.y;
        this.x_lower = edge.startPoint.x;
        this.y_upper = edge.endPoint.y;
        dx = edge.endPoint.x - edge.startPoint.x;
        dy = edge.endPoint.y - edge.startPoint.y;
    }
    else {
        this.y_lower = edge.endPoint.y;
        this.x_lower = edge.endPoint.x;
        this.y_upper = edge.startPoint.y;
        dx = edge.startPoint.x - edge.endPoint.x;
        dy = edge.startPoint.y - edge.endPoint.y;
    }

    this.invSlope = dx / dy;
}

function compareEdgeTableEntries(a, b) {
    return a.y_lower - b.y_lower;
}

function printEdgeTableEntry(e) {
    console.log("ET: " + e.y_lower + " " + e.x_lower + " " + e.y_upper + " " + e.invSlope);
}

// edge table
function EdgeTable(polygon) {
    this.entries = new Array(polygon.nEdges);
    this.nEntries = polygon.nEdges;

    for (var i = 0; i < polygon.nEdges; i++) {
        this.entries[i] = new EdgeTableEntry(polygon.edges[i]);
    }
    this.entries.sort(compareEdgeTableEntries);

    for (var i = 0; i < polygon.nEdges; i++) {
        printEdgeTableEntry(this.entries[i]);
    }
}

////////////////////////////
//// active edge table  ////
////////////////////////////

// active edge table entry
function ActiveEdgeTableEntry(edgeTableEntry) {
    this.x_intersect = edgeTableEntry.x_lower;
    this.y_upper = edgeTableEntry.y_upper;
    this.invSlope = edgeTableEntry.invSlope;
}

function compareActiveEdgeTableEntries(a, b) {
    return a.x_intersect - b.x_intersect;
}

// active edge table
function ActiveEdgeTable() {
    this.entries = new Array();
    this.nEntries = 0;
}


/////////////////////////////
//// scanline algorithm  ////
/////////////////////////////

function scanline(image, polygon) {

    var edgeTable = new EdgeTable(polygon);
    var activeEdgeTable = new ActiveEdgeTable();

    //////////////////////////
    ///////   TODO   /////////
    //////////////////////////

    for (var y_scanline = 0; y_scanline < image.height; y_scanline++) {
        // [optimization]
        // if the active edge table is empty (nEntries==0) we can step to the next edge, i.e. we can set y_scanline = myEdgeTableEntry.y_lower
        // note that the edge table is sorted by y_lower!




        // [mandatory]
        // build a new active edge table
        // copy all edges from the previouse active edge table




        // [mandatory]
        // add new edges from the edge table to the active edge table




        // [mandatory]
        // sort the active edge table along x (use the array sort function with compareActiveEdgeTableEntries as compare function)



        // [mandatory]
        // rasterize the line:
        // for every two successive pairs of active edge entries set the pixels in between the x intersections (the first and the second entry build a line segment, the third and the fourth build a line segment and so on)




        // [mandatory]
        // update the x_intersect of the active edge table entries



    }
    //////////////////////////
    ///////   TODO   /////////
    //////////////////////////
}


//////////////////////////
//// render function  ////
//////////////////////////

function RenderCanvas3() {
    // get canvas handle
    var context = document.getElementById("canvas3").getContext("2d");
    var canvas = context.createImageData(200, 200);

    // clear canvas
    clearImage(canvas, new Color(255, 255, 255));

    // draw line
    scanline(canvas, polygon);

    // show image
    context.putImageData(canvas, 0, 0);
}

function setupScanline(canvas) {
    // execute rendering
    RenderCanvas3();
}
