attribute vec2 vVertex;
uniform mat3 modelMatrix;
varying vec2 vTex;

void main(void)
{
	vTex = vVertex;
	vec2 pos = (modelMatrix * vec3(vVertex,1.0)).xy;
	gl_Position = vec4(pos, 0.0, 1.0);
	gl_PointSize = 10.0;
}