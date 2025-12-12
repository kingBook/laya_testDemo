const { regClass, property } = Laya;

/**
 * 动画曲线
 */
@regClass()
export default class AnimationCurve {

    @property({ type: [Laya.FloatKeyframe] })
    public keys: Laya.FloatKeyframe[];

    /**
     * 估算在指定时间的曲线值
     * @param t 要估算的时间，范围：[0, 1]（曲线图中的x轴）。
     * @returns 曲线值，范围：[0, 1]（曲线图中的y轴）。
     */
    public evaluate(t: number): number {
        return 0;
    }

}