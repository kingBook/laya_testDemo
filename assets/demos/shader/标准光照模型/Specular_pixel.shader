Shader3D Start
{
    type:Shader3D,
    name:"标准光照模型/Specular_pixel",
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_SpecularColor: { type: Color,  default: [1, 1, 1, 1], block: unlit },
        u_Gloss: {type: Float, default: 3.0, range: [2.0, 24.0]},
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

    #define SHADER_NAME Specular_pixel

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #include "Lighting.glsl";

    varying vec3 worldNormal;
    varying vec3 worldPosition;

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);


        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        // ============================================
        // 法线方向（世界空间）
        worldNormal = normalize(mat3(worldMat) * vertex.normalOS);

        // 顶点位置（世界空间）
        worldPosition = positionWS;
        // ============================================

        gl_Position = getPositionCS(positionWS);

        gl_Position = remapPositionZ(gl_Position);

    }
#endGLSL

#defineGLSL unlitPS

    #define SHADER_NAME Specular_pixel

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    #include "Lighting.glsl";

    varying vec3 worldNormal;
    varying vec3 worldPosition;

    void main()
    {
        // ============================================
        // 主灯光方向（世界空间），注意反转
        DirectionLight directionLight = getDirectionLight(0, worldPosition);
        vec3 worldLightDir = normalize(-directionLight.direction);

        // 漫反射颜色
        vec3 diffuseColor = directionLight.color * u_AlbedoColor.rgb * saturate(dot(worldNormal, worldLightDir));

        // -------------
        // 主灯光反射方向（世界空间）
        vec3 reflectDir = normalize(reflect(-worldLightDir, worldNormal)); // reflect 函数的入射方向要求是由光源指顶点处，因此取反
        // 视角方向（世界空间）
        vec3 viewDir = normalize(u_CameraPos - worldPosition);
        // 高光反射颜色
        vec3 specularColor = directionLight.color * u_SpecularColor.rbg * pow(saturate(dot(reflectDir, viewDir)), u_Gloss);
        // -------------

        // 最终输出颜色
        vec3 outColor = diffuseColor + specularColor;
        // ============================================

        float alpha = u_AlbedoColor.a;

        gl_FragColor = vec4(outColor, alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


