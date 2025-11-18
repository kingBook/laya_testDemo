Shader3D Start
{
    type:Shader3D,
    name:"卡通/ToonShading",
    enableInstancing:true,
    supportReflectionProbe:true,
    statefirst: true,
    uniformMap:{
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0], block: unlit },

        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_AlbedoTexture: { type: Texture2D, options: { define: "ALBEDOTEXTURE" } },

        // =======================================
        u_OutlineWidth: { type:Float, default: 0.1, range: [0, 1] },
        u_OutlineColor: { type: Color, default: [0, 0, 0, 1], block: unlit },
        // =======================================
    },
    defines: {
    },
    shaderPass:[
         {
            // 渲染状态
            renderState: {
                cull: "Front"
            },
            statefirst: true,
            pipeline:Forward,
            VS:outlineVS,
            FS:outlinePS
        },
        {
            // 渲染状态
            // renderState: {
            //     cull: "Back"
            // },
            // statefirst: true,
            pipeline:Forward,
            VS:outlineVS2,
            FS:outlinePS2
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL outlineVS
    #define SHADER_NAME ToonShadingOutline

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";


    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

        // ----------------------
        vec4 position = vec4((vertex.positionOS) + (vertex.normalOS) * u_OutlineWidth, 1.0);

        mat4 worldMat = getWorldMatrix();
        vec3 positionWS = (worldMat * vec4(position)).xyz;
        
        // ----------------------

        gl_Position = getPositionCS(positionWS);
        gl_Position = remapPositionZ(gl_Position);

    }
#endGLSL

#defineGLSL outlinePS
    #define SHADER_NAME ToonShadingOutline

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    void main()
    {

        vec3 color = u_OutlineColor.rgb;
        float alpha = 0.0;
   

        gl_FragColor = vec4(color, alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL

#defineGLSL outlineVS2

    #define SHADER_NAME ToonShadingOutline2

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #ifdef UV
    varying vec2 v_Texcoord0;
    #endif // UV


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

#defineGLSL outlinePS2

    #define SHADER_NAME ToonShadingOutline2

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
        
    //#ifdef ALBEDOTEXTURE //(多pass时， 宏定义似乎无效)
        vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);
        #ifdef Gamma_u_AlbedoTexture
        albedoSampler = gammaToLinear(albedoSampler);
        #endif // Gamma_u_AlbedoTexture
        color *= albedoSampler.rgb;
        alpha *= albedoSampler.a;
    //#endif // ALBEDOTEXTURE

       // color = vec3(0.0, 1.0, 0.0);
        gl_FragColor = vec4(color, alpha);
        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


