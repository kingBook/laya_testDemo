Shader3D Start
{
    type:Shader3D,
    name:"twoD/VertexWater",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        u_Magnitude: {type:Float, default:0.1},
        u_Frequency: {type:Float, default:1.0},
        u_InvWaveLength: {type:Float, default:0.5},
        u_Time: { type:Float, default: 0, tips: "时间"}
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

    #define SHADER_NAME VertexWater
    #include "Sprite2DVertex.glsl";
    #include "Math.glsl";

    void main() {
	    vertexInfo info;
	    getVertexInfo(info);

	    v_cliped = info.cliped;
	    v_texcoordAlpha = info.texcoordAlpha;
	    v_useTex = info.useTex;
	    v_color = info.color;

	    vec4 pos;
	    getPosition(pos);

        // wave offset
        float offset = sin(u_Frequency * u_Time + pos.x * u_InvWaveLength) * u_Magnitude;
        pos.y += offset;

	    gl_Position = pos;

    }

#endGLSL

#defineGLSL texturePS
    #define SHADER_NAME VertexWater
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
        vec4 color = getSpriteTextureColor();
        setglColor(color);
    }
    
#endGLSL
GLSL End


