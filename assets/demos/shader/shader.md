#include "Scene.glsl";
```
float u_Time;
vec4 u_FogParams;//x start,y range,z Density
vec4 u_FogColor;
float u_GIRotate;
int u_DirationLightCount;
```

#include "Math.glsl";
```
mat2 inverse(mat2 m)
mat3 inverse(mat3 m)
mat4 inverse(mat4 m)

mat4 transpose(mat4 m)
mat3 transpose(mat3 m)

#define PI 3.14159265359

#define INVERT_PI 0.31830988618

#define HALF_PI 1.570796327

#define MEDIUMP_FLT_MAX 65504.0
#define MEDIUMP_FLT_MIN 0.00006103515625

#if defined(GL_FRAGMENT_PRECISION_HIGH)
#define FLT_EPS		   1e-5
#define saturateMediump(x) x
#else
#define FLT_EPS		   MEDIUMP_FLT_MIN
#define saturateMediump(x) min(x, MEDIUMP_FLT_MAX)
#endif // GL_FRAGMENT_PRECISION_HIGH

#define saturate(x) clamp(x, 0.0, 1.0)

float pow2(float x)
vec3 pow2(vec3 x)
float pow5(float x)

float log10(float x)

float vecmax(const vec2 v)
float vecmax(const vec3 v)
float vecmax(const vec4 v)

float vecmin(const vec2 v)
float vecmin(const vec3 v)
float vecmin(const vec4 v)

vec3 SafeNormalize(in vec3 inVec)
vec3 normalScale(in vec3 normal, in float scale)

/**
 * Approximates acos(x) with a max absolute error of 9.0x10^-3.
 * Valid in the range -1..1.
 */
float acosFast(float x)

/**
 * Approximates acos(x) with a max absolute error of 9.0x10^-3.
 * Valid only in the range 0..1.
 */
float acosFastPositive(float x)

/*
 * Random number between 0 and 1, using interleaved gradient noise.
 * w must not be normalized (e.g. window coordinates)
 */
float interleavedGradientNoise(const highp vec2 w)

/*
 * vertex rotate by Euler
 */
vec3 rotationByEuler(in vec3 vector, in vec3 rot)

/*
 * Assume that axis has been normalized
 * point rotate by one axis
 */
vec3 rotationByAxis(in vec3 vector, in vec3 axis, in float angle)

/*
 *rotate by quaternions
 */
vec3 rotationByQuaternions(in vec3 v, in vec4 q)

```

#include "Camera.glsl";
```
uniform vec3 u_CameraPos;
uniform mat4 u_View;
uniform mat4 u_Projection;
uniform mat4 u_ViewProjection;
uniform vec3 u_CameraDirection;
uniform vec3 u_CameraUp;
uniform vec4 u_Viewport;
uniform vec4 u_ProjectionParams;
uniform vec4 u_OpaqueTextureParams;
uniform vec4 u_ZBufferParams;
    #endif // ENUNIFORMBLOCK

uniform sampler2D u_CameraDepthTexture;
uniform sampler2D u_CameraDepthNormalsTexture;
uniform sampler2D u_CameraOpaqueTexture;

vec4 getPositionCS(in vec3 positionWS)
vec3 getViewDirection(in vec3 positionWS)
// 根据投影矩阵重映射深度
vec4 remapPositionZ(vec4 position)
```

#include "VertexCommon.glsl";
```
struct Vertex {

    vec3 positionOS;

    vec3 normalOS;

    #ifdef TANGENT
    vec4 tangentOS;
    #endif // TANGENT

    // todo  uv define ?
    #ifdef UV
    vec2 texCoord0;
    #endif // UV

    #ifdef UV1
    vec2 texCoord1;
    #endif // UV1

    #ifdef COLOR
    vec4 vertexColor;
    #endif // COLOR

    #ifdef LIGHTMAP
    vec4 lightmapScaleOffset;
	#endif LIGHTMAP
};

void getVertexParams(inout Vertex vertex)

```
#include "Sprite3DVertex.glsl";
```
//Sprite3DCommon.glsl

uniform mat4 u_WorldMat;

uniform vec4 u_WorldInvertFront; // x: invert front face,yzw NodeCustomData

vec2 transformUV(in vec2 texcoord, in vec4 tilingOffset)

/**
 * world matrix
 */
mat4 getWorldMatrix()
```

#ShadingCommon.glsl
```
#if !defined(ShadingCommon_lib)
    #define ShadingCommon_lib

// varying
varying vec3 v_PositionWS;
// todo
varying vec3 v_NormalWS;
varying vec3 v_TangentWS;
varying vec3 v_BiNormalWS;

    #ifdef UV
varying vec2 v_Texcoord0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
varying vec2 v_Texcoord1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
varying vec4 v_VertexColor;
    #endif // COLOR

// 记录顶点信息, 用于由vs向fs传递数据
struct PixelParams {
    vec3 positionWS;

    // todo
    vec3 normalWS;
    vec3 tangentWS;
    vec3 biNormalWS;
    mat3 TBN;

    #ifdef UV
    vec2 uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    vec2 uv1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    vec4 vertexColor;
    #endif // COLOR
};

#endif // ShadingCommon_lib
```

#SkyCommon.glsl
```
uniform vec3 u_SunLight_direction;
uniform vec4 u_SunLight_color;
uniform mat4 u_SkyViewMat;
uniform mat4 u_SkyProjectionMat;
uniform mat4 u_SkyProjectionViewMat;


vec4 remapSkyPositionZ(in vec4 position)

vec4 rotateAroundYInDegrees(vec4 vertex, float deg)

```

 #include "SceneFogInput.glsl";
```
varying float v_fogFactor;
void FogHandle(in float fact)
```

#SceneFog.glsl
```
float getFogFactor()
vec3 scenUnlitFog(in vec3 color)
vec3 sceneLitFog(in vec3 color)

```

#Lighting.glsl
```
struct Light {
    vec3 color;
    vec3 dir;
    float attenuation;
};

struct DirectionLight {
    vec3 color;
    vec3 direction;
    float attenuation;
    int lightMode;
};

struct PointLight {
    vec3 color;
    vec3 position;
    float range;
    float attenuation;
    int lightMode;
};

struct SpotLight {
    vec3 color;
    vec3 position;
    float range;
    vec3 direction;
    float spot;
    float attenuation;
    int lightMode;
};

    #define LightMode_Mix      0
    #define LightMode_RealTime 1

int getAttenuationByMode(float lightMapMode)

// 灯光衰减函数
float attenuation(in vec3 L, in float invLightRadius)

// 平行光
Light getLight(in DirectionLight directionLight)

// 点光
Light getLight(in PointLight pointLight, in vec3 normalWS, in vec3 positionWS)

// 聚光灯
Light getLight(in SpotLight spotLight, in vec3 normalWS, in vec3 positionWS)

#ifdef LEGACYSINGLELIGHTING
	    #define CalculateLightCount 1
	    #define DirectionCount	1

	    #ifdef DIRECTIONLIGHT
uniform vec3 u_DirLightColor;
uniform vec3 u_DirLightDirection;
uniform int u_DirLightMode;
	    #endif // DIRECTIONLIGHT

	    #ifdef POINTLIGHT
// uniform PointLight u_PointLight;
uniform vec3 u_PointLightColor;
uniform vec3 u_PointLightPos;
uniform float u_PointLightRange;
uniform int u_PointLightMode;
	    #endif // POINTLIGHT

	    #ifdef SPOTLIGHT
// uniform SpotLight u_SpotLight;
uniform vec3 u_SpotLightPos;
uniform vec3 u_SpotLightColor;
uniform vec3 u_SpotLightDirection;
uniform float u_SpotLightRange;
uniform float u_SpotLightSpot;
uniform int u_SpotLightMode;
	    #endif // SPOTLIGHT

	#else // LEGACYSINGLELIGHTING
	    #define CalculateLightCount MAX_LIGHT_COUNT
	    #define DirectionCount	u_DirationLightCount

uniform sampler2D u_LightBuffer;

	//	    #ifdef DIRECTIONLIGHT
	// uniform mediump int u_DirationLightCount;
	//	    #endif

	    #if defined(POINTLIGHT) || defined(SPOTLIGHT)
const int c_ClusterBufferWidth = CLUSTER_X_COUNT * CLUSTER_Y_COUNT;
int c_ClusterBufferHeight = CLUSTER_Z_COUNT * (1 + int(ceil(float(MAX_LIGHT_COUNT_PER_CLUSTER) / 4.0))); // 兼容WGSL
const int c_ClusterBufferFloatWidth = c_ClusterBufferWidth * 4;
uniform sampler2D u_LightClusterBuffer;

int getLightIndex(in int offset, in int index)

DirectionLight getDirectionLight(in int index, in vec3 positionWS)

ivec4 getClusterInfo(mat4 viewMatrix, vec4 viewport, vec3 positionWS, vec4 fragCoord, vec4 projectParams)

PointLight getPointLight(in int index, in ivec4 clusterInfo, in vec3 positionWS)

SpotLight getSpotLight(in int index, in ivec4 clusterInfo, in vec3 positionWS)

```

#ShadowCommon.glsl
```
uniform vec3 u_ShadowLightDirection;
uniform vec4 u_ShadowBias;
uniform vec4 u_ShadowSplitSpheres[4];
uniform mat4 u_ShadowMatrices[4];
uniform vec4 u_ShadowMapSize;
uniform vec4 u_ShadowParams;
uniform vec4 u_SpotShadowMapSize;
uniform mat4 u_SpotViewProjectMatrix;
```