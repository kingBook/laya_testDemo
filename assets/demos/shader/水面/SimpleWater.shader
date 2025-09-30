Shader3D Start
{
    type:Shader3D
    name:SimpleWater,
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        u_AlphaTestValue: { type: Float, default: 0.5 },
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0] },

        u_DiffuseColor: { type: Color, default: [1, 1, 1, 1] },
        u_DiffuseTexture: { type: Texture2D, options: { define: "DIFFUSEMAP" } },
        u_AlbedoIntensity: { type: Float, default: 1.0 },

        u_SpecularColor: { type: Color, default: [1, 1, 1, 1] },
        u_SpecularTexture: { type: Texture2D, options: { define: "SPECULARMAP" } },
        u_Shininess: { type: Float, default: 0.078, range: [0.0, 1.0] },

        u_NormalTexture: { type: Texture2D, options: { define: "NORMALMAP" } },
        u_NormalScale: { type: Float, default: 1.0, range: [0.0, 2.0] },
        
        // =============================================
        u_WaveParams: { type: Vector4, default: [1, 1, 0, 0],tips:"xy: 水流速1; zw: 水流速2"},
        u_ShalowColor: { type: Color, default:[1,1,1,1], tips:"浅水颜色"},
        u_DeepColor: { type: Color, default:[1,1,1,1], tips:"深水颜色"},
        u_FoamTexture: { type: Texture2D, default: "white", tips:"泡沫贴图 (R: 深浅程度; G: 泡沫; B: 细节）"},
        u_WaterNormalTexture: { type: Texture2D, default: "white", tips:"水面法线贴图" },
        u_WaterNormalScale: { type: Float, default: 1.0, range: [0.0, 2.0] },
        // =============================================
    },
    defines: {
        ENABLEVERTEXCOLOR: { type: bool, default: false }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:BlinnPhongVS,
            FS:BlinnPhongFS
        }
    ]
}
Shader3D End


GLSL Start
#defineGLSL BlinnPhongVS
    #define SHADER_NAME SimpleWater

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #include "BlinnPhongVertex.glsl";

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

        PixelParams pixel;
        initPixelParams(pixel, vertex);

        gl_Position = getPositionCS(pixel.positionWS);

        gl_Position = remapPositionZ(gl_Position);

    #ifdef FOG
        FogHandle(gl_Position.z);
    #endif
    }
#endGLSL

#defineGLSL BlinnPhongFS
    #define SHADER_NAME SimpleWater

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "BlinnPhongFrag.glsl";

    void getBinnPhongSurfaceParams(inout Surface surface, in PixelParams pixel)
    {
    #ifdef UV
        vec2 uv = transformUV(pixel.uv0, u_TilingOffset);
    #else // UV
        vec2 uv = vec2(0.0);
    #endif // UV

    surface.diffuseColor = u_DiffuseColor.rgb;
    surface.alpha = u_DiffuseColor.a;

    #ifdef COLOR
        #ifdef ENABLEVERTEXCOLOR
        surface.diffuseColor *= pixel.vertexColor.xyz;
        surface.alpha *= pixel.vertexColor.a;
        #endif // ENABLEVERTEXCOLOR
    #endif // COLOR
        
    #ifdef DIFFUSEMAP
        vec4 diffuseSampler = texture2D(u_DiffuseTexture, uv);
        #ifdef Gamma_u_AlbedoTexture
        diffuseSampler = gammaToLinear(diffuseSampler);
        #endif // Gamma_u_AlbedoTexture
        surface.diffuseColor *= diffuseSampler.rgb;
        surface.alpha *= diffuseSampler.a;
    #endif // DIFFUSEMAP

        surface.diffuseColor *= u_AlbedoIntensity;

        surface.normalTS = vec3(0.0, 0.0, 1.0);
    #ifdef NORMALMAP
        vec3 normalSampler = texture2D(u_NormalTexture, uv).rgb;
        normalSampler = normalize(normalSampler * 2.0 - 1.0);
        normalSampler.y *= -1.0;
        surface.normalTS = normalScale(normalSampler, u_NormalScale);
    #endif // NORMALMAP

        surface.specularColor = u_SpecularColor.rgb;
        surface.shininess = u_Shininess;

    #ifdef SPECULARMAP
        vec4 specularSampler = texture2D(u_SpecularTexture, uv);
        #ifdef Gamma_u_SpecularTexture
        specularSampler = gammaToLinear(specularSampler);
        #endif // Gamma_u_SpecularTexture
        surface.gloss = specularSampler.rgb;
    #else // SPECULARMAP
        #ifdef DIFFUSEMAP
        surface.gloss = vec3(diffuseSampler.a);
        #else // DIFFUSEMAP
        surface.gloss = vec3(1.0, 1.0, 1.0);
        #endif // DIFFUSEMAP
    #endif // SPECULARMAP
    }

    vec3 blendNormals(vec3 n1, vec3 n2) {
        return normalize(vec3(n1.xy+n2.xy, n1.z+n2.z));
    }

    vec3 unpackNormal(vec4 packednormal) {
        // #if defined(SHADER_API_GLES)  defined(SHADER_API_MOBILE)
        //    return packednormal.xyz * 2 - 1;
        // #else
        //     vec3 normal;
        //     normal.xy = packednormal.wy * 2 - 1;
        //     normal.z = sqrt(1 - normal.x*normal.x - normal.y * normal.y);
        //     return normal;
        // #endif
        return packednormal.xyz * 2.0 - 1.0;
   }

    void main()
    {
        PixelParams pixel;
        getPixelParams(pixel);

        Surface surface;
        getBinnPhongSurfaceParams(surface, pixel);

        // =============================================
        vec2 uv = v_Texcoord0;

        // 深浅颜色
        float t = texture2D(u_FoamTexture, uv).r; // R: 深浅程度
        surface.diffuseColor *= mix(u_ShalowColor, u_DeepColor, t).xyz; // 使用插值计算出深浅颜色

        // 水面波纹
        vec2 waveOffset1 = u_WaveParams.xy * u_Time + uv; // 水流速1
        vec2 waveOffset2 = u_WaveParams.zw * u_Time + uv; // 水流速2
        
        vec3 worldNormal = blendNormals(unpackNormal(texture2D(u_WaterNormalTexture, waveOffset1)), 
                                        unpackNormal(texture2D(u_WaterNormalTexture, waveOffset2)));
        worldNormal = mix(vec3(0.0, 0.0, 1.0), worldNormal, u_WaterNormalScale);
        // =============================================

    #ifdef ALPHATEST
        if (surface.alpha < u_AlphaTestValue)
        {
            discard;
        }
    #endif // ALPHATEST

        vec3 surfaceColor = vec3(0.0);

        surfaceColor = BlinnPhongLighting(surface, pixel);

    #ifdef FOG
        surfaceColor = sceneLitFog(surfaceColor);
    #endif // FOG

        gl_FragColor = vec4(surfaceColor, surface.alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL

GLSL End
