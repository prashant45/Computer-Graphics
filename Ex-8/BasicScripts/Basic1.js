function arrow(context, fromx, fromy, tox, toy, text) {
    if (fromx == tox && fromy == toy) return;

    // http://stuff.titus-c.ch/arrow.html
    var headlen = 5;   // length of head in pixels
    var angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
    if (text) {
        var d = [tox - fromx, toy - fromy];
        var l = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
        context.fillText(text, tox + 10 / l * d[0], toy + 10 / l * d[1]);
    }
}

// simple class to hold a 2D vector in the (x,z) plane
function Vector(x, z) {
    this.x = x;
    this.z = z;
}

// simple class to hold a line segment consisting of 
// a start and an end point
function LineSegment(startPoint, endPoint) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
}

var Basic1 = function () {
    var canvas;
    var context;
    var nSegments = 10;
    var epsilon = 0.001;
    var culling = 0;

    function computeCircle(midPoint, radius, segments) {
        var lineSegments = new Array(segments);
        var lastPoint = new Vector(midPoint.x, midPoint.z + radius);
        for (var i = 1; i <= segments; i++) {
            var angle = i / segments * 2 * Math.PI;
            var point = new Vector(midPoint.x + radius * Math.sin(angle), midPoint.z + radius * Math.cos(angle));
            lineSegments[i - 1] = new LineSegment(lastPoint, point);
            lastPoint = point;
        }
        return lineSegments;
    }

    function computeNormals(lineSegments) {
        var normals = new Array(lineSegments.length);
        for (var i = 0; i < lineSegments.length; i++) {
            var lineDirection = new Vector(lineSegments[i].endPoint.x - lineSegments[i].startPoint.x,
                                           lineSegments[i].endPoint.z - lineSegments[i].startPoint.z);
            var normal = new Vector(-lineDirection.z, lineDirection.x);
            var length = Math.sqrt(normal.x * normal.x + normal.z * normal.z);
            normals[i] = new Vector(normal.x / length, normal.z / length);
        }
        return normals;
    }

    function drawSegment(lineSegment, normal) {
        context.strokeStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.moveTo(lineSegment.startPoint.z, lineSegment.startPoint.x);
        context.lineTo(lineSegment.endPoint.z, lineSegment.endPoint.x);
        context.stroke();
        context.strokeStyle = 'rgb(255,0,0)';
        var startZ = 0.5 * lineSegment.startPoint.z + 0.5 * lineSegment.endPoint.z;
        var startX = 0.5 * lineSegment.startPoint.x + 0.5 * lineSegment.endPoint.x;
        arrow(context, startZ, startX, startZ + 20 * normal.z, startX + 20 * normal.x);
    }

    function cullSegmentNormal(normal) {
        // TODO 8.1a):  Given the normal of a line segment, return
        //              true if the line segment is facing towards
        //              the viewer and false if it is back-facing.
        //
        //              You can use the global small value epsilon
        //              to make sure that segments with normals perpendicular
        //              to the viewing direction are also culled
        //              despite floating point imprecision.
		
		var view_dir = new Vector(0.0, 1.0);
		var dot_prod = view_dir.x*normal.x + view_dir.z*normal.z;
		// *************	If the dot product is positive then the vector is away, if negative then is is towards	*************
		if(dot_prod >= epsilon)
			return true;
		else
			return false;
    }

    function cullSegmentSimplified(lineSegment) {
        // TODO 8.1b):  Given the line segment itself (For an explanation
        //              of the data type, see the constructor above!), return
        //              true if the line segment is facing towards
        //              the viewer and false if it is back-facing.
        //              Do not compute the normal!
        //
        //              You can use the global small value epsilon
        //              to make sure that segments with normals perpendicular
        //              to the viewing direction are also culled
        //              despite floating point imprecision.

		var product = lineSegment.startPoint.x * lineSegment.endPoint.z - lineSegment.startPoint.z * lineSegment.endPoint.x;
		if(product < 0)
			return true;
		else
			return false;
    }

    function drawCircle(lineSegments, normals) {
        for (var i = 0; i < lineSegments.length; i++) {
            if (culling == 0) {
                drawSegment(lineSegments[i], normals[i]);
            } else if (culling == 1) {
                if (!cullSegmentNormal(normals[i])) {
                    drawSegment(lineSegments[i], normals[i]);
                }
            } else if (culling == 2) {
                if (!cullSegmentSimplified(lineSegments[i])) {
                    drawSegment(lineSegments[i], normals[i]);
                }
            }
        }
    }

    function Render() {
        context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = "bold 12px Georgia";

        // draw axes
        var eye = [4, 4];
        context.fillStyle = 'rgb(0,0,0)';
        context.strokeStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();
        arrow(context, eye[1], eye[0], eye[1] + 50, eye[0]);
        arrow(context, eye[1], eye[0], eye[1], eye[0] + 50);
        context.fillText("x", eye[1] + 11, eye[0] + 50);
        context.fillText("z", eye[1] + 50, eye[0] + 14);

        // draw view direction
        context.strokeStyle = 'rgb(0,0,255)';
        var x_part = canvas.height / 6;
        for (var i = 0; i < 5; i++) {
            var x = (i + 1) * x_part;
            arrow(context, 50, x, 90, x);
        }
        context.fillStyle = 'rgb(0,0,255)';
        context.fillText("view direction", 50, 5.5 * x_part);

        // construct a circle consisting of several line segments
        var circleSegments = computeCircle(new Vector(canvas.height / 2, 250), 100, nSegments);
        // compute the normals of the circle segments
        var normals = computeNormals(circleSegments);
        // draw the circle and the normals
        drawCircle(circleSegments, normals);
    }

    return {
        start: function (_canvas) {
            canvas = _canvas;

            var slider = document.getElementById("nSegments");
            slider.value = 10;
            var radios = document.getElementsByName("culling");
            radios[0].checked = true;

            Render();
        },

        onChangeNSegments: function (value) {
            nSegments = value;
            Render();
        },

        onChangeCulling: function (value) {
            culling = value;
            Render();
        }
    }
}()
