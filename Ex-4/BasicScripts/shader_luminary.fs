precision mediump float;

uniform vec3 clearColor;
uniform float viewportDim; // in x and y direction (aspect ratio=1)!
uniform float time;

varying vec2 vTex;
uniform vec3 color;
uniform float radius;
uniform vec3 sunPosition;

const float DEG2RAD = 3.14159 / 180.0;

void main(void)
{
	float pixel_r = length(vTex);
	if(pixel_r < radius)
	{
		gl_FragColor = vec4(color * cos(pixel_r / radius * 80.0 * DEG2RAD), 1.0);
	}
	else
	{
		float distanceToBoundary = abs(pixel_r - radius) / 2.0 * viewportDim;
		if(distanceToBoundary < 3.0)
		{
			float alpha = clamp(distanceToBoundary, 0.0, 1.0);
			gl_FragColor = vec4(mix(color * cos(80.0 * DEG2RAD), clearColor, alpha), 1.0);
		}
		else discard;
	}
}