
export default class AnimationCurveUtil {

    public static readonly tempOutKey = { outTangent: 0, outWeight: 0 };
    public static readonly tempInKey = { inTangent: 0, inWeight: 0 };
    public static readonly tempPoint1 = { x: 0, y: 0 };
    public static readonly tempPoint2 = { x: 0, y: 0 };


    /**
     * 获取曲线值（曲线图中的y轴）
     * @param keys 曲线上的关键帧点数组
     * @param t 时间插值，区间：[0, 1]（曲线图中的x轴）。
     * @param precision 精度<正整数>，默认：8
     * @returns 曲线值，范围：[0, 1]（曲线图中的y轴）。
     */
    public static getCurveValue(
        keys: { inTangent: number, inWeight: number, outTangent: number, outWeight: number, time: number, value: number }[],
        t: number,
        precision: number = 8
    ): number {
        let result = NaN;
        const len = keys.length;
        if (len < 2) return result;

        t = Math.min(Math.max(t, 0), 1);

        for (let i = 0; i < len - 1; i++) {
            const key1 = keys[i];
            const key2 = keys[i + 1];

            if (t >= key1.time && t <= key2.time) {
                if (t === key1.time) {
                    result = key1.value;
                } else if (t === key2.time) {
                    result = key2.value;
                } else {
                    const c1 = this.outKeyToControlPoint(key1, 1, 1, this.tempPoint1);
                    const c2 = this.inKeyToControlPoint(key2, 1, 1, this.tempPoint2);
                    const tb = (t - key1.time) / (key2.time - key1.time);
                    result = this.cubicBezierValue(tb, c1.x, c1.y, c2.x, c2.y, precision);
                }
                break;
            }
        }
        return result;
    }

    /**
     * 获取点(p)到贝塞尔曲线上距离最近点的 t 和距离
     * * 注意: 此函数很耗性能
     * @param px 点p的x
     * @param py 点p的y
     * @param keys 曲线上的关键帧点数组
     * @param stepCount [默认：10]，迭代次数<大于0的整数>，把 t 分成 {@link stepCount} 份来计算
     * @param recursionCount [默认：2]，递归次数
     * @returns t: 最近点的 t ，区间：[0, 1]; distance: 最近点的距离
     */
    public static getClosestPointOnCubicBezierCurve(
        px: number,
        py: number,
        keys: { inTangent: number, inWeight: number, outTangent: number, outWeight: number, time: number, value: number }[],
        stepCount: number = 10,
        recursionCount: number = 2
    ): { t: number, distance: number } {

        let retT: number, val: number, d: number, i: number;
        let t = 0, maxT = 1, dt = (maxT - t) / stepCount, minD = Number.MAX_VALUE;

        for (i = 0; i < recursionCount; i++) {
            for (t; t <= maxT; t += dt) {
                t = Math.min(t, maxT); // 曲线图x
                val = this.getCurveValue(keys, t); // 曲线图y
                d = Math.pow(px - t, 2) + Math.pow(py - val, 2); // 距离平方
                if (d < minD) {
                    minD = d;
                    retT = t;
                }
            }
            t = Math.max(retT - dt, 0);
            maxT = Math.min(t + dt, 1);
            dt = dt = (maxT - t) / stepCount;
        }
        return { t: retT, distance: Math.sqrt(minD) };
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
    public static cubicBezierValue(t: number, p1x: number, p1y: number, p2x: number, p2y: number, precision: number = 8): number {
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
            let midX = this.cubicBezierX(mid, p1x, p2x);  // 只计算 X
            if (midX < t) {
                a = mid;
            } else {
                b = mid;
            }
        }
        let finalT = (a + b) / 2;
        return this.cubicBezierY(finalT, p1y, p2y);  // 返回对应的 Y
    }

    /**
    * 辅助函数：只计算 X（用于逆向求解）
    * @param t 0~1
    * @param p1x 
    * @param p2x 
    * @returns 
    */
    private static cubicBezierX(t: number, p1x: number, p2x: number): number {
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
    private static cubicBezierY(t: number, p1y: number, p2y: number): number {
        let u = 1 - t;
        let tt = t * t;
        let uu = u * u;
        //let uuu = uu * u;
        let ttt = tt * t;
        return 3 * uu * t * p1y + 3 * u * tt * p2y + ttt;
    }

    /**
     * x坐标映射函数
     * @param px [0,1]
     * @param mapWidth 宽
     * @returns 返回 x 的方向不变
     */
    public static mapX(px: number, mapWidth: number): number {
        return px * mapWidth;
    }

    /**
     * y坐标映射函数
     * @param py [0,1]
     * @param mapHeight 高
     * @returns 返回 y 的原点相反
     */
    public static mapY(py: number, mapHeight: number): number {
        return (1 - py) * mapHeight;
    }

    /**
    * cubic-bezier.com 数据转为 FloatKey
    * @param values cubic-bezier.com 数据
    * @returns 长度为 2，weight=x, tangent=y/x, inTangent、inWeight 以右上角为原点(x向左，y向下)，outTangent、outWeight 以左下角为原点(x向右，y向上)
    */
    public static cubicBezierValuesToKeys(c1x: number, c1y: number, c2x: number, c2y: number): { inTangent: number, inWeight: number, outTangent: number, outWeight: number, time: number, value: number }[] {
        const outKey = this.controlPointToOutKey(c1x, c1y, 1, 1, this.tempOutKey);
        const inKey = this.controlPointToInKey(c2x, c2y, 1, 1, this.tempInKey);

        const key0 = {
            time: 0,
            value: 0,
            outTangent: outKey.outTangent,
            outWeight: outKey.outWeight,
            inTangent: 0,
            inWeight: 0
        };

        const key1 = {
            time: 1,
            value: 1,
            outTangent: 0,
            outWeight: 0,
            inTangent: inKey.inTangent,
            inWeight: inKey.inWeight
        };
        return [key0, key1];
    }

    /**
     * FloatKeyFrame 转为 cubic-bezier.com 数据
     * @param keys 长度为 2，weight=x, tangent=y/x, inTangent 与 inWeight 以右上角为原点，x向左，y向下，outTangent 与 outWeight 以左下角为原点，x向右，y向上
     * @returns 返回 cubic-bezier.com 数据（长度4，控制点1：c1:{x:[0], y:[1]}， 控制点2：c2:{x:[2], y:[3]}）
     */
    public static keysToCubicBezierValues(keys: readonly { inTangent: number, inWeight: number, outTangent: number, outWeight: number }[]): number[] {
        if (keys.length !== 2) throw new Error("keys 的长度非 2, 不能调用此方法");

        const c1 = this.outKeyToControlPoint(keys[0], 1, 1, this.tempPoint1);
        const c2 = this.inKeyToControlPoint(keys[1], 1, 1, this.tempPoint2);

        // 首控制点，距离端点很近，直接等于0
        const d0 = Math.pow(c1.x, 2) + Math.pow(c1.y, 2);
        if (d0 <= Number.EPSILON) {
            c1.x = c1.y = 0;
        }

        // 末控制点，距离端点很近，直接等于1
        const de = Math.pow(c2.x - 1, 2) + Math.pow(c2.y - 1, 2);
        if (de <= Number.EPSILON) {
            c2.x = c2.y = 1;
        }
        return [c1.x, c1.y, c2.x, c2.y];
    }

    /**
     * 内切线、内权重 转 控制点
     * @param inKey 内切线、内权重
     * @param mapWidth 控制点所在画布的宽
     * @param mapHeight 控制点所在画布的高
     * @param output
     * @returns 控制点xy
     */
    public static inKeyToControlPoint(inKey: { inTangent: number, inWeight: number }, mapWidth: number = 1, mapHeight: number = 1, output?: { x: number, y: number }): { x: number, y: number } {
        output ||= { x: 0, y: 0 };
        if (inKey.inTangent + inKey.inWeight === 0) {
            output.x = output.y = 0; // 起点控制点
        } else {
            output.x = -inKey.inWeight + 1; // inWeight = 1 - c2.x
            output.y = -(inKey.inTangent * inKey.inWeight) + 1; // inTangent = (1 - c2.y) / (1 - c2.x)
        }
        output.x *= mapWidth;
        output.y *= mapHeight;
        return output;
    }

    /**
    * 外切线、外权重 转 控制点
    * @param outKey 外切线、外权重
    * @param mapWidth 控制点所在画布的宽
    * @param mapHeight 控制点所在画布的高
    * @param output
    * @returns 控制点xy
    */
    public static outKeyToControlPoint(outKey: { outTangent: number, outWeight: number }, mapWidth: number = 1, mapHeight: number = 1, output?: { x: number, y: number }): { x: number, y: number } {
        output ||= { x: 0, y: 0 };
        if (outKey.outTangent + outKey.outWeight === 0) {
            output.x = output.y = 1; // 终点控制点
        } else {
            output.x = outKey.outWeight; // outWeight = c1.x
            output.y = outKey.outTangent * outKey.outWeight; // outTangent = c1.y / c1.x
        }
        output.x *= mapWidth;
        output.y *= mapHeight;
        return output;
    }

    /**
     * 控制点 转 内切线、内权重
     * @param cx 控制点x
     * @param cy 控制点y
     * @param mapWidth 控制点所在画布的宽
     * @param mapHeight 控制点所在画布的高
     * @param output 
     * @returns 内切线、内权重
     */
    public static controlPointToInKey(cx: number, cy: number, mapWidth: number = 1, mapHeight: number = 1, output?: { inTangent: number, inWeight: number }): { inTangent: number, inWeight: number } {
        cx /= mapWidth;
        cy /= mapHeight;
        cx = Math.max(1 - cx, Number.EPSILON);
        cy = 1 - cy;
        output ||= { inTangent: 0, inWeight: 0 };
        output.inWeight = cx;
        output.inTangent = (cy === cx) ? 1 : cy / output.inWeight;
        return output;
    }

    /**
    * 控制点 转 外切线、外权重
    * @param cx 控制点x
    * @param cy 控制点y
    * @param mapWidth 控制点所在画布的宽
    * @param mapHeight 控制点所在画布的高
    * @param output 
    * @returns 外切线、外权重 
    */
    public static controlPointToOutKey(cx: number, cy: number, mapWidth: number = 1, mapHeight: number = 1, output?: { outTangent: number, outWeight: number }): { outTangent: number, outWeight: number } {
        cx /= mapWidth;
        cy /= mapHeight;
        output ||= { outTangent: 0, outWeight: 0 };
        output.outWeight = Math.max(cx, Number.EPSILON);
        output.outTangent = (cy === cx) ? 1 : cy / output.outWeight;
        return output;
    }
}