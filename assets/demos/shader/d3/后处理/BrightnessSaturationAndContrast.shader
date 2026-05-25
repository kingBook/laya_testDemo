Shader3D Start
{
    type:Shader3D,
    name:"后处理/BrightnessSaturationAndContrast",
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0], block: unlit },

        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_AlbedoTexture: { type: Texture2D, options: { define: "ALBEDOTEXTURE" } },

        //----------------
        u_Brightness: { type: Float, default:1 },
        u_Saturation: { type: Float, default:1 },
        u_Contrast: { type: Float, default:1 },
        //----------------

    },
    defines: {
    }
    shaderPass:[
        {
            //----------------
            renderState: {
                ZTest: Always,
                Cull: Off,
                ZWrite: Off
            },
            //----------------
            pipeline:Forward,
            VS:unlitVS,
            FS:unlitPS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL unlitVS

    #define SHADER_NAME BrightnessSaturationAndContrast

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    varying vec2 v_Texcoord0;


    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

    #ifdef UV
        v_Texcoord0 = transformUV(vertex.texCoord0, u_TilingOffset);
    #endif // UV


        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        gl_Position = getPositionCS(positionWS);

        gl_Position = remapPositionZ(gl_Position);


    }
#endGLSL

#defineGLSL unlitPS

    #define SHADER_NAME BrightnessSaturationAndContrast

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    varying vec2 v_Texcoord0;

    void main()
    {
        vec2 uv = v_Texcoord0;

        vec3 color = u_AlbedoColor.rgb;
        float alpha = u_AlbedoColor.a;
    #ifdef ALBEDOTEXTURE
        vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);
        #ifdef Gamma_u_AlbedoTexture
        albedoSampler = gammaToLinear(albedoSampler);
        #endif // Gamma_u_AlbedoTexture
        color *= albedoSampler.rgb;
        alpha *= albedoSampler.a;
    #endif // ALBEDOTEXTURE
        vec3 finalColor = color.rgb * u_Brightness;

        float luminance = 0.2125 * color.r + 0.7154 * color.g + 0.0721 * color.b;
        vec3 luminanceColor = vec3(luminance, luminance, luminance);
        finalColor = mix(luminanceColor, finalColor, u_Saturation);

        color *= finalColor;

        gl_FragColor = vec4(color, alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


