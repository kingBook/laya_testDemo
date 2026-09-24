Shader3D Start
{
    type:Shader3D,
    name:"列表扭曲/Distortion",
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

    #define SHADER_NAME Distortion
    #include "Sprite2DVertex.glsl";

    void getPosition2(inout vec4 glPosition){
        vec4 pos = vec4(a_posuv.xy,0.,1.);

        #ifdef WORLDMAT
            pos= u_mmat * pos;
            transedPos=pos;//vec4(pos.x,pos.y,0.0,1.0);
        #endif

        #ifdef CAMERA2D
            pos.xy = (u_view2D *vec3(pos.x,pos.y,1.0)).xy+u_size/2.;
        #endif  

        //clip
    	float clipw = length(u_clipMatDir.xy);
    	float cliph = length(u_clipMatDir.zw);
	    vec2 clpos = u_clipMatPos.xy;
        #ifdef WORLDMAT
            vec2 clippos = transedPos.xy - clpos;
        #else
        vec2 clippos = pos.xy- clpos;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
        #endif


        if(clipw>20000. && cliph>20000.)
            v_cliped = vec2(0.5,0.5);
        else {
            //转成0到1之间。/clipw/clipw 表示clippos与normalize之后的clip朝向点积之后，再除以clipw
            v_cliped = vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
        }
        
        // pos.x/u_size.x：把 x 从像素值归一化到 [0,1]
        // - 0.5：把范围从 [0,1] 移到 [-0.5,0.5]（以中心对齐）
        // * 2.0：放大到 [-1,1]
        vec4 pos1 = vec4((pos.x/u_size.x-0.5)*2.0,(0.5-pos.y/u_size.y)*2.0,0.,1.0);

        // 居中缩放Y -------------------------------------------------------------------------
        // // scaleY 左(小) -> 右(大)
        // // pos1.x 的范围 [-1,1]， 转换为 [0,1]
        // float t = (pos1.x + 1.0) * 0.5;
        // // min/max 垂直比例
        // float minScaleY = 1.0;
        // float maxScaleY = 0.5;
        // float scaleY = mix(minScaleY, maxScaleY, t);
        // pos1.y *= 0.5;

        // 居中缩放X -------------------------------------------------------------------------
        // scaleX 上(小) -> 下(大)
        // pos1.y 的范围 [-1,1]， 转换为 [0,1]
        float t = 1.0 - ((pos1.y + 1.0) * 0.5);
        // min/max 水平比例
        float minScaleX = 0.1;
        float maxScaleX = 1.0;
        float scaleX = mix(minScaleX, maxScaleX, t);
        pos1.x *= scaleX;
        // ------------------------------------------------------------------------------------
        
        #ifdef MVP3D
            glPosition = u_MvpMatrix * pos1;
        #else
            glPosition = pos1;
        #endif
        
        #ifdef INVERTY
            glPosition.y = -glPosition.y;
        #endif
    }

    void main() {
	    vertexInfo info;
	    getVertexInfo(info);

	    v_cliped = info.cliped;
	    v_texcoordAlpha = info.texcoordAlpha;
	    v_useTex = info.useTex;
	    v_color = info.color;

	    vec4 pos;
	    getPosition2(pos);
	    gl_Position = pos;

    }
#endGLSL

#defineGLSL texturePS
    #define SHADER_NAME Distortion
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


