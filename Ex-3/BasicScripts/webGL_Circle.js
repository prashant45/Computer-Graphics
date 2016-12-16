function webGLStart(canvas) {

    var gl = canvas.getContext("experimental-webgl");
    if (!gl) alert("Could not initialise WebGL, sorry :-(\nTo enable WebGL support in your browser, go to about:config and skip the warning.\nSearch for webgl.disabled and set its value to false.");

    var glVersion = gl.getParameter(gl.VERSION);
    var glslVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    console.log("GL Version: \t" + glVersion);
    console.log("GLSL Version: \t" + glslVersion);

    gl.viewport(0, 0, canvas.width, canvas.height);


    //////////////////////////////////////////////////////////////
    // Exercise 3.1: Draw Circle
    // create triangles using vertices and indices
    // never store vertex data twice

    var c = [0, 0];
    var r = 0.8;
    var slices = 360;

    var vertices = [];
    var indices = [];

	vertices.push(0);								//Vertex 0
    vertices.push(0);
	
	vertices.push(r);								//Vertex 1
	vertices.push(0);

	for(var i = 1; i < slices; ++i){				//Vertex 2 till Vertex,
		vertices.push(r*Math.cos(i*Math.PI/180));	//359 because we have stored the vextex for last triangle(Vertex 1).
		vertices.push(r*Math.sin(i*Math.PI/180));											
	}
	
    
	for (var j = 1; j <= slices; ++j){				//Indexing to plot different triangles using same edge vertex and a new one.
		if(j == slices){							//Condition for the last traingle.
			indices.push(0);
			indices.push(slices);
			indices.push(1);
		}
		else{
			indices.push(0);
			indices.push(j);
			indices.push(j+1);
		}
	}
    
	
	var vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


    var vertexShader = getShader(gl, "shader-vs");
    var fragmentShader = getShader(gl, "shader-fs");

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    var attrVertexPosition = gl.getAttribLocation(shaderProgram, "vVertex");
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.vertexAttribPointer(attrVertexPosition, 2, gl.FLOAT, false, 8, 0);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}


/*
vertices.push(r*Math.cos(0*Math.PI/180));		//Vertex 1
    vertices.push(r*Math.sin(0*Math.PI/180));
	
    vertices.push(r*Math.cos(315*Math.PI/180));		//Vertex 2
    vertices.push(r*Math.sin(315*Math.PI/180));
		
	vertices.push(r*Math.cos(270*Math.PI/180));		//Vertex 3
	vertices.push(r*Math.sin(270*Math.PI/180))
	
	vertices.push(r*Math.cos(225*Math.PI/180));		//Vertex 4
	vertices.push(r*Math.sin(225*Math.PI/180));
	
	vertices.push(r*Math.cos(180*Math.PI/180));		//Vertex 5
	vertices.push(r*Math.sin(180*Math.PI/180));
	
	vertices.push(r*Math.cos(135*Math.PI/180));		//Vertex 6
	vertices.push(r*Math.sin(135*Math.PI/180));
	
	vertices.push(r*Math.cos(90*Math.PI/180));		//Vertex 7
	vertices.push(r*Math.sin(90*Math.PI/180));
	
	vertices.push(r*Math.cos(45*Math.PI/180));		//Vertex 8
    vertices.push(r*Math.sin(45*Math.PI/180));
	*/
