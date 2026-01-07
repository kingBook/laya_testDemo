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
     * 估算在指定时间的曲线值
     * @param t 要估算的时间，范围：[0, 1]（曲线图中的x轴）。
     * @param precision 精度<正整数>，默认：8
     * @returns 曲线值，范围：[0, 1]（曲线图中的y轴）。
     */
    public evaluate(t: number, precision: number = 8): number {
        t = Laya.MathUtil.clamp01(t);

        let val = NaN;

        const len = this.keys.length;
        if (len > 2) {
            for (let i = 0; i < len - 1; i++) {
                const key0 = this.keys[i];
                const key1 = this.keys[i + 1];

                if (t >= key0.time && t <= key1.time) {
                    if (t === key0.time) {
                        val = key0.value;
                    } else if (t === key1.time) {
                        val = key1.value;
                    } else {
                        const tb = (t - key0.time) / (key1.time - key0.time);
                        const p1x = key0.outWeight; // outWeight: cubicBezierValues[0]
                        const p1y = key0.outTangent * key0.outWeight; // outTangent: cubicBezierValues[1] / cubicBezierValues[0]
                        const p2x = -key1.inWeight + 1; // inWeight: 1 - cubicBezierValues[2]
                        const p2y = -(key1.inTangent * key1.inWeight) + 1; // inTangent: (1 - cubicBezierValues[3]) / (1 - cubicBezierValues[2])
                        val = this.getCubicBezierValue(tb, p1x, p1y, p2x, p2y, precision);
                    }
                    break;
                }
            }
        }
        return val;
    }

    /**
     * 获取三次贝塞尔曲线值
     * @param t 0~1
     * @param p1x 
     * @param p1y 
     * @param p2x 
     * @param p2y 
     * @param precision 精度<正整数>，默认：8
     * @returns 
     */
    private getCubicBezierValue(t: number, p1x: number, p1y: number, p2x: number, p2y: number, precision: number = 8): number {
        /**
         * 三次贝塞尔曲线计算函数（核心）
         * @param t 0~1
         * @param p1x 
         * @param p1y 
         * @param p2x 
         * @param p2y 
         * @returns 
         */
        const cubicBezier = (t: number, p1x: number, p1y: number, p2x: number, p2y: number): number => {
            // 贝塞尔曲线参数方程（t: 0~1）
            //let u = 1 - t;
            //let tt = t * t;
            //let uu = u * u;
            //let uuu = uu * u;
            //let ttt = tt * t;

            // 计算 X 和 Y 的加权平均
            //let x = uuu * 0 + 3 * uu * t * p1x + 3 * u * tt * p2x + ttt * 1;
            //let y = uuu * 0 + 3 * uu * t * p1y + 3 * u * tt * p2y + ttt * 1;

            // 二分法求逆（找到 t' 使得 x(t') = t）
            let a = 0, b = 1;
            for (let i = 0; i < precision; i++) {  // 迭代 8 次，精度足够
                let mid = (a + b) / 2;
                let midX = cubicBezierX(mid, p1x, p2x);  // 只计算 X
                if (midX < t) {
                    a = mid;
                } else {
                    b = mid;
                }
            }
            let finalT = (a + b) / 2;
            return cubicBezierY(finalT, p1y, p2y);  // 返回对应的 Y
        }

        /**
         * 辅助函数：只计算 X（用于逆向求解）
         * @param t 0~1
         * @param p1x 
         * @param p2x 
         * @returns 
         */
        const cubicBezierX = (t: number, p1x: number, p2x: number): number => {
            let u = 1 - t;
            let tt = t * t;
            let uu = u * u;
            //let uuu = uu * u;
            let ttt = tt * t;
            return 3 * uu * t * p1x + 3 * u * tt * p2x + ttt;
        }

        /**
         * 辅助函数：只计算 Y
         * @param t 0~1
         * @param p1y 
         * @param p2y 
         * @returns 
         */
        const cubicBezierY = (t: number, p1y: number, p2y: number): number => {
            let u = 1 - t;
            let tt = t * t;
            let uu = u * u;
            //let uuu = uu * u;
            let ttt = tt * t;
            return 3 * uu * t * p1y + 3 * u * tt * p2y + ttt;
        }

        return cubicBezier(t, p1x, p1y, p2x, p2y);
    }

}