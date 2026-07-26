import AnimationCurve from "views/prefabs/animationCurve/AnimationCurve";
import { Mesh2dDrawLinesCmd, Mesh2dDrawPolygonCmd, Mesh2dGraphics } from "./Mesh2dGraphics";
import { Point } from "./poly2tri/poly2tri";

const { regClass, property } = Laya;

/** 跳点数据结构 */
interface JumpPointData {
    /** 发射经过的时间<毫秒> */
    time: number;
    /** 倍数 */
    multipler: number;
    /** 要显示的对象 */
    sprite: Laya.Sprite;
    /** true:玩家跳点; false:其他用户跳点 */
    isPlayer: boolean;
}

enum Flag {
    /** 已初始化 */
    Inited = 1,
    /** 已发射启动... */
    Launching = 1 << 1,
    /** 已爆炸 */
    Boomed = 1 << 2
}

/** 火箭图表 */
@regClass()
export class RocketChart extends Laya.Script {

    @property({ type: Laya.Box, private: false, tips: "画布" })
    private _canvas: Laya.Box;
    @property({ type: Laya.Box, private: false, tips: "图形盒" })
    private _shapeBox: Laya.Box;
    @property({ type: Laya.Sprite, private: false, tips: "三角形" })
    private _triangle: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "线" })
    private _line: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "线头" })
    private _lineHead: Laya.Sprite;
    @property({ type: Laya.Box, private: false, tips: "倍数盒" })
    private _multiplierBox: Laya.Box;
    @property({ type: Laya.Label, private: false, tips: "当前倍数文本" })
    private _multiplierLabel?: Laya.Label;
    @property({ type: Boolean, tips: "显示网格线" })
    public showGrid: boolean = true;


    /** 时间标尺 */
    private _timeRuler: Laya.Sprite;
    /** 倍数标尺 */
    private _multiplierRuler: Laya.Sprite;

    /** 初速度 */
    private _initSpeed: number = 0.1;

    /** 加速度 */
    private _acceleration: number = 0.002;

    /** 发射经过的时间<毫秒> */
    private _time: number;
    /** 倍数 */
    private _multiplier: number;

    /** 到达两倍时的时间<毫秒> */
    private _timeOnTwoMultiplier: number;
    /** 跳点数组 */
    private _jumpPoints: JumpPointData[];

    /** 布尔集合 */
    private _flags: Flag;

    private _lineGraphics: Mesh2dGraphics;
    private _triangleGraphics: Mesh2dGraphics;

    private _drawLinesCmd: Mesh2dDrawLinesCmd;
    private _drawTriangleCmd: Mesh2dDrawPolygonCmd;

    private _tempLinePoints: number[] = [];
    private _tempTrianglePoints: number[] = [];

    private readonly _mixFactorID = Laya.Shader3D.propertyNameToID("u_mixFactor");
    private readonly _lineMinPos = new Point(0, 0);

    /** 时间标尺默认显示的时间长度<毫秒>，必须是10的次方 */
    private readonly _defaultDisplayTimeMs = 10000;
    /** 倍数标尺默认显示的倍数 */
    private readonly _defaultDisplayMultiplier = 2;
    /** 初始倍数 */
    private readonly _initMultiplier = 1;

    /** 已初始化 */
    public get isInited(): boolean { return (this._flags & Flag.Inited) > 0; }
    /** 已发射启动... */
    public get isLaunching(): boolean { return (this._flags & Flag.Launching) > 0; }
    /** 已爆炸 */
    public get isBoomd(): boolean { return (this._flags & Flag.Boomed) > 0; }

    /** 发射经过的时间<毫秒> */
    public get time(): number { return this._time; }
    /** 倍数 */
    public get multiplier(): number { return this._multiplier; }
    /** 初速度 */
    public get initSpeed(): number { return this._initSpeed; }
    /** 加速度 */
    public get acceleration(): number { return this._acceleration; }



    onAwake(): void {
        this._jumpPoints = [];

        // 时间标尺
        this._timeRuler = new Laya.Sprite();
        this._canvas.addChildAt(this._timeRuler, 0);

        // 倍数标尺
        this._multiplierRuler = new Laya.Sprite();
        this._canvas.addChildAt(this._multiplierRuler, 0);

        // 线
        this._lineGraphics = this._line.getComponent(Mesh2dGraphics);
        this._drawLinesCmd = new Mesh2dDrawLinesCmd();
        this._lineGraphics.addCmd(this._drawLinesCmd);

        // 三角形
        this._triangleGraphics = this._triangle.getComponent(Mesh2dGraphics);
        this._drawTriangleCmd = new Mesh2dDrawPolygonCmd();
        this._triangleGraphics.addCmd(this._drawTriangleCmd);

    }

    onEnable(): void {
        // 初始位置，左下角
        this._triangle.pos(0, this._canvas.height);
        this._line.pos(0, this._canvas.height);
        this._lineHead.pos(this._lineMinPos.x, this._canvas.height - this._lineMinPos.y);
        this._multiplierRuler.pos(0, this._canvas.height);
        this._timeRuler.pos(0, this._canvas.height);
    }

    /**
     * 初始化（需在 onEnable() 之后调用这个方法）
     * @param initSpeed 初速度
     * @param acceleration 加速度
     */
    public init(initSpeed: number, acceleration: number): void {
        this.dispose();

        this._flags = Flag.Inited;
        this._initSpeed = initSpeed;
        this._acceleration = acceleration;
        this._time = 0;
        this._multiplier = 1;
        this._multiplierLabel?.setVar('p', this._multiplier.toFixed(2));
        this._timeOnTwoMultiplier = this.multiplierToTime(2, initSpeed, acceleration);
        this._jumpPoints.length = 0;
        this._shapeBox.visible = false; // 图形盒
        this._multiplierBox.visible = false; // 倍数盒

        // 网格标尺绘制
        this.drawGridAndRulers(this._defaultDisplayTimeMs, this._defaultDisplayMultiplier);
    }

    onUpdate(): void {
        if (!(this._flags & Flag.Inited)) return;

        if (this._flags & Flag.Launching) {
            // 更新状态到指定的时间
            this.updateStatusToTime(this._time + Laya.timer.delta);
        }
    }

    onDisable(): void {
        this.dispose();

        // 清空绘制，并移除所有绘制命令
        this._lineGraphics.clear(true);
        this._triangleGraphics.clear(true);
    }

    /**
     * 更新状态到指定的时间
     * @param time 发射经过的时间<毫秒>
     */
    public updateStatusToTime(time: number): void {
        // console.time("draw");

        if (!this._shapeBox.visible) this._shapeBox.visible = true; // 图形盒
        if (!this._multiplierBox.visible) this._multiplierBox.visible = true; // 倍数盒

        // 时间
        this._time = time;

        // 倍数
        this._multiplier = this.timeToMultiplier(this._time, this._initSpeed, this._acceleration);
        this._multiplierLabel?.setVar('p', this._multiplier.toFixed(2));

        // 2.00x 变色
        if (this._time > this._timeOnTwoMultiplier) {
            const speedMF = 0.015;
            let mixFactorVal = this._lineGraphics.sharedMaterial.getFloatByIndex(this._mixFactorID);
            mixFactorVal = Math.min(mixFactorVal + speedMF, 1);

            this._lineGraphics.sharedMaterial.setFloatByIndex(this._mixFactorID, mixFactorVal);
            this._triangleGraphics.sharedMaterial.setFloatByIndex(this._mixFactorID, mixFactorVal);
        }


        // 画线 ---------------------------------------------------
        const timeRulerMax = this.getTimeRulerMax();
        const multiplierRulerMax = this.getMultiplierRulerMax();

        const targetT = Laya.MathUtil.clamp01(this._time / timeRulerMax);
        const segmentCount = 25;
        const step = 1 / segmentCount;
        let nx = 0, ny = 0, mx = 0, my = 0;

        this._tempLinePoints.length = 0;
        this._tempLinePoints.push(mx, my); // (0,0)点

        while (true) {
            nx = Math.min(nx + step, targetT);
            ny = (this.timeToMultiplier(timeRulerMax * nx, this._initSpeed, this._acceleration) - this._initMultiplier) / (multiplierRulerMax - this._initMultiplier);

            mx = this.mapX(nx);
            my = this.mapY(ny);

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
        this._lineHead.pos(Math.max(lastBx, this._lineMinPos.x), Math.min(lastBy, this._canvas.height - this._lineMinPos.y));


        // 画三角形 -------------------------------------------------
        this._tempTrianglePoints.length = 0;

        for (let i = 0, len = this._tempLinePoints.length / 2; i < len; i++) {
            const vx = this._tempLinePoints[i * 2];
            const vy = this._tempLinePoints[i * 2 + 1];

            if (i > 0) {
                const lastX = this._tempTrianglePoints.at(-2);
                const lastY = this._tempTrianglePoints.at(-1);
                const d = Math.pow(lastX - vx, 2) + Math.pow(lastY - vy, 2);
                const dx = Math.abs(lastX - vx)

                if (d <= Number.EPSILON) continue; // 过滤掉距离太近的点，导致三角化出错
                if (dx < 0.1) continue; // 过滤掉距离太近的点，导致三角化出错

                this._tempTrianglePoints.push(vx, vy);
                continue;
            }

            this._tempTrianglePoints.push(vx, vy); // [0] 索引
        }
        this._tempTrianglePoints.push(mx, 0); // 右下角点

        this._drawTriangleCmd.points = this._tempTrianglePoints;
        this._triangleGraphics.clear();
        this._triangleGraphics.repaint();

        // 网格标尺绘制 ----------------------------------------
        const displayTimeMs = this._time > this._defaultDisplayTimeMs ? this.ceilPowerOf10(this._time) : this._defaultDisplayTimeMs; // 时间标尺显示的时间长度<毫秒>，注意：必须是10的次方
        const displayMutiplier = this._multiplier > this._defaultDisplayMultiplier ? this.ceilPowerOf10(this._multiplier) : this._defaultDisplayMultiplier - this._initMultiplier;

        this.drawGridAndRulers(displayTimeMs, displayMutiplier);

        // 计算并展示跳点 --------------------------------------
        this.calcAndShowPlayerJumpPoint();

        // console.timeEnd("draw");
    }

    /** 开始发射 */
    public startLaunch(): void {
        if (!(this._flags & Flag.Inited)) return;
        if (this._flags & Flag.Launching) return;

        this._flags |= Flag.Launching;
    }

    /**
     * 爆炸
     * @param multipler 倍数
     * @param time 发射经过的时间<毫秒>
     */
    public boom(multipler: number, time: number): void {
        if (!(this._flags & Flag.Inited)) return;
        if (this._flags & Flag.Boomed) return;
        this._flags |= Flag.Boomed;

    }

    /**
     * 添加玩家的跳点
     * @param multipler 倍数<两位小数>
     * @param sprite 跳点需要展示的对象
     * @param isPlayer true:玩家跳点; false:其他用户跳点
     */
    public addJumpPoint(multipler: number, sprite: Laya.Sprite, isPlayer: boolean): void {
        const time = this.multiplierToTime(multipler, this._initSpeed, this._acceleration);
        // console.log("addJumpPoint", time, multipler);

        this._jumpPoints.push({
            time: time,
            multipler: multipler,
            sprite: sprite,
            isPlayer: isPlayer
        });
    }

    /**
     * 网格标尺绘制
     * @param displayTimeMs 时间标尺显示的时间长度<毫秒>，注意：必须是10的次方
     * @param displayMutiplier
     */
    private drawGridAndRulers(displayTimeMs: number, displayMutiplier: number): void {
        const fontSize = 18; // 字体大小
        const space = 10; // '倍数'、'时间'与画布的间距

        // 时间标尺 ------------------------------
        const xCount = this._time > this._defaultDisplayTimeMs ? 10 : 5; // 格数
        const xScaleUnit = displayTimeMs / xCount; // 一格的单位<毫秒>
        const xScale = this._time > this._defaultDisplayTimeMs ? this._defaultDisplayTimeMs / this._time : 1; // 计算缩放
        const dx = (this._canvas.width * (displayTimeMs / this._defaultDisplayTimeMs)) / xCount; // 一格距离

        this._timeRuler.graphics.clear();

        for (let i = 0; i <= xCount; i++) {
            const x = i * dx * xScale;
            if (x > this._canvas.width) continue; // 画布外不显示

            const value = i * xScaleUnit;
            const text = `${value / 1000}`;
            const y = space;
            const font = `${fontSize}px Arial`;
            const color = "#e6e6e6";
            const textAlign = "center";
            this._timeRuler.graphics.fillText(text, x, y, font, color, textAlign);

            // 网格线
            if (this.showGrid) {
                this._timeRuler.graphics.drawLine(x, 0, x, -this._canvas.height, "#686868", 1);
            }
        }

        // 倍数标尺 ------------------------------
        const yCount = this._multiplier > this._defaultDisplayMultiplier ? 10 : 5; // 格数
        const yScaleUnit = displayMutiplier / yCount; // 一格的单位<倍>
        const dy = (this._canvas.height * (displayMutiplier / (this._defaultDisplayMultiplier - this._initMultiplier))) / yCount; // 一格距离
        // console.log(displayMutiplier, yCount, yScaleUnit);

        const yScale = this._multiplier > this._defaultDisplayMultiplier ? (this._defaultDisplayMultiplier - this._initMultiplier) / (this._multiplier - this._initMultiplier) : 1; // 计算缩放

        this._multiplierRuler.graphics.clear();

        for (let i = 1; i <= yCount; i++) {
            const y = -i * dy * yScale;
            if (y < -this._canvas.height) continue; // 画布外不显示

            const value = this._initMultiplier + (i * yScaleUnit);

            const x = -space;
            const text = `${yCount <= 5 ? value.toFixed(1) : value}x`;
            const font = `${fontSize}px Arial`;
            const color = "#e6e6e6";
            const textAlign = "right";
            this._multiplierRuler.graphics.fillText(text, x, y - fontSize * 0.5, font, color, textAlign);

            // 网格线
            if (this.showGrid) {
                this._multiplierRuler.graphics.drawLine(0, y, this._canvas.width, y, "#686868", 1);
            }
        }
    }

    /** 计算并展示跳点 */
    private calcAndShowPlayerJumpPoint(): void {
        if (this._jumpPoints.length <= 0) return;

        let i = this._jumpPoints.length;
        while (--i >= 0) {
            const item = this._jumpPoints[i];
            if (!item.sprite) continue;
            if (this._multiplier < item.multipler) continue; // 只处理到达倍数的跳点

            if (!item.sprite.parent) {
                this._line.parent.addChild(item.sprite);
            }

            const nx = this.getPrecentX(item.time);
            const ny = this.getPrecentY(item.multipler);

            const x = this.mapX(nx);
            const y = this._canvas.height + this.mapY(ny);
            item.sprite.pos(x, y);

            // 其他用户跳点
            if (!item.isPlayer) {
                const toX = x - 100;
                const toY = y + 100;
                const duration = 1000;

                Laya.Tween.create(item.sprite)
                    .to('x', toX)
                    .to('y', toY)
                    .to("alpha", 0.2)
                    .duration(duration)
                    .then(_ => {
                        item.sprite?.destroy();
                    });

                this._jumpPoints.splice(i, 1); // 删除跳点元素 
            }
        }
    }

    private dispose(): void {
        // 清空绘制
        this._lineGraphics.clear(false);
        this._triangleGraphics.clear(false);
        this._timeRuler.graphics.clear();
        this._multiplierRuler.graphics.clear();

        // 清空跳点
        this._jumpPoints.forEach(item => {
            item.sprite?.destroy();
        });
        this._jumpPoints.length = 0;
    }



    //#region Util
    /** 获取时间标尺当前显示的最大值 */
    private getTimeRulerMax(): number {
        return this._time > this._defaultDisplayTimeMs ? this.time : this._defaultDisplayTimeMs;
    }

    /** 获取倍数标尺当前显示的最大值 */
    private getMultiplierRulerMax(): number {
        return this._multiplier > this._defaultDisplayMultiplier ? this._multiplier : this._defaultDisplayMultiplier;
    }

    /**
     * 获取指定时间所占时间标尺的比率
     * @param time 发射经过的时间
     * @returns 
     */
    private getPrecentX(time: number): number {
        return time / this.getTimeRulerMax();
    }

    /**
     * 获取指定倍数所占倍数标尺的比率
     * @param multipler 倍数
     * @returns 
     */
    private getPrecentY(multipler: number): number {
        return (multipler - this._initMultiplier) / (this.getMultiplierRulerMax() - this._initMultiplier);
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

    /** 
     * 时间转倍数
     * @param time 发射经过的时间<毫秒>
     * @param v0 初速度<倍/秒>
     * @param a 加速度<倍/秒>
     * @returns 倍数
     */
    private timeToMultiplier(time: number, v0: number, a: number): number {
        const t = time / 1000; // 时间<秒>

        let result = 1 + v0 * t + 0.5 * a * t * t;
        // result = ((result * 100) | 0) / 100; // 保留两位小数
        // console.log(result);
        return result;
    }

    /**
     * 倍数转时间
     * @param multiplier 倍数 （保留两位小数）
     * @param v0 初速度<倍/秒>
     * @param a 加速度<倍/秒>
     * @returns 发射经过的时间<毫秒>
     */
    private multiplierToTime(multiplier: number, v0: number, a: number): number {
        // 0 = (1 - multiplier) + (v0 * t) + (0.5 * a * t * t);
        const aa = 0.5 * a;
        const bb = v0;
        const cc = 1 - multiplier;

        // 一元二次求根
        let result = (-bb + Math.sqrt(bb * bb - 4 * aa * cc)) / (2 * aa);
        result = Math.abs(result * 1000); // 转毫秒
        return result;
    }

    /**
     * 求大于或等于指定数的最小10次方数
     * * 注意：最小返回 10
     * @param x 正整数
     * @returns 10次方数<正整数>
     */
    private ceilPowerOf10(x: number): number {
        if (x <= 1) return 10;
        const exp = Math.ceil(Math.log10(x));
        return 10 ** exp;
    }
    //#endregion

    onKeyDown(evt: Laya.Event): void {
        //const multipler = 1.2;
        //console.log("timeToMultiplier", this.timeToMultiplier(23928, this._initSpeed, this._acceleration));
        //console.log("multiplierToTime", this.multiplierToTime(multipler, this._initSpeed, this._acceleration));
    }



}