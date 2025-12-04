const { regClass, property } = Laya;


@regClass()
export default class AnimationCurve {

    @property({ type: [Laya.FloatKeyframe] })
    public keys: Laya.FloatKeyframe[];

    /**
     * 估算在指定时间的曲线值
     * @param time 要估算的时间（曲线图中的x轴）。
     * @returns 曲线值（曲线图中的y轴）。
     */
    public evaluate(time: number): number {
        return 0;
    }

    constructor() {
        const key0 = new Laya.FloatKeyframe();
        key0.time = 0;
        key0.value = 0;

        const key1 = new Laya.FloatKeyframe();
        key1.time = 1;
        key1.value = 1;

        this.keys = [key0, key1];


    }

}