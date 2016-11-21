attribute vec3 vVertex;

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

void main(void)
{
	vec4 pos = projectionMatrix * cameraMatrix * modelMatrix * vec4(vVertex,1.0);
	gl_Position = pos;
}