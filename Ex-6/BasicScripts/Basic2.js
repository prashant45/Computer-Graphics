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
    if(text)
    {
        var d = [tox - fromx, toy - fromy];
        var l = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
        context.fillText(text, tox + 10 / l * d[0], toy + 10 / l * d[1]);
    }
}

function floatToColor(rgb_float) {
    return [Math.max(Math.min(Math.floor(rgb_float[0] * 255.0), 255), 0),
                Math.max(Math.min(Math.floor(rgb_float[1] * 255.0), 255), 0),
                Math.max(Math.min(Math.floor(rgb_float[2] * 255.0), 255), 0)];
}

function setStrokeStyle(context, rgb_float) {
    var c = floatToColor(rgb_float);
    context.strokeStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

function setFillStyle(context, rgb_float) {
    var c = floatToColor(rgb_float);
    context.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

function computeNormals(polygon) {
    var nVertices = polygon.length;
    var normals = new Array(nVertices);
    for (var i = 0; i < nVertices; ++i) normals[i] = [0.0, 0.0];

    for (var e = 0; e < nVertices; ++e) {
        var i = e;
        var j = e + 1;
        if (j == nVertices) j = 0;
        var dir = [polygon[j][0] - polygon[i][0], polygon[j][1] - polygon[i][1]];
        var l = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
        if (l != 0.0) {
            var edgeNormal = [-dir[1] / l, dir[0] / l];
            normals[i][0] += edgeNormal[0];
            normals[i][1] += edgeNormal[1];
            normals[j][0] += edgeNormal[0];
            normals[j][1] += edgeNormal[1];
        }
    }

    for (var i = 0; i < nVertices; ++i) {
        var n = [normals[i][0], normals[i][1]];
        var l = Math.sqrt(n[0] * n[0] + n[1] * n[1]);
        if (l != 0.0) {
            normals[i][0] = n[0] / l;
            normals[i][1] = n[1] / l;
        }
    }
    return normals;
}

function PhongLighting(context, point, normal, eye, pointLight, albedo, showVectors) {

    // TODO: implement phong lighting - follow the stepwise instructions below

    // 1. compute view vector v, light vector l and the reflected light vector r (all pointing away from the point!)
    //    note: to help you implementing this task we draw the computed vectors for the user specified sample point.
    //    replace the following dummy lines
	
    var v = [ eye[0] - point[0], eye[1] - point[1] ];
	vec2.normalize(v, v);
	
    var l = [ pointLight[0] - point[0], pointLight[1] - point[1] ];
	vec2.normalize(l, l);
	
	var r = [ 2*vec2.dot(normal, l)*normal[0] - l[0], 2*vec2.dot(normal, l)*normal[1] - l[1]];
	/*var r = vec2.create();
	r[0] = ;
	r[1] = ;*/
	vec2.normalize(r, r);

    // 2. compute the ambient part, use 0.1 * albedo as ambient material property
	var L_amb = albedo.map(function(x) x*0.1);
	
	
    // 3. compute the diffuse part, also use 0.5 * albedo as diffuse material property
	var temp1 = vec2.dot(normal, l);
	var L_diff = albedo.map(function(x) x*0.5*temp1);

    // 4. compute the specular part, assume an attenuated white specular material property (0.4 * [1.0, 1.0, 1.0])
    //    use the defined shiny factor
    var shiny = 30.0;
	var L_spec = [1.0, 1.0, 1.0].map(function(x) x*0.4*Math.pow(vec2.dot(v, r), shiny));
	


    // 5. add ambient, diffuse and specular color
    //    store the result in the variable color - replace the following dummy line
    var color = vec3.create();
	vec3.add(color, L_amb, L_diff);
	vec3.add(color, color, L_spec);	
	
    if (showVectors) {
        // draw vectors
        var vecScale = 100;
        context.strokeStyle = 'rgb(0,0,0)';
        arrow(context, point[1], point[0], point[1] + vecScale * normal[1], point[0] + vecScale * normal[0], "n");
        arrow(context, point[1], point[0], point[1] + vecScale * v[1], point[0] + vecScale * v[0], "v");
        arrow(context, point[1], point[0], point[1] + vecScale * l[1], point[0] + vecScale * l[0], "l");
        arrow(context, point[1], point[0], point[1] + vecScale * r[1], point[0] + vecScale * r[0], "r");
    }

    return color;
	
}

var Basic2_1 = function () {
    var canvas;
    var nSamples = 5;
    var alpha = 0.25;

    function Render()
    {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "bold 12px Georgia";
        context.textAlign = "center";

        // light source
        var eye = [40, 20];

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", eye[1], eye[0] + 20);
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // light source
        var pointLight = [20, 580];

        // draw light source
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("light", pointLight[1], pointLight[0] + 20);
        context.arc(pointLight[1], pointLight[0], 4, 0, 2 * Math.PI);
        context.fill();

        // line
        var line = [[270, 0], [270, 600]];
        var albedo = [0, 1, 0];

        // draw surface (line)
        setStrokeStyle(context, [0.5, 0.5, 0.5]);
        context.beginPath();
        context.lineWidth = 4;
        context.moveTo(line[0][1], line[0][0]);
        context.lineTo(line[1][1], line[1][0]);
        context.stroke();
        context.fillText("surface", line[0][1]+50, line[0][0] + 20);
        context.lineWidth = 1;

        for (var i = 0; i < nSamples; ++i) {
            var _alpha = i / (nSamples - 1.0);
            // sampled point on the surface
            var point = [(1.0 - _alpha) * line[0][0] + _alpha * line[1][0], (1.0 - _alpha) * line[0][1] + _alpha * line[1][1]];
            var normal = [-1.0, 0.0];

            // compute light - Phong Lighting
            var color = PhongLighting(context, point, normal, eye, pointLight, albedo, false);

            // draw point
            setFillStyle(context, color)
            context.beginPath();
            context.arc(point[1], point[0], 4, 0, 2 * Math.PI);
            context.fill();
        }

        // current point on the surface
        var point = [(1.0-alpha) * line[0][0] + alpha * line[1][0], (1.0 - alpha) * line[0][1] + alpha * line[1][1]];
        var normal = [-1.0, 0.0];

        // compute light - Phong Lighting
        var color = PhongLighting(context, point, normal, eye, pointLight, albedo, true);

        // draw point
        setFillStyle(context, color)
        context.beginPath();
        context.fillText("p", point[1], point[0] + 20);
        context.arc(point[1], point[0], 6, 0, 2 * Math.PI);
        context.fill();
    }

    return {
        start: function (_canvas) {
            canvas = _canvas;

            // reset the slider and the checkboxes
            var slider = document.getElementById('nSamples');
            slider.value = 5;

            canvas.addEventListener('mousedown', onMouseDown, false);
            Render();
        },
        onChangeNSamples: function (value) {
            nSamples = value;
            Render();
        }
    }

    function onMouseDown(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        alpha = x / rect.width;
        Render();
    }
}()

var Basic2_2 = function () {
    var canvas;
    var nLineSegments = 5;

    function Render() {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "bold 12px Georgia";
        context.textAlign = "center";

        // light source
        var eye = [40, 20];

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", eye[1], eye[0] + 20);
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // light source
        var pointLight = [20, 580];

        // draw light source
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("light", pointLight[1], pointLight[0] + 20);
        context.arc(pointLight[1], pointLight[0], 4, 0, 2 * Math.PI);
        context.fill();

        // line segments
        var p0 = 0;
        var p1 = 600;
        var lineSegments = new Array(nLineSegments);
		
        for (var i = 0; i < nLineSegments; ++i) {
            var _alpha = i / (nLineSegments);
            var start = [270, Math.floor((1.0 - _alpha) * p0 + _alpha * p1)];
            _alpha = (i + 1.0) / (nLineSegments);
            var end = [270, Math.ceil((1.0 - _alpha) * p0 + _alpha * p1)];
            lineSegments[i] = [[start[0], start[1]], [end[0], end[1]]];
        }
        var albedo = [0, 1, 0];		
		
		var midPoint = new Array(nLineSegments);
		var normal = new Array(nLineSegments);
        // draw surface (line segments) using flat shading
        for (var i = 0; i < nLineSegments; ++i) {
            // TODO: implement Flat Shading of the line segments - follow the stepwise instructions below

            // 1. compute representant of the primitive -> midpoint on the line segment
            midPoint[i] = [ ( lineSegments[i][0][0] + lineSegments[i][1][0] )/2, ( lineSegments[i][0][1]+lineSegments[i][1][1] )/2 ];
			//vec2.normalize(midPoint[i], midPoint[i]);
			
            // 2. compute the normal of the line segment
            var dx =  lineSegments[i][1][0] -  lineSegments[i][0][0];
			var dy =  lineSegments[i][1][1] -  lineSegments[i][0][1];
			normal[i] = [ -dy, dx ];
			vec2.normalize(normal[i], normal[i]);

            // 3. use the function PhongLighting that you implemented in the previous assignment to evaluate the color
            var color = PhongLighting(context, midPoint[i], normal[i], eye, pointLight, albedo, false);

            // 4. set the stroke color (use setStrokeStyle() (it is defined in this .js-file))
            setStrokeStyle(context, color);


            // draw the line segment
            context.beginPath();
            context.lineWidth = 8;
            context.moveTo(lineSegments[i][0][1], lineSegments[i][0][0]);
            context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0]);
            context.stroke();

            if (i < nLineSegments - 1) {
                // draw auxiliary line between this and the next line segment
                context.beginPath();
                setStrokeStyle(context, [0, 0, 0]);
                context.lineWidth = 1;
                context.moveTo(lineSegments[i][1][1], lineSegments[i][1][0] + 4);
                context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0] + 14);
                context.stroke();
            }
        }
		//debugger;
        context.fillText("surface", p0[1] + 50, p0[0] + 20);
        context.lineWidth = 1;
    }
	

    return {
        start: function (_canvas) {
            canvas = _canvas;

            // reset the slider and the checkboxes
            var slider = document.getElementById('nLineSegments2_2');
            slider.value = 5;

            Render();
        },
        onChangeNLineSegments: function (value) {
            nLineSegments = value;
            Render();
        }
    }
}()

var Basic2_3 = function () {
    var canvas;
    var nLineSegments = 5;

    function Render() {
        var context = canvas.getContext("2d");
        context.clearRect(0, 0, 600, 300);
        context.font = "bold 12px Georgia";
        context.textAlign = "center";

        // light source
        var eye = [40, 20];

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("eye", eye[1], eye[0] + 20);
        context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
        context.fill();

        // light source
        var pointLight = [20, 580];

        // draw light source
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.fillText("light", pointLight[1], pointLight[0] + 20);
        context.arc(pointLight[1], pointLight[0], 4, 0, 2 * Math.PI);
        context.fill();

        // line segments
        var p0 = 0;
        var p1 = 600;
        var lineSegments = new Array(nLineSegments);
        for (var i = 0; i < nLineSegments; ++i) {
            var _alpha = i / (nLineSegments);
            var start = [270, Math.floor( (1.0 - _alpha) * p0 + _alpha * p1 )];
            _alpha = (i + 1.0) / (nLineSegments);
            var end = [270, Math.ceil((1.0 - _alpha) * p0 + _alpha * p1)];
            lineSegments[i] = [[start[0], start[1]], [end[0], end[1]]];
        }
        var albedo = [0, 1, 0];

		var vertices = new Array(nLineSegments);
		var a = b = vec3.create();
        // draw surface (line segments) using flat shading
        for (var i = 0; i < nLineSegments; ++i) {
            // TODO: implement Gouraud Shading of the line segments - follow the stepwise instructions below

            // 1. evaluate the color at the vertices using the PhongLighting function
            //    the normal of the vertices can be assumed to be [-1.0, 0.0] in this assignment.
			normal = [-1.0, 0.0];
			vec2.normalize(normal, normal);
			vertices[i] = 	[ lineSegments[i][0][0], lineSegments[i][0][1] ];
			vertices[i+1] = [ lineSegments[i][1][0], lineSegments[i][1][1] ]
			
			var color_vertexone = PhongLighting(context, vertices[i], normal, eye, pointLight, albedo, false);
			var color_vertextwo = PhongLighting(context, vertices[i+1], normal, eye, pointLight, albedo, false);
			
            // 2. use the linear gradient stroke style of the context, to linearly interpolate the vertex colors over the primitive
            //    the color triples can be scaled from [0,1] to [0,255] using the function floatToColor()
            //    the start and end points of the line segments are stored in [y,x] order, remember when using createLinearGradient()!
			
			var grd = context.createLinearGradient(vertices[i][0], vertices[i][1], vertices[i+1][0], vertices[i+1][1]);
			
			a = floatToColor(color_vertexone);
			b = floatToColor(color_vertextwo);
			grd.addColorStop(0,'rgb(' + a[0] + ',' + a[1] + ',' + a[2] + ')');
			grd.addColorStop(1,'rgb(' + b[0] + ',' + b[1] + ',' + b[2] + ')');	
			context.strokeStyle=grd;
			
			//setStrokeStyle(context, color);

            // draw line segment
            context.beginPath();
            context.lineWidth = 8;
            context.moveTo(lineSegments[i][0][1], lineSegments[i][0][0]);
            context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0]);
            context.stroke();

            if (i < nLineSegments - 1) {	
                // draw auxiliary line between this and the next line segment
                context.beginPath();
                setStrokeStyle(context, [0, 0, 0]);
                context.lineWidth = 1;
                context.moveTo(lineSegments[i][1][1], lineSegments[i][1][0] + 4);
                context.lineTo(lineSegments[i][1][1], lineSegments[i][1][0] + 14);
                context.stroke();
            }
        }//debugger;
        context.fillText("surface", p0[1] + 50, p0[0] + 20);
        context.lineWidth = 1;
    }

    return {
        start: function (_canvas) {
            canvas = _canvas;

            // reset the slider and the checkboxes
            var slider = document.getElementById('nLineSegments2_3');
            slider.value = 5;

            Render();
        },
        onChangeNLineSegments: function (value) {
            nLineSegments = value;
            Render();
        }
    }
}()

