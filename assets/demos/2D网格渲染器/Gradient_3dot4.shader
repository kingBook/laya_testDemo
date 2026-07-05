Shader3D Start
{
    type:Shader3D,
    name:"2D网格渲染器/Gradient_3dot4",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:D2_BaseRenderNode2D,
    uniformMap:{
        u_gradientDirection: {type: Vector2, default:[1,1]},    // 渐变方向
        u_gradientStartColor: {type:Color, default:[1,1,1,1]},       // 渐变起始颜色
        u_gradientEndColor: {type:Color, default:[1,1,1,1]}        // 渐变结束颜色    
    },
    attributeMap: {
        a_position: ["Vector4", 0],
        a_color: ["Vector4", 1],
        a_uv: ["Vector2", 2],
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

    #define SHADER_NAME baseRenderVS

    #include "Sprite2DVertex.glsl";

    void main() {
        //先计算位置，再做裁剪
        vertexInfo info;
        getVertexInfo(info);

        v_texcoord = info.uv;
        v_color = info.color;

        #ifdef LIGHT2D_ENABLE
            lightAndShadow(info);
        #endif

        gl_Position = getPosition(info.pos);
    }

#endGLSL

#defineGLSL baseRenderPS
    #define SHADER_NAME baseRenderPS
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