Shader3D Start
{
    type:Shader3D,
    name:"标准光照模型/Diffuse_vertex",
    enableInstancing:true,
    supportReflectionProbe:true,
    uniformMap:{
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
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

    #define SHADER_NAME Diffuse_vertex

    #include "Math.glsl";

    #include "Scene.glsl";
    #include "SceneFogInput.glsl";

    #include "Camera.glsl";
    #include "Sprite3DVertex.glsl";

    #include "VertexCommon.glsl";

    #include "Lighting.glsl";

    varying vec3 diffuseColor;

    void main()
    {
        Vertex vertex;
        getVertexParams(vertex);


        mat4 worldMat = getWorldMatrix();
        vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
        vec3 positionWS = pos.xyz / pos.w;

        // ============================================
        // 法线方向（世界空间）
        vec3 worldNormal = normalize(mat3(worldMat) * vertex.normalOS);

        // 主灯光方向（世界空间），注意反转
        DirectionLight directionLight = getDirectionLight(0, positionWS);
        vec3 worldLightDir = normalize(-directionLight.direction);

        // 漫反射颜色
        diffuseColor = directionLight.color * u_AlbedoColor.rgb * saturate(dot(worldNormal, worldLightDir));
        // ============================================

        gl_Position = getPositionCS(positionWS);

        gl_Position = remapPositionZ(gl_Position);

    }
#endGLSL

#defineGLSL unlitPS

    #define SHADER_NAME Diffuse_vertex

    #include "Color.glsl";

    #include "Scene.glsl";
    #include "SceneFog.glsl";

    #include "Camera.glsl";
    #include "Sprite3DFrag.glsl";

    varying vec3 diffuseColor;

    void main()
    {

        vec3 color = diffuseColor;
        float alpha = u_AlbedoColor.a;

        gl_FragColor = vec4(color, alpha);

        gl_FragColor = outputTransform(gl_FragColor);
    }
#endGLSL
GLSL End


