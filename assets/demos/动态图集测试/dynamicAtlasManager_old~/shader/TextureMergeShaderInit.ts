import TexMergeVS from "./TexMerge.vs";
import TexMergeFS from "./TexMerge.fs";
// import { ShaderData, ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
// import { LayaGL } from "../../layagl/LayaGL";
// import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
// import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
// import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
// import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
// import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";


export class TextureMergeShaderInit {

    /** @internal */
    static _sdNotChange: Laya.ShaderData; //着色器数据（颜色空间不变
    /** @internal */
    static _sdGammaToLinear: Laya.ShaderData; //着色器数据（伽马转线性）
    /** @internal */
    static _sdLinearToGamma: Laya.ShaderData; //着色器数据（线性转伽马）
    
        
    private static LINEAR_TO_GAMMA: Laya.ShaderDefine;
    
    private static GAMMA_TO_LINEAR: Laya.ShaderDefine;

    static init() {
        const attributeMap: { [name: string]: [number, Laya.ShaderDataType] } = {
            "a_PositionTexcoord": [Laya.VertexMesh.MESH_POSITION0, Laya.ShaderDataType.Vector4]
        };

        const uniformMap = {
            "u_MainTex": Laya.ShaderDataType.Texture2D,
            "u_OffsetScale": Laya.ShaderDataType.Vector4,
        };

        this.LINEAR_TO_GAMMA = Laya.Shader3D.getDefineByName("LINEAR_TO_GAMMA");
        this.GAMMA_TO_LINEAR = Laya.Shader3D.getDefineByName("GAMMA_TO_LINEAR");

        this._sdNotChange = Laya.LayaGL.renderDeviceFactory.createShaderData(null);
        this._sdGammaToLinear = Laya.LayaGL.renderDeviceFactory.createShaderData(null);
        this._sdGammaToLinear.addDefine(this.GAMMA_TO_LINEAR);
        this._sdLinearToGamma = Laya.LayaGL.renderDeviceFactory.createShaderData(null);
        this._sdLinearToGamma.addDefine(this.LINEAR_TO_GAMMA);

        const shader = Laya.Shader3D.add("TexMerge");
        const subShader = new Laya.SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        const blitPass = subShader.addShaderPass(TexMergeVS, TexMergeFS);
        const blitState = blitPass.renderState;
        blitState.depthTest = Laya.RenderState.DEPTHTEST_ALWAYS;
        blitState.depthWrite = false;
        blitState.cull = Laya.RenderState.CULL_NONE;
        blitState.blend = Laya.RenderState.BLEND_DISABLE;
    }
}