const { regClass, property } = Laya;

@regClass()
export class TestChartGradient extends Laya.Script {

    @property({ type: Laya.Mesh2DRender, private: false })
    private _mesh2dRender: Laya.Mesh2DRender;

    private _distance = 0;

    onUpdate(): void {
        this._distance += 0.01;
        this._mesh2dRender.sharedMaterial.setFloat("u_mixFactor", Laya.MathUtil.repeat(this._distance, 1));
    }

}