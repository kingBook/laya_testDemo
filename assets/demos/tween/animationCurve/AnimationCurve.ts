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
        let result = NaN;
        const len = this.keys.length;
        if (len < 2) return result;

        t = Laya.MathUtil.clamp01(t);

        for (let i = 0; i < len - 1; i++) {
            const key0 = this.keys[i];
            const key1 = this.keys[i + 1];

            if (t >= key0.time && t <= key1.time) {
                if (t === key0.time) {
                    result = key0.value;
                } else if (t === key1.time) {
                    result = key1.value;
                } else {
                    const c1 = AnimationCurveUtil.outKeyToControlPoint(key0, 1, 1, AnimationCurveUtil.tempPoint);
                    const c2 = AnimationCurveUtil.inKeyToControlPoint(key1, 1, 1, AnimationCurveUtil.tempPoint);
                    const tb = (t - key0.time) / (key1.time - key0.time);
                    result = this.cubicBezierValue(tb, c1.x, c1.y, c2.x, c2.y, precision);
                }
                break;
            }
        }
        return result;
    }

    /**
     * 三次贝塞尔曲线值
     * @param t 0~1
     * @param p1x 
     * @param p1y 
     * @param p2x 
     * @param p2y 
     * @param precision 精度<正整数>，默认：8
     * @returns 
     */
    private cubicBezierValue(t: number, p1x: number, p1y: number, p2x: number, p2y: number, precision: number = 8): number {
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