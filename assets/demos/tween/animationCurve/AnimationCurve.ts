import AnimationCurveUtil from "./AnimationCurveUtil";

const { regClass, property } = Laya;

/**
 * 动画曲线
 */
@regClass()
export default class AnimationCurve {

    /** 动画曲线上的顶点数组 */
    @property({ type: [Laya.FloatKeyframe] })
    public keys: Laya.FloatKeyframe[];

    /** 精度<正整数>，默认：16 */
    public precision: number = 16;

    /**
     * 获取曲线值（曲线图中的y轴）
     * @param t 时间插值（曲线图中的x轴），区间：[0, 1]。
     * @returns 曲线值（曲线图中的y轴），区间：[0, 1]。
     */
    public getValue(t: number): number {
        return AnimationCurveUtil.getCurveValue(this.keys, t, this.precision);
    }

    /**
     * 转换为 {@link Laya.Tween} 使用的缓动函数
     * @param t 当前时间，取值范围是0到持续时间（包括持续时间）。
     * @param b 属性的初始值。
     * @param c 属性的变化总量。
     * @param d 动画的持续时间。
     * @returns 
     * @example
     *  animationCurve: AnimationCurve;
     *  Laya.Tween.create(target).to('x', 100).duration(1000).ease(animationCurve.toEaseFn);
     */
    public toEaseFn(t: number, b: number, c: number, d: number): number {
        // 转换成 0~1
        const hT = t / d;
        const t2 = this.getValue(hT) * d;
        return Laya.Ease.linear(t2, b, c, d);
    }

    /**
     * 设置动画曲线, 源于 cubic-bezier.com 数据
     * @param c1x 控制点1.x
     * @param c1y 控制点1.y
     * @param c2x 控制点2.x
     * @param c2y 控制点2.y
     */
    public setTo(c1x: number, c1y: number, c2x: number, c2y: number): AnimationCurve {
        this.keys.length = 2;
        AnimationCurveUtil.cubicBezierValuesToKeys(c1x, c1y, c2x, c2y).forEach((k, i) => {
            const keyFrame = this.keys[i];
            keyFrame.inTangent = k.inTangent;
            keyFrame.inWeight = k.inWeight;
            keyFrame.outTangent = k.outTangent;
            keyFrame.outWeight = k.outWeight;
            keyFrame.time = k.time;
            keyFrame.value = k.value;
        });
        return this;
    }

}