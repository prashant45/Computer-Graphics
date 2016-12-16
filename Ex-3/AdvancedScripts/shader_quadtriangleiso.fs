precision mediump float;

uniform vec3 color;
uniform vec2 pointA;
uniform vec2 pointB;
uniform vec2 pointC;

void main(void)
{
	// use the fragment coordinate (gl_FragCoord) and clip it against the triangle that is defined by the three points A,B and C
	// if the fragment lies in the triangle set the gl_FragColor to the uniform color, otherwise discard the fragment (using "dicard;")
	// if the fragment is inside the triangle and in the range of a iso line (within 1 pixel radius from a iso line) blend the color linearly with the color of the iso line (black)
	// draw all iso lines with a multiple of 14 pixels distance
	gl_FragColor = vec4(color, 1.0);
}