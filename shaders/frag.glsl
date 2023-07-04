#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif


uniform vec2 size;
uniform float time;

//uniform sampler2D palettes;
//uniform vec2 palettesSize;

/*
vec3 samplePalette(int palette, int index) {
    vec2 uv = vec2(
        (float(index + 1) + 0.5) / palettesSize.x,
        (float(palette) + 0.5) / palettesSize.y
    );
    return texture2D(palettes, uv).xyz;
}

int paletteSize(int palette) {
    vec2 uv = vec2(
        0,
        (float(palette) + 0.5) / palettesSize.y
    );
    return int(texture2D(palettes, uv).x * 255.0);
}
*/


vec3 TRANS_BLUE = vec3(0.357,0.808,0.98);
vec3 TRANS_PINK = vec3(0.961,0.663,0.722);
vec3 TRANS_WHITE = vec3(1.0, 1.0, 1.0);

vec3 trans(float a) {
    if(a < 0.25) return mix(TRANS_BLUE, TRANS_PINK, a / 0.25);
    if(a < 0.5)  return mix(TRANS_PINK, TRANS_WHITE, (a - 0.25) / 0.25);
    if(a < 0.75) return mix(TRANS_WHITE, TRANS_PINK, (a - 0.5) / 0.25);
    return mix(TRANS_PINK, TRANS_BLUE, (a - 0.75) / 0.25);
}


float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}


float sdUnion(float a, float b) { return min(a, b); }
float sdIntersection(float a, float b) { return max(a, b); }
float sdSubtract(float a, float b) { return sdIntersection(a, -b); }


vec2 rotate(vec2 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c) * p;
}


float sin2(float a) { return (sin(a) + 1.0) / 2.0; }
float cos2(float a) { return (cos(a) + 1.0) / 2.0; }


void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - size) / size.y;

    vec3 color = trans(sin2(time));

    float a = sdCircle(uv - vec2(0.3, 0.0), sin2(time) / 9.0);
    float b = sdCircle(uv - vec2(-0.3, 0.0), cos2(time) / 9.0);
    float d = sdUnion(a, b);

    //d = sin(d*10.0 + time)/10.0;
    d = abs(d);

    d = 0.005 / d;

    color *= d;


    gl_FragColor = vec4(color, 1.0);
}