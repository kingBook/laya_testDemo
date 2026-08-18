import RangeColor from "./RangeColor";
import { RocketChart } from "./RocketChart";

/** 图表颜色设置器 */
export default class ColorSetter {

    private _rocketChart: RocketChart;
    private _lineMaterial: Laya.Material;
    private _triangleMaterial: Laya.Material;

    private _sequence: RangeColor[];
    private _index: number;
    private _shaderMixFactor: number;
    private _colorStartTime: number;
    private _colorFinishTime: number;

    private readonly _lineGradientA_start = new Laya.Color();
    private readonly _lineGradientA_end = new Laya.Color();
    private readonly _lineGradientB_start = new Laya.Color();
    private readonly _lineGradientB_end = new Laya.Color();
    private readonly _triangleGradientA_start = new Laya.Color();
    private readonly _triangleGradientA_end = new Laya.Color();
    private readonly _triangleGradientB_start = new Laya.Color();
    private readonly _triangleGradientB_end = new Laya.Color();

    private readonly _mixFactorID = Laya.Shader3D.propertyNameToID("u_mixFactor");
    private readonly _gradientStartColorA_ID = Laya.Shader3D.propertyNameToID("u_gradientStartColorA");
    private readonly _gradientEndColorA_ID = Laya.Shader3D.propertyNameToID("u_gradientEndColorA");
    private readonly _gradientStartColorB_ID = Laya.Shader3D.propertyNameToID("u_gradientStartColorB");
    private readonly _gradientEndColorB_ID = Laya.Shader3D.propertyNameToID("u_gradientEndColorB");

    private readonly _tempArgs: any[] = [];

    /** 线条的起始透明度，范围:[0,1] */
    public lineAlphaMin: number = 1;
    /** 线条的结束透明度，范围:[0,1] */
    public lineAlphaMax: number = 0.4;

    /** 三角形的起始透明度，范围:[0,1] */
    public triangleAlphaMin: number = 0.3;
    /** 三角形的结束透明度，范围:[0,1] */
    public triangleAlphaMax: number = 0;

    /** 过渡持续时间<毫秒> */
    public transitionDuration: number = 1000;
    /** 颜色过渡处理器，格式：```(progress: number, current: RangeColor, next: RangeColor): void``` ，progress∈[0,1] */
    public onTransitionHandler?: Laya.Handler;

    /**
     * 初始化
     * @param rocketChart 图表
     * @param lineMaterial 线的材质
     * @param triangleMaterial 三角形的材质
     * @param rangeColors 范围颜色数组
     */
    public init(
        rocketChart: RocketChart,
        lineMaterial: Laya.Material,
        triangleMaterial: Laya.Material,
        rangeColors: RangeColor[]
    ) {
        this._rocketChart = rocketChart;
        this._lineMaterial = lineMaterial;
        this._triangleMaterial = triangleMaterial;

        this._sequence = rangeColors.sort((a, b) => a.start - b.start); // 按倍数排序：小 -> 大
        this._index = -1;
    }

    /**
    * 更新状态到指定的时间、倍数
    * @param time 发射经过的时间<毫秒>
    * @param multiplier 倍数
    */
    public updateStatusToTime(time: number, multiplier: number): void {
        const index = this.getIndexByMultiplier(multiplier);
        const prevIndex = Math.max(index - 1, 0);
        const rangeColorA = this._sequence[prevIndex];
        const rangeColorB = this._sequence[index];

        if (this._index !== index) {
            this._index = index;

            // 线
            const lightenAmount = 0.3; // 向白色靠近的程度，范围:[0,1]
            this._lineGradientA_start.setRGB(rangeColorA.color.getRGB());
            this._lineGradientA_end.setRGB(this.lightenRGB(rangeColorA.color, lightenAmount));
            this._lineGradientB_start.setRGB(rangeColorB.color.getRGB());
            this._lineGradientB_end.setRGB(this.lightenRGB(rangeColorB.color, lightenAmount));
            this._lineGradientA_start.a = this.lineAlphaMin;
            this._lineGradientB_start.a = this.lineAlphaMin;
            this._lineGradientA_end.a = this.lineAlphaMax;
            this._lineGradientB_end.a = this.lineAlphaMax;
            this._lineMaterial.setColorByIndex(this._gradientStartColorA_ID, this._lineGradientA_start);
            this._lineMaterial.setColorByIndex(this._gradientEndColorA_ID, this._lineGradientA_end);
            this._lineMaterial.setColorByIndex(this._gradientStartColorB_ID, this._lineGradientB_start);
            this._lineMaterial.setColorByIndex(this._gradientEndColorB_ID, this._lineGradientB_end);

            // 三角形
            this._triangleGradientA_start.setRGB(rangeColorA.color.getRGB());
            this._triangleGradientA_end.setRGB(rangeColorA.color.getRGB());
            this._triangleGradientB_start.setRGB(rangeColorB.color.getRGB());
            this._triangleGradientB_end.setRGB(rangeColorB.color.getRGB());
            this._triangleGradientA_start.a = this.triangleAlphaMin;
            this._triangleGradientB_start.a = this.triangleAlphaMin;
            this._triangleGradientA_end.a = this.triangleAlphaMax;
            this._triangleGradientB_end.a = this.triangleAlphaMax;
            this._triangleMaterial.setColorByIndex(this._gradientStartColorA_ID, this._triangleGradientA_start);
            this._triangleMaterial.setColorByIndex(this._gradientEndColorA_ID, this._triangleGradientA_end);
            this._triangleMaterial.setColorByIndex(this._gradientStartColorB_ID, this._triangleGradientB_start);
            this._triangleMaterial.setColorByIndex(this._gradientEndColorB_ID, this._triangleGradientB_end);

            this._shaderMixFactor = 0;
            this._colorStartTime = RocketChart.multiplierToTime(rangeColorB.start, this._rocketChart.initSpeed, this._rocketChart.acceleration);

            const colorEndTime = RocketChart.multiplierToTime(rangeColorB.end, this._rocketChart.initSpeed, this._rocketChart.acceleration);
            const duration = Math.min(this.transitionDuration, Math.max(colorEndTime - this._colorStartTime, 0)); // 过渡持续时间<毫秒>
            this._colorFinishTime = this._colorStartTime + duration;
        }
        // console.log("index", index, "multiplier", ((multiplier * 100) | 0) / 100, "time", time);

        // 颜色过渡
        if (time >= this._colorStartTime) {
            if (this._shaderMixFactor === 0) {
                this._tempArgs.length = 0;
                this._tempArgs.push(0, rangeColorA, rangeColorB);
                this.onTransitionHandler?.runWith(this._tempArgs); // 颜色过渡，开始
            }

            const factor = (time - this._colorStartTime) / (this._colorFinishTime - this._colorStartTime);

            if (factor >= 0 && factor <= 1) {
                // console.log("factor", factor, "multiplier", ((multiplier * 100) | 0) / 100);
                this._tempArgs.length = 0;
                this._tempArgs.push(factor, rangeColorA, rangeColorB);
                this.onTransitionHandler?.runWith(this._tempArgs); // 颜色过渡中...
            }

            if (factor >= 1 && this._shaderMixFactor < 1) {
                this._tempArgs.length = 0;
                this._tempArgs.push(1, rangeColorA, rangeColorB);
                this.onTransitionHandler?.runWith(this._tempArgs); // 颜色过渡，完成
            }
            this._shaderMixFactor = Laya.MathUtil.clamp01(factor);
        } else {
            this._shaderMixFactor = 0;
        }

        this._lineMaterial.setFloatByIndex(this._mixFactorID, this._shaderMixFactor);
        this._triangleMaterial.setFloatByIndex(this._mixFactorID, this._shaderMixFactor);
    }

    /**
     * 根据倍数获取'范围颜色序列'中的索引
     * @param multiplier 倍数
     * @returns 
     */
    private getIndexByMultiplier(multiplier: number) {
        if (multiplier < 1) throw new Error("倍数不能小于1");
        multiplier = ((multiplier * 100) | 0) / 100; // 保留两位小数
        const len = this._sequence.length;
        let index = len - 1; // 默认最大（考虑比 9999x 大）
        for (let i = 0; i < len; i++) {
            const item = this._sequence[i];
            if (multiplier >= item.start && multiplier <= item.end) {
                index = i;
                break;
            }
        }
        return index;
    }

    /**
     * 让颜色向白色靠近
     * @param rgb 颜色值，例如 0xFF3300
     * @param amount 变浅程度，范围 [0,1]  0 = 不变 1 = 白色
     */
    private lightenRGB(color: Laya.Color, amount: number): number {
        const clamped = Laya.MathUtil.clamp01(amount);

        const r = (color.r * 255) | 0;
        const g = (color.g * 255) | 0;
        const b = (color.b * 255) | 0;

        const nr = (r + (255 - r) * clamped) | 0;
        const ng = (g + (255 - g) * clamped) | 0;
        const nb = (b + (255 - b) * clamped) | 0;

        return (nr << 16) | (ng << 8) | nb;
    }

}