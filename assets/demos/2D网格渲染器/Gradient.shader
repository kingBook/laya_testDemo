Shader3D Start
{
    type:Shader3D,
    name:"2D网格渲染器/Gradient",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:2,
    uniformMap:{
        u_gradientDirection: {type: Vector2, default:[1,1]},    // 渐变方向
        u_gradientStartColor: {type:Color, default:[1,1,1,1]},       // 渐变起始颜色
        u_gradientEndColor: {type:Color, default:[1,1,1,1]}        // 渐变结束颜色    
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

    #define SHADER_NAME Gradient

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
    #define SHADER_NAME Gradient
    #if defined(GL_FRAGMENT_PRECISION_HIGH) 
    precision highp float;
    #else
    precision mediump float;
    #endif

    #include "Sprite2DFrag.glsl";

    void main()
    {
        clip();
        vec4 textureColor = texture2D(u_baseRender2DTexture, v_texcoord);

        // 计算渐变因子
        float gradientFactor = dot(v_texcoord, normalize(u_gradientDirection)) * 0.5 + 0.5;

        // 混合渐变颜色
        vec4 gradientColor = mix(u_gradientStartColor, u_gradientEndColor, gradientFactor);
        textureColor *= gradientColor;

        #ifdef LIGHT_AND_SHADOW
            lightAndShadow(textureColor);
        #endif

        textureColor = transspaceColor(textureColor);
        setglColor(textureColor);
    }

#endGLSL
GLSL End