precision mediump float;

//////////////////////////////////////////////////////////////
// Exercise 3.3: Circle from Quad
//  define a constant variable (uniform) to define the canvas size from the "outside"

uniform vec2 canvasSize;

void main(void)
{
	//////////////////////////////////////////////////////////////
	// Exercise 3.3: Circle from Quad
	// map the fragment coordinate gl_FragCoord into the range of [-1,1]
	// discard all elements "outside" the radius length
	// smooth the circle edge within [r-smoothMargin, r] by computing an appropriate alpha value

	 float smoothMargin = .01;
	 float r = 0.8;

	vec2 uv = gl_FragCoord.xy;
	 
	 // Converting (x,y,z) to range [0,1]
	 //
	 
	float x = gl_FragCoord[0]/canvasSize[0];
	float y = gl_FragCoord[1]/canvasSize[1];

	 // Converting from range [0,1] to NDC [-1,1]
	 //
	
	float ndcx = x * 2.0 - 1.0;
	float ndcy = y * 2.0 - 1.0;
	
	float one = ndcx*ndcx;
	float two = ndcy*ndcy;
	float three = r*r;
	
	if(one + two  <= three){
	gl_FragColor = vec4(1.0, 0.0, 0.0, clamp(0.1, r - smoothMargin, r));
	}
	else{
	discard;
	}

	
}