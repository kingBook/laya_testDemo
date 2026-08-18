import { ITEMLEVEL } from "globalCfg/GameCfg";
import ColorSetter from "./ColorSetter";
import { Mesh2dDrawLinesCmd, Mesh2dDrawPolygonCmd, Mesh2dGraphics } from "./Mesh2dGraphics";
import RangeColor from "./RangeColor";

const { regClass, property } = Laya;

/** 跳点数据结构 */
interface JumpPointData {
    /** 发射经过的时间<毫秒> */
    time: number;
    /** 倍数 */
    multiplier: number;
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

    @property({ type: Laya.UIComponent, private: false, tips: "画布" })
    private _canvas: Laya.UIComponent;
    @property({ type: Laya.UIComponent, private: false, tips: "图形盒" })
    private _shapeBox: Laya.UIComponent;
    @property({ type: Laya.Sprite, private: false, tips: "三角形" })
    private _triangle: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "线" })
    private _line: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "线头" })
    private _lineHead: Laya.Sprite;
    @property({ type: Laya.UIComponent, private: false, tips: "倍数盒" })
    private _multiplierBox: Laya.UIComponent;
    @property({ type: Laya.Label, private: false, tips: "当前倍数文本" })
    private _multiplierLabel?: Laya.Label;

    @property({ type: Number, private: false, catalog: "ColorTransition", min: 1, fractionDigits: 0, tips: "颜色过渡持续时间<毫秒>" })
    private _colorTransitionDuration = 1000;
    @property({ type: [RangeColor], catalog: "ColorTransition", nullable: false, fixedLength: 4, tips: "倍数范围的颜色配置数组" })
    public rangeColors: RangeColor[] = [
        {
            start: 1,
            end: 1,
            colorLevel: ITEMLEVEL.yellow,
            color: new Laya.Color().parse("#ffff27")
        },
        {
            start: 10,
            end: 9999,
            colorLevel: ITEMLEVEL.red,
            color: new Laya.Color().parse("#ff2d2d")
        },
        {
            start: 2,
            end: 9.99,
            colorLevel: ITEMLEVEL.purple,
            color: new Laya.Color().parse("#ff38ff")
        },
        {
            start: 1.01,
            end: 1.99,
            colorLevel: ITEMLEVEL.blue,
            color: new Laya.Color().parse("#2ffdfd")
        }
    ];


    @property({ type: Number, private: false, catalog: "Line", min: 5, fractionDigits: 0, tips: "线的段数" })
    private _lineSegmentCount: number = 25;
    @property({ type: Number, private: false, catalog: "Line", min: 1, fractionDigits: 0, tips: "线起点宽" })
    private _lineStartWidth: number = 1;
    @property({ type: Number, private: false, catalog: "Line", min: 1, fractionDigits: 0, tips: "线终点宽" })
    private _lineEndWidth: number = 10;
    @property({ type: Number, private: false, catalog: "Line", min: 1, fractionDigits: 0, tips: "以时间定义线头左下角的最小位置，单位：<毫秒>" })
    private _lineHeadMinTime: number = 200;
    @property({ type: Number, private: false, catalog: "Line", range: [0, 1], tips: "线条的起始透明度，范围:[0,1]" })
    private _lineAlphaMin: number = 1;
    @property({ type: Number, private: false, catalog: "Line", range: [0, 1], tips: "线条的结束透明度，范围:[0,1]" })
    private _lineAlphaMax: number = 0.4;

    @property({ type: Number, private: false, catalog: "Triangle", range: [0, 1], tips: "三角形的起始透明度，范围:[0,1]" })
    private _triangleAlphaMin: number = 0.3;
    @property({ type: Number, private: false, catalog: "Triangle", range: [0, 1], tips: "三角形的结束透明度，范围:[0,1]" })
    private _triangleAlphaMax: number = 0;


    @property({ type: Boolean, private: false, catalog: "Ruler", tips: "显示网格线" })
    private _showGrid: boolean = false;
    @property({ type: Laya.Color, private: false, catalog: "Ruler", tips: "网格线颜色" })
    private _gridColor: Laya.Color = new Laya.Color(0.4, 0.4, 0.4);
    @property({ type: Number, private: false, catalog: "Ruler", min: 1, fractionDigits: 0, tips: "网格线宽" })
    private _gridLineWidth: number = 1;

    @property({ type: Number, private: false, catalog: "Ruler", min: 0, fractionDigits: 0, tips: "标尺文字与画布的边距" })
    private _rulerLabelMargin: number = 10;
    @property({ type: Number, private: false, catalog: "Ruler", min: 1, fractionDigits: 0, tips: "标尺字体大小" })
    private _rulerFontSize: number = 18;
    @property({ type: Laya.Color, private: false, catalog: "Ruler", tips: "标尺字体颜色" })
    private _rulerFontColor: Laya.Color = new Laya.Color(0.9, 0.9, 0.9);



    /** 时间标尺 */
    private _timeRuler: Laya.Sprite;
    /** 倍数标尺 */
    private _multiplierRuler: Laya.Sprite;

    /** 初速度 */
    private _initSpeed: number;
    /** 加速度 */
    private _acceleration: number;

    /** 发射经过的时间<毫秒> */
    private _time: number;
    /** 倍数 */
    private _multiplier: number;

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

    private _colorSetter: ColorSetter = new ColorSetter();

    /** 时间标尺默认显示的时间长度<毫秒>，必须是10的次方 */
    private readonly _defaultDisplayTimeMs = 10000;
    /** 倍数标尺默认显示的倍数 */
    private readonly _defaultDisplayMultiplier = 2;
    /** 初始倍数 */
    private readonly _initMultiplier = 1;

    /** 颜色过渡处理器，格式：```(progress: number, current: RangeColor, next: RangeColor): void``` ，progress∈[0,1] */
    public set onColorTransitionHandler(value: Laya.Handler) {
        this._colorSetter.onTransitionHandler = value;
    }

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

        // 画布大小改变侦听
        this._canvas.on(Laya.Event.RESIZE, this, this.onCanvasResize);
    }

    onEnable(): void {
        // 把时间、倍数转换函数加入 window 对象，方便在控制台做测试
        if (Laya.LayaEnv.isPreview && window) {
            window["timeToMultiplier"] ??= RocketChart.timeToMultiplier;
            window["multiplierToTime"] ??= RocketChart.multiplierToTime;
        }
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
        this._multiplier = this._initMultiplier;
        this._multiplierLabel?.setVar('p', this._multiplier.toFixed(2));
        this._jumpPoints.length = 0;
        this._shapeBox.visible = false; // 图形盒
        this._multiplierBox.visible = false; // 倍数盒

        // 颜色设置器
        const args = {
            rocketChart: this,
            lineMaterial: this._lineGraphics.sharedMaterial,
            triangleMaterial: this._triangleGraphics.sharedMaterial,
            rangeColors: this.rangeColors
        };
        this._colorSetter.init(args.rocketChart, args.lineMaterial, args.triangleMaterial, args.rangeColors);
        this._colorSetter.transitionDuration = this._colorTransitionDuration;
        this._colorSetter.lineAlphaMin = this._lineAlphaMin;
        this._colorSetter.lineAlphaMax = this._lineAlphaMax;
        this._colorSetter.triangleAlphaMin = this._triangleAlphaMin;
        this._colorSetter.triangleAlphaMax = this._triangleAlphaMax;

        // 网格标尺绘制
        this.drawGridAndRulers(this._defaultDisplayTimeMs, this._defaultDisplayMultiplier - this._initMultiplier);
    }

    onUpdate(): void {
        if (!(this._flags & Flag.Inited)) return;
        if (this._flags & Flag.Boomed) return;

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

        // 把时间、倍数转换函数从 window 对象中移除
        if (Laya.LayaEnv.isPreview && window) {
            if (window["timeToMultiplier"] == RocketChart.timeToMultiplier) {
                window["timeToMultiplier"] = undefined;
            }
            if (window["multiplierToTime"] == RocketChart.multiplierToTime) {
                window["multiplierToTime"] = undefined;
            }
        }
    }

    onDestroy(): void {
        this._canvas.off(Laya.Event.RESIZE, this, this.onCanvasResize);
    }

    /**
     * 更新状态到指定的时间、倍数
     * @param time 发射经过的时间<毫秒>
     * @param multiplier [可选] 倍数
     */
    public updateStatusToTime(time: number, multiplier?: number): void {
        // console.time("draw");

        if (!this._shapeBox.visible) this._shapeBox.visible = true; // 图形盒
        if (!this._multiplierBox.visible) this._multiplierBox.visible = true; // 倍数盒

        // 修正时间、倍数保证对应(倍数优先)
        if (!isNaN(multiplier)) {
            const digits = (multiplier % 1 === 0) ? 0 : ((multiplier * 10) % 1 === 0) ? 1 : 2; // 纠正时判断的小数位（是整数则0）
            const tempMultiplier = this.toFixedNumber(RocketChart.timeToMultiplier(time, this._initSpeed, this._acceleration), digits);
            const curMultiplier = this.toFixedNumber(multiplier, digits);
            if (tempMultiplier != curMultiplier) {
                const tempTime = RocketChart.multiplierToTime(multiplier, this._initSpeed, this._acceleration);
                // console.log("testTime 纠正时间",
                //     "原时间", time,
                //     "原倍数", curMultiplier,
                //     "用原时间取的倍数", tempMultiplier,
                //     "纠正后时间", tempTime,
                //     "纠正后时间取的倍数", this.toFixedNumber(RocketChart.timeToMultiplier(tempTime, this._initSpeed, this._acceleration), 2);
                time = tempTime;
            }
        }

        // 时间
        this._time = time;

        // 倍数
        this._multiplier = RocketChart.timeToMultiplier(this._time, this._initSpeed, this._acceleration);
        this._multiplierLabel?.setVar('p', this._multiplier.toFixed(2));

        // 设置颜色
        this._colorSetter.updateStatusToTime(this._time, this._multiplier);

        // 线和三角形绘制 ----------------------------------------
        this.drawLineAndTriangle();

        // 网格标尺绘制 ----------------------------------------
        const displayTimeMs = this._time > this._defaultDisplayTimeMs ? this.ceilPowerOf10(this._time) : this._defaultDisplayTimeMs; // 时间标尺显示的时间长度<毫秒>，注意：必须是10的次方
        const displayMutiplier = this._multiplier > this._defaultDisplayMultiplier ? this.ceilPowerOf10(this._multiplier) : this._defaultDisplayMultiplier - this._initMultiplier;
        this.drawGridAndRulers(displayTimeMs, displayMutiplier);

        // 计算并展示跳点 --------------------------------------
        this.calcAndShowJumpPoint();

        // console.timeEnd("draw");
    }

    /** 开始发射 */
    public startLaunch(): void {
        if (!(this._flags & Flag.Inited)) throw new Error("未初始化，不能发射");
        if (this._flags & Flag.Boomed) throw new Error("火箭已经爆炸，需重新初始化，才能发射");
        if (this._flags & Flag.Launching) throw new Error("已经发射了，不能重复调用发射");

        this._flags |= Flag.Launching;
    }

    /**
     * 爆炸
     * @param time 发射经过的时间<毫秒>
     * @param multiplier 倍数
     */
    public boom(time: number, multiplier?: number): void {
        if (!(this._flags & Flag.Inited)) throw new Error("未初始化，不能调用爆炸");
        if (!(this._flags & Flag.Launching)) throw new Error("未开始发射，不能调用爆炸");
        if (this._flags & Flag.Boomed) throw new Error("已经爆炸了，不能重复调用爆炸");

        this._flags |= Flag.Boomed;
        this._flags &= ~Flag.Launching;

        // 1. 同步图形和倍数
        // this.updateStatusToTime(time, multiplier);

        // 2. 仅同步倍数, 图形不变
        this._time = time;
        this._multiplier = multiplier;
        this._multiplierLabel?.setVar('p', this._multiplier.toFixed(2));
    }

    /**
     * 添加跳点
     * * 火箭到达跳点指定的倍数时，才显示跳点对应的显示对象
     * * 如果在火箭到达跳点指定的倍数后添加跳点，则立即显示跳点对应的显示对象
     * @param multiplier 倍数<两位小数>
     * @param sprite 跳点需要展示的对象
     * @param isPlayer true:玩家跳点; false:其他用户跳点
     */
    public addJumpPoint(multiplier: number, sprite: Laya.Sprite, isPlayer: boolean): void {
        const time = RocketChart.multiplierToTime(multiplier, this._initSpeed, this._acceleration);

        this._jumpPoints.push({
            time: time,
            multiplier: multiplier,
            sprite: sprite,
            isPlayer: isPlayer
        });
    }

    /** 画布大小改变侦听函数 */
    private onCanvasResize(): void {
        // 初始位置，左下角
        this._triangle.pos(0, this._canvas.height);
        this._line.pos(0, this._canvas.height);
        this._lineHead.pos(0, this._canvas.height);
        this._multiplierRuler.pos(0, this._canvas.height);
        this._timeRuler.pos(0, this._canvas.height);
    }

    /**
     * 画线和三角形
     */
    private drawLineAndTriangle(): void {
        // 画线 ---------------------------------------------------
        const timeRulerMax = this.getTimeRulerMax();
        const multiplierRulerMax = this.getMultiplierRulerMax();

        const targetT = Laya.MathUtil.clamp01(this._time / timeRulerMax);
        const step = 1 / this._lineSegmentCount;
        let nx = 0, ny = 0, mx = 0, my = 0;

        this._tempLinePoints.length = 0;
        this._tempLinePoints.push(mx, my); // (0,0)点

        while (true) {
            nx = Math.min(nx + step, targetT);
            nx = (targetT - nx <= 0.001) ? targetT : nx; // 太靠近端点时，直接端点

            ny = (RocketChart.timeToMultiplier(timeRulerMax * nx, this._initSpeed, this._acceleration) - this._initMultiplier) / (multiplierRulerMax - this._initMultiplier);

            mx = this.mapX(nx);
            my = this.mapY(ny);

            this._tempLinePoints.push(mx, my);
            if (nx >= targetT) break;
        }

        this._drawLinesCmd.lineStartWidth = this._lineStartWidth;
        this._drawLinesCmd.lineEndWidth = this._lineEndWidth;
        this._drawLinesCmd.points = this._tempLinePoints;
        this._lineGraphics.clear();
        this._lineGraphics.repaint();


        // 线头 -------------------------------------------------
        // - 点a
        const anx = Math.max(0, this._time - this._lineHeadMinTime) / timeRulerMax;
        const any = (RocketChart.timeToMultiplier(timeRulerMax * anx, this._initSpeed, this._acceleration) - this._initMultiplier) / (multiplierRulerMax - this._initMultiplier);
        const ax = this.mapX(anx);
        const ay = this.mapY(any) + this._canvas.height;
        // - 点b
        const bnx = Math.max(this._time, this._lineHeadMinTime) / timeRulerMax;
        const bny = (RocketChart.timeToMultiplier(timeRulerMax * bnx, this._initSpeed, this._acceleration) - this._initMultiplier) / (multiplierRulerMax - this._initMultiplier);
        const bx = this.mapX(bnx);
        const by = this.mapY(bny) + this._canvas.height;

        this._lineHead.rotation = Laya.MathUtil.getRotation(ax, ay, bx, by);
        this._lineHead.pos(bx, by);

        // 画三角形 -------------------------------------------------
        this._tempTrianglePoints.length = 0;

        if (this._tempLinePoints.length === 4) {
            const x1 = this._tempLinePoints[0];
            const y1 = this._tempLinePoints[1];
            const x2 = this._tempLinePoints[2];
            const y2 = this._tempLinePoints[3];
            const lineLen = Math.hypot(x2 - x1, y2 - y1);
            if (lineLen < 1) return; // 线条只有两个点，且长度小于1像素，不画三角形
        }

        for (let i = 0, len = this._tempLinePoints.length / 2; i < len; i++) {
            const ix2 = i * 2;
            const vx = this._tempLinePoints[ix2];
            const vy = this._tempLinePoints[ix2 + 1];

            if (i > 0) {
                const lastX = this._tempTrianglePoints.at(-2);
                const lastY = this._tempTrianglePoints.at(-1);
                const dx = lastX - vx;
                const dy = lastY - vy;
                const d = dx * dx + dy * dy;

                if (d <= Number.EPSILON) continue; // 过滤掉距离太近的点，导致三角化出错
                if (Math.abs(dx) < 0.1) continue; // 过滤掉距离太近的点，导致三角化出错

                this._tempTrianglePoints.push(vx, vy);
                continue;
            }

            this._tempTrianglePoints.push(vx, vy); // [0] 索引
        }
        this._tempTrianglePoints.push(mx, 0); // 右下角点

        this._drawTriangleCmd.points = this._tempTrianglePoints;
        this._triangleGraphics.clear();
        this._triangleGraphics.repaint();
    }

    /**
     * 网格标尺绘制
     * @param displayTimeMs 时间标尺显示的时间长度<毫秒>，注意：必须是10的次方
     * @param displayMutiplier 需要减去{@link _initMultiplier}
     */
    private drawGridAndRulers(displayTimeMs: number, displayMutiplier: number): void {
        const fontSize = this._rulerFontSize; // 字体大小
        const margin = this._rulerLabelMargin; // '倍数'、'时间'与画布的边距

        // 时间标尺 ------------------------------
        const xCount = this._time > this._defaultDisplayTimeMs ? 10 : 5; // 格数
        const xScaleUnit = displayTimeMs / xCount; // 一格的单位<毫秒>
        const xScale = this._time > this._defaultDisplayTimeMs ? this._defaultDisplayTimeMs / this._time : 1; // 计算缩放
        const dx = (this._canvas.width * (displayTimeMs / this._defaultDisplayTimeMs)) / xCount; // 一格的距离

        this._timeRuler.graphics.clear();

        for (let i = 0; i <= xCount; i++) {
            const x = i * dx * xScale;
            if (x > this._canvas.width) continue; // 画布外不显示

            const value = i * xScaleUnit;
            const text = `${value / 1000}`;
            const y = margin;
            const font = `${fontSize}px Arial`;
            const color = this._rulerFontColor.getStyleString()
            const textAlign = "center";
            this._timeRuler.graphics.fillText(text, x, y, font, color, textAlign);

            // 网格线
            if (this._showGrid) {
                this._timeRuler.graphics.drawLine(x, 0, x, -this._canvas.height, this._gridColor.getStyleString(), this._gridLineWidth);
            }
        }

        // 倍数标尺 ------------------------------
        const yCount = this._multiplier > this._defaultDisplayMultiplier ? 10 : 5; // 格数
        const yScaleUnit = displayMutiplier / yCount; // 一格的单位<倍>
        const dy = (this._canvas.height * (displayMutiplier / (this._defaultDisplayMultiplier - this._initMultiplier))) / yCount; // 一格的距离
        const yScale = this._multiplier > this._defaultDisplayMultiplier ? (this._defaultDisplayMultiplier - this._initMultiplier) / (this._multiplier - this._initMultiplier) : 1; // 计算缩放

        this._multiplierRuler.graphics.clear();

        for (let i = 1; i <= yCount; i++) {
            const y = -i * dy * yScale;
            if (y < -this._canvas.height) continue; // 画布外不显示

            const value = this._initMultiplier + (i * yScaleUnit);

            const x = -margin;
            const text = `${yCount <= 5 ? value.toFixed(1) : value}x`;
            const font = `${fontSize}px Arial`;
            const color = this._rulerFontColor.getStyleString();
            const textAlign = "right";
            this._multiplierRuler.graphics.fillText(text, x, y - fontSize * 0.5, font, color, textAlign);

            // 网格线
            if (this._showGrid) {
                this._multiplierRuler.graphics.drawLine(0, y, this._canvas.width, y, this._gridColor.getStyleString(), this._gridLineWidth);
            }
        }
    }

    /** 计算并展示跳点 */
    private calcAndShowJumpPoint(): void {
        if (this._jumpPoints.length <= 0) return;

        let i = this._jumpPoints.length;
        while (--i >= 0) {
            const item = this._jumpPoints[i];
            if (!item.sprite) continue;
            if (this._multiplier < item.multiplier) continue; // 只处理到达倍数的跳点

            if (!item.sprite.parent) {
                this._line.parent.addChild(item.sprite);
            }

            const nx = this.getPrecentX(item.time);
            const ny = this.getPrecentY(item.multiplier);

            const x = this.mapX(nx);
            const y = this._canvas.height + this.mapY(ny);
            item.sprite.pos(x, y);

            // 其他用户跳点
            if (!item.isPlayer) {
                const toX = x - 100;
                const toY = y + 100;
                const duration = 1000;

                // 缓动
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
        return this._time > this._defaultDisplayTimeMs ? this._time : this._defaultDisplayTimeMs;
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
     * @param multiplier 倍数
     * @returns 
     */
    private getPrecentY(multiplier: number): number {
        return (multiplier - this._initMultiplier) / (this.getMultiplierRulerMax() - this._initMultiplier);
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
    public static timeToMultiplier(time: number, v0: number, a: number): number {
        const t = time / 1000; // 时间<秒>

        let result = 1 + v0 * t + 0.5 * a * t * t;
        return result;
    }

    /**
     * 倍数转时间
     * @param multiplier 倍数 （保留两位小数）
     * @param v0 初速度<倍/秒>
     * @param a 加速度<倍/秒>
     * @returns 发射经过的时间<毫秒>
     */
    public static multiplierToTime(multiplier: number, v0: number, a: number): number {
        // 0 = (1 - multiplier) + (v0 * t) + (0.5 * a * t * t);
        const aa = 0.5 * a;
        const bb = v0;
        const cc = 1 - multiplier;

        // 一元二次求根
        let result = (-bb + Math.sqrt(bb * bb - 4 * aa * cc)) / (2 * aa);
        result = Math.abs(result * 1000); // 转毫秒
        return result;
    }

    // /** 
    //  * 在指定时间点的导数
    //  * @param time 发射经过的时间<毫秒>
    //  * @param v0 初速度<倍/秒>
    //  * @param a 加速度<倍/秒>
    //  * @returns 
    //  */
    // public static timeToTangent(time: number, v0: number, a: number): number {
    //     const t = time / 1000; // 时间<秒>
    //     return v0 + a * t;
    // }

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

    /**
     * 直接截断多余的小数位保留小数
     * @param value 数字
     * @param digits 保留的小数位数<正整数>
     */
    private toFixedNumber(value: number, digits: number): number {
        const pow = 10 ** digits;
        return ((value * pow) | 0) / pow;
    }
    //#endregion

    // test
    // onKeyDown(evt: Laya.Event): void {
    //     if (!Laya.LayaEnv.isPreview) return;
    // }



}