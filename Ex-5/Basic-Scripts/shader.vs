attribute vec3 vVertex;
uniform mat4 M; // model matrix
uniform mat4 V; // view matrix
uniform mat4 P; // projection matrix

void main(void)
{
	mat4 MVP = P * V * M;
	gl_Position = MVP * vec4(vVertex, 1);
}