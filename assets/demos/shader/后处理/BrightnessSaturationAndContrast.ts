const { regClass, property } = Laya;

@regClass()
export class BrightnessSaturationAndContrast extends Laya.PostProcessEffect {

    @property({type:Laya.Material})
    public material:Laya.Material;

    /**
     * @zh 根据后期处理设置获取摄像机深度纹理模式标志。
     */
    public override getCameraDepthTextureModeFlag(): number {
        return 0;
    }

    /**
     * @zh 在添加到后期处理栈时调用。
     * @param postprocess 后期处理组件。
     */
    public override effectInit(postprocess: Laya.PostProcess): void {

    }

    /**
     * @zh 释放效果。
     * @param postprocess 后期处理组件。
     */
    public override release(postprocess: Laya.PostProcess): void {

    }

    /**
     * @zh 渲染效果。
     * @param context 后期处理渲染上下文。
     */
    public override render(context: Laya.PostProcessRenderContext): void {
        context.command.blitScreenQuadByMaterial(context.indirectTarget, context.destination, null/*new Laya.Vector4(0, 0, 1, 1)*/, this.material);
    }
}