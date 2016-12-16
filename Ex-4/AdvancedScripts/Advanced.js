var Advanced = function () {

    var timeRef = 0.000001;
    var zoom = 1.0;
    var translation = [0.0, 0.0];

    function Luminary(radius, rotationalSpeedAroundParentAxis, rotationalSpeedAroundOwnAxis, color0, color1, modelMatrix, luminaryShaderProgram, children) {
        this.radius = radius;
        this.rotationalSpeedAroundParentAxis = rotationalSpeedAroundParentAxis;
        this.rotationalSpeedAroundOwnAxis = rotationalSpeedAroundOwnAxis;
        this.color0 = color0;
        this.color1 = color1;
        this.modelMatrix = modelMatrix;
        this.luminaryShaderProgram = luminaryShaderProgram;
        this.children = children;
    }

    function initSolarSystem(defaultLuminaryShaderProgram, shaderProgramSun) {
        var TWO_PI = 6.283185;
        var moon = new Luminary(0.02, 12.0 * TWO_PI, 0.0 * TWO_PI, [0.2, 0.2, 0.2], [0.9, 0.9, 0.9], mat3.fromValues(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.2, 0.0, 1.0), defaultLuminaryShaderProgram, []);
        var earth = new Luminary(0.1, TWO_PI, 365.0 * TWO_PI, [0.0, 0.0, 0.5], [0.0, 0.5, 0.0], mat3.fromValues(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.7, 0.0, 1.0), defaultLuminaryShaderProgram, [moon]);
        var sun = new Luminary(0.2, 0.0, 0.0, [1.0, 1.0, 0.0], [1.0, 1.0, 0.0], mat3.fromValues(1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0), shaderProgramSun, [earth]);
        return sun;
    }

    // sun system
    var solarSystem;

    // clear color
    var clearColor = [0.1, 0.1, 0.1];

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
        var shaderProgramLuminary = ShaderProgram(gl, "advanced-shader-vs-default", "advanced-shader-fs-luminary");
        gl.useProgram(shaderProgramLuminary);
        attrVertex = gl.getAttribLocation(shaderProgramLuminary, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        var shaderProgramSun = ShaderProgram(gl, "advanced-shader-vs-default", "advanced-shader-fs-sun");
        gl.useProgram(shaderProgramSun);
        attrVertex = gl.getAttribLocation(shaderProgramSun, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        //////////////////////////////
        ////  setup solar system  ////
        //////////////////////////////
        solarSystem = initSolarSystem(shaderProgramLuminary, shaderProgramSun);
    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////
    function drawScene(gl, time) {
        // set viewport and clear framebuffer
        var minDim = Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.viewport((gl.drawingBufferWidth - minDim) / 2, (gl.drawingBufferHeight - minDim) / 2, minDim, minDim);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // TODO 4.3b):  Set up the user editable initial transformation
        //              used to navigate around the solar system. Take
        //              into account the variables zoom and translation.
        //              You can use the function mat3.fromValues() 
        //              defined in gl-matrix.js. Replace the following 
        //              dummy line.
        var initialTransf = mat3.create();

        // draw solar system
        drawLuminary(gl, time, solarSystem, initialTransf);
    }

    function drawLuminary(gl, time, luminary, modelMatrixParent)
    {
        if (modelMatrixParent == undefined)
        {
            modelMatrixParent = mat3.create();
            mat3.identity(modelMatrixParent);
        }


        // TODO 4.3a): 	Setup affine transformations for the luminary movement
        //              similarly to the Basic Exercises. This time, also take
        //              into account the rotation of the luminary around its own
        //              axis, and make sure to prevent influence of this rotation
        //              on the children of each luminary. Replace the following
        //              dummy line and follow the instructions in the subsequent
        //              TODOs.
        var modelMatrix = modelMatrixParent;
        
        // TODO: apply rotation around the axis of the luminary
        

        // TODO: apply rotation around the axis of the parent
        

        // TODO: apply transformation of the parent
        

        drawCircle(gl, time, luminary.luminaryShaderProgram, luminary.radius, luminary.color0, luminary.color1, modelMatrix);
        
        // TODO: compute modelMatrix for children -- revert luminary rotation around own axis
        

        // TODO: draw children
        
    }

    function drawCircle(gl, time, shaderProgram, radius, color0, color1, modelMatrix)
    {
        gl.useProgram(shaderProgram);
        // set shader uniforms
        var uniformLocClearColor = gl.getUniformLocation(shaderProgram, "clearColor");
        gl.uniform3fv(uniformLocClearColor, clearColor);
        var uniformLocViewportDim = gl.getUniformLocation(shaderProgram, "viewportDim");
        gl.uniform1f(uniformLocViewportDim, Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight));
        var uniformLocTime = gl.getUniformLocation(shaderProgram, "time");
        gl.uniform1f(uniformLocTime, time);
        var uniformLocColor0 = gl.getUniformLocation(shaderProgram, "color0");
        gl.uniform3fv(uniformLocColor0, color0);
        var uniformLocColor1 = gl.getUniformLocation(shaderProgram, "color1");
        gl.uniform3fv(uniformLocColor1, color1);
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

            // reset the slider
            var slider = document.getElementById('advanced_time_slider');
            slider.value = 20;

            // add event listener
            canvas.addEventListener('mousemove', onMouseMove, false);
            canvas.addEventListener('mouseup', onMouseUp, false);
            window.addEventListener('mouseup', onMouseUp, false);
            canvas.addEventListener('mousedown', onMouseDown, false);
            canvas.addEventListener('DOMMouseScroll', onMouseWheel, false);

            // initialize webGL canvas
            gl = new initGL(canvas);

            // init scene and shaders
            initScene(gl);

            // set clear color and disable depth test
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
            gl.disable(gl.DEPTH_TEST);

            // start render loop
            renderLoop();
        },

        onChangeTimeSlider: function (value) {
            timeRef = value / 20000000.0;
        }
    }

    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////
    var lastPoint;
    var dragging = false;

    function onMouseDown(e) {
        dragging = true;
    }

    function onMouseMove(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        y = canvas.height - y;

        if (dragging) {
            translation[0] += (x - lastPoint[0]) / rect.width;
            translation[1] += (y - lastPoint[1]) / rect.height;
        }

        lastPoint = [x, y];
    }

    function onMouseUp(e) {
        dragging = false;
    }

    function onMouseWheel(e) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / 10.0;

        zoom = zoom + delta;
        zoom = Math.max(zoom, 1.0);
        zoom = Math.min(zoom, 5.0);

        // do not scroll the page
        e.preventDefault();
    }
}()
