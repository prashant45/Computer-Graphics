attribute vec2 vVertex;

void main(void)
{
	gl_Position = vec4(vVertex, 1.0, 1.0);
}