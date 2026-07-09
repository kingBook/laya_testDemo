import { Mesh2dDrawLineCmd, Mesh2dDrawLinesCmd, Mesh2dGraphics } from "./chart/Mesh2dGraphics";

const { regClass, property } = Laya;

@regClass()
export class TestMesh2dGraphics extends Laya.Script {

    @property({ type: Mesh2dGraphics, private: false })
    private _meshGraphics: Mesh2dGraphics;

    onAwake(): void {
        // 直线
        // const drawLineCmd = new Mesh2dDrawLineCmd();
        // drawLineCmd.lineWidth = 40;
        // drawLineCmd.fromX = 0;
        // drawLineCmd.fromY = 0;
        // drawLineCmd.toX = 100;
        // drawLineCmd.toY = -100;
        // this._meshGraphics.addCmd(drawLineCmd);

        // 折线
        const drawLinesCmd = new Mesh2dDrawLinesCmd();
        drawLinesCmd.lineWidth = 40;
        drawLinesCmd.points = [
            0, 0,
            100, 50,
            200, 0,
            300, 100,
        ];
        this._meshGraphics.addCmd(drawLinesCmd);


    }

    private _distance = 0;

    onUpdate(): void {
        this._distance += 0.01;
        this._meshGraphics.sharedMaterial.setFloat("u_mixFactor", Laya.MathUtil.repeat(this._distance, 1));
    }

}