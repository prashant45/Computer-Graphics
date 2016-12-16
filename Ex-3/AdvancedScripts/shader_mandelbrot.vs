attribute vec2 vVertex;

varying vec2 coord;

void main(void)
{
	coord = vVertex * 0.5 + 0.5;
	gl_Position = vec4(vVertex, 0.0, 1.0);
}