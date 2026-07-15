import { Mesh2dDrawLineCmd, Mesh2dDrawLinesCmd, Mesh2dGraphics, Mesh2dDrawPolygonCmd } from "./rocketChart/Mesh2dGraphics";

const { regClass, property } = Laya;

@regClass()
export class TestMesh2dGraphics extends Laya.Script {

    @property({ type: Mesh2dGraphics, private: false })
    private _meshGraphics0: Mesh2dGraphics;

    @property({ type: Mesh2dGraphics, private: false })
    private _meshGraphics1: Mesh2dGraphics;

    @property({ type: Mesh2dGraphics, private: false })
    private _meshGraphics2: Mesh2dGraphics;

    onAwake(): void {
        // 直线
        const drawLineCmd = new Mesh2dDrawLineCmd();
        drawLineCmd.lineWidth = 40;
        drawLineCmd.fromX = 0;
        drawLineCmd.fromY = 0;
        drawLineCmd.toX = 100;
        drawLineCmd.toY = -100;
        //this._meshGraphics0?.addCmd(drawLineCmd);

        // 折线
        const drawLinesCmd = new Mesh2dDrawLinesCmd();
        drawLinesCmd.lineWidth = 40;
        // drawLinesCmd.points = [
        //     0, 0,
        //     100, 50,
        //     200, 0,
        //     300, 100
        // ];
        drawLinesCmd.points = [
            0, 0,
            100, -100,
            200, -200
        ];
        this._meshGraphics1?.addCmd(drawLinesCmd);

        // 多边形
        const drawPolygonCmd = new Mesh2dDrawPolygonCmd();
        drawPolygonCmd.points = [
            0, 0,
            100, 0,
            100, 100,
            500, 600,
            100, 700,
            200, 500
        ];
        //this._meshGraphics2?.addCmd(drawPolygonCmd);
    }

    private _distance = 0;

    onUpdate(): void {
        this._distance += 0.01;
        this._meshGraphics0.sharedMaterial.setFloat("u_mixFactor", Laya.MathUtil.repeat(this._distance, 1));
        this._meshGraphics1.sharedMaterial.setFloat("u_mixFactor", Laya.MathUtil.repeat(this._distance, 1));
        this._meshGraphics2.sharedMaterial.setFloat("u_mixFactor", Laya.MathUtil.repeat(this._distance, 1));
    }

}