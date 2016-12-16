var Advanced2 = function () {

    // objects holding the vbo's
    var vboMandelbrot;
    var iboMandelbrot;
    var iboNMandelbrot;
    var vboJulia;
    var iboJulia;
    var iboNJulia;
    var vboLine;
    var iboLine;
    var iboNLine;

    // webGL shader program
    var shaderProgramLine;
    var shaderProgramMandelbrot;
    var shaderProgramJulia;

    // data for the uniforms
    var zoom = 0;
    var center = new ComplexNumber(-0.5, 0);
    var max_iter = 30;
    var juliaC = new ComplexNumber(0.4, 0.1);

    // helper variables needed for interaction
    var lastPoint;
    var dragging = false;
    var updatingLine = false;
    var fromX = 0.57;
    var fromY = 0.3;
    var toX = 0.57;
    var toY = -0.3;


    ////////////////////////////////
    ////////  webGL helper  ////////
    ////////////////////////////////
    function initGL(canvas) {
        console.log("init webGL");
        var gl;
        try {
            gl = canvas.getContext("experimental-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) { }
        if (!gl) alert("Could not initialise WebGL, sorry :-(\nTo enable WebGL support in your browser, go to about:config and skip the warning.\nSearch for webgl.disabled and set its value to false.");
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
        if (shaderScript.type == "--fragment") shader = gl.createShader(gl.FRAGMENT_SHADER);
        else if (shaderScript.type == "--vertex") shader = gl.createShader(gl.VERTEX_SHADER);
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
    

    //////////////////////////////////////////
    ////////  Complex Number Helpers  ////////
    //////////////////////////////////////////
    function ComplexNumber(re, im) {
        this.re = re;
        this.im = im;
    }

    function ComplexNumberFromCoords(x, y) {
        this.re = (x / (1.0 * mandelbrotCanvas.width) - 0.5);
        this.im = (y / (1.0 * mandelbrotCanvas.height) - 0.5);
        this.re = this.re * 3 * Math.pow(2, zoom) + center.re;
        this.im = this.im * 2 * Math.pow(2, zoom) + center.im;
    }

    function sub(x, y) {
        var re = (x.re - y.re);
        var im = (x.im - y.im);
        return new ComplexNumber(re, im);
    }


    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initSceneMandelbrot() {

        var gl = mandelbrot_gl;

        //////////////////////////////////////
        ////////  setup geometry - quad //////
        //////////////////////////////////////

        // buffer on the cpu
        var v = [1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1];
        var i = [0, 1, 2, 3, 4, 5];

        // create vertex buffer on the gpu
        vboMandelbrot = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboMandelbrot);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboMandelbrot = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboMandelbrot);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

        iboNMandelbrot = i.length;

        //////////////////////////////////////
        ////////  setup geometry - line //////
        //////////////////////////////////////

        // buffer on the cpu
        v = [fromX, fromY, toX, toY];
        i = [0, 1];

        // create vertex buffer on the gpu
        vboLine = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLine);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboLine = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLine);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

        iboNLine = i.length;

        ///////////////////////////////
        ////////  setup shaders  //////
        ///////////////////////////////

        // setup Mandelbrot shader program
        var vertexShaderMandelbrot = "shader-vs-mandelbrot";
        var fragmentShaderMandelbrot = "shader-fs-mandelbrot";
        shaderProgramMandelbrot = ShaderProgram(gl, vertexShaderMandelbrot, fragmentShaderMandelbrot);
        gl.useProgram(shaderProgramMandelbrot);
        var attrVertex = gl.getAttribLocation(shaderProgramMandelbrot, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        // setup line shader program
        var vertexShaderLine = "shader-vs-line";
        var fragmentShaderLine = "shader-fs-line";
        shaderProgramLine = ShaderProgram(gl, vertexShaderLine, fragmentShaderLine);
        gl.useProgram(shaderProgramLine);
        var uniformLocColor = gl.getUniformLocation(shaderProgramLine, "color");
        gl.uniform3f(uniformLocColor, 1.0, 1.0, 1.0);
        attrVertex = gl.getAttribLocation(shaderProgramLine, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

    }

    function initSceneJulia() {

        var gl = julia_gl;

        ////////////////////////////////
        ////////  setup geometry  //////
        ////////////////////////////////

        // buffer on the cpu
        var v = [1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1];
        var i = [0, 1, 2, 3, 4, 5];

        // create vertex buffer on the gpu
        vboJulia = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboJulia);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboJulia = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboJulia);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

        iboNJulia = i.length;

        //////////////////////////////
        ////////  setup shader  //////
        //////////////////////////////

        // setup Julia shader program
        var vertexShaderJulia = "shader-vs-mandelbrot";
        var fragmentShaderJulia = "shader-fs-julia";
        shaderProgramJulia = ShaderProgram(gl, vertexShaderJulia, fragmentShaderJulia);
        gl.useProgram(shaderProgramJulia);
        var attrVertex = gl.getAttribLocation(shaderProgramJulia, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////
    function drawSceneMandelbrot() {

        var gl = mandelbrot_gl;

        // set viewport and clear framebuffer
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // draw Mandelbrot quad
        gl.useProgram(shaderProgramMandelbrot);
        gl.bindBuffer(gl.ARRAY_BUFFER, vboMandelbrot);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboMandelbrot);
        var attrVertex = gl.getAttribLocation(shaderProgramMandelbrot, "vVertex");
        gl.vertexAttribPointer(attrVertex, 2, gl.FLOAT, false, 8, 0);
        gl.drawElements(gl.TRIANGLES, iboNMandelbrot, gl.UNSIGNED_SHORT, 0);

        if (document.getElementsByName("animation")[0].checked) {
            // draw line
            gl.useProgram(shaderProgramLine);
            gl.bindBuffer(gl.ARRAY_BUFFER, vboLine);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLine);
            var attrVertex = gl.getAttribLocation(shaderProgramLine, "vVertex");
            gl.vertexAttribPointer(attrVertex, 2, gl.FLOAT, false, 8, 0);
            gl.drawElements(gl.LINE_STRIP, iboNLine, gl.UNSIGNED_SHORT, 0);
        }
    }

    function drawSceneJulia() {

        var gl = julia_gl;

        // set viewport and clear framebuffer
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // draw Julia quad
        gl.useProgram(shaderProgramJulia);
        gl.bindBuffer(gl.ARRAY_BUFFER, vboJulia);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboJulia);
        var attrVertex = gl.getAttribLocation(shaderProgramJulia, "vVertex");
        gl.vertexAttribPointer(attrVertex, 2, gl.FLOAT, false, 8, 0);
        gl.drawElements(gl.TRIANGLES, iboNJulia, gl.UNSIGNED_SHORT, 0);
    }

    var mandelbrot_gl; // webGL context for mandelbrot canvas
    var julia_gl; // webGL context for julia canvas
    var t = 0; // time counter

    function renderLoop() {
        if (document.getElementsByName("animation")[0].checked) {

            // change juliaC to make it move along the drawn line
            var factor = Math.cos(t / 2000) * 0.5 + 0.5;
            var from = new ComplexNumber(fromX, fromY);
            var to = new ComplexNumber(toX, toY);
            from.re *= 0.5 * 3 * Math.pow(2, zoom);
            from.re += center.re;
            to.re *= 0.5 * 3 * Math.pow(2, zoom);
            to.re += center.re;
            from.im *= 0.5 * 2 * Math.pow(2, zoom);
            from.im += center.im;
            to.im *= 0.5 * 2 * Math.pow(2, zoom);
            to.im += center.im;
            juliaC.re = (1 - factor) * from.re + factor * to.re;
            juliaC.im = (1 - factor) * from.im + factor * to.im;

            var gl = julia_gl;

            // TODO 3.2c):      Pass the updated variable juliaC to the
            //                  right shader program. You can find examples
            //					for uniform passing elsewhere in this file.



        }
        
        // draw scene
        drawSceneMandelbrot();
        drawSceneJulia();

        // wait
        window.setTimeout(renderLoop, 1000 / 60);

        // update time
        t += 1000 / 60;
    }

    ///////////////////////////////////
    //////////   setup webGL   ///////
    ///////////////////////////////////

    var mandelbrotCanvas;
    var juliaCanvas;

    return {
        webGLStartMandelbrot : function (_canvas) {
            // store canvas
            mandelbrotCanvas = _canvas;

            // reset the slider
            var slider = document.getElementById('slider');
            slider.value = 30;

            // add event listener
            mandelbrotCanvas.addEventListener('mousemove', onMouseMove, false);
            mandelbrotCanvas.addEventListener('mouseup', onMouseUp, false);
            mandelbrotCanvas.addEventListener('mousedown', onMouseDown, false);
            mandelbrotCanvas.addEventListener('DOMMouseScroll', onMouseWheel, false);

            // initialize webGL canvas
            mandelbrot_gl = new initGL(mandelbrotCanvas);
            var gl = mandelbrot_gl;

            // init scene and shaders
            initSceneMandelbrot();

            // set clear color and disable depth test
            gl.clearColor(0.9, 0.9, 0.9, 1.0);
            gl.disable(gl.DEPTH_TEST);

            gl.useProgram(shaderProgramMandelbrot);
            var uniformLocZoom = gl.getUniformLocation(shaderProgramMandelbrot, "zoom");
            gl.uniform1i(uniformLocZoom, zoom);
            var uniformLocCenter = gl.getUniformLocation(shaderProgramMandelbrot, "center");
            gl.uniform2f(uniformLocCenter, center.re, center.im);
            var uniformLocMaxIter = gl.getUniformLocation(shaderProgramMandelbrot, "max_iter");
            gl.uniform1i(uniformLocMaxIter, max_iter);
        },

        webGLStartJulia: function (_canvas) {
            // store canvas
            juliaCanvas = _canvas;

            // initialize webGL canvas
            julia_gl = new initGL(juliaCanvas);
            var gl = julia_gl;

            // init scene and shaders
            initSceneJulia();

            // set clear color and disable depth test
            gl.clearColor(0.9, 0.9, 0.9, 1.0);
            gl.disable(gl.DEPTH_TEST);

            gl.useProgram(shaderProgramJulia);
            var uniformLocJuliaC = gl.getUniformLocation(shaderProgramJulia, "juliaC");
            gl.uniform2f(uniformLocJuliaC, juliaC.re, juliaC.im);
            var uniformLocMaxIter = gl.getUniformLocation(shaderProgramJulia, "max_iter");
            gl.uniform1i(uniformLocMaxIter, max_iter);

            renderLoop();
        },

        onChangeMaxIter : function(value) {
            max_iter = value;

            var gl = mandelbrot_gl;

            // TODO 3.2b):      Pass the updated variable max_iter to the
            //                  right shader program. You can find examples
            //					for uniform passing elsewhere in this file.



        }
    }

    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////
    function onMouseDown(e) {
        var gl = mandelbrot_gl;
        var rect = mandelbrotCanvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        y = mandelbrotCanvas.height - y;

        if (e.ctrlKey) {
            fromX = 2 * (x / gl.viewportWidth) - 1;
            fromY = 2 * (y / gl.viewportHeight) - 1;
            toX = fromX;
            toY = fromY;
            var v = [fromX, fromY, toX, toY];
            gl.bindBuffer(gl.ARRAY_BUFFER, vboLine);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

            updatingLine = true;
        } else {
            lastPoint = [x, y];
            dragging = true;
        }
    }



    function onMouseMove(e) {
        var gl = mandelbrot_gl;
        var rect = mandelbrotCanvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        y = mandelbrotCanvas.height - y;

        if (e.ctrlKey) {
            if (updatingLine) {
                toX = 2 * (x / gl.viewportWidth) - 1;
                toY = 2 * (y / gl.viewportHeight) - 1;
                var v = [fromX, fromY, toX, toY];
                gl.bindBuffer(gl.ARRAY_BUFFER, vboLine);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
            }
        } else {
            if (dragging) {
                
                var newPoint = [x, y];

                var newPointComplex = new ComplexNumberFromCoords(newPoint[0], newPoint[1]);
                var lastPointComplex = new ComplexNumberFromCoords(lastPoint[0], lastPoint[1]);
                var diff = sub(newPointComplex, lastPointComplex);

                center = sub(center, diff);
                lastPoint = newPoint;

                var gl = mandelbrot_gl;

                // TODO 3.2b):      Pass the updated variable center to the
                //                  right shader program. You can find examples
                //					for uniform passing elsewhere in this file.



            }
        }
    }

    function onMouseUp(e) {
        dragging = false;
        updatingLine = false;
    }

    function onMouseWheel(e) {
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        zoom = zoom + delta;

        zoom = Math.max(zoom, -15);

        var gl = mandelbrot_gl;

        // TODO 3.2b):      Pass the updated variable zoom to the
        //                  right shader program. You can find examples
        //					for uniform passing elsewhere in this file.


        
        // do not scroll the page
        e.preventDefault();
    }

}()