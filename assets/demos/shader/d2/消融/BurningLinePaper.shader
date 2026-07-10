Shader3D Start
{
    type:Shader3D,
    name:"消融/BurningLinePaper",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        u_NoiseTex: { type: Texture2D, default: "white" },
        u_BurnAmount: { type: Float, default: 0.0 },
        u_EdgeWidth: { type: Float, default: 0.05 },
        u_EdgeColor1: { type: Color, default: [1.0, 0.6, 0.0, 1.0] },
        u_EdgeColor2: { type: Color, default: [1.0, 0.2, 0.0, 1.0] }
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

    #define SHADER_NAME BurningLinePaper
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
    #define SHADER_NAME BurningLinePaper
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
        vec4 texColor = getSpriteTextureColor();
        // ----------------------------------------------------------------
        vec2 uv;
        #ifdef FILLTEXTURE
            uv = fract(v_texcoordAlpha.xy) * u_TexRange.zw + u_TexRange.xy;
        #else
            uv = v_texcoordAlpha.xy;
        #endif

        //vec4 texColor = texture2D(v_useTex, v_uv);
        float noise = texture2D(u_NoiseTex, uv * 1.0).r;
        
        float burnLine = u_BurnAmount * 1.4 - 0.2 + (noise - 0.5) * 0.6;
        
        // 从下往上
        if (uv.y < burnLine) {
            discard;
        }

        float edgeFactor = smoothstep(burnLine, burnLine + u_EdgeWidth, uv.y);
        vec4 burnColor = mix(u_EdgeColor1, u_EdgeColor2, noise);
        vec4 finalColor = mix(burnColor, texColor, edgeFactor);
        finalColor.a = texColor.a;
        // ----------------------------------------------------------------
        setglColor(finalColor);
    }
    
#endGLSL
GLSL End


