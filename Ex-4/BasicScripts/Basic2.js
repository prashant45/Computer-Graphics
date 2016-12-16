	var Basic2 = function () {

    // luminary objects
    function Luminary(radius, orbitRadius, speed, color, modelMatrix, luminaryShaderProgram, orbitShaderProgram, children) {
        this.radius = radius;
        this.orbitRadius = orbitRadius;
        this.speed = speed;
        this.color = color;
        this.modelMatrix = modelMatrix;
        this.luminaryShaderProgram = luminaryShaderProgram;
        this.orbitShaderProgram = orbitShaderProgram;
        this.children = children;
    }

    function initSolarSystem(defaultLuminaryShaderProgram, defaultOrbitShaderProgram)
    {
        var moon = new Luminary(0.02, 0.2, 0.0015, [0.3, 0.3, 0.3], mat3.fromValues(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.2, 0.0, 1.0), defaultLuminaryShaderProgram, defaultOrbitShaderProgram, []);
        var earth = new Luminary(0.1, 0.7, 0.001, [0.0, 0.0, 0.5], mat3.fromValues(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.7, 0.0, 1.0), defaultLuminaryShaderProgram, defaultOrbitShaderProgram, [moon]);
        var sun = new Luminary(0.3, 0.0, 0.0, [1.0, 1.0, 0.0], mat3.fromValues(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0), defaultLuminaryShaderProgram, defaultOrbitShaderProgram, [earth]);
        return sun;
    }

    // sun system
    var solarSystem;

    // clear color
    var clearColor = [0.9, 0.9, 0.9];

    // gl buffer data
    var vbo;
    var ibo;
    var iboN;

    ////////////////////////////////
    ////////  webGL helper  ////////
    ////////////////////////////////
    function initGL(canvas) {
        console.log("init webGL");

        var gl;
        try {
            gl = canvas.getContext("experimental-webgl");
        } catch (e) { }
        if (!gl) alert("Could not initialise WebGL, sorry :-(");
        return gl;
    }

    // shader from java script block
    function getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "--fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }
        else if (shaderScript.type == "--vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else return null;

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    function ShaderProgram(gl, vertexShaderSourceID, fragmentShaderSourceID) {
        var vertexShader = getShader(gl, vertexShaderSourceID);
        var fragmentShader = getShader(gl, fragmentShaderSourceID);

        // create shader program
        var shaderProgram = gl.createProgram();

        // attach shaders
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        // link program
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        return shaderProgram;
    }

    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initScene(gl) {

        ////////////////////////////////
        ////////  setup geometry  //////
        ////////////////////////////////

        // buffer on the cpu
        var v = [1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1];
        var i = [0, 1, 2, 3, 4, 5];

        // create vertex buffer on the gpu
        vbo = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        ibo = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

        iboN = i.length;

        //////////////////////////////
        ////////  setup shader  //////
        //////////////////////////////
        var shaderProgramLuminary = ShaderProgram(gl, "basic-shader-vs-default", "basic-shader-fs-luminary");
        gl.useProgram(shaderProgramLuminary);
        attrVertex = gl.getAttribLocation(shaderProgramLuminary, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        var shaderProgramOrbit = ShaderProgram(gl, "basic-shader-vs-default", "basic-shader-fs-orbit");
        gl.useProgram(shaderProgramOrbit);
        attrVertex = gl.getAttribLocation(shaderProgramOrbit, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        var shaderProgramSun = ShaderProgram(gl, "basic-shader-vs-default", "basic-shader-fs-sun");
        gl.useProgram(shaderProgramSun);
        attrVertex = gl.getAttribLocation(shaderProgramSun, "vVertex");
        gl.enableVertexAttribArray(attrVertex);


        //////////////////////////////
        ////  setup solar system  ////
        //////////////////////////////
        solarSystem = initSolarSystem(shaderProgramLuminary, shaderProgramOrbit);
        solarSystem.luminaryShaderProgram = shaderProgramSun;
    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////
    function drawScene(gl, time) {
        // set viewport and clear framebuffer
        var minDim = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.viewport((gl.drawingBufferWidth - minDim) / 2, (gl.drawingBufferHeight - minDim) / 2, minDim, minDim);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // draw solar system
        drawLuminary(gl, time, solarSystem);
    }

    function drawLuminary(gl, time, luminary, modelMatrixParent)
    {
        if (modelMatrixParent == undefined)
        {
            modelMatrixParent = mat3.create();
            mat3.identity(modelMatrixParent);
        }

        // TODO: 	Setup affine transformations for the luminary movement:
        //       	First compute the rotation of the luminary around its 
        //       	parent object (The angle is computed by time*luminary.speed.).
        //       	Finally you have to compose the model matrix considering 
		//			the model matrix of the parent object (modelMatrixParent).
		//			You can use functions mat3.create() and mat3.mul() defined
		//			in gl-matrix.js. Replace the following dummy line.
        
		
		var alpha = time*luminary.speed; 					// <-- angle of rotation
		
	    var Rotation_Matrix = mat3.create();				// <-- Rotation Matrix
	    Rotation_Matrix[0] = Math.cos(alpha);
	    Rotation_Matrix[1] = -Math.sin(alpha); 
	    Rotation_Matrix[3] = Math.sin(alpha);
	    Rotation_Matrix[4] = Math.cos(alpha);
		
		var result = mat3.create();							// <-- Multiply Rotation Matrix with ModelMatrix of a particular luminary
		mat3.multiply(result, Rotation_Matrix, luminary.modelMatrix);
		
		var modelMatrix = mat3.create();					// <-- Multiply ModelMatrix with the parent ModelMatrix
		mat3.multiply(modelMatrix, modelMatrixParent, result);	
		
	
		// draw orbit
        drawCircle(gl, time, luminary.orbitShaderProgram, luminary.orbitRadius, luminary.color, modelMatrixParent);

        // draw luminary
        drawCircle(gl, time, luminary.luminaryShaderProgram, luminary.radius, luminary.color, modelMatrix);


        // TODO: 	Draw children by calling drawLuminary()
        //       	recursively for every child.
		
		for(var i = 0; i < luminary.children.length; ++i){	// <-- Calling drawLuminary for all the children(luminary objects)
			drawLuminary(gl, time, luminary.children[i], modelMatrix);
		}
    }

    function drawCircle(gl, time, shaderProgram, radius, color, modelMatrix)
    {
        gl.useProgram(shaderProgram);
        // set shader uniforms
        var uniformLocClearColor = gl.getUniformLocation(shaderProgram, "clearColor");
        gl.uniform3fv(uniformLocClearColor, clearColor);
        var uniformLocViewportDim = gl.getUniformLocation(shaderProgram, "viewportDim");
        gl.uniform1f(uniformLocViewportDim, Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight));
        var uniformLocTime = gl.getUniformLocation(shaderProgram, "time");
        gl.uniform1f(uniformLocTime, time);
        var uniformLocColor = gl.getUniformLocation(shaderProgram, "color");
        gl.uniform3fv(uniformLocColor, color);
        var uniformLocRadius = gl.getUniformLocation(shaderProgram, "radius");
        gl.uniform1f(uniformLocRadius, radius);
        var uniformLocModelMatrix = gl.getUniformLocation(shaderProgram, "modelMatrix");
        gl.uniformMatrix3fv(uniformLocModelMatrix, false, modelMatrix);
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        var attrVertex = gl.getAttribLocation(shaderProgram, "vVertex");
        gl.vertexAttribPointer(attrVertex, 2, gl.FLOAT, false, 8, 0);
        // draw
        gl.drawElements(gl.TRIANGLES, iboN, gl.UNSIGNED_SHORT, 0);
    }



    /////////////////////////////
    ///////   Render Loop   /////
    /////////////////////////////
    var gl; // webGL context
    var t = 0; // time counter

    function renderLoop() {
        // draw scene
        drawScene(gl, t);

        // wait
        window.setTimeout(renderLoop, 1000 / 60);

        // update time
        t += 1000 / 60;
    }

    ///////////////////////////////////
    //////////   setup web gl   ///////
    ///////////////////////////////////

    var canvas;

    return{
        webGLStart : function(_canvas) {
            // store canvas
            canvas = _canvas;

            // initialize webGL canvas
            gl = new initGL(canvas);

            // init scene and shaders
            initScene(gl);

            // set clear color and disable depth test
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
            gl.disable(gl.DEPTH_TEST);

            // start render loop
            renderLoop();
        }
    }
}()
