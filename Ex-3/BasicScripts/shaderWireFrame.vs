	
attribute vec2 vVertex;				// Get the vertex(attribute) position 
attribute vec3 vertColor;

//attribute vec3 vBarycenter;

varying vec3 receive_data;


//////////////////////////////////////////////////////////////
// Exercise 3.2: Barycentric Coordinates
// create an attribute for the barycentric Coordinate 


//////////////////////////////////////////////////////////////
// Exercise 3.2: Barycentric Coordinates
// create an interpolation variable (varying) to "send data" to the fragment shader


void main(void)
{
	receive_data = vertColor;
    gl_Position = vec4(vVertex, 0.0, 1.0);
    //////////////////////////////////////////////////////////////
    // Exercise 3.2: Barycentric Coordinates
    // assign the barycentric coordinate to the varying
	
	
}
