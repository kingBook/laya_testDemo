import { FloatKey } from "./FloatKey";

export default class AnimationCurveEditorUtil {

    public static readonly MIN_VALUE = 1e-8;

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
    * @param values cubic-bezier.com 数据（长度4，控制点1：c1:{x:[0], y:[1]}， 控制点2：c2:{x:[2], y:[3]}）
    * @returns 长度为 2，weight=x, tangent=y/x, inTangent、inWeight 以右上角为原点(x向左，y向下)，outTangent、outWeight 以左下角为原点(x向右，y向上)
    */
    public static cubicBezierValuesToKeys(values: readonly number[]): FloatKey[] {
        const c1x = values[0], c1y = values[1];
        const c2x = values[2], c2y = values[3];

        const outKey = this.controlPointToOutKey(c1x, c1y);
        const inKey = this.controlPointToInKey(c2x, c2y);

        const key0 = new FloatKey();
        key0.time = 0;
        key0.value = 0;
        key0.outTangent = outKey.outTangent;
        key0.outWeight = outKey.outWeight;

        const key1 = new FloatKey();
        key1.time = 1;
        key1.value = 1;
        key1.inTangent = inKey.inTangent;
        key1.inWeight = inKey.inWeight;

        console.log("cubicBezierValuesToKeys: values", values);
        console.log("cubicBezierValuesToKeys:", key0.outTangent, key0.outWeight, key1.inTangent, key1.inWeight);

        return [key0, key1];
    }

    /**
     * FloatKeyFrame 转为 cubic-bezier.com 数据
     * @param keys 长度为 2，weight=x, tangent=y/x, inTangent 与 inWeight 以右上角为原点，x向左，y向下，outTangent 与 outWeight 以左下角为原点，x向右，y向上
     * @returns 返回 cubic-bezier.com 数据（长度4，控制点1：c1:{x:[0], y:[1]}， 控制点2：c2:{x:[2], y:[3]}）
     */
    public static keysToCubicBezierValues(keys: readonly { inTangent: number, inWeight: number, outTangent: number, outWeight: number }[]): number[] {
        const c1 = this.outKeyToControlPoint(keys[0]);
        const c2 = this.inKeyToControlPoint(keys[1]);
        return [c1.x, c1.y, c2.x, c2.y];
    }

    /**
     * 内切线、内权重 转 控制点
     * @param inKey 内切线、内权重
     * @param mapWidth 控制点所在画布的宽
     * @param mapHeight 控制点所在画布的高
     * @returns 控制点xy
     */
    public static inKeyToControlPoint(inKey: { inTangent: number, inWeight: number }, mapWidth: number = 1, mapHeight: number = 1): { x: number, y: number } {
        let x: number, y: number;
        if (inKey.inTangent + inKey.inWeight === 0) {
            x = y = 0; // 起点控制点
        } else {
            x = -inKey.inWeight + 1; // inWeight = 1 - c2.x
            y = -(inKey.inTangent * inKey.inWeight) + 1; // inTangent = (1 - c2.y) / (1 - c2.x)
        }
        x *= mapWidth;
        y *= mapHeight;
        return { x, y };
    }

    /**
    * 外切线、外权重 转 控制点
    * @param outKey 外切线、外权重
    * @param mapWidth 控制点所在画布的宽
    * @param mapHeight 控制点所在画布的高
    * @returns 控制点xy
    */
    public static outKeyToControlPoint(outKey: { outTangent: number, outWeight: number }, mapWidth: number = 1, mapHeight: number = 1): { x: number, y: number } {
        let x: number, y: number;
        if (outKey.outTangent + outKey.outWeight === 0) {
            x = y = 1; // 终点控制点
        } else {
            x = outKey.outWeight; // outWeight = c1.x
            y = outKey.outTangent * outKey.outWeight; // outTangent = c1.y / c1.x
        }
        x *= mapWidth;
        y *= mapHeight;
        return { x, y };
    }

    /**
     * 控制点 转 内切线、内权重
     * @param cx 控制点x
     * @param cy 控制点y
     * @param mapWidth 控制点所在画布的宽
     * @param mapHeight 控制点所在画布的高
     * @returns 内切线、内权重
     */
    public static controlPointToInKey(cx: number, cy: number, mapWidth: number = 1, mapHeight: number = 1): { inTangent: number, inWeight: number } {
        let inTangent: number, inWeight: number;
        cx /= mapWidth;
        cy /= mapHeight;
        cx = Math.max(1 - cx, this.MIN_VALUE);
        cy = 1 - cy;
        inWeight = cx;
        inTangent = (cy === cx) ? 1 : cy / inWeight;
        return { inTangent, inWeight };
    }

    /**
    * 控制点 转 外切线、外权重
    * @param cx 控制点x
    * @param cy 控制点y
    * @param mapWidth 控制点所在画布的宽
    * @param mapHeight 控制点所在画布的高
    * @returns 外切线、外权重 
    */
    public static controlPointToOutKey(cx: number, cy: number, mapWidth: number = 1, mapHeight: number = 1): { outTangent: number, outWeight: number } {
        let outTangent: number, outWeight: number;
        cx /= mapWidth;
        cy /= mapHeight;
        outWeight = Math.max(cx, this.MIN_VALUE);
        outTangent = (cy === cx) ? 1 : cy / outWeight;
        return { outTangent, outWeight };
    }

    /**
     * cubic-bezier.com 数据 转为字符串
     * @param values 
     */
    public static valuesToString(values: number[]): string {
        const c1xStr = this.getFloatString(values[0]);
        const c1yStr = this.getFloatString(values[1]);
        const c2xStr = this.getFloatString(values[2]);
        const c2yStr = this.getFloatString(values[3]);
        return [c1xStr, c1yStr, c2xStr, c2yStr].toString();
    }

    /** 获取浮点数字符串 */
    public static getFloatString(n: number): string {
        n = ((n * 100) | 0) / 100;
        return n.toString().replace("0.", '.');
    }
}