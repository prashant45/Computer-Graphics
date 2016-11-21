function arrow(context, fromx, fromy, tox, toy) {
    // http://stuff.titus-c.ch/arrow.html
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
}

var Basic1_1 = function () {

    function OrthogonalProjection2D(point2D)
    {
        // TODO: implement the orthogonal projection
        // the camera orientation is aligned with the global coordinatesystem, the view direction is the z-axis
        // note that point2D[0] is the x component and point2D[1] is the z-component
        // (hint: have a look at the bottom left of the output image, there you will see the x-z-axis)

		var x = point2D[0]*1.0 + point2D[1]*0.0;			//************ Matrix that maps 2d to 1d <-- [1 0 0 0] ****************
        return x;
    }

    return {
        start: function (canvas) {
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, 600, 300);
            context.font = "bold 12px Georgia";
            context.textAlign = "center";

            // polygon - in world space
            var color = [0, 255, 0];
            var polygon = [[100, 400], [100, 500], [200, 500], [200, 400]];

            // draw polygon
            context.strokeStyle = 'rgb(0,0,0)';
            context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.beginPath();
            context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
            for (var i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
            context.fill();
            context.stroke();

            // draw image plane
            var imagePlane = 150;
            context.fillStyle = 'rgb(0,0,0)';
            context.fillText("image plane", imagePlane, 290);
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            context.moveTo(imagePlane, 0);
            context.lineTo(imagePlane, 270);
            context.stroke();

            // project polygon onto the image plane
            var polygonProjected = new Array();
            for (var i = 0; i < polygon.length; ++i) polygonProjected.push(OrthogonalProjection2D(polygon[i]));

            // draw projected polygon
            context.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.beginPath();
            context.moveTo(imagePlane, polygonProjected[polygonProjected.length - 1]);
            for (var i = 0; i < polygonProjected.length; ++i) context.lineTo(imagePlane, polygonProjected[i]);
            context.stroke();

            // draw projection lines
            context.setLineDash([3, 3]);
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            for (var i = 0; i < polygonProjected.length; ++i) {
                context.moveTo(polygon[i][1], polygon[i][0]);
                context.lineTo(imagePlane, polygonProjected[i]);
            }
            context.stroke();
            context.setLineDash([1, 0]);

            // draw axis
            arrow(context, 15, 285, 15, 255);
            arrow(context, 15, 285, 45, 285);
            context.fillStyle = 'rgb(0,0,0)';
            context.fillText("X", 5, 260);
            context.fillText("Z", 45, 297);
        }
    }
}()



var Basic1_2 = function () {

    function PerspectiveProjection2D(eye, imagePlane, point2D) {
        // TODO: implement the perspective projection assuming the center of the camera lies in (eye[0], eye[1])
        // the camera orientation is aligned with the global coordinatesystem
        // note that eye, point2D, imagePlane are all in world space
        // you first have to transform everything to camera space
        // imagePlane = z value of the image plane (you also have to transform it to camera space coordinates)
		
		//
		// ************** Converting into homogeneous coordinates for matrix multiplication **************
		//
		var point_x = [point2D[0], point2D[1], 1.0];
		
		//
		// ************** Defining the Rotation and Translation matrix to change world to camera coordinates **************
		//
		var Rotation_Matrix = [1, 0, -eye[0], 0, 1, -eye[1], 0, 0, 1];
		
		//
		// ************** Point coordinates in camera orientation **************
		//
		var point2D_new =  [ (Rotation_Matrix[0]*point_x[0] + Rotation_Matrix[1]*point_x[1] + Rotation_Matrix[2]*1.0),
						     (Rotation_Matrix[3]*point_x[0] + Rotation_Matrix[4]*point_x[1] + Rotation_Matrix[5]*1.0), 
							 (Rotation_Matrix[6]*point_x[0] + Rotation_Matrix[7]*point_x[1] + Rotation_Matrix[8]*1.0) ] ;
		
		var final_point = point2D_new[0]*imagePlane/point2D_new[1];
			
		return final_point;
    }

    return {
        start: function (canvas) {
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, 600, 300);
            context.font = "bold 12px Georgia";
            context.textAlign = "center";

            // polygon - in world space
            var color = [0, 255, 0];
            var polygon = [[100, 400], [100, 500], [200, 500], [200, 400]];

            // draw polygon
            context.strokeStyle = 'rgb(0,0,0)';
            context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.beginPath();
            context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
            for (var i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
            context.fill();
            context.stroke();

            // draw image plane
            var eye = [150, 10];
            var imagePlane = 150;
            context.fillStyle = 'rgb(0,0,0)';
            context.fillText("image plane", imagePlane, 290);
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            context.moveTo(imagePlane, 0);
            context.lineTo(imagePlane, 270);
            context.stroke();
            context.beginPath();
            context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
            context.fill();

            // project polygon onto the image plane
            var polygonProjected = new Array();
            for (var i = 0; i < polygon.length; ++i) polygonProjected.push(PerspectiveProjection2D(eye, imagePlane, polygon[i]));

            // draw projected polygon
            context.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.beginPath();
            context.moveTo(imagePlane, polygonProjected[polygonProjected.length - 1] + eye[0]);
            for (var i = 0; i < polygonProjected.length; ++i) context.lineTo(imagePlane, polygonProjected[i] + eye[0]);
            context.stroke();

            // draw projection lines
            context.setLineDash([3, 3]);
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            for (var i = 0; i < polygonProjected.length; ++i) {
                context.moveTo(polygon[i][1], polygon[i][0]);
                context.lineTo(imagePlane, polygonProjected[i] + eye[0]);
            }
            context.stroke();
            context.setLineDash([1, 0]);

            // draw axis
            arrow(context, 15, 285, 15, 255);
            arrow(context, 15, 285, 45, 285);
            context.fillStyle = 'rgb(0,0,0)';
            context.fillText("X", 5, 260);
            context.fillText("Z", 45, 297);
        }
    }
}()

// compute a perspective transformation
// that perspectively maps the 2D space onto a 1D line
mat3.perspective = function (out, fovy, near, far) {
    // TODO: setup the projection matrix, parameterized with the variables fovy, near and far
    // use the opengl style to setup the matrix (as in the lecture)
    // i.e. the camera looks into the negativ view direction

	//
	// ************** Defining the Perspective Projection Matrix **************
	var aspect = 1.0;
	var r = aspect*near*Math.tan(fovy/2.0);
	var l = -r;
	
    out[0] = 2.0*near/(r-l);
    out[1] = 0;
    out[2] = 0;

    out[3] = (l+r)/(r-l);
    out[4] = -(far+near)/(far-near);
    out[5] = -1.0;

    out[6] = 0;
    out[7] = -2.0*far*near/(far-near);
    out[8] = 0;

    return out;
};


function Camera() {
    this.eye = [150, 10];
    this.fovy = 30.0 / 180.0 * Math.PI;
    this.near = 150;
    this.far = 500;
    this.lookAtPoint = [150, 450];

    // the cameraMatrix transforms from world space to camera space
    this.cameraMatrix = mat3.create();
    // the cameraMatrixInverse transforms from camera space to world space
    this.cameraMatrixInverse = mat3.create();
    // projection matrix
    this.projectionMatrix = mat3.create();

    // setup matrices
    this.update();
}

Camera.prototype.lookAt = function (point2D) {
    this.lookAtPoint = [point2D[0], point2D[1]];
    this.update();
};

Camera.prototype.setEye = function (eye2D) {
    this.eye[0] = eye2D[0];
    this.eye[1] = eye2D[1];
    this.update();
};

Camera.prototype.update = function () {
    // note: opengl looks into the negative viewDir!
    var negViewDir = vec2.create();
	negViewDir[0] = this.eye[0] - this.lookAtPoint[0];			//g-vec Gaze Direction
    negViewDir[1] = this.eye[1] - this.lookAtPoint[1];
    vec2.normalize(negViewDir, negViewDir);
	
	
    // TODO: setup the camera matrix and the inverse camera matrix
    // the cameraMatrix transforms from world space to camera space
    // the cameraMatrixInverse transforms from camera space to world space
	
	//
	// ************** Defining the Inverse Camera Matrix based on the new vectors defined **************
	// ************** Refer the new Slide uploaded **************
	//
	var v = vec2.fromValues(negViewDir[0],negViewDir[1]);
	var u = vec2.fromValues(-negViewDir[1],negViewDir[0]);
	this.cameraMatrixInverse = [ u[0], u[1], 0.0, v[0], v[1], 0.0, this.eye[0], this.eye[1], 1.0 ];
	mat3.invert(this.cameraMatrix, this.cameraMatrixInverse);
	
    // TODO: setup the projection matrix using mat3.perspective(...), which has to be implemented!
	
	mat3.perspective(this.projectionMatrix, this.fovy, this.near, this.far);
};

Camera.prototype.projectPoint = function (point2D) {
    // this function projects a point form world space coordinates to the canonical viewing volume

    // TODO: use this.cameraMatrix to transform the point to camera space, use homogeneous coordinates!
    // then, use this.projectionMatrix to apply the projection
    // don't forget to dehomogenize the projected point before returning it!
	var homog_Point2D = vec3.fromValues(point2D[0], point2D[1], 1.0);
	
	var point2camera = vec3.create()
	vec3.transformMat3(point2camera,homog_Point2D,this.cameraMatrix);
	
	var point2proj = vec3.create();
	vec3.transformMat3(point2proj,point2camera,this.projectionMatrix);
	
    return [point2proj[0]/point2proj[2], point2proj[1]/point2proj[2]];
	
}

Camera.prototype.render = function (context) {
    // near plane
    var p_near_0 = vec3.create();
    vec3.transformMat3(p_near_0, [this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
    var p_near_1 = vec3.create();
    vec3.transformMat3(p_near_1, [-this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
    // far plane
    var p_far_0 = vec3.create();
    vec3.transformMat3(p_far_0, [this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);
    var p_far_1 = vec3.create();
    vec3.transformMat3(p_far_1, [-this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);

    // render frustum
    context.fillStyle = 'rgb(0,0,0)';
    context.lineWidth = 1;
    context.fillText("near plane", p_near_1[1], p_near_1[0]+20);
    context.fillText("far plane", p_far_1[1], p_far_1[0]+20);
    context.strokeStyle = 'rgb(100,100,100)';
    context.fillStyle = 'rgb(240,240,240)';
    context.beginPath();
    context.moveTo(p_near_0[1], p_near_0[0]);
    context.lineTo(p_near_1[1], p_near_1[0]);
    context.lineTo(p_far_1[1],  p_far_1[0]);
    context.lineTo(p_far_0[1],  p_far_0[0]);
    context.lineTo(p_near_0[1], p_near_0[0]);
    context.fill();
    context.stroke();

    // render eye
    context.fillStyle = 'rgb(0,0,0)';
    context.beginPath();
    context.fillText("eye", this.eye[1], this.eye[0] + 20);
    context.arc(this.eye[1], this.eye[0], 4, 0, 2 * Math.PI);
    context.arc(this.lookAtPoint[1], this.lookAtPoint[0], 4, 0, 2 * Math.PI);
    context.fill();
};

Camera.prototype.enableFrustumClipping = function (context) {
    // near plane
    var p_near_0 = vec3.create();
    vec3.transformMat3(p_near_0, [this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
    var p_near_1 = vec3.create();
    vec3.transformMat3(p_near_1, [-this.near * Math.sin(this.fovy / 2), -this.near, 1.0], this.cameraMatrixInverse);
    // far plane
    var p_far_0 = vec3.create();
    vec3.transformMat3(p_far_0, [this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);
    var p_far_1 = vec3.create();
    vec3.transformMat3(p_far_1, [-this.far * Math.sin(this.fovy / 2), -this.far, 1.0], this.cameraMatrixInverse);

    context.save();
    context.lineWidth = 1;
    context.strokeStyle = 'rgb(100,100,100)';
    context.beginPath();
    context.moveTo(p_near_0[1], p_near_0[0]);
    context.lineTo(p_near_1[1], p_near_1[0]);
    context.lineTo(p_far_1[1], p_far_1[0]);
    context.lineTo(p_far_0[1], p_far_0[0]);
    context.lineTo(p_near_0[1], p_near_0[0]);
    context.stroke();
    context.clip();
}

Camera.prototype.disableFrustumClipping = function (context) {
    context.restore();
}

Camera.prototype.getWorldPointOnScreen = function (screenCoordinate) {
    var inverse = this.cameraMatrixInverse;
    // near plane
    var p_near_0 = vec3.create();
    vec3.transformMat3(p_near_0, [this.near * Math.sin(this.fovy/2), -this.near, 1.0], inverse);
    var p_near_1 = vec3.create();
    vec3.transformMat3(p_near_1, [-this.near * Math.sin(this.fovy/2), -this.near, 1.0], inverse);

    var alpha = screenCoordinate / 2.0 + 0.5;

    return [alpha * p_near_0[0] + (1.0-alpha) * p_near_1[0],
            alpha * p_near_0[1] + (1.0-alpha) * p_near_1[1]];
}

var Basic1_3 = function () {

    var init = true;
    var canvas;
    var camera = new Camera();

    return {
        start: function (_canvas) {
            if (init) {
                canvas = _canvas;
                canvas.addEventListener('mousedown', onMouseDown, false);
                init = false;
            }
            var context = canvas.getContext("2d");
            context.clearRect(0, 0, 600, 300);
            context.font = "bold 12px Georgia";
            context.textAlign = "center";

            // polygon - coordinates in world space
            var color = [0, 255, 0];
            var polygon = [[100, 400], [100, 500], [200, 500], [200, 400]];

            // draw camera
            camera.render(context);

            // draw polygon
            context.strokeStyle = 'rgb(0,0,0)';
            context.fillStyle = 'rgb(255,0,0)';
            context.beginPath();
            context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
            for (var i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
            context.fill();
            context.stroke();

            camera.enableFrustumClipping(context);
            context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.beginPath();
            context.moveTo(polygon[polygon.length - 1][1], polygon[polygon.length - 1][0]);
            for (var i = 0; i < polygon.length; ++i) context.lineTo(polygon[i][1], polygon[i][0]);
            context.fill();
            context.stroke();
            camera.disableFrustumClipping(context);


            // project polygon onto the image plane
            var polygonProjected = new Array();
            for (var i = 0; i < polygon.length; ++i)
                polygonProjected.push(camera.projectPoint(polygon[i]));

            // draw projected polygon
            context.strokeStyle = 'rgb(255, 0, 0)';
            context.beginPath();
            var pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[polygonProjected.length - 1][0]);
            context.moveTo(pointOnScreen1D[1], pointOnScreen1D[0]);
            for (var i = 0; i < polygonProjected.length; ++i) {
                pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[i][0]);
                context.lineTo(pointOnScreen1D[1], pointOnScreen1D[0]);
            }
            context.stroke();

            camera.enableFrustumClipping(context);
            context.lineWidth = 4;
            context.strokeStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            context.beginPath();
            var pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[polygonProjected.length - 1][0]);
            context.moveTo(pointOnScreen1D[1], pointOnScreen1D[0]);
            for (var i = 0; i < polygonProjected.length; ++i) {
                pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[i][0]);
                context.lineTo(pointOnScreen1D[1], pointOnScreen1D[0]);
            }
            context.stroke();
            camera.disableFrustumClipping(context);
            context.lineWidth = 1;

            // draw projection lines
            context.setLineDash([3, 3]);
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            for (var i = 0; i < polygonProjected.length; ++i) {
                context.moveTo(polygon[i][1], polygon[i][0]);
                pointOnScreen1D = camera.getWorldPointOnScreen(polygonProjected[i][0]);
                context.lineTo(pointOnScreen1D[1], pointOnScreen1D[0]);

                // debug code to see the projection lines from vertex to eye
                // these lines should coinside with the projection lines ending at the image plane
                //context.moveTo(polygon[i][1], polygon[i][0]);
                //context.lineTo(camera.eye[1], camera.eye[0]);
            }
            context.stroke();
            context.setLineDash([1, 0]);


            // draw homogeneouse coordinate system
            var offset = [0, 0];
            var dim = [120, 120];
            context.save();
            context.beginPath();
            context.rect(offset[1], offset[0], dim[1], dim[0]);
            context.clip();
            context.strokeStyle = 'rgb(100,100,100)';
            context.fillStyle = 'rgb(240,240,240)';
            context.beginPath();
            context.rect(offset[1], offset[0], dim[1], dim[0]);
            context.fill();
            context.stroke();
            context.beginPath();
            context.strokeStyle = 'rgb(0,0,0)';
            context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            var p = [   (-polygonProjected[polygonProjected.length - 1][0] / 2 + 0.5) * dim[0] + offset[0],
                        (polygonProjected[polygonProjected.length - 1][1] / 2 + 0.5) * dim[1] + offset[1]];
            context.moveTo(p[1], p[0]);
            for (var i = 0; i < polygonProjected.length; ++i) {
                p = [   (-polygonProjected[i][0] / 2 + 0.5) * dim[0] + offset[0],
                        (polygonProjected[i][1] / 2 + 0.5) * dim[1] + offset[1]];
                context.lineTo(p[1], p[0]);
            }
            context.fill();
            context.stroke();
            context.fillStyle = 'rgb(0,0,0)';
            context.fillText("Canonical Volume", offset[1] + dim[1] / 2, offset[0] + dim[0] - 4);
            context.restore();

            // draw axis
            arrow(context, 15, 285, 15, 255);
            arrow(context, 15, 285, 45, 285);
            context.fillStyle = 'rgb(0,0,0)';
            context.fillText("X", 5, 260);
            context.fillText("Z", 45, 297);
        }
    }

    function onMouseDown(e) {
        var rect = canvas.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        if (e.ctrlKey) {
            camera.lookAt([y, x]);
        } else {
            camera.setEye([y, x]);
        }
        Basic1_3.start(canvas);
    }
}()
