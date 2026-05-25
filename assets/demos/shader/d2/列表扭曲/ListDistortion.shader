Shader3D Start
{
    type:Shader3D,
    name:"列表扭曲/ListDistortion",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        u_Time: { type: Float, default: 0, tips: "时间，用于动画驱动" },
        u_Amplitude: { type: Float, default: 0.06, tips: "扭曲幅度" },
        u_Frequency: { type: Float, default: 10.0, tips: "扭曲频率" },
        u_Offset: { type: Float, default: 0.0, tips: "列表滚动偏移，用于同步滚动效果" },
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

    #define SHADER_NAME ListDistortion
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

	    // 列表扭曲：根据 Y 轴位置产生水平波动
	    float wave = sin((pos.y + u_Offset) * u_Frequency + u_Time) * u_Amplitude;
	    pos.x += wave;

	    gl_Position = pos;

    }

#endGLSL

#defineGLSL texturePS
    #define SHADER_NAME ListDistortion
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
        //color = vec4(1.0, 0.0, 0.0, 1.0);
        setglColor(color);
    }
    
#endGLSL
GLSL End


