function drawPixelwiseCircle(canvas) {
  var context = canvas.getContext("2d");
  var img = context.createImageData(200, 200);
	
function drawIntoCanvas(canvas) {
	console.log("This is an exemplary log!");
	var context = canvas.getContext("2d");
	var img = context.createImageData(200, 200);

	for (var i = 0; i < 4 * 200 * 200; i += 4) {
			img.data[i] = 255;
			img.data[i + 1] = 0;
			img.data[i + 2] = 0;
			img.data[i + 3] = 255;
	}
context.putImageData(img, 0, 0);
}
context.putImageData(img, 0, 0);
}

function drawContourCircle(canvas) {
  var context = canvas.getContext("2d");
  var img = context.createImageData(200, 200);

  //TODO 1.1b)      Copy your code from above
  //                and extend it to receive a
  //                contour around the circle.
  context.putImageData(img, 0, 0);
}

function drawSmoothCircle(canvas) {
  var context = canvas.getContext("2d");
  var img = context.createImageData(200, 200);

  //TODO 1.1c)      Copy your code from above
  //                and extend it to get rid
  //                of the aliasing effects at
  //                the border.
  context.putImageData(img, 0, 0);
}
