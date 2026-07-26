Shader3D Start
{
    type:Shader3D,
    name:"ChartGradient3_4",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:D2_BaseRenderNode2D,
    uniformMap:{
        u_mixFactor: {type:Float, range:[0,1], default:0, tips:"AB两组颜色的过渡因子"},
        u_gradientDirection: {type:Vector2, default:[0,1], tips:"渐变方向"},
        u_startAlpha: {type:Float, range:[0,1], default:1, tips:"起始透明度"},
        u_endAlpha: {type:Float, range:[0,1], default:0, tips:"结束透明度"},

        // A组
        u_gradientStartColorA: {type:Color, default:[1,1,1,1], tips:"渐变起始颜色A"},
        u_gradientEndColorA: {type:Color, default:[1,1,1,1], tips:"渐变结束颜色A"},

        // B组
        u_gradientStartColorB: {type:Color, default:[1,1,1,1], tips:"渐变起始颜色B"},
        u_gradientEndColorB: {type:Color, default:[1,1,1,1], tips:"渐变结束颜色B"}
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
        
        // ------------------------------------------------------------------------------------
        // 计算渐变因子
        float gradientFactor = dot(v_texcoord, normalize(u_gradientDirection)) * 0.5 + 0.5;

        // 混合渐变颜色A
        vec4 gradientColorA = mix(u_gradientStartColorA, u_gradientEndColorA, gradientFactor);
        gradientColorA.a = mix(u_startAlpha, u_endAlpha, gradientFactor);

        // 混合渐变颜色B
        vec4 gradientColorB = mix(u_gradientStartColorB, u_gradientEndColorB, gradientFactor);
        gradientColorB.a =  mix(u_startAlpha, u_endAlpha, gradientFactor);
        
        textureColor *= gradientFactor >= (u_mixFactor * 0.5 + 0.5) ? gradientColorA : gradientColorB;
        // ------------------------------------------------------------------------------------

        #ifdef LIGHT_AND_SHADOW
            lightAndShadow(textureColor);
        #endif

        textureColor = transspaceColor(textureColor);
        setglColor(textureColor);
    }
    
#endGLSL
GLSL End