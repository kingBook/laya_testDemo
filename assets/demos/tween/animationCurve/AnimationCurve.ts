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

    /**
     * 获取曲线值（曲线图中的y轴）
     * @param t 时间插值，区间：[0, 1]（曲线图中的x轴）。
     * @param precision 精度<正整数>，默认：8
     * @returns 曲线值，范围：[0, 1]（曲线图中的y轴）。
     */
    public getValue(t: number, precision: number = 8): number {
        return AnimationCurveUtil.getCurveValue(this.keys, t, precision);
    }



}