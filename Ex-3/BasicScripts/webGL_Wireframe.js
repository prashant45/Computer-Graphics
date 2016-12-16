function webGLStart(canvas) {

    var gl = canvas.getContext("experimental-webgl");
    if (!gl) alert("Could not initialise WebGL, sorry :-(\nTo enable WebGL support in your browser, go to about:config and skip the warning.\nSearch for webgl.disabled and set its value to false.");

    var glVersion = gl.getParameter(gl.VERSION);
    var glslVersion = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);
    console.log("GL Version: \t" + glVersion);
    console.log("GLSL Version: \t" + glslVersion);

    gl.viewport(0, 0, canvas.width, canvas.height);


    //////////////////////////////////////////////////////////////
    // Exercise 3.2: Barycentric Coordinates
    // add the barycentric coordinats b0[1,0,0], b1[0,1,0] and b3[0,0,1]
    // to the positions of each vertex
    // the layout should be as follows
    // [p0x,p0y,b0x,b0y,b0z,p1x...
	
    var vertices = [ -0.5, -0.5, 	1.0, 0.0, 0.0,
                     0.5, -0.5, 	0.0, 1.0, 0.0,
                     0.0, 0.5, 		0.0, 0.0, 1.0];

    var indices = [0, 1, 2];

    var vbo = gl.createBuffer();	// Memory on GPPU ready to be used
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    var ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	//
	// Creating Vertex and fragment shaders.
	//
	
    var fragmentShader = getShader(gl, "shaderWireFrame-fs");
    var vertexShader = getShader(gl, "shaderWireFrame-vs");

    var shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);				//
	gl.attachShader(shaderProgram, fragmentShader);				// Attaching the vertex and fragment shaders to graphics program
																
    gl.linkProgram(shaderProgram);								// 
																// linking the program together					

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {		//
	alert("Could not initialise shaders");								// To check if shaders have compilation errors.
	}

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);


    //////////////////////////////////////////////////////////////
    // Exercise 3.2: Barycentric Coordinates
    // create an attribute for the barycentric Coordinate
    // enable the attribute
    // beware to set the correct NUMBER of elements, STRIDE and OFFSET

    //BEWARE: YOU MUST CHANGE THE VERTEX STRIDE FOR THE POSITION AS WELL

    var attrVertexPosition = gl.getAttribLocation(shaderProgram, "vVertex");   // Specifying the vertex position attribute to vertex shader
    var colorVertexPosition = gl.getAttribLocation(shaderProgram, "vertColor");
	
	gl.enableVertexAttribArray(attrVertexPosition);		         // Enable attributes to use
	gl.enableVertexAttribArray(colorVertexPosition);
	
    gl.vertexAttribPointer(attrVertexPosition, 2, gl.FLOAT, false, 20, 0);	//Specifying the layout of the attribute --> //(AttPos, No. of elements/att, type of elements, data normalized?, size, Offset from the beginning
	gl.vertexAttribPointer(colorVertexPosition, 3, gl.FLOAT, false, 20, 8);							


    //var attrVertexBaryCenter;

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
