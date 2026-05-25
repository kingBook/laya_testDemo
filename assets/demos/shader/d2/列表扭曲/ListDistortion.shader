Shader3D Start
{
    type:Shader3D,
    name:"列表扭曲/ListDistortion",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        u_Radius: { type: Float, default: 300.0, tips: "圆柱半径，控制扭曲强度" },
        u_Offset: { type: Float, default: 0.0, tips: "列表滚动偏移，用于同步圆柱旋转" },
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

	    // 水平圆柱扭曲：顶点围绕水平圆柱轴（X轴）旋转
	    // angle = 纵向距离 / 圆柱半径
	    float angle = (pos.y + u_Offset) / u_Radius;
        //float angle = (u_Offset) / u_Radius;
	    
	    // 在圆柱表面上，X坐标保持（沿圆柱轴），Y变为圆柱面的垂直位移
	    // 新的 Y = Radius * (1 - cos(angle))
	    // 新的 X = Radius * sin(angle)（如果需要水平挤压效果）
	    float cosA = cos(angle);
	    //float sinA = sin(angle);
	    
	    // 圆柱扭曲变换
	    //pos.x = pos.x + u_Radius * sinA * 0.3;  // 0.3用于调节水平挤压程度
	    pos.y = u_Radius * (1.0 - cosA);

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


