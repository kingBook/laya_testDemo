Shader3D Start
{
    type:Shader3D,
    name:baseRender2D,
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:4,
    uniformMap:{
        
    },
    attributeMap: {
        a_position: Vector4,
        a_color: Vector4,
        a_uv: Vector2,
    },
    defines: {
        BASERENDER2D: { type: bool, default: true }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:baseRenderVS,
            FS:baseRenderPS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL baseRenderVS

    #define SHADER_NAME baseRender2D

    #include "Sprite2DVertex.glsl";

    void main() {
        vec4 pos;
        //先计算位置，再做裁剪
        getPosition(pos);
        vertexInfo info;
        getVertexInfo(info);

        v_texcoord = info.uv;
        v_color = info.color;

        #ifdef LIGHT_AND_SHADOW
            lightAndShadow(info);
        #endif

        gl_Position = pos;
    }

#endGLSL

#defineGLSL baseRenderPS
    #define SHADER_NAME baseRender2D
    #if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
    precision highp float;
    #else
    precision mediump float;
    #endif

    #include "Sprite2DFrag.glsl";

    void main()
    {
        clip();
        vec4 textureColor = texture2D(u_baseRender2DTexture, v_texcoord);

        #ifdef LIGHT_AND_SHADOW
            lightAndShadow(textureColor);
        #endif

        textureColor = transspaceColor(textureColor);
        setglColor(textureColor);
    }
    
#endGLSL
GLSL End