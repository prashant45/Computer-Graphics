"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

// pixel scale
var pixelScaleCanvas1 = 10;

// line
var line = new Line(new Point(10 / pixelScaleCanvas1, 10 / pixelScaleCanvas1),
                    new Point(190 / pixelScaleCanvas1, 190 / pixelScaleCanvas1),
                    new Color(0, 0, 0));

//////////////
//// gui  ////
//////////////

// event listener for gui
function onChangePixelScaleCanvas1(value) {
    // rescale line
    var s = pixelScaleCanvas1 / value;
    line.startPoint.x = line.startPoint.x * s;
    line.startPoint.y = line.startPoint.y * s;
    line.endPoint.x = line.endPoint.x * s;
    line.endPoint.y = line.endPoint.y * s;
    // set new scaling factor
    pixelScaleCanvas1 = value;
    // rerender scene
    RenderCanvas1();
}

function onMouseDownCanvas1(e) {
    var rect = document.getElementById("canvas1").getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    console.log("onMouseDownCanvas1: " + x + " " + y);

    // set new points
    if (e.ctrlKey) {
        line.endPoint.x = x / pixelScaleCanvas1;
        line.endPoint.y = y / pixelScaleCanvas1;
    }
    else {
        line.startPoint.x = x / pixelScaleCanvas1;
        line.startPoint.y = y / pixelScaleCanvas1;
    }

    // rerender image
    RenderCanvas1();
}


//////////////////////////////
//// bresenham algorithm  ////
//////////////////////////////

function bresenham(image, line) {
    // ensure integer coordinates
	var x0 = Math.floor(line.startPoint.x);
    var y0 = Math.floor(line.startPoint.y);
    var x1 = Math.floor(line.endPoint.x);
    var y1 = Math.floor(line.endPoint.y);

    //////////////////////////
    ///////   TODO   /////////
    //////////////////////////

    // TODO: compute deltas and update directions

	
	if (x0 > x1 && y0 > y1){		//Swaping of start and end points 
			var x0 = Math.floor(line.endPoint.x);
			var y0 = Math.floor(line.endPoint.y);
			var x1 = Math.floor(line.startPoint.x);
			var y1 = Math.floor(line.startPoint.y);
	}
	
	var dx = x1 - x0;
	var dy = y1 - y0;
	var m = dy/dx;
	
	
	// TODO: set initial coordinates
	var x = x0;
	var y = y0;
	
	//Decision Parameters
	var p = 2*dy - dx; //dx * (d_lower - d_upper) and slope 0 < m < 1
	var p_plus = 2*dx - dy; // slope m > 1
	
	

    // TODO: start loop to set nPixels, 
    var nPixels = Math.max(Math.abs(dx), Math.abs(dy)); // TODO: think about how many pixels need to be set
    for (var i = 0; i < nPixels; ++i) {
        
		
		var currentPoint = new Point(x,y);
		
		// TODO: set pixel use the helper function setPixelS()
		setPixelS(image, currentPoint, new Color(0, 0, 255), pixelScaleCanvas1);
		
		if ((m >=0 && m <1)){  // 1st quadrant and 3rd quadrant, 0 < Theta < 45 deg and 180 < Theta < 225
			x+=1;
			if(p<=0)
				p += 2*dy;
			else{
				y = (y + 1);
				p += (2*dy)-(2*dx);
			}
				
		}
		else if(m>=1){ // // 1st quadrant and 3rd quadrant, 45 < Theta < 90 deg and 225 < Theta < 270
			y += 1;
			if(p_plus<=0)
				p_plus += (2*dx);
			else{
				x+=1;
				p_plus+=(2*dx)-(2*dy);
			}
		}
		
        // TODO: update error


        // TODO: update coordinates depending on the error

		//P.S - We couldn't figure out the maths for negative slopes.
    }
    //////////////////////////
    ///////   TODO   /////////
    //////////////////////////
	
}


//////////////////////////
//// render function  ////
//////////////////////////

function RenderCanvas1() {
    // get canvas handle
    var context = document.getElementById("canvas1").getContext("2d");
    var canvas = context.createImageData(200, 200);

    // clear canvas
    clearImage(canvas, new Color(255, 255, 255));

    // draw line
    bresenham(canvas, line);

    // draw start and end point with different colors
    setPixelS(canvas, line.startPoint, new Color(255, 0, 0), pixelScaleCanvas1);
    setPixelS(canvas, line.endPoint, new Color(0, 255, 0), pixelScaleCanvas1);

    // show image
    context.putImageData(canvas, 0, 0);
}


function setupBresenham(canvas) {
    // execute rendering
    RenderCanvas1();
    // add event listener
    document.getElementById("canvas1").addEventListener('mousedown', onMouseDownCanvas1, false);
}
