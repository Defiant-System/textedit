### Some cool shaders
Below are a few amazing shaders found at [shadertoy.com](//shadertoy.com)

---

#### [Shiny Tiles](https://www.shadertoy.com/view/l3y3DK)

```y-glsl
#define F(a) for (float i; i++ < 7.; u /= .998) \
        o.a += .7/i/length(exp(-9.*cos(i/(.3+u*u) + iTime)) \
                         + tan(o.a*5.-iTime/i) \
                         + tan(u/i)*i/2.);
                     
void mainImage( out vec4 o, vec2 u ) {
    o.xyz = iResolution;
    u = (u+u-o.xy)/o.y;
    o -= o;
    F(x) F(y) F(z);
}
```


#### [Zippy Zaps](https://www.shadertoy.com/view/XXyGzh)

```y-glsl
void mainImage( out vec4 o, vec2 u )
{
    vec2 v = iResolution.xy;
         u = .2*(u+u-v)/v.y;    
         
    vec4 z = o = vec4(1,2,3,0);
     
    for (float a = .5, t = iTime, i; 
         ++i < 19.; 
         o += (1. + cos(z+t)) 
            / length((1.+i*dot(v,v)) 
                   * sin(1.5*u/(.5-dot(u,u)) - 9.*u.yx + t))
         )  
        v = cos(++t - 7.*u*pow(a += .03, i)) - 5.*u,                 
        u += tanh(40. * dot(u *= mat2(cos(i + .02*t - vec4(0,11,33,0)))
                           ,u)
                      * cos(1e2*u.yx + t)) / 2e2
           + .2 * a * u
           + cos(4./exp(dot(o,o)/1e2) + t) / 3e2;
              
     o = 25.6 / (min(o, 13.) + 164. / o) 
       - dot(u, u) / 250.;
}
```


#### [Raymarching Basic](https://www.shadertoy.com/view/Ml2XRD)

```y-glsl
float map(vec3 p) {
    vec3 n = vec3(0, 1, 0);
    float k1 = 1.9;
    float k2 = (sin(p.x * k1) + sin(p.z * k1)) * 0.8;
    float k3 = (sin(p.y * k1) + sin(p.z * k1)) * 0.8;
    float w1 = 4.0 - dot(abs(p), normalize(n)) + k2;
    float w2 = 4.0 - dot(abs(p), normalize(n.yzx)) + k3;
    float s1 = length(mod(p.xy + vec2(sin((p.z + p.x) * 2.0) * 0.3, cos((p.z + p.x) * 1.0) * 0.5), 2.0) - 1.0) - 0.2;
    float s2 = length(mod(0.5+p.yz + vec2(sin((p.z + p.x) * 2.0) * 0.3, cos((p.z + p.x) * 1.0) * 0.3), 2.0) - 1.0) - 0.2;
    return min(w1, min(w2, min(s1, s2)));
}

vec2 rot(vec2 p, float a) {
    return vec2(
        p.x * cos(a) - p.y * sin(a),
        p.x * sin(a) + p.y * cos(a));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    float time = iTime;
    vec2 uv = ( fragCoord.xy / iResolution.xy ) * 2.0 - 1.0;
    uv.x *= iResolution.x /  iResolution.y;
    vec3 dir = normalize(vec3(uv, 1.0));
    dir.xz = rot(dir.xz, time * 0.23);dir = dir.yzx;
    dir.xz = rot(dir.xz, time * 0.2);dir = dir.yzx;
    vec3 pos = vec3(0, 0, time);
    vec3 col = vec3(0.0);
    float t = 0.0;
    float tt = 0.0;
    for(int i = 0 ; i < 100; i++) {
        tt = map(pos + dir * t);
        if(tt < 0.001) break;
        t += tt * 0.45;
    }
    vec3 ip = pos + dir * t;
    col = vec3(t * 0.1);
    col = sqrt(col);
    fragColor = vec4(0.05*t+abs(dir) * col + max(0.0, map(ip - 0.1) - tt), 1.0); //Thanks! Shane!
    fragColor.a = 1.0 / (t * t * t * t);
}
```

