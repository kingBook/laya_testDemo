Shader3D Start
{
    type:Shader3D,
    name:Brick_UnlitShader,
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        u_AlphaTestValue: { type: Float, default: 0.5 },
        
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_AlbedoTexture: { type: Texture2D, options: { define: "ALBEDOTEXTURE" } },
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0], block: unlit },


        // =============================================
        u_NormalTexture: { type: Texture2D },
        u_TilingOffsetNormal: { type: Vector4, default: [1, 1, 0, 0], block: unlit },
        u_NormalScale: { type: Float, default: 1.0, range: [0.0, 2.0] },
        // =============================================
    },
    defines: {
        ENABLEVERTEXCOLOR: { type: bool, default: false }
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

    #define SHADER_NAME Brick_UnlitShader

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";
    #include "Lighting.glsl";

    #ifdef COLOR
    varying vec4 v_VertexColor;
    #endif // COLOR

    // 法线在切线空间下计算，相关： =============================
    varying vec4 uv;
    varying vec3 lightDirOS;
    varying vec3 viewDirOS;

    vec3 ObjSpaceLightDir(in vec3 positionWS) {
        mat3 worldMat3 = mat3(getWorldMatrix()); // world matrix 的上 3x3
        mat3 worldToObj = inverse(worldMat3);

        DirectionLight directionLight = getDirectionLight(0, positionWS);

        return normalize(worldToObj * normalize(-directionLight.direction));
    }

    vec3 ObjSpaceViewDir(in vec3 positionWS) {
        mat3 worldMat3 = mat3(getWorldMatrix()); // world matrix 的上 3x3
        mat3 worldToObj = inverse(worldMat3);

        vec3 viewDirWS = getViewDirection(positionWS);

        return normalize(worldToObj * normalize(viewDirWS));
    }
    // =============================================================

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);

    #ifdef COLOR
        v_VertexColor = vertex.vertexColor;
    #endif // COLOR

        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        gl_Position = getPositionCS(positionWS);

        gl_Position = remapPositionZ(gl_Position);

    #ifdef FOG
        FogHandle(gl_Position.z);
    #endif

        // ============================================================
        // 使用了两张纹理
        // xy 存储主纹理的纹理坐标
        uv.xy = vertex.texCoord0.xy * u_TilingOffset.xy + u_TilingOffset.zw; // transformUV(vertex.texCoord0, u_TilingOffset);
        //  zw 存储法线纹理的纹理坐标
        uv.zw = vertex.texCoord0.xy * u_TilingOffsetNormal.xy + u_TilingOffsetNormal.zw; // transformUV(vertex.texCoord0, u_TilingOffsetNormal);
        
        // 副法线
        vec3 binormal = cross(normalize(vertex.normalOS), normalize(vertex.tangentOS.xyz)) * vertex.tangentOS.w;
        
        // 模型空间到切线空间的变换矩阵（模型空间切线方向、副法线、模型空间法线，按行排列）
        mat3 rotation = mat3(vertex.tangentOS.xyz, binormal, vertex.normalOS);


        lightDirOS = (rotation * ObjSpaceLightDir(positionWS)).xyz;
        viewDirOS = (rotation * ObjSpaceViewDir(positionWS)).xyz;
        // ============================================================
    }
#endGLSL

#defineGLSL unlitPS

    #define SHADER_NAME Brick_UnlitShader

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    varying vec4 v_Color;

    // ==========================================
    varying vec4 uv;
    varying vec3 lightDirOS;
    varying vec3 viewDirOS;
    // ===========================================

    void main()
    {

        vec3 color = u_AlbedoColor.rgb;
        float alpha = u_AlbedoColor.a;
    #ifdef ALBEDOTEXTURE
        vec4 albedoSampler = texture2D(u_AlbedoTexture, uv.xy);
        #ifdef Gamma_u_AlbedoTexture
        albedoSampler = gammaToLinear(albedoSampler);
        #endif // Gamma_u_AlbedoTexture
        color *= albedoSampler.rgb;
        alpha *= albedoSampler.a;
    #endif // ALBEDOTEXTURE

    #ifdef COLOR
        #ifdef ENABLEVERTEXCOLOR
        vec4 vertexColor = v_Color;
        color *= vertexColor.rgb;
        alpha *= vertexColor.a;
        #endif // ENABLEVERTEXCOLOR
    #endif // COLOR

    #ifdef ALPHATEST
        if (alpha < u_AlphaTestValue)
            discard;
    #endif // ALPHATEST

    #ifdef FOG
        color = scenUnlitFog(color);
    #endif // FOG
        // =========================================
        vec3 normalSampler = texture2D(u_NormalTexture, uv.zw).rgb;
        normalSampler = normalize(normalSampler * 2.0 - 1.0);
        //normalSampler.y *= -1.0;

        vec3 normalTS = normalScale(normalSampler, u_NormalScale);
        //normalTS.z = sqrt(1.0 - saturate(dot(normalSampler.xy, normalSampler.xy)));

        color *= max(0.0, dot(normalTS, lightDirOS));
        // =========================================

        gl_FragColor = vec4(color, alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


