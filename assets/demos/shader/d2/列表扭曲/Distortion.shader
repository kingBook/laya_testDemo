Shader3D Start
{
    type:Shader3D,
    name:"列表扭曲/Distortion",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:D2_TextureSV,
    uniformMap:{
        // ------------------------------------------------------
        u_center: { type: Vector2, default: [0, 0], tips: "缩放中小（全局）" }
        u_viewSize: {type: Vector2, default: [100, 100], tips: "可视区大小（全局）"}
        // ------------------------------------------------------
    },
    attributeMap: {
        a_posuv: ["Vector4", 0],
        a_attribColor: ["Vector4", 1],
        a_attribFlags: ["Vector4", 2],
        a_customs: ["Vector4", 3],
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

    #define SHADER_NAME textureVS
    #include "Sprite2DVertex.glsl";

    void main() {
	    vertexInfo info;
	    getVertexInfo(info);

	    // v_cliped = info.cliped;
	    v_texcoordAlpha = info.texcoordAlpha;
	    v_useTex = info.useTex;
        v_useClip = info.useClip;
        v_customs = info.customs;
	    v_color = info.color;

        // -------------------------------------------------------
        vec2 localPos = info.pos - u_center;

        float t = 1.0-abs(localPos.y)/(u_viewSize.y*0.5);
        t = clamp(t, 0., 1.);

        float minScaleX = 0.5;
        float maxScaleX = 1.1;
        float scaleX = mix(minScaleX, maxScaleX, t);
        localPos.x *= scaleX;

        info.pos = localPos + u_center;
        // -------------------------------------------------------

        gl_Position = getPosition(info.pos);

    }

#endGLSL

#defineGLSL texturePS
    #define SHADER_NAME texturePS
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
       // color=vec4(1.0,1.0,1.0,1.0);
        setglColor(color);
    }
    
#endGLSL
GLSL End


