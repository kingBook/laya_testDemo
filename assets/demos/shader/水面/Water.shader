Shader3D Start
{
    type:Shader3D
    name:"水面/Water",
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        // =============================================
        u_SpecularColor: { type: Color, default: [1, 1, 1, 1] },
        u_Gloss: { type: Float, default:1.0, range: [1.0, 5.0] },
        u_Shininess: { type: Float, default: 0.078, range: [0.0, 1.0] },

        u_detailColor: { type: Color, default: [1, 1, 1, 1] },

        u_WaveParams: { type: Vector4, default: [0.01,0.0, 0.01, 0.01], tips:"xy: 水流速1; zw: 水流速2"},
        u_ShalowColor: { type: Color, default:[1,1,1,1], tips:"浅水颜色"},
        u_DeepColor: { type: Color, default:[1,1,1,1], tips:"深水颜色"},
        u_FoamTexture: { type: Texture2D, default: "white", tips:"泡沫贴图 (R: 深浅程度; G: 泡沫; B: 细节）"},
        u_WaterNormalTexture: { type: Texture2D, default: "white", tips:"水面法线贴图（注意：法线贴图的平铺模式必须设置为重复，否则无法看到流动效果）" },
        u_WaterNormalScale: { type: Float, default: 1.0, range: [0.0, 2.0] },
        // =============================================
    },
    defines: {
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:WaterVS,
            FS:WaterFS
        }
    ]
}
Shader3D End


GLSL Start
#defineGLSL WaterVS
    #define SHADER_NAME Water

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

    }
#endGLSL

#defineGLSL WaterFS
    #define SHADER_NAME Water

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "BlinnPhongFrag.glsl";

    void getWaterSurface(inout Surface surface, const in PixelParams pixel){
        vec2 uv = v_Texcoord0;

        vec4 foamTextureSampler = texture2D(u_FoamTexture, uv);

        // 深浅颜色
        float t = foamTextureSampler.r; // R: 深浅程度
        vec3 diffuseColor = mix(u_ShalowColor, u_DeepColor, t).rgb; // 使用插值计算出深浅颜色

        // 细节颜色
        vec3 viewDirWS = getViewDirection(pixel.positionWS);
        float ndv = max(0.0, dot(pixel.normalWS, viewDirWS));
        vec3 detailColor = (foamTextureSampler.b * ndv * 0.5) * u_detailColor.rgb;
        diffuseColor *= detailColor;

        // 水面波纹（注意：法线贴图的平铺模式必须设置为重复，否则无法看到流动效果）
        vec2 waveOffset1 = uv + u_WaveParams.xy * u_Time; // 水流速1
        vec2 waveOffset2 = uv + u_WaveParams.zw * u_Time; // 水流速2
        
        vec3 normal1 = texture2D(u_WaterNormalTexture, waveOffset1).rgb;
        normal1 = normalize(normal1 * 2.0 - 1.0);
        normal1.y *= -1.0;

        vec3 normal2 = texture2D(u_WaterNormalTexture, waveOffset2).rgb;
        normal2 = normalize(normal2 * 2.0 - 1.0);
        normal2.y *= -1.0;

        vec3 blendNormalTS = normalize(normal1 + normal2);
        blendNormalTS = mix(vec3(0.0, 0.0, 1.0), blendNormalTS, u_WaterNormalScale);
        //blendNormalTS.z = mix(1.0, blendNormalTS.z, u_WaterNormalScale);

        surface.diffuseColor = diffuseColor;
        surface.specularColor = u_SpecularColor.rgb;
        surface.shininess = u_Shininess;
        surface.gloss = vec3(1.0) * u_Gloss;
        surface.normalTS = blendNormalTS;
        surface.alpha = 1.0;
        // surface.alphaClip
    }

    void main()
    {
        PixelParams pixel;
        getPixelParams(pixel);

        // =============================================
        Surface surface;
        getWaterSurface(surface, pixel);

        vec3 color = BlinnPhongLighting(surface, pixel);
        // =============================================

        gl_FragColor = vec4(color, surface.alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL

GLSL End
