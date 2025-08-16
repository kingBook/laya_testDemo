Shader3D Start
{
    type:Shader3D,
    name:Water,
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        //u_AlphaTestValue: { type: Float, default: 0.5 },
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0], block: unlit },

        //u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        //u_AlbedoTexture: { type: Texture2D, options: { define: "ALBEDOTEXTURE" } },

        // 浅水色
        u_ShalowColor: { type: Color, default:[1,1,1,1]},
        // 深水色
        u_DeepColor: { type: Color, default:[1,1,1,1]},
        // 泡沫贴图（R: 深浅程度; G: 泡沫; B: 细节）
        u_FoamTexture: { type: Texture2D, default: "white"},
        // xy: 水流速1; zw: 水流速2
        u_WaveParams: { type: Vector4, default: [1, 1, 0, 0]},
    },
    defines: {
        //ENABLEVERTEXCOLOR: { type: bool, default: false }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:unlitVS,
            FS:unlitPS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL unlitVS

    #define SHADER_NAME Water

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #ifdef UV
    varying vec2 v_Texcoord0;
    #endif // UV

    // #ifdef COLOR
    // varying vec4 v_VertexColor;
    // #endif // COLOR

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

    #ifdef UV
        v_Texcoord0 = transformUV(vertex.texCoord0, u_TilingOffset);
    #endif // UV

    // #ifdef COLOR
    //     v_VertexColor = vertex.vertexColor;
    // #endif // COLOR

        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        gl_Position = getPositionCS(positionWS);

        gl_Position = remapPositionZ(gl_Position);

    // #ifdef FOG
    //     FogHandle(gl_Position.z);
    // #endif
    }
#endGLSL

#defineGLSL unlitPS

    #define SHADER_NAME Water

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    //varying vec4 v_Color;
    varying vec2 v_Texcoord0;

    vec4 lerp(vec4 a, vec4 b, float t) {
        float r1 = a.r+(b.r-a.r)*t;
        float g1 = a.g+(b.g-a.g)*t;
        float b1 = a.b+(b.b-a.b)*t;
        float a2 = a.a+(b.a-a.a)*t;
        return vec4(r1,g1,b1,a2);
    }

    vec3 blendNormals(vec3 n1, vec3 n2) {
        return normalize(vec3(n1.xy+n2.xy, n1.z+n2.z));
    }

    vec3 UnpackNormal(vec4 packednormal) {
        //#if defined(SHADER_API_GLES)  defined(SHADER_API_MOBILE)
        //    return packednormal.xyz * 2 - 1;
        //#else
            vec3 normal;
            normal.xy = packednormal.wy * 2 - 1;
            normal.z = sqrt(1 - normal.x*normal.x - normal.y * normal.y);
            return normal;
        //#endif
    }

    void main()
    {
        vec2 uv = v_Texcoord0;

        //vec3 color = u_AlbedoColor.rgb;
        //float alpha = u_AlbedoColor.a;

        // 深浅程度
        float degree = texture2D(u_FoamTexture, uv).r;
        // 使用插值计算出颜色
        vec4 diffuse = lerp(u_ShalowColor, u_DeepColor, degree);

        //vec3 color = u_AlbedoColor.rgb;
        //float alpha = u_AlbedoColor.a;

    // #ifdef ALBEDOTEXTURE
    //     vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);
    //     #ifdef Gamma_u_AlbedoTexture
    //     albedoSampler = gammaToLinear(albedoSampler);
    //     #endif // Gamma_u_AlbedoTexture
    //     color *= albedoSampler.rgb;
    //     alpha *= albedoSampler.a;
    // #endif // ALBEDOTEXTURE

    // #ifdef COLOR
    //     #ifdef ENABLEVERTEXCOLOR
    //     vec4 vertexColor = v_Color;
    //     color *= vertexColor.rgb;
    //     alpha *= vertexColor.a;
    //     #endif // ENABLEVERTEXCOLOR
    // #endif // COLOR

    // #ifdef ALPHATEST
    //     if (alpha < u_AlphaTestValue)
    //         discard;
    // #endif // ALPHATEST

    // #ifdef FOG
    //     color = scenUnlitFog(color);
    // #endif // FOG

        //gl_FragColor = vec4(color, alpha);

        gl_FragColor = diffuse;

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


