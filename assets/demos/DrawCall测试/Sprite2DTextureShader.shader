Shader3D Start
{
    type:Shader3D,
    name:"DrawCall测试/BatchableDepthSprite",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        
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

    #define SHADER_NAME BatchableDepthSprite
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
    #define SHADER_NAME BatchableDepthSprite
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

        // 关键：设置像素深度值，替代zOrder控制渲染顺序
        // gl_FragDepth范围是[0,1]，值越小越靠前（0最前，1最后）
        gl_FragDepth = 0.5;
    }
    
#endGLSL
GLSL End


