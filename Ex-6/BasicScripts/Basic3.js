var enableInteraction = true;

mat4.perspective = function (out, fovy, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
    nf = 1 / (near - far);

    out[0] = f;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;

    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;

    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;

    return out;
};

function Camera3D() {
    this.eye = [0, 50, 100];
    this.fovy = 30.0 / 180.0 * Math.PI;
    this.near = 5;
    this.far = 500;
    this.lookAtPoint = [0, 0, 0];
    this.upVector = [0, 1, 0];

    // the cameraMatrix transforms from world space to camera space
    this.cameraMatrix = mat4.create();
    // projection matrix
    this.projectionMatrix = mat4.create();

    this.cameraMatrixInverse = mat4.create();

    // setup matrices
    this.update();
}

Camera3D.prototype.setMatrices = function (cameraMatrix, projectionMatrix) {
    this.cameraMatrix = cameraMatrix;
    this.projectionMatrix = projectionMatrix;
};

Camera3D.prototype.lookAt = function (point3D) {
    this.lookAtPoint = [point3D[0], point3D[1], point3D[2]];
    this.update();
};

Camera3D.prototype.setEye = function (eye3D) {
    this.eye[0] = eye3D[0];
    this.eye[1] = eye3D[1];
    this.eye[2] = eye3D[2];
    this.update();
};

Camera3D.prototype.setFar = function (far) {
    this.far = far;
    this.update();
};

Camera3D.prototype.setFovy = function (fovy) {
    this.fovy = fovy;
    this.update();
};

Camera3D.prototype.move = function (dir) {
    if (dir == 0) {
        vec3.sub(this.eye, this.eye, this.w);
    } else if (dir == 1) {
        var origin = vec3.fromValues(0, 0, 0);
        vec3.rotateY(this.eye, this.eye, origin, -5 * Math.PI / 180);
    } else if (dir == 2) {
        vec3.add(this.eye, this.eye, this.w);
    } else if (dir == 3) {
        var origin = vec3.fromValues(0, 0, 0);
        vec3.rotateY(this.eye, this.eye, origin, 5 * Math.PI / 180);
    }
    this.update();
};

Camera3D.prototype.update = function () {
    var e = vec3.fromValues(this.eye[0], this.eye[1], this.eye[2]);
    var g = vec3.fromValues(this.lookAtPoint[0] - this.eye[0],
                            this.lookAtPoint[1] - this.eye[1],
                            this.lookAtPoint[2] - this.eye[2]);
    var t = vec3.fromValues(this.upVector[0], this.upVector[1], this.upVector[2]);

    this.w = vec3.fromValues(-g[0], -g[1], -g[2]);
    vec3.normalize(this.w, this.w);

    this.u = vec3.create();
    vec3.cross(this.u, t, this.w);
    vec3.normalize(this.u, this.u);

    this.v = vec3.create();
    vec3.cross(this.v, this.w, this.u);

    var first_matrix = mat4.fromValues(this.u[0], this.v[0], this.w[0], 0,
                                        this.u[1], this.v[1], this.w[1], 0,
                                        this.u[2], this.v[2], this.w[2], 0,
                                        0, 0, 0, 1);
    var second_matrix = mat4.fromValues(1, 0, 0, 0,
                                        0, 1, 0, 0,
                                        0, 0, 1, 0,
                                        -e[0], -e[1], -e[2], 1);
    mat4.multiply(this.cameraMatrix, first_matrix, second_matrix);

    mat4.invert(this.cameraMatrixInverse, this.cameraMatrix);

    mat4.perspective(this.projectionMatrix, this.fovy, this.near, this.far);
};


var Basic3 = function () {

    // shader programs
    var shaderProgramTerrain;
    var shaderProgramLight;

    // clear color
    var clearColor = [0.1, 0.1, 0.1];

    // gl buffer data
    var vboTerrain;
    var iboTerrain;
    var iboNTerrain;
    var vboLight;
    var iboLight;
    var iboNLight;

    // camera
    var camera = new Camera3D();

    // global variables for interaction
    var shiny = 100;
    var lightRotation = true;
    var ambient = true;
    var diffuse = false;
    var specular = false;


    ////////////////////////////////
    ////////  webGL helper  ////////
    ////////////////////////////////
    function initGL(canvas) {
        console.log("init webGL");
        // http://webglfundamentals.org/webgl/lessons/webgl-anti-patterns.html
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

    function shaderProgram(gl, vertexShaderSourceID, fragmentShaderSourceID) {
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

        /////////////////////////////////////////
        ////////  setup geometry - terrain //////
        /////////////////////////////////////////

        var img = document.getElementById('height_field');
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        var width = canvas.width;
        var height = canvas.height;

        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        var raw_data = canvas.getContext('2d').getImageData(0, 0, width, height).data;

        var sigmaD = 4.0;
        var kernelRadius = Math.ceil(2.0 * sigmaD);
        var data = new Array(width * height * 4);
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var sumWeight = 0.0;
                var sum = 0.0;
                for (var m = i - kernelRadius; m <= i + kernelRadius; m++) {
                    for (var n = j - kernelRadius; n <= j + kernelRadius; n++) {
                        if (m >= 0 && n >= 0 && m < width && n < height) {
                            var weight = Math.exp(-(((m - i) * (m - i) + (n - j) * (n - j)) / (2.0 * sigmaD * sigmaD)));
                            sumWeight += weight;
                            sum += weight * raw_data[(m + n * width) * 4];
                        }
                    }
                }
                data[(i + j * width) * 4] = sum / sumWeight;
            }
        }



        var x_scale = 0.4;
        var y_scale = 0.1;
        var z_scale = 0.4;

        var v = [];

        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var center = [j, i];
                var neighbours = [[j, i - 1],
                                  [j + 1, i - 1],
                                  [j + 1, i],
                                  [j, i + 1],
                                  [j - 1, i + 1],
                                  [j - 1, i]];
                var A = vec3.fromValues(x_scale * (center[1] - width * 0.5),
                                        y_scale * data[(center[1] + center[0] * width) * 4],
                                        z_scale * (center[0] - height * 0.5));
                var normal = vec3.fromValues(0, 0, 0);
                for (var k = 0; k < 6; k++) {
                    var neighbourB = neighbours[k];
                    var B = vec3.fromValues(x_scale * (neighbourB[1] - width * 0.5),
                                            y_scale * data[(neighbourB[1] + neighbourB[0] * width) * 4],
                                            z_scale * (neighbourB[0] - height * 0.5));
                    var neighbourC = neighbours[(k + 1) % 6];
                    var C = vec3.fromValues(x_scale * (neighbourC[1] - width * 0.5),
                                            y_scale * data[(neighbourC[1] + neighbourC[0] * width) * 4], 
                                            z_scale * (neighbourC[0] - height * 0.5));

                    var normalABC = vec3.create();
                    vec3.cross(normalABC, B, C);

                    vec3.add(normal, normal, normalABC);
                }

                v.push(A[0]);
                v.push(A[1]);
                v.push(A[2]);
                v.push(normal[0]);
                v.push(normal[1]);
                v.push(normal[2]);
            }
        }

        var index = [];

        for (var j = 1; j < height - 2; j++) {
            for (var i = 1; i < width - 2; i++) {
                index.push(j * width + i);
                index.push((j + 1) * width + i);
                index.push(j * width + i + 1);
                index.push(j * width + i + 1);
                index.push((j + 1) * width + i);
                index.push((j + 1) * width + i + 1);
            }
        }

        // create vertex buffer on the gpu
        vboTerrain = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboTerrain);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboTerrain = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTerrain);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

        iboNTerrain = index.length;

        //////////////////////////////////////////////
        ////////  setup geometry - light source //////
        //////////////////////////////////////////////

        var vLight = [0.0, 0.0, 0.0];

        var iLight = [0];

        // create vertex buffer on the gpu
        vboLight = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLight);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vLight), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboLight = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLight);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iLight), gl.STATIC_DRAW);

        iboNLight = iLight.length;

        ///////////////////////////////
        ////////  setup shaders  //////
        ///////////////////////////////
        shaderProgramTerrain = shaderProgram(gl, "shader-vs-phong", "shader-fs-phong");

        shaderProgramLight = shaderProgram(gl, "shader-vs-light", "shader-fs-light");
    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////

    function drawScene(gl, time) {

        var modelMatrixTerrain = mat4.create();
        modelMatrixTerrain[13] = -10;
        var modelMatrixLight = mat4.create();
        modelMatrixLight[12] = 20;
        modelMatrixLight[13] = 10;

        var rot = mat4.create();
        mat4.fromRotation(rot, (time * 0.05 % 360) / 360 * 2 * Math.PI, [0, 1, 0]);
        mat4.mul(modelMatrixLight, rot, modelMatrixLight);
        

        // draw the light source
        drawLight(gl, modelMatrixLight);

        // draw the cube
        drawTerrain(gl, modelMatrixTerrain, [0, 0.8, 0.5], modelMatrixLight);
    }

    function drawTerrain(gl, modelMatrix, color, modelMatrixLight) {

        var normalMatrix = mat4.create();
        mat4.transpose(normalMatrix, modelMatrix);
        mat4.invert(normalMatrix, normalMatrix);

        gl.useProgram(shaderProgramTerrain);
        // enable vertex attributes
        var attrVertexTerrain = gl.getAttribLocation(shaderProgramTerrain, "vVertex");
        gl.enableVertexAttribArray(attrVertexTerrain);
        var attrNormalTerrain = gl.getAttribLocation(shaderProgramTerrain, "vNormal");
        gl.enableVertexAttribArray(attrNormalTerrain);
        // set shader uniforms
        var uniformLocModelMatrix = gl.getUniformLocation(shaderProgramTerrain, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix);
        var uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramTerrain, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix);
        var uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramTerrain, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix);
        var uniformLocNormalMatrix = gl.getUniformLocation(shaderProgramTerrain, "normalMatrix");
        gl.uniformMatrix4fv(uniformLocNormalMatrix, false, normalMatrix);
        var uniformLocColor = gl.getUniformLocation(shaderProgramTerrain, "color");
        gl.uniform3fv(uniformLocColor, color);
        var lightPosition = vec3.fromValues(0, 0, 0);
        vec3.transformMat4(lightPosition, lightPosition, modelMatrixLight);
        var uniformLocLightPosition = gl.getUniformLocation(shaderProgramTerrain, "lightPosition");
        gl.uniform3fv(uniformLocLightPosition, lightPosition);
        var uniformLocCameraMatrixInverse = gl.getUniformLocation(shaderProgramTerrain, "cameraMatrixInverse");
        gl.uniformMatrix4fv(uniformLocCameraMatrixInverse, false, camera.cameraMatrixInverse);
        var uniformLocShiny = gl.getUniformLocation(shaderProgramTerrain, "shiny");
        gl.uniform1f(uniformLocShiny, shiny);
        var uniformLocAmbient = gl.getUniformLocation(shaderProgramTerrain, "ambient");
        gl.uniform1i(uniformLocAmbient, ambient);
        var uniformLocDiffuse = gl.getUniformLocation(shaderProgramTerrain, "diffuse");
        gl.uniform1i(uniformLocDiffuse, diffuse);
        var uniformLocSpecular = gl.getUniformLocation(shaderProgramTerrain, "specular");
        gl.uniform1i(uniformLocSpecular, specular);
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboTerrain);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTerrain);
        var attrVertex = gl.getAttribLocation(shaderProgramTerrain, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 24, 0);
        var attrNormal = gl.getAttribLocation(shaderProgramTerrain, "vNormal");
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, 24, 12);
        // draw
        gl.drawElements(gl.TRIANGLES, iboNTerrain, gl.UNSIGNED_SHORT, 0);
    }

    function drawLight(gl, modelMatrix) {
        gl.useProgram(shaderProgramLight);
        // enable vertex attributes
        var attrVertexLight = gl.getAttribLocation(shaderProgramLight, "vVertex");
        gl.enableVertexAttribArray(attrVertexLight);
        // set shader uniforms
        var uniformLocModelMatrix = gl.getUniformLocation(shaderProgramLight, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix);
        var uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramLight, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix);
        var uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramLight, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix);
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLight);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLight);
        var attrVertex = gl.getAttribLocation(shaderProgramLight, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 12, 0);
        // draw
        gl.drawElements(gl.POINTS, iboNLight, gl.UNSIGNED_SHORT, 0);
    }

    /////////////////////////////
    ///////   Render Loop   /////
    /////////////////////////////
    var gl; // webGL context
    var t = 0; // time counter

    function renderLoop() {

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // draw scene
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        drawScene(gl, t);

        // wait
        window.setTimeout(renderLoop, 1000 / 60);

        // update time
        if (lightRotation) {
            t += 1000 / 60;
        }
    }

    ///////////////////////////////////
    //////////   setup web gl   ///////
    ///////////////////////////////////

    var canvas;

    return {
        webGLStart: function (_canvas) {
            // store canvas
            canvas = _canvas;

            // reset the slider and the checkboxes
            var slider = document.getElementById('shiny');
            slider.value = 100;
            var lightRotation = document.getElementsByName('lightRotation');
            lightRotation[0].checked = true;
            var phongTerms = document.getElementsByName('phongTerm');
            phongTerms[0].checked = true;
            phongTerms[1].checked = false;
            phongTerms[2].checked = false;

            // add event listener
            document.addEventListener('keypress', onKeyPress, false);

            // initialize webGL canvas
            gl = new initGL(canvas);

            // init scene and shaders
            initScene(gl);

            // set clear color and enable depth test
            gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
            gl.enable(gl.DEPTH_TEST);

            // start render loop
            renderLoop();
        },

        onChangeShiny: function (value) {
            shiny = value;
        },

        onChangeLightRotation: function () {
            lightRotation = !lightRotation;
        },

        onChangePhongTerms: function (value) {
            if (value == 0) {
                ambient = !ambient;
            } else if (value == 1) {
                diffuse = !diffuse;
            } else if (value == 2) {
                specular = !specular;
            }
        }

    }

    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////

    function onKeyPress(e) {
        if (enableInteraction) {
            if (e.charCode == 119) { // W
                camera.move(0);
            } else if (e.charCode == 97) { // A
                camera.move(1);
            } else if (e.charCode == 115) { // S
                camera.move(2);
            } else if (e.charCode == 100) { // D
                camera.move(3);
            }
        }

    }
}()
