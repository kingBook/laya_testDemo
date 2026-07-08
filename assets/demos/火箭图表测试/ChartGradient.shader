Shader3D Start
{
    type:Shader3D,
    name:"ChartGradient",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:2,
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

    #define SHADER_NAME baseRenderVS

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