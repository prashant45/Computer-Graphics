var Advanced1 = function () {

    // object holding the vbo's
    var vbo;
    var ibo;
    var iboN;

    // webGL shader programs
    var shaderProgramQuadTriangle;
    var shaderProgramQuadTriangleIso;

    // data for the uniforms
    var triangle1 = [10, 10, 290, 10, 150, 290];
    var triangle2 = [310, 10, 590, 10, 450, 290];

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
        if (shaderScript.type == "--fragment")     shader = gl.createShader(gl.FRAGMENT_SHADER);
        else if (shaderScript.type == "--vertex")  shader = gl.createShader(gl.VERTEX_SHADER);
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
        var v = [   1, 1, -1, 1, 1, -1, -1, 1, 1, -1, -1, -1];
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

        var vertexShaderDefault = "shader-vs-default";

        // setup shader program to render a triangle
        var fragmentShaderQuadTriangle = "shader-fs-quadtriangle";
        shaderProgramQuadTriangle = ShaderProgram(gl, vertexShaderDefault, fragmentShaderQuadTriangle);
        gl.useProgram(shaderProgramQuadTriangle);
        attrVertex = gl.getAttribLocation(shaderProgramQuadTriangle, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        // setup shader program to render a triangle with iso lines
        var fragmentShaderQuadTriangleIso = "shader-fs-quadtriangleiso";
        shaderProgramQuadTriangleIso = ShaderProgram(gl, vertexShaderDefault, fragmentShaderQuadTriangleIso);
        gl.useProgram(shaderProgramQuadTriangleIso);
        attrVertex = gl.getAttribLocation(shaderProgramQuadTriangleIso, "vVertex");
        gl.enableVertexAttribArray(attrVertex);
    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////
    function drawScene(gl) {
        // set viewport and clear framebuffer
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // draw triangle quad
        {
            gl.useProgram(shaderProgramQuadTriangle);
            // set shader uniforms
            var uniformLocPointA = gl.getUniformLocation(shaderProgramQuadTriangle, "pointA");
            var uniformLocPointB = gl.getUniformLocation(shaderProgramQuadTriangle, "pointB");
            var uniformLocPointC = gl.getUniformLocation(shaderProgramQuadTriangle, "pointC");
            var uniformLocColor = gl.getUniformLocation(shaderProgramQuadTriangle, "color");
            gl.uniform2f(uniformLocPointA, triangle1[0], triangle1[1]);
            gl.uniform2f(uniformLocPointB, triangle1[2], triangle1[3]);
            gl.uniform2f(uniformLocPointC, triangle1[4], triangle1[5]);
            gl.uniform3f(uniformLocColor, 1.0, 1.0, 0.0);
            // bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
            var attrVertex = gl.getAttribLocation(shaderProgramQuadTriangle, "vVertex");
            gl.vertexAttribPointer(attrVertex, 2, gl.FLOAT, false, 8, 0);
            // draw
            gl.drawElements(gl.TRIANGLES, iboN, gl.UNSIGNED_SHORT, 0);
        }

        // draw triangle quad with iso lines
        {
            gl.useProgram(shaderProgramQuadTriangleIso);
            // set shader uniforms
            var uniformLocPointA = gl.getUniformLocation(shaderProgramQuadTriangleIso, "pointA");
            var uniformLocPointB = gl.getUniformLocation(shaderProgramQuadTriangleIso, "pointB");
            var uniformLocPointC = gl.getUniformLocation(shaderProgramQuadTriangleIso, "pointC");
            var uniformLocColor = gl.getUniformLocation(shaderProgramQuadTriangleIso, "color");
            gl.uniform2f(uniformLocPointA, triangle2[0], triangle2[1]);
            gl.uniform2f(uniformLocPointB, triangle2[2], triangle2[3]);
            gl.uniform2f(uniformLocPointC, triangle2[4], triangle2[5]);
            gl.uniform3f(uniformLocColor, 1.0, 1.0, 0.0);
            // bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
            var attrVertex = gl.getAttribLocation(shaderProgramQuadTriangleIso, "vVertex");
            gl.vertexAttribPointer(attrVertex, 2, gl.FLOAT, false, 8, 0);
            // draw
            gl.drawElements(gl.TRIANGLES, iboN, gl.UNSIGNED_SHORT, 0);
        }

    }

    /////////////////////////////
    ///////   Render Loop   /////
    /////////////////////////////
    var gl; // webGL context
    var t = 0; // time counter

    function renderLoop() {
        // draw scene
        drawScene(gl);

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
            gl.clearColor(0.9, 0.9, 0.9, 1.0);
            gl.disable(gl.DEPTH_TEST);

            // start render loop
            renderLoop();
        }
    }
}()
