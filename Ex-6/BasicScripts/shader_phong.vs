precision mediump float;

attribute vec3 vVertex;
attribute vec3 vNormal;

uniform mat4 modelMatrix; // model matrix
uniform mat4 cameraMatrix; // camera matrix
uniform mat4 projectionMatrix; // projection matrix

uniform mat4 normalMatrix;

// TODO 6.3a)	Define a varying variable to
//				pass the normal to the fragment
//				shader.



// TODO 6.3a)	Define a varying variable to
//				pass the world position to the
//				fragment shader.

varying vec3 frag_Normal;
varying vec3 worldPos;


void main(void)
{
	mat4 MVP = projectionMatrix * cameraMatrix * modelMatrix;
	gl_Position = MVP * vec4(vVertex, 1);

	// TODO 6.3a)	Assign the normal to the varying variable. 
	//				Before you do so, transform it from model
	//				space to world space. Use the appropriate
	//				matrix. Do not forget to normalize the normal
	//				afterwards.
	

	// TODO 6.3a)	Assign the position to the varying variable. 
	//				Before you do so, transform it from model
	//				space to world space. Use the appropriate
	//				matrix. Do not forget to dehomogenize it 
	//				afterwards.
	
	vec4 vertPos4 = modelMatrix * vec4(vVertex, 1.0);
	worldPos = vec3(vertPos4) / vertPos4.w;
	//worldPos = normalize(worldPos);
	frag_Normal = vec3(normalMatrix * vec4(vNormal, 0.0));
	frag_Normal = normalize(frag_Normal);
}