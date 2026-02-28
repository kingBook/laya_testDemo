// ============================================
// 世界坐标顶点变形Shader
// ============================================
// 用途：实现基于世界坐标的顶点动画效果
// 特性：径向波动 + 切向波动 + Y轴高度变化
// 适用：水波纹、扭曲变形、脉冲等动态效果

Shader3D Start
{
    type:Shader3D,
    name:"twoD/顶点/VertexBend",
    enableInstancing:true,  // 启用GPU实例化，性能优化
    supportReflectionProbe:true,
    shaderType:3,
    uniformMap:{
        // ========== 波动基础参数 ==========
        //u_Magnitude: {type:Float, default:0.1, tips: "Y轴波动幅度"},
        u_Frequency: {type:Float, default:1.0, tips: "波动频率，值越大波动越快"},
        u_InvWaveLength: {type:Float, default:0.5, tips: "波长倒数，值越大波纹越密集"},
        u_Time: { type:Float, default: 0, tips: "时间变量（通常由脚本更新）"},
        
        // ========== 世界坐标参数 ==========
        u_WorldPos: {type:Vector4, default:[0, 0, 0, 0], tips: "波动中心的世界坐标(x,y,z,w)"},
        u_Amplitude: {type:Float, default:0.05, tips: "径向和切向波动的总振幅"},
        //u_Speed: {type:Float, default:1.0, tips: "波动速度系数（预留参数，可扩展使用）"}
    },
    attributeMap: {
        // ========== 顶点属性 ==========
        a_posuv: Vector4,       // 位置和UV坐标
        a_attribColor: Vector4, // 顶点颜色
        a_attribFlags: Vector4, // 其他标志信息
    },
    defines: {
        TEXTUREVS: { type: bool, default: true }  // 纹理顶点着色器开关
    }
    shaderPass:[
        {
            pipeline:Forward,
            VS:textureVS,        // 顶点着色器
            FS:texturePS         // 片段着色器
        }
    ]
}
Shader3D End

GLSL Start
// ============================================
// 顶点着色器 - 处理顶点变形逻辑
// ============================================
#defineGLSL textureVS

    #define SHADER_NAME VertexBend
    #include "Sprite2DVertex.glsl";
    #include "Math.glsl";

    void main() {
	    // ========== 获取顶点基础信息 ==========
	    vertexInfo info;
	    getVertexInfo(info);

	    // 传递给片段着色器的信息
	    v_cliped = info.cliped;          // 裁剪状态
	    v_texcoordAlpha = info.texcoordAlpha;  // 纹理坐标和透明度
	    v_useTex = info.useTex;          // 是否使用纹理
	    v_color = info.color;            // 顶点颜色

	    vec4 pos;
	    getPosition(pos);

        // ========== 基于世界坐标的顶点变形算法 ==========
        
        // [步骤1] 计算相对世界坐标
        // 将顶点位置转换为相对于波动中心的世界坐标系统
        vec3 worldPos = vec3(pos.x + u_WorldPos.x, pos.y + u_WorldPos.y, 0.0);
        
        // [步骤2] 计算到波动中心的距离
        // 这个距离用于控制波纹的半径范围
        float distToCenter = length(worldPos.xy);
        
        // [步骤3] 计算径向波动效果
        // 原理：sin函数基于距离和时间创建周期性波纹
        // u_Time: 时间进度（外部脚本控制）
        // u_Frequency: 波动快速性（高频率 = 快速波动）
        // distToCenter * u_InvWaveLength: 波纹密度（波长越短波纹越密）
        // u_Amplitude: 波动幅度（最大偏移量）
        float radialWave = sin(u_Frequency * u_Time + distToCenter * u_InvWaveLength) * u_Amplitude;
        
        // [步骤4] 计算切向波动效果
        // 基于极坐标角度，与径向波动垂直，增加复杂的动画效果
        float angle = atan(worldPos.y, worldPos.x);
        // 使用 angle * 3.0 增加旋转波纹的数量
        float tangentialWave = sin(u_Frequency * u_Time + angle * 3.0) * u_Amplitude * 0.5;
        
        // [步骤5] 计算波动的方向向量
        // 从中心点向外指向该顶点的单位向量
        // 用于确定顶点沿着径向移动
        vec2 direction = normalize(worldPos.xy);
        
        // [步骤6] 应用径向和切向波动
        // 组合两种波动效果，创建复杂的扭曲变形
        float totalWave = radialWave + tangentialWave;
        pos.xy += direction * totalWave;

	    gl_Position = pos;
    }

#endGLSL

#defineGLSL texturePS
    #define SHADER_NAME VertexBend
    
    // ========== 精度设置 ==========
    // 条件编译：根据设备能力选择精度
    // 高端设备：使用高精度浮点数（highp）
    // 低端设备：使用中等精度浮点数（mediump）
    #if defined(GL_FRAGMENT_PRECISION_HIGH)
        precision highp float;  // 高精度：提高渲染质量
    #else
        precision mediump float; // 中等精度：性能与质量的平衡
    #endif

    #include "Sprite2DFrag.glsl";  // 引入2D精灵片段着色器库

    // ========== 片段着色器 - 处理像素颜色 ==========
    void main()
    {
        // 执行像素裁剪（处理透明/半透明像素）
        clip();
        
        // 从纹理获取颜色值
        vec4 color = getSpriteTextureColor();
        
        // 设置最终的片段颜色（乘以顶点颜色进行着色）
        setglColor(color);
    }
    
#endGLSL
GLSL End


