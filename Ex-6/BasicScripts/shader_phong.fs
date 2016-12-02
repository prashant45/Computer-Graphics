precision mediump float;

uniform mat4 cameraMatrixInverse;

uniform vec3 color;
uniform vec3 lightPosition;
uniform float shiny;

uniform bool ambient;
uniform bool diffuse;
uniform bool specular;

// TODO 6.3a)	Define a varying variable with
//				the same name as in the vertex
//				shader to pass the normal.


// TODO 6.3a)	Define a varying variable with
//				the same name as in the vertex
//				shader to pass the position.

varying vec3 frag_Normal;
varying vec3 worldPos;


void main(void)
{

	vec3 k_amb = 0.1 * color;
	vec3 k_diff = 0.5 * color;
	vec3 k_spec = 0.4 * vec3(1, 1, 1);
	
	vec3 color_ambient, color_diffuse, color_specular;
	

	////////////////////////////////
    ////////  ambient term  ////////
    ////////////////////////////////
	color_ambient = k_amb;

	////////////////////////////////
	////////  diffuse term  ////////
	////////////////////////////////
	
	// TODO 6.3a)	Compute the diffuse color like shown
	//				in the lecture. Use k_diff and I_in.
	//				For the dot product, you need the normal
	//				and the vector from the fragment to the
	//				light source. Both vectors have to be
	//				normalized. Note that the varying variables
	//				normalized in the vertex shader do not have
	//				to be still normalized in the fragment shader.
	
	vec3 n = (frag_Normal);
	vec3 l = normalize(lightPosition - worldPos);
	vec3 r = normalize( 2.0 * dot(n, l) * n - l);
	
	color_diffuse = k_diff * dot(n, l);
	
	/////////////////////////////////
	////////  specular term  ////////
	/////////////////////////////////
	
	// TODO 6.3b)	Compute the specular color like shown
	//				in the lecture. Use k_spec, I_in and shiny.
	//				For the dot product, you need the reflection
	//				vector (computed from the normal and the vector
	//				to the light) and the view vector. To calculate
	//				the camera position, transform the camera
	//				position in camera space (easy!) to world space
	//				using the inverse camera matrix given as a 
	//				uniform.
	
	vec3 camera_pos = vec3(cameraMatrixInverse * vec4(0.0, 0.0, 0.0, 1.0));
	vec3 v = normalize(camera_pos - worldPos);
	
	color_specular = k_spec * pow(dot(v, r), shiny);

	///////////////////////////////////
    ////////  resulting color  ////////
    ///////////////////////////////////
	vec3 color_result = color_ambient + color_diffuse + color_specular;
	
    if(ambient) color_result += color_ambient;
    if(diffuse) color_result += color_diffuse;
    if(specular) color_result += color_specular;
	gl_FragColor = vec4(color_result, 1.0);

}