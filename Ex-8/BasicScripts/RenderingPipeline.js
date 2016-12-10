function interpolateA(a, b, alpha) {
    var result = new Array(a.length);
    for(var i=0; i<a.length; ++i) {
        result[i] = (1.0 - alpha) * a[i] + alpha * b[i];
    }
    return result;
}

function RenderTarget(w) {
    this.w = w;
    this.data = new Array(w);
    this.Clear();
}

RenderTarget.prototype.Clear = function () {
    for (var i = 0; i < this.w; ++i) this.data[i] = [0.0, 0.0, 0.0];
}

RenderTarget.prototype.SetFragment = function (x, value) {
    if(x >= 0 && x<this.w) this.data[x] = value;
}

function DepthBuffer(w, bits) {
    this.w = w;
    this.bits = bits;
    this.data = new Array(w);
    this.Clear();
}

DepthBuffer.prototype.Clear = function (clrF) {
    if (clrF == undefined) clrF = 1.0;
    var clr = Math.floor(clrF * (Math.pow(2, this.bits)-1));
    for (var i = 0; i < this.w; ++i) this.data[i] = clr;
}

DepthBuffer.prototype.TestAndSetFragment = function (x, valueF, depthTestMode) {
    // boundary check
    if (x < 0 || x >= this.w) return false;
    // convert float value to fixed point value
    var value = Math.floor(valueF * (Math.pow(2, this.bits) - 1));
	

    var newValue = value;
    var oldValue = this.data[x];
    // TODO: implement the depth test based on the depth test mode (depthTestMode) and the depth value in fixed point representation
    // depthTestMode: 0 = no depth test, 1 = pass if less, -1 = pass if greater
	
    if (depthTestMode == 1) // adapt this condition
	{ 
        if(newValue < oldValue)
		{
			this.data[x] = newValue;
			return true;
		}
	}
	else if(depthTestMode == -1)
	{
		if(newValue > oldValue)
		{
			this.data[x] = newValue;
			return true;
		}
	}
	else
		return false;
}

function RenderingPipeline(depthBuffer, renderTarget) {
    this.uniforms = undefined;
    this.culling = 0; // 0 = false, 1 = backface culling, -1 = frontface culling
    this.depthTest = 0; // 0 = false, 1 = pass if less, -1 = pass if greater
    this.viewport = { x: 0, w: depthBuffer.w };

    this.depthBuffer = depthBuffer;
    this.renderTarget = renderTarget;

    // results from the pipeline stages, in practice you won't store these results
    this.vertexStream = undefined;
    this.primitives = undefined;
    this.culledPrimitives = undefined;
    this.clippedPrimitives = undefined;
    this.fragments = undefined;
    this.processedFragments = undefined;

    this.verbose = false;
}

RenderingPipeline.prototype.SetUniforms = function (uniforms) {
    this.uniforms = uniforms;
}

RenderingPipeline.prototype.SetCullingMode = function (cullingMode) {
    // 0 = false, 1 = backface culling, -1 = frontface culling
    this.culling = cullingMode;
}

RenderingPipeline.prototype.SetDepthMode = function (depthMode) {
    // 0 = false, 1 = pass if less, -1 = pass if greater
    this.depthTest = depthMode; 
}

RenderingPipeline.prototype.SetViewport = function (x, w) {
    this.viewport.x = x;
    this.viewport.w = w;
}

RenderingPipeline.prototype.Render = function (vbo, ibo, context) {
    if(this.verbose) console.log("Call Rendering Pipeline:");

    // vbo is handed to the vertex shader stage
    this.vertexStream = this.VertexShaderStage(vbo);

    // primitive assembly stage (converts a vertex stream into a sequence of primitives)
    this.primitives = this.PrimitiveAssemblyStage(this.vertexStream, ibo);

    // front-/back-face culling
    this.culledPrimitives = this.FaceCullingStage(this.primitives);

    // clipping
    this.clippedPrimitives = this.ClippingStage(this.culledPrimitives);

    // rasterization
    this.fragments = this.Rasterization(this.clippedPrimitives)

    // fragment shader stage
    this.processedFragments = this.FragmentShaderStage(this.fragments);

    // per sample processing
    this.PerSampleProcessingStage(this.processedFragments);

    if(this.verbose) console.log("----------------------------------");
}

RenderingPipeline.prototype.VertexShaderStage = function (vertices) {
    if(this.verbose) console.log("  Vertex Shader Stage:");
    if(this.verbose) console.log("    - #vertices: " + vertices.length);

    var vertexShaderStageOut = new Array(vertices.length);

    for (var i = 0; i < vertices.length; ++i) {
        vertexShaderStageOut[i] = this.VertexShader(vertices[i], i);
    }

    return vertexShaderStageOut;
}

RenderingPipeline.prototype.VertexShader = function (vertex, vId) {
    // elevate position of the vertex to homogeneous coordinates
    var p = vec3.create();
    p[0] = vertex[0];
    p[1] = vertex[1];
    p[2] = 1.0;

    // apply model space to world space transformation
    var p_worldSpace = vec3.create();
    vec3.transformMat3(p_worldSpace, p, this.uniforms.modelMatrix);

    // apply world space to camera space transformation
    var p_cameraSpace = vec3.create();
    vec3.transformMat3(p_cameraSpace, p_worldSpace, this.uniforms.cameraMatrix);

    // project point
    var q = vec3.create();
    vec3.transformMat3(q, p_cameraSpace, this.uniforms.projectionMatrix);

    // additional programable list of vertex attributes
    var color = [vertex[2], vertex[3], vertex[4]];

    var vertexAttributes = [color];

    // set the vertex shader output
    return {
                position: [q[0], q[1], q[2]], // homogeneous coordinate! (note that we are in 2D)
                attributes: vertexAttributes
            };
}

RenderingPipeline.prototype.PrimitiveAssemblyStage = function (vertexStream, ibo) {
    if(this.verbose) console.log("  Primitive Assembly Stage:");
    if(this.verbose) console.log("    - #vertices [in]: " + vertexStream.length);

    // TODO: implement the primitive assembly stage
    // a primitive consists of two vertices (e.g. primitives[i] = [vertexStream[idx_a], vertexStream[idx_b];)
	// you have to iterate over all indices in the ibo (every two ibo entries form a primitive e.g. ibo[0] and ibo[1] are the indices of the first primitive)
	// the result can best be seen in the canonical volume
	
    var primitives = new Array();
	var k = 0;
	
	for(var i = 0; i < ibo.length; i+=2)
	{
		primitives[k] = [ vertexStream[ibo[i]], vertexStream[ibo[[(i+1)]]] ];
		k+=1;
	}
    if(this.verbose) console.log("    - #primitives [out]: " + primitives.length);

    return primitives;
}

RenderingPipeline.prototype.FaceCullingStage = function (primitives) {
    if(this.verbose) console.log("  Face Culling Stage:");
    if(this.verbose) console.log("    - #primitives [in]: " + primitives.length);

    var cullingStageOut = new Array();

    for (var i = 0; i < primitives.length; ++i) {
        if (!this.LineCulling(primitives[i][0].position, primitives[i][1].position)) {
            cullingStageOut.push(primitives[i]);
        }
    }

    if(this.verbose) console.log("    - #primitives [out]: " + cullingStageOut.length);

    return cullingStageOut;
}

RenderingPipeline.prototype.LineCulling = function (a, b) {
    // TODO: implement line culling depending on the culling mode (this.culling)
    // this.culling: 0 = false, 1 = backface culling, -1 = frontface culling
	// the result can best be seen in the canonical volume
	
	vec3.scale(a, a, 1/a[2]);
	vec3.scale(b, b, 1/b[2]);
	
	if (this.culling == 0)
		return false;
	
    else if(this.culling == 1)
	{
		if(a[0] - b[0] < -0.001) 
			return false;
		else 
			return true;
	}
	else if(this.culling == -1)
	{
		if(a[0] - b[0] > -0.001)
			return false;
		else
			return true;
	}
		 // replace me: atm everything is not culled
}

RenderingPipeline.prototype.ClippingStage = function (primitives) {
    var clippingStageOut = new Array();

    if(this.verbose) console.log("  Clipping Stage:");
    if(this.verbose) console.log("    - #line segments [in]:  " + primitives.length);

    for (var i = 0; i < primitives.length; ++i) {
        var clippingResult = this.LineClipping(primitives[i][0].position, primitives[i][1].position);
        if (clippingResult != undefined) {
            var res = {
                primitive: primitives[i],
                alpha: clippingResult
            };
            clippingStageOut.push(res);
        }
    }

    if(this.verbose) console.log("    - #line segments [out]: " + clippingStageOut.length);

    return clippingStageOut;
}

RenderingPipeline.prototype.LineClipping = function (a, b) {
    // clip triangle against canonical volume in homogeneous coordinates
    var alpha_a = 0.0;
    var alpha_b = 1.0;

    for (var dim = 0; dim < 2; ++dim) {
        // window edge coordinates
        var wec_min = [a[2] + a[dim], b[2] + b[dim]];
        var wec_max = [a[2] - a[dim], b[2] - b[dim]];

        // trivial rejects
        if ((wec_min[0] < 0 && wec_min[1] < 0) || (wec_max[0] < 0 && wec_max[1] < 0)) {
            return undefined;
        }

        // compute alpha values
        if (!(wec_min[0] > 0 && wec_min[1] > 0)) {
            var alpha_min_edge = wec_min[0] / (wec_min[0] - wec_min[1]);
            alpha_min_edge = Math.max(Math.min(alpha_min_edge, 1.0), 0.0);

            // update global alpha values
            if (wec_min[0] < 0) { // a outside, b inside
                if (alpha_min_edge > alpha_a) alpha_a = alpha_min_edge;
            } else {
                if (alpha_min_edge < alpha_b) alpha_b = alpha_min_edge;
            }
        }

        if (!(wec_max[0] > 0 && wec_max[1] > 0)) {
            var alpha_max_edge = wec_max[0] / (wec_max[0] - wec_max[1]);
            alpha_max_edge = Math.max(Math.min(alpha_max_edge, 1.0), 0.0);

            // update global alpha values
            if (wec_max[0] < 0) { // a outside, b inside
                if (alpha_max_edge > alpha_a) alpha_a = alpha_max_edge;
            } else {
                if (alpha_max_edge < alpha_b) alpha_b = alpha_max_edge;
            }
        }
    }
    if (alpha_a >= alpha_b) return undefined;

    return [alpha_a, alpha_b];
}

RenderingPipeline.prototype.Rasterization = function (primitives) {
    if(this.verbose) console.log("  Rasterizer Stage:");
    if(this.verbose) console.log("    - #primitives [in]:  " + primitives.length);

    var fragments = new Array();

    for (var i = 0; i < primitives.length; ++i) {
        var primitiveFragments = this.RasterizePrimitive(primitives[i], i);
        for (var j = 0; j < primitiveFragments.length; ++j)
            fragments.push(primitiveFragments[j]);
    }

    if(this.verbose) console.log("    - #fragments [out]:  " + fragments.length);

    return fragments;
}

RenderingPipeline.prototype.RasterizePrimitive = function (primitive, pId) {
    var a = primitive.primitive[0].position;
    var b = primitive.primitive[1].position;

    // apply result from clipping stage
    var alpha_a = primitive.alpha[0];
    var alpha_b = primitive.alpha[1];
    var aC = interpolateA(a, b, alpha_a);
    var bC = interpolateA(a, b, alpha_b);

    // apply viewport transformation
    var aC_screenCoord = Math.floor( ((aC[0] / aC[2]) / 2.0 + 0.5) * this.viewport.w + this.viewport.x);
    var bC_screenCoord = Math.ceil( ((bC[0] / bC[2]) / 2.0 + 0.5) * this.viewport.w + this.viewport.x);

    // map depth to [0.0, 1.0]
    var a_depth = (a[1] / a[2]) / 2.0 + 0.5;
    var b_depth = (b[1] / b[2]) / 2.0 + 0.5;

    // read vertex attributes
    var attributes_a = primitive.primitive[0].attributes;
    var attributes_b = primitive.primitive[1].attributes;

    // compute number of fragments
    var sgn = bC_screenCoord > aC_screenCoord ? 1 : -1;
    var nFragments = Math.abs(bC_screenCoord - aC_screenCoord) + 1;
    var fragments = new Array(nFragments);
    for (var i = 0; i < nFragments; ++i) {
        // current screen coordinates
        var scrCoord = aC_screenCoord + i * sgn;

        // rasterizer alpha
        var alpha_rasterizer = i / (nFragments - 1.0);
        // primitive alpha, note: linear interpolation (might not be perspective correct)
        var alpha = (1.0 - alpha_rasterizer) * alpha_a + alpha_rasterizer * alpha_b;

        // interpolated depth
        var interpolatedDepth = (1.0 - alpha) * a_depth + alpha * b_depth;

        // interpolate attributes
        var interpolatedAttributes = new Array(attributes_a.length)
        for (var j = 0; j < attributes_a.length; ++j) {
            interpolatedAttributes[j] = interpolateA(attributes_a[j], attributes_b[j], alpha);
        }

        // set fragment
        fragments[i] = {
            screenCoord: scrCoord,
            depth: interpolatedDepth,
            attributes: interpolatedAttributes,
            primitiveId: pId
        };
    }
    return fragments;
}

RenderingPipeline.prototype.FragmentShaderStage = function (fragments) {
    var processedFragments = new Array();
    if(this.verbose) console.log("  Fragment Shader Stage:");
    if(this.verbose) console.log("    - #fragments [in]:  " + fragments.length);
    for (var i = 0; i < fragments.length; ++i) {
        var processedFragment = this.FragmentShader(fragments[i]);
        if (processedFragment != undefined) // check if pixel has been discarded
            processedFragments.push(processedFragment);
    }
    if(this.verbose) console.log("    - #fragments [out]:  " + processedFragments.length);
    return processedFragments;
}

RenderingPipeline.prototype.FragmentShader = function (fragment) {
    // simplest fragment shader, just pass on interpolated vertex colors
    var color = fragment.attributes[0];

    // return results
    return {
        depth: fragment.depth,
        screenCoord: fragment.screenCoord,
        fragColor: color
    };
}

// per sample processing
RenderingPipeline.prototype.PerSampleProcessingStage = function (processedFragments) {
    if(this.verbose) console.log("  Per Sample Processing Stage:");
    if(this.verbose) console.log("    - #fragments [in]:  " + processedFragments.length);
    for (var i = 0; i < processedFragments.length; ++i) {
        this.PerSampleProcessing(processedFragments[i]);
    }
}

RenderingPipeline.prototype.PerSampleProcessing = function (processedFragment) {
    var depthTestResult = this.depthBuffer.TestAndSetFragment(processedFragment.screenCoord, processedFragment.depth, this.depthTest);
    if (depthTestResult) {
        this.renderTarget.SetFragment(processedFragment.screenCoord, processedFragment.fragColor);
    }
}
