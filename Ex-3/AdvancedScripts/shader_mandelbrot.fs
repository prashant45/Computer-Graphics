precision mediump float;

uniform int zoom;
uniform vec2 center;
uniform int max_iter;

varying vec2 coord;

vec2 getComplexNumberFromCoords(vec2 xy) {
	float re = (xy.x - 0.5) * 3.0 * pow(2.0, float(zoom)) + center.x;
	float im = (xy.y - 0.5) * 2.0 * pow(2.0, float(zoom)) + center.y;
	return vec2(re, im);
}


vec3 hsv2rgb(vec3 hsv) {
	float h = hsv[0];
	float s = hsv[1];
	float v = hsv[2];

	float c = v * s;
	float x = c * (1.0 - abs(mod((h / 60.0), 2.0) - 1.0));
	float m = v - c;

	float r, g, b;
	if (h < 60.0) {
		r = c;
		g = x;
		b = 0.0;
	}
	else if (h < 120.0) {
		r = x;
		g = c;
		b = 0.0;
	}
	else if (h < 180.0) {
		r = 0.0;
		g = c;
		b = x;
	}
	else if (h < 240.0) {
		r = 0.0;
		g = x;
		b = c;
	}
	else if (h < 300.0) {
		r = x;
		g = 0.0;
		b = c;
	}
	else {
		r = c;
		g = 0.0;
		b = x;
	}
	vec3 rgb = vec3(r + m, g + m, b + m);
	return rgb;
}


vec3 getColorForIter(float iter) {
	// TODO 3.2a):      Port your Javascript code from Advanced 
	//					Exercises 1 to GLSL (see the code below 
	//					for reference). Orientate yourselves
	//					by the existing code in this file. Only 
	//					implement the HSV rainbow colorscheme for
	//					simplicity. The hsv2rgb function is already
	//					given.
	//
	// -->	function getColorForIter(iter) {
	// -->		if (iter >= (max_iter * 1.0)) {
	// -->			return [0, 0, 0];
	// -->		}
	// -->		var h = iter / (1.0 * max_iter);
	// -->		var hsv = [(h * 360 + 180) % 360, 1.0, 1.0];
	// -->		color = hsv2rgb(hsv);
	// -->
	// -->		return color;
	// -->	}
		


	return vec3(1, 0.5, 0); // dummy return value, to be replaced
}


vec2 mult(vec2 x, vec2 y) {
	float re = (x.x * y.x - x.y * y.y);
	float im = (x.x * y.y + x.y * y.x);
	return vec2(re, im);
}


vec2 add(vec2 x, vec2 y) {
	float re = (x.x + y.x);
	float im = (x.y + y.y);
	return vec2(re, im);
}


float complex_abs(vec2 x) {
	return sqrt(x.x * x.x + x.y * x.y);
}


vec2 f_c(vec2 z, vec2 c) {
	return add(mult(z, z), c);
}


float countIterations(vec2 start_z, vec2 c) {
	// TODO 3.2a):      Port your Javascript code from Advanced 
	//					Exercises 1 to GLSL (see the code below 
	//					for reference). Orientate yourselves
	//					by the existing code in this file. Note that
	//					we cannot use a while loop in WebGL, so we
	//					use a for loop and break once max_iter is reached.
	//					Also note that the abs() function for complex
	//					numbers aka vec2 is called complex_abs in this version
	//					due to name conflicts with the built-in function abs().
	//
	// -->	function countIterations(start_z, c, max_iter) {
	// -->		var z = start_z;
	// -->		var iter = 0;
	// -->		for (var i = 0; i < 1000; i++) {
	// -->			if (abs(z) >= 2 || iter > max_iter) break;
	// -->			z = f_c(z, c);
	// -->			iter++;
	// -->		}
	// -->		if (abs(z) < 1) return iter;
	// -->		return iter + 1 - Math.log(Math.log(abs(z))) / Math.log(2.0);
	// -->	}



	return float(max_iter); // dummy return value, to be replaced
}


void main(void)
{
	// TODO 3.2a):      Use functions countIterations() and getColorForIter()
	//					to find the right gl_FragColor for each pixel. You can
	//					use getComplexNumberFromCoords(coord) to find the 
	//					complex number corresponding to the current pixel.
		


	gl_FragColor = vec4(1, 1, 0, 1); // dummy return value, to be replaced
}