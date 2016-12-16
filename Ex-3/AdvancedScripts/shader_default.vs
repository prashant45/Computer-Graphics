attribute vec2 vVertex;

void main(void)
{
	gl_Position = vec4(vVertex, 0.0, 1.0);
	gl_PointSize = 10.0;
}