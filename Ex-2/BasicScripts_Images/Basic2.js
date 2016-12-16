"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

// seed point
var seedPoint = new Point(50, 50);

//////////////
//// gui  ////
//////////////

// event listener for gui
function onMouseDownCanvas2(e) {
    var rect = document.getElementById("canvas2").getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    console.log("onMouseDownCanvas2: " + x + " " + y);

    // set new seed point
    seedPoint.x = Math.floor(x);
    seedPoint.y = Math.floor(y);

    // rerender image
    RenderCanvas2();
}

///////////////////////////////
//// flood fill algorithm  ////
///////////////////////////////
function floodFill4(image, pixel, fillColor) {
    // flood fill, considering only the 4 direct neighbors
    // note: border color == fillColor
    
    /////////////////////////
    ///////   TODO  /////////
    /////////////////////////

	// TODO: get the color at pixel location, use getPixel()
    var seedPoint_color = getPixel(image,pixel);


	// TODO: base case 
	//       - color channels of the current color are equal to the color channels of the fillColor
	//       - pixel position is out of range
    if(seedPoint_color.r==fillColor.r){
        console.log('pixel out of range');
        return;
    }
   
	else if (seedPoint_color.r != fillColor.r){
   var x=pixel.x;
   var y=pixel.y;

	// TODO: set pixel color
       setPixel(image,pixel,fillColor);

    

	// TODO: start recursion (4 neighboring pixels)
       floodFill4(image, new Point(x+1,y),fillColor);
       floodFill4(image, new Point(x,y+1),fillColor);
       floodFill4(image, new Point(x-1,y),fillColor);
       floodFill4(image, new Point(x,y-1),fillColor);
}


}
    /////////////////////////
    ///////   TODO  /////////
    /////////////////////////


//////////////////////////
//// render function  ////
//////////////////////////
function RenderCanvas2() {
    // draw something onto the canvas
    var context = document.getElementById("canvas2").getContext("2d");
    context.clearRect(0, 0, 200, 200);
    var canvas = context.getImageData(0, 0, 200, 200);

    for (var i = 1; i < 20; ++i)
    {
        for (var j = 0; j < 200; ++j)
        {
            setPixel(canvas, new Point(i * 10, j), new Color(255, 0, 0));
            setPixel(canvas, new Point(j, i * 10), new Color(255, 0, 0));
        }
    }

    // flood fill
    floodFill4(canvas, seedPoint, new Color(255, 0, 0));

    // draw seed point
    setPixel(canvas, seedPoint, new Color(255, 255, 0));

    // show image
    context.putImageData(canvas, 0, 0);
}


function setupFloodFill(canvas) {
    // execute rendering
    RenderCanvas2();
    // add event listener
    document.getElementById("canvas2").addEventListener('mousedown', onMouseDownCanvas2, false);
}
