Shader3D Start
{
    type:Shader3D,
     name:"文本渐变色/LabelGradient_1",
    enableInstancing:true,
    supportReflectionProbe:true,
    shaderType:2,
    uniformMap:{
        u_topColor:    { type:Color, default:[1,1,1,1], tips:"颜色1"    },
        u_bottomColor: { type:Color, default:[0,1,0,1], tips:"颜色2"    },
        u_direction:   { type:Bool,  default: true, tips:"渐变方向" },
        u_colorOffset: { type:Float, default:0.5, range:[0,1], tips:"颜色偏移" }
    },
    attributeMap: {
        a_position : Vector4,
        a_attribColor : Vector4,
    },
    defines: {
        PRIMITIVEMESH: { type: bool, default: true }
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:primitiveVS,
            FS:primitivePS
        }
    ]
}
Shader3D End

GLSL Start
#defineGLSL primitiveVS

    #define SHADER_NAME Sprite2DPrimitiveShader
    #define PRIMITIVEMESH
    #include "Sprite2DVertex.glsl";


    #ifdef WORLDMAT
        uniform mat4 mmat;
    #endif

    void main(){
        vertexInfo info;
        getVertexInfo(info);
        
        //Update 
        v_color = info.color;
        v_cliped = info.cliped;
        
        vec4 pos;
        
        getPosition(pos);
        gl_Position = pos;
    }

#endGLSL

#defineGLSL primitivePS
    #define SHADER_NAME Sprite2DPrimitiveShader
    #define PRIMITIVEMESH
    precision mediump float;

    #include "Sprite2DFrag.glsl";

    void main(){
        clip();

        // vec4 src = getGlColor(v_color);

        // // 计算插值因子：垂直(0)使用 v_texcoordAlpha.y，水平(1)使用 v_texcoordAlpha.x
        // float t =0.5;// u_direction ? v_texcoord.y : (1.0 - v_texcoord.x);
        // t = clamp(t + u_colorOffset - 0.5, 0.0, 1.0);

        // vec4 grad = mix(u_bottomColor, u_topColor, t);

        // // 将文字的采样 alpha 作为遮罩，输出颜色由渐变色决定
        // vec3 outRgb = src.rgb * grad.rgb * v_color.rgb;
        // float outA = src.a * grad.a * v_color.a;

        // //setglColor(vec4(outRgb, outA));


        // gl_FragColor = vec4(outRgb, outA);


        gl_FragColor = getGlColor(v_color);
        gl_FragColor.rgb = vec3(1.0, 0.0, 0.0);
        gl_FragColor.rgb*=gl_FragColor.a;
    }
    
#endGLSL
GLSL End


