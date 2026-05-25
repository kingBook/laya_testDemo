// Label 文本渐变色 Shader
// * 注意：Label 必须缓存为位图才有效
Shader3D Start
{
    type:Shader3D,
    name:"文本渐变色/LabelGradient",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        u_topColor:    { type:Color, default:[1,1,1,1], tips:"颜色1"    },
        u_bottomColor: { type:Color, default:[0,1,0,1], tips:"颜色2"    },
        u_direction:   { type:Bool,  default: true, tips:"渐变方向" },
        u_colorOffset: { type:Float, default:0.5, range:[0,1], tips:"颜色偏移" }
    },
    attributeMap: {
        a_posuv: Vector4,
        a_attribColor: Vector4,
        a_attribFlags: Vector4,
    },
    defines: {
        TEXTUREVS: { type: bool, default: true }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:textureVS,
            FS:texturePS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL textureVS

    #define SHADER_NAME LabelGradient
    #include "Sprite2DVertex.glsl";

    void main() {
	    vertexInfo info;
	    getVertexInfo(info);

	    v_cliped = info.cliped;
	    v_texcoordAlpha = info.texcoordAlpha;
	    v_useTex = info.useTex;
	    v_color = info.color;

	    vec4 pos;
	    getPosition(pos);
	    gl_Position = pos;

    }

#endGLSL

#defineGLSL texturePS
    #define SHADER_NAME LabelGradient
    //texture和fillrect使用的。
    #if defined(GL_FRAGMENT_PRECISION_HIGH) // 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
        precision highp float;
    #else
        precision mediump float;
    #endif

    #include "Sprite2DFrag.glsl";

    void main()
    {
        clip();
        vec4 src = getSpriteTextureColor();

        // 计算插值因子：垂直(0)使用 v_texcoordAlpha.y，水平(1)使用 v_texcoordAlpha.x
        float t = u_direction ? v_texcoordAlpha.y : (1.0 - v_texcoordAlpha.x);
        t = clamp(t + u_colorOffset - 0.5, 0.0, 1.0);

        vec4 grad = mix(u_bottomColor, u_topColor, t);

        // 将文字的采样 alpha 作为遮罩，输出颜色由渐变色决定
        vec3 outRgb = src.rgb * grad.rgb * v_color.rgb;
        float outA = src.a * grad.a * v_color.a;

        setglColor(vec4(outRgb, outA));
    }
    
#endGLSL
GLSL End


