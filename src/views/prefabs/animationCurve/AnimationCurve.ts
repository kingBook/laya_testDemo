import AnimationCurveUtil from "./AnimationCurveUtil";

const { regClass, property } = Laya;

/**
 * 动画曲线
 * @example
```ts
import AnimationCurve from "./animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class AnimationCurveTest extends Laya.Script {

    @property({ type: AnimationCurve, inspector: AnimationCurve.name })
    aniCurve: AnimationCurve = new AnimationCurve();

    @property({ type: Laya.Box })
    box: Laya.Box;

    @property({ type: Laya.Box })
    box2: Laya.Box;

    private _time: number;
    private _totalTime: number;
    private _startY: number;
    private _targetY: number;
    private _isMoveing: boolean;

    onUpdate(): void {
        if (!this._isMoveing) return;

        this._time = Math.min(this._time + Laya.timer.delta, this._totalTime);
        const t = Laya.MathUtil.clamp01(Math.trunc(this._time / this._totalTime * 1000) / 1000); // [0,1]三位小数

        const tb = this.aniCurve.getValue(t);
        this.box2.y = Laya.MathUtil.lerp(this._startY, this._targetY, tb);

        if (t >= 1) {
            this._isMoveing = false;
        }
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            this._totalTime = 2000;
            this._targetY = 800;
            this._startY = 120;

            // 两个 box 起始 y 一致
            this.box.pos(375, this._startY);
            this.box2.pos(615, this._startY);

            // 示例1： tween 
            Laya.Tween.killAll(this.box);
            Laya.Tween.create(this.box).to('y', this._targetY).duration(this._totalTime).ease(this.aniCurve.easeFn);

            // 示例2：
            this._time = 0;
            this._isMoveing = true;
        }
    }
}
```
 */
@regClass()
export default class AnimationCurve {

    /** 动画曲线上的顶点数组 */
    @property({ type: [Laya.FloatKeyframe] })
    public keys: Laya.FloatKeyframe[];

    /** 精度<正整数>，默认：16 */
    public precision: number = 16;

    constructor(c1x = 0.25, c1y = 0.1, c2x = 0.25, c2y = 1) {
        // 默认
        this.setTo(c1x, c1y, c2x, c2y);
    }

    /**
     * 转换为 {@link Laya.Tween} 使用的缓动函数
     * @param t 当前时间，取值范围是0到持续时间（包括持续时间）。
     * @param b 属性的初始值。
     * @param c 属性的变化总量。
     * @param d 动画的持续时间。
     * @returns 
     * @example
     *  const aniCurve = new AnimationCurve();
     *  aniCurve.setTo(.25, .1, .25, 1);
     *  Laya.Tween.create(target).to('x', 100).duration(1000).ease(aniCurve.easeFn);
     */
    public easeFn = (t: number, b: number, c: number, d: number): number => {
        const t2 = this.getValue(t / d) * d;
        return Laya.Ease.linear(t2, b, c, d);
    }

    /**
     * 获取曲线值（曲线图中的y轴）
     * * 注意：如何精度不够，请先设置 {@link precision} 提高精度后，再调用这个方法
     * @param t 时间插值（曲线图中的x轴），区间：[0, 1]。
     * @returns 曲线值（曲线图中的y轴），区间：[0, 1]。
     */
    public getValue(t: number): number {
        return AnimationCurveUtil.getCurveValue(this.keys, t, this.precision);
    }

    /**
     * 获取曲线在 t 位置的导数（斜率）
     * @param t 时间插值（曲线图中的x轴），区间：[0, 1]。
     * @returns 
     */
    public getTangent(t: number): number {
        return AnimationCurveUtil.getCurveTangent(this.keys, t, this.precision);
    }

    /**
    * 设置动画曲线, 源于 cubic-bezier.com 数据
    * @param c1x 控制点1.x
    * @param c1y 控制点1.y
    * @param c2x 控制点2.x
    * @param c2y 控制点2.y
    * @returns this
    */
    public setTo(c1x: number, c1y: number, c2x: number, c2y: number): AnimationCurve;

    /**
     * 设置动画曲线, 源于另一动画曲线
     * @param otherCurve 另一动画曲线
     * @returns this
     */
    public setTo(otherCurve: AnimationCurve): AnimationCurve;

    public setTo(c1x: number | AnimationCurve, c1y?: number, c2x?: number, c2y?: number): AnimationCurve {
        if (typeof c1x === 'number') {
            this.keys ||= [];
            this.keys.length = 2;
            AnimationCurveUtil.controlPointValuesToKeys(c1x, c1y, c2x, c2y).forEach((k, i) => {
                this.keys[i] ||= new Laya.FloatKeyframe();
                const keyFrame = this.keys[i];
                keyFrame.inTangent = k.inTangent;
                keyFrame.inWeight = k.inWeight;
                keyFrame.outTangent = k.outTangent;
                keyFrame.outWeight = k.outWeight;
                keyFrame.time = k.time;
                keyFrame.value = k.value;
            });
        } else {
            this.keys ||= [];
            this.keys.length = c1x.keys.length;
            this.precision = c1x.precision;
            c1x.keys.forEach((k, i) => {
                this.keys[i] ||= new Laya.FloatKeyframe();
                const keyFrame = this.keys[i];
                keyFrame.inTangent = k.inTangent;
                keyFrame.inWeight = k.inWeight;
                keyFrame.outTangent = k.outTangent;
                keyFrame.outWeight = k.outWeight;
                keyFrame.time = k.time;
                keyFrame.value = k.value;
            });
        }
        return this;
    }



    /**
     * 转为 cubic-bezier.com 数据
     * @param output [可选] 存储输出的数组
     * @returns 返回 cubic-bezier.com 数据，如: [.25, .1, .25, 1]
     */
    public toControlPointValues(output?: number[]): number[] {
        return AnimationCurveUtil.keysToControlPointValues(this.keys, output);
    }

}