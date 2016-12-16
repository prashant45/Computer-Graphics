precision mediump float;

uniform vec3 clearColor;
uniform float viewportDim; // in x and y direction (aspect ratio=1)!
uniform float time;

varying vec2 vTex;
uniform vec3 color0;
uniform vec3 color1;
uniform float radius;
uniform vec3 sunPosition;

const float DEG2RAD = 3.14159 / 180.0;

// procedural noise from https://www.shadertoy.com/view/4lfSzS
vec4 hash4( vec4 n ) { return fract(sin(n)*1399763.5453123); }
float noise3(vec3 seed)
{
	vec4 x = vec4(seed.xy, 0.0, -seed.z);
	vec4 n3 = vec4(0,0.25,0.5,0.75);
	vec4 p2 = floor(x.wwww+n3);
	vec4 b = floor(x.xxxx+n3) + floor(x.yyyy+n3)*157.0 + floor(x.zzzz +n3)*113.0;
	vec4 p1 = b + fract(p2*0.00390625)*vec4(164352.0, -164352.0, 163840.0, -163840.0);
	p2 = b + fract((p2+1.0)*0.00390625)*vec4(164352.0, -164352.0, 163840.0, -163840.0);
	vec4 f1 = fract(x.xxxx+n3);
	vec4 f2 = fract(x.yyyy+n3);
	f1=f1*f1*(3.0-2.0*f1);
	f2=f2*f2*(3.0-2.0*f2);
	vec4 n1 = vec4(0,1.0,157.0,158.0);
	vec4 n2 = vec4(113.0,114.0,270.0,271.0);	
	vec4 vs1 = mix(hash4(p1), hash4(n1.yyyy+p1), f1);
	vec4 vs2 = mix(hash4(n1.zzzz+p1), hash4(n1.wwww+p1), f1);
	vec4 vs3 = mix(hash4(p2), hash4(n1.yyyy+p2), f1);
	vec4 vs4 = mix(hash4(n1.zzzz+p2), hash4(n1.wwww+p2), f1);	
	vs1 = mix(vs1, vs2, f2);
	vs3 = mix(vs3, vs4, f2);
	vs2 = mix(hash4(n2.xxxx+p1), hash4(n2.yyyy+p1), f1);
	vs4 = mix(hash4(n2.zzzz+p1), hash4(n2.wwww+p1), f1);
	vs2 = mix(vs2, vs4, f2);
	vs4 = mix(hash4(n2.xxxx+p2), hash4(n2.yyyy+p2), f1);
	vec4 vs5 = mix(hash4(n2.zzzz+p2), hash4(n2.wwww+p2), f1);
	vs4 = mix(vs4, vs5, f2);
	f1 = fract(x.zzzz+n3);
	f2 = fract(x.wwww+n3);
	f1=f1*f1*(3.0-2.0*f1);
	f2=f2*f2*(3.0-2.0*f2);
	vs1 = mix(vs1, vs2, f1);
	vs3 = mix(vs3, vs4, f1);
	vs1 = mix(vs1, vs3, f2);
	float r=dot(vs1,vec4(0.25));
	return r*r*(3.0-2.0*r) * sqrt(2.0);
}

float noiseDir(vec2 direction, float t)
{
	float n_0 = noise3(vec3(direction * 7.0,  t));
	float n_1 = noise3(vec3(direction * 17.0, t));
	float n_2 = noise3(vec3(direction * 73.0, t));
	return clamp(n_0 * n_0 * n_1 * n_2, 0.0, 1.0);
}

void main(void)
{
	float pixel_r = length(vTex);

	// TODO:	Compute blending weight, using the 
	//			noiseDir function.

	// TODO:	Use the blending weight to blend 
	//			between color0 and color1. Replace
	//			the following dummy line.
	vec3 mixedColor = color0;

	if(pixel_r < radius)
	{
		gl_FragColor = vec4(mixedColor, 1.0);
	}
	else
	{
		
		float distanceToBoundary = abs(pixel_r - radius) / 2.0 * viewportDim;
		if(distanceToBoundary < 0.5)
		{
			float alpha = clamp(distanceToBoundary, 0.0, 1.0);
			gl_FragColor = vec4(mix(mixedColor, clearColor, alpha), 1.0);
		}
		else discard;
		
		
	}
}