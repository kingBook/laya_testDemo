import AnimationCurve from "views/prefabs/animationCurve/AnimationCurve";
import { Mesh2dDrawLinesCmd, Mesh2dDrawPolygonCmd, Mesh2dGraphics } from "./Mesh2dGraphics";

const { regClass, property } = Laya;

@regClass()
export class RocketChart extends Laya.Script {

    @property({ type: Laya.Box, private: false, tips: "画布" })
    private _canvas: Laya.Box;
    @property({ type: Laya.Sprite, private: false, tips: "三角形" })
    private _triangle: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "线" })
    private _line: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "线头" })
    private _lineHead: Laya.Sprite;

    @property({ type: AnimationCurve, inspector: AnimationCurve.name, private: false, tips: "动画曲线1" })
    public animCurve1: AnimationCurve = new AnimationCurve();
    @property({ type: AnimationCurve, inspector: AnimationCurve.name, private: false, tips: "动画曲线2" })
    public animCurve2: AnimationCurve = new AnimationCurve();

    @property({ 
        type: [Number], 
        nullable: false, 
        fixedLength: 2, 
        elementProps: { step: 0.01, fractionDigits: 2, range: [0, 1] }, 
        onChange: "onChangeRangeNormalMapY", 
        tips: "定义曲线右上角Y轴的填充范围 (1:表示填满)" 
    })
    public rangeNormalMapY: number[] = [0.7, 1.0];

    private _lineGraphics: Mesh2dGraphics;
    private _triangleGraphics: Mesh2dGraphics;

    private _tempLinePoints: number[] = [];
    private _tempTrianglePoints: number[] = [];

    //#region Editor
    /** 在编辑器中改变 {@link rangeNormalMapY} 属性时的回调 (仅用于编辑器) */
    private onChangeRangeNormalMapY(key?: string): void {
        if (!key) return;
        const i = parseInt(key);
        if (i <= 0) return;

        let current = this.rangeNormalMapY[i];

        // 限制大于上一个
        let prev = this.rangeNormalMapY[i - 1];
        current = Math.max(prev, current);
        this.rangeNormalMapY[i] = current;
    }
    //#endregion

    onAwake(): void {
        this._lineGraphics = this._line.getComponent(Mesh2dGraphics);
        this._triangleGraphics = this._triangle.getComponent(Mesh2dGraphics);
    }

    onEnable(): void {
        // 初始位置，左下角
        this._triangle.pos(0, this._canvas.height);
        this._line.pos(0, this._canvas.height);
        this._lineHead.pos(0, this._canvas.height);

        {
            // 画线 ---------------------------------------------------
            const targetT = 1.0; // 区间: [0,1]
            const segmentCount = 50;
            const step = targetT / segmentCount;
            let nx = 0, ny = 0, mx = 0, my = 0;

            this._tempLinePoints.length = 0;
            this._tempLinePoints.push(mx, my);

            while (true) {
                nx = Math.min(nx + step, targetT);
                ny = this.animCurve1.getValue(nx);
                mx = this.mapX(nx);
                my = this.mapY(ny);
                this._tempLinePoints.push(mx, my);
                if (nx >= targetT) break;
            }

            const drawLinesCmd = new Mesh2dDrawLinesCmd();
            drawLinesCmd.lineWidth = 5;
            drawLinesCmd.points = this._tempLinePoints;
            this._lineGraphics.addCmd(drawLinesCmd);

            // 画三角形 -------------------------------------------------
            this._tempTrianglePoints.length = 0;
            this._tempTrianglePoints = this._tempLinePoints.concat();
            this._tempTrianglePoints.push(this._canvas.width, 0);

            const drawPolygonCmd = new Mesh2dDrawPolygonCmd();
            drawPolygonCmd.points = this._tempTrianglePoints;
            this._triangleGraphics.addCmd(drawPolygonCmd);

        }
    }

    onUpdate(): void {

    }

    onDisable(): void {

    }


    /**
     * 设置值
     * @param multiple 倍数
     * @param height 高度
     */
    public setValue(multiple: number, height: number): void {

    }

    /**
     * 跳点
     * @param multiple 倍数
     */
    public jump(multiple: number): void {

    }

    /**
     * 曲线图中的x，映射到画布
     * @param nx 曲线图中单位化的x
     * @returns 
     */
    private mapX(nx: number): number {
        return this._canvas.width * nx;
    }

    /**
     * 曲线图中的y，映射到画布
     * @param ny 曲线图中单位化的y
     * @returns 
     */
    private mapY(ny: number): number {
        return -(this._canvas.height * ny);
    }



}