Shader3D Start
{
    type:Shader3D,
    name:"纹理/法线纹理/NormalMapWS",
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_AlbedoTexture: { type: Texture2D, options: { define: "ALBEDOTEXTURE" } },
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0], block: unlit },

        // ================== 法线 =====================
        u_NormalTexture: { type: Texture2D },
        u_TilingOffsetNormal: { type: Vector4, default: [1, 1, 0, 0], block: unlit },
        u_NormalScale: { type: Float, default: 1.0, range: [0.0, 2.0] },
        // =============================================

        // ================== 高光反射 ==================
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_SpecularColor: { type: Color,  default: [1, 1, 1, 1], block: unlit },
        u_Gloss: {type: Float, default: 3.0, range: [2.0, 24.0]},
        // =============================================
    },
    defines: {
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

    #define SHADER_NAME NormalMapWS

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";
    #include "Lighting.glsl";


    // 法线在世界空间下计算，相关： =================
    varying vec4 uv;
    varying vec3 directionLightColor;
    varying mat3 TBN;
    varying vec3 worldPosition;
    // ============================================


    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);


        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        // ============================================
        // 使用了两张纹理

        // xy 存储主纹理的纹理坐标
        uv.xy = vertex.texCoord0.xy * u_TilingOffset.xy + u_TilingOffset.zw;
        // transformUV(vertex.texCoord0, u_TilingOffset);

        //  zw 存储法线纹理的纹理坐标
        uv.zw = vertex.texCoord0.xy * u_TilingOffsetNormal.xy + u_TilingOffsetNormal.zw;
        // transformUV(vertex.texCoord0, u_TilingOffsetNormal);

        // 主灯光方向（世界空间）
        DirectionLight directionLight = getDirectionLight(0, positionWS);
        
        // 主灯光颜色
        directionLightColor = directionLight.color;

        // 对象空间 > 世界空间的变换矩阵3x3
        mat3 worldMat3x3 = mat3(worldMat);

        // 法线方向（世界空间）
        vec3 normalWS = normalize(worldMat3x3 * vertex.normalOS);
        // 切线方向（世界空间）
        vec3 tangentWS = normalize(worldMat3x3 * vertex.tangentOS.xyz);
        // 副法线（世界空间）
        vec3 ninormalWS = normalize(cross(normalWS, tangentWS) * sign(vertex.tangentOS.w));

        TBN = mat3(tangentWS, ninormalWS, normalWS);

        worldPosition = positionWS;
        // ============================================

       

        gl_Position = getPositionCS(positionWS);

        gl_Position = remapPositionZ(gl_Position);
        
    }
#endGLSL

#defineGLSL unlitPS

    #define SHADER_NAME NormalMapWS

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "Lighting.glsl";

    // ==========================================
    varying vec4 uv;
    varying vec3 directionLightColor;
    varying mat3 TBN;
    varying vec3 worldPosition;
    // ===========================================

    void main()
    {
        // ============================================
        // 主灯光方向（世界空间），注意反转
        DirectionLight directionLight = getDirectionLight(0, worldPosition);
        vec3 lightDirWS = -directionLight.direction;

        // 视角方向（世界空间）
        vec3 viewDirWS = getViewDirection(worldPosition);

        // 法线方向（切线空间 > 世界空间）
        vec3 normalSampler = texture2D(u_NormalTexture, uv.zw).rgb;
        normalSampler = normalize(normalSampler * 2.0 - 1.0);
        //normalSampler.y *= -1.0;
        vec3 normalTS = normalScale(normalSampler, u_NormalScale);
        normalTS.z = sqrt(1.0 - saturate(dot(normalTS.xy, normalTS.xy)));
        // 此处原需要由（T、B、N）按行排列构成的矩阵的逆（即转置矩阵，正交矩阵的逆等于转置） * 法线方向向量，
        // 由于GLSL中，矩阵填充T、B、N向量时，默认就是按列排列，所以此处不需要对TBN转置
        vec3 normalWS = normalize(TBN * normalTS); 
       
        // 漫反射颜色
        vec3 diffuseColor = directionLightColor * u_AlbedoColor.rgb * saturate(dot(normalWS, lightDirWS));
        // -------------
        // 主灯光反射方向（世界空间）
        vec3 reflectDir = normalize(reflect(-lightDirWS, normalWS)); // reflect 函数的入射方向要求是由光源指顶点处，因此取反
        // 高光反射颜色
        vec3 specularColor = directionLightColor * u_SpecularColor.rbg * pow(saturate(dot(reflectDir, viewDirWS)), u_Gloss);
        // -------------
        // ============================================

        vec3 color = diffuseColor + specularColor;

        float alpha = u_AlbedoColor.a;
    #ifdef ALBEDOTEXTURE
        vec4 albedoSampler = texture2D(u_AlbedoTexture, uv.xy);
        #ifdef Gamma_u_AlbedoTexture
        albedoSampler = gammaToLinear(albedoSampler);
        #endif // Gamma_u_AlbedoTexture
        color *= albedoSampler.rgb;
        alpha *= albedoSampler.a;
    #endif // ALBEDOTEXTURE

        gl_FragColor = vec4(color, alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


