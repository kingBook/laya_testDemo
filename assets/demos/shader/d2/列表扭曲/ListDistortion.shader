Shader3D Start
{
    type:Shader3D,
    name:"列表扭曲/ListDistortion",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        u_Radius: { type: Float, default: 0.5, tips: "圆柱半径，控制扭曲强度" },
        u_Squeeze: { type: Float, default: 0.2, tips: "对称挤压系数（正值扩张，负值收缩）" },
        u_SqueezeRange: { type: Float, default: 1.0, tips: "挤压衰减范围（基于 angle，单位为弧度），越小衰减越集中" },
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
    #include "Math.glsl";

    varying float v_att;

    void main() {
	    vertexInfo info;
	    getVertexInfo(info);

	    v_cliped = info.cliped;
	    v_texcoordAlpha = info.texcoordAlpha;
	    v_useTex = info.useTex;
	    v_color = info.color;

	    vec4 pos;
	    getPosition(pos);

            float angle = atan(pos.y / u_Radius);
    
            float sinA = sin(angle);
            float cosA = cos(angle);

            // 计算挤压随距离的衰减系数：基于 angle 的绝对值平滑衰减
            // att = 1 当靠近中心 (angle -> 0)，att -> 0 当远离中心 (abs(angle) >= u_SqueezeRange)
            float att = 1.0 - smoothstep(0.0, 1.0, abs(angle));
            v_att = pos.y / u_Radius;

            // 对称挤压并随距离衰减：靠近中心挤压明显，远离中心逐渐减弱
            pos.x = pos.x * (1.0 + u_Squeeze * cosA * att); // 对称挤压
            pos.y = u_Radius * sinA;

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

    varying float v_att;

    void main()
    {
        clip();
        vec4 color = getSpriteTextureColor();
        //color = vec4(v_att, 0.0, 0.0, 1.0);
        setglColor(color);
    }
    
#endGLSL
GLSL End


