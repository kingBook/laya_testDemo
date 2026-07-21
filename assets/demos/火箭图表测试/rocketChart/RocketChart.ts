import AnimationCurve from "views/prefabs/animationCurve/AnimationCurve";
import { Mesh2dDrawLinesCmd, Mesh2dDrawPolygonCmd, Mesh2dGraphics } from "./Mesh2dGraphics";

const { regClass, property } = Laya;

/** 火箭图表 */
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

    @property({ type: AnimationCurve, inspector: AnimationCurve.name, tips: "第一阶段, 动画曲线" })
    public curve1: AnimationCurve = new AnimationCurve();
    @property({ type: Number, range: [1, 20], step: 1, fractionDigits: 0, tips: "第一阶段, 曲线图的x轴的增长速度" })
    public curve1SpeedX: number = 5;


    @property({ type: AnimationCurve, inspector: AnimationCurve.name, tips: "第二阶段, 动画曲线" })
    public curve2: AnimationCurve = new AnimationCurve();

    @property({
        type: [Number],
        nullable: false,
        fixedLength: 2,
        elementProps: { step: 0.01, fractionDigits: 2, range: [0, 1] },
        onChange: "onChangeRangeNormalMapY",
        tips: "定义曲线右上角Y轴的填充范围 (1:表示填满)"
    })
    public rangeNormalMapY: number[] = [0.75, 1.0];

    /** 时间标尺 sprite */
    private _timeRuler: Laya.Sprite;
    /** 倍数标尺 */
    private _multiplierRuler: Laya.Sprite;


    /** 跟随加速变化的曲线 */
    private _curve: AnimationCurve;
    /** 曲线图的x轴插值，区间：[0,1] */
    private _curveT: number;
    /** 加速时，曲线变化的插值1 */
    private _curveSpeedUpChangeT1: number;
    /** 加速时，曲线变化的插值2 */
    private _curveSpeedUpChangeT2: number;

    /** '画布高度百分比插值'，区间：[0,1] */
    private _canvasHeightPercentT: number;

    /** 时间<毫秒> */
    private _time: number;
    /** 倍数 */
    private _multiplier:number;


    private _lineGraphics: Mesh2dGraphics;
    private _triangleGraphics: Mesh2dGraphics;

    private _drawLinesCmd: Mesh2dDrawLinesCmd;
    private _drawTriangleCmd: Mesh2dDrawPolygonCmd;


    private _tempLinePoints: number[] = [];
    private _tempTrianglePoints: number[] = [];
    private _tempCtrlPts1: number[] = [];
    private _tempCtrlPts2: number[] = [];

    private readonly _mixFactorID = Laya.Shader3D.propertyNameToID("u_mixFactor");

    /** 时间<毫秒> */
    public get time():number { return this._time; }
    /** 倍数 */
    public get multiplier():number { return this._multiplier; }


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
        // 时间标尺
        this._timeRuler = new Laya.Sprite();
        this._timeRuler.pos(this._canvas.x, this._canvas.y + this._canvas.height);
        this.owner.addChild(this._timeRuler);

        // 倍数标尺
        this._multiplierRuler = new Laya.Sprite();
        this._multiplierRuler.pos(this._canvas.x, this._canvas.y + this._canvas.height);
        this.owner.addChild(this._multiplierRuler);

        // 线
        this._lineGraphics = this._line.getComponent(Mesh2dGraphics);
        this._drawLinesCmd = new Mesh2dDrawLinesCmd();
        this._lineGraphics.addCmd(this._drawLinesCmd);

        // 三角形
        this._triangleGraphics = this._triangle.getComponent(Mesh2dGraphics);
        this._drawTriangleCmd = new Mesh2dDrawPolygonCmd();
        this._triangleGraphics.addCmd(this._drawTriangleCmd);

        // 跟随加速变化的曲线
        this._curve = new AnimationCurve();
    }

    onEnable(): void {
        // 初始位置，左下角
        this._triangle.pos(0, this._canvas.height);
        this._line.pos(0, this._canvas.height);
        this._lineHead.pos(0, this._canvas.height);

        // 跟随加速变化的曲线 -> 曲线1
        this._curve.setTo(this.curve1);

        // 每次初始需要赋值的变量
        this._curveT = 0;
        this._curveSpeedUpChangeT1 = 0;
        this._curveSpeedUpChangeT2 = 0;
        this._canvasHeightPercentT = 0;
        this._time = 0;
        this._multiplier = 1;
    }

    onUpdate(): void {
        //console.time("draw");

        // 时间
        this._time += Laya.timer.delta;
        console.log("time", this._time/1000);
        

        // 阶段1
        const speedT = this.curve1SpeedX / 5000;
        this._curveT = Math.min(this._curveT + speedT, 1);

        // '画布高度百分比插值' 增长
        if (this._curveT >= 1) {
            const speedCT = this.curve1SpeedX / 1000;
            this._canvasHeightPercentT = Math.min(this._canvasHeightPercentT + speedCT, 1);
        }

        // 阶段2 加速
        if (this._canvasHeightPercentT >= 1) {
            // '图形颜色' 跟随加速变化
            const speedMF = this.curve1SpeedX / 500;
            let mixFactorVal = this._lineGraphics.sharedMaterial.getFloatByIndex(this._mixFactorID);
            mixFactorVal = Math.min(mixFactorVal + speedMF, 1);

            this._lineGraphics.sharedMaterial.setFloatByIndex(this._mixFactorID, mixFactorVal);
            this._triangleGraphics.sharedMaterial.setFloatByIndex(this._mixFactorID, mixFactorVal);

            // '曲线' 跟随加速变化
            const speedAC = this.curve1SpeedX / 10000;
            this._curveSpeedUpChangeT1 = Math.min(this._curveSpeedUpChangeT1 + speedAC, 1);
            if (this._curveSpeedUpChangeT1 >= 1) {
                this._curveSpeedUpChangeT2 = Math.min(this._curveSpeedUpChangeT2 + speedAC, 1);
            }
            this.curve1.toControlPointValues(this._tempCtrlPts1);
            this.curve2.toControlPointValues(this._tempCtrlPts2);
            const c1x = Laya.MathUtil.lerp(this._tempCtrlPts1[0], this._tempCtrlPts2[0], this._curveSpeedUpChangeT1);
            const c1y = Laya.MathUtil.lerp(this._tempCtrlPts1[1], this._tempCtrlPts2[1], this._curveSpeedUpChangeT1);
            const c2x = Laya.MathUtil.lerp(this._tempCtrlPts1[2], this._tempCtrlPts2[2], this._curveSpeedUpChangeT2);
            const c2y = Laya.MathUtil.lerp(this._tempCtrlPts1[3], this._tempCtrlPts2[3], this._curveSpeedUpChangeT2);
            this._curve.setTo(c1x, c1y, c2x, c2y);
            // this._curve.precision = 32;
        }

        // 画线 ---------------------------------------------------
        const canvasHeightPercent = Laya.MathUtil.lerp(this.rangeNormalMapY[0], this.rangeNormalMapY[1], this._canvasHeightPercentT); // 画布高度百分比

        const targetT = this._curveT; // 区间: [0,1]

        const segmentCount = this._canvasHeightPercentT >= 1 ? 100 : 20; // 线段数
        const step = targetT / segmentCount;
        let nx = 0, ny = 0, mx = 0, my = 0;

        this._tempLinePoints.length = 0;
        this._tempLinePoints.push(mx, my);

        while (true) {
            nx = Math.min(nx + step, targetT);
            ny = this._curve.getValue(nx);
            mx = this.mapX(nx);
            my = this.mapY(ny, canvasHeightPercent);
            this._tempLinePoints.push(mx, my);
            if (nx >= targetT) break;
        }

        this._drawLinesCmd.lineWidth = 5;
        this._drawLinesCmd.points = this._tempLinePoints;
        this._lineGraphics.clear();
        this._lineGraphics.repaint();

        // 线头 -------------------------------------------------
        const lastAx = this._tempLinePoints.at(-6);
        const lastAy = this._tempLinePoints.at(-5) + this._canvas.height;
        const lastBx = this._tempLinePoints.at(-2);
        const lastBy = this._tempLinePoints.at(-1) + this._canvas.height;
        this._lineHead.rotation = Laya.MathUtil.getRotation(lastAx, lastAy, lastBx, lastBy);
        this._lineHead.pos(lastBx, lastBy);

        // 画三角形 -------------------------------------------------
        this._tempTrianglePoints.length = 0;

        for (let i = 0, len = this._tempLinePoints.length / 2; i < len; i++) {
            const vx = this._tempLinePoints[i * 2];
            const vy = this._tempLinePoints[i * 2 + 1];

            if (i > 0) {
                const lastX = this._tempTrianglePoints.at(-2);
                const lastY = this._tempTrianglePoints.at(-1);
                const d = Math.pow(lastX - vx, 2) + Math.pow(lastY - vy, 2);

                if (d <= Number.EPSILON) continue; // 过滤掉距离太近的点，导致三角化出错

                this._tempTrianglePoints.push(vx, vy);
                continue;
            }

            this._tempTrianglePoints.push(vx, vy); // [0] 索引
        }
        this._tempTrianglePoints.push(mx, 0); // 右下角点

        this._drawTriangleCmd.points = this._tempTrianglePoints;
        this._triangleGraphics.clear();
        this._triangleGraphics.repaint();

        //console.timeEnd("draw");
    }

    onDisable(): void {
        // 清空绘制，并移除所有绘制命令
        this._lineGraphics.clear(true);
        this._triangleGraphics.clear(true);
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
     * @param percent [默认:1] 映射画布宽度的百分比，区间:[0,1]
     * @returns 
     */
    private mapX(nx: number, percent: number = 1): number {
        return (this._canvas.width * percent) * nx;
    }

    /**
     * 曲线图中的y，映射到画布
     * @param ny 曲线图中单位化的y
     * @param percent [默认:1] 映射画布高度的百分比，区间:[0,1]
     * @returns 
     */
    private mapY(ny: number, percent: number = 1): number {
        return -(this._canvas.height * percent) * ny;
    }



}