import { Mesh2dDrawLineCmd, Mesh2dDrawLinesCmd, Mesh2dGraphics } from "./chart/Mesh2dGraphics";

const { regClass, property } = Laya;

@regClass()
export class TestMesh2dGraphics extends Laya.Script {

    @property({ type: Mesh2dGraphics, private: false, tips: "" })
    private _meshGraphics: Mesh2dGraphics;

    onAwake(): void {
        // // 直线
        // const drawLineCmd = new Mesh2dDrawLineCmd();
        // drawLineCmd.lineWidth = 10;
        // drawLineCmd.fromX = 0;
        // drawLineCmd.fromY = 0;
        // drawLineCmd.toX = 100;
        // drawLineCmd.toY = 100;
        // this._meshGraphics.addCmd(drawLineCmd);

        // 折线
        const drawLinesCmd = new Mesh2dDrawLinesCmd();
        drawLinesCmd.lineWidth = 10;
        drawLinesCmd.points = [
            0, 0,
            100, 50,
            200, 0
        ];
        this._meshGraphics.addCmd(drawLinesCmd);


    }

}