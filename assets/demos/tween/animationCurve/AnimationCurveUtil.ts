
export default class AnimationCurveUtil {

    /**
     * x坐标映射函数
     * @param px [0,1]
     * @param svg 父容器节点
     * @returns 
     */
    public static mapX(px: number, svg: SVGSVGElement): number {
        return px * parseFloat(svg.getAttribute("width"));
    }

    /**
     * y坐标映射函数
     * @param py [0,1]
     * @param svg 父容器节点
     * @returns 
     */
    public static mapY(py: number, svg: SVGSVGElement): number {
        return (1 - py) * parseFloat(svg.getAttribute("height"));
    }

    /**
    * cubic-bezier.com 数据转为 FloatKeyFrame
    * @param values 长度为 4
    */
    public static cubicBezierValuesToKeys(values: number[]) {
        const p1x = values[0];
        const p1y = values[1];
        const p2x = values[2];
        const p2y = values[3];

        // inWeight 和 outWeight 的值不能为0，否则在曲线编辑窗口会重置为0.333.., 并且在计算inTangent、outTangent 会无穷大
        let outWeight0 = Math.max(p1x, Number.MIN_VALUE);
        // p1y等于p1x时直接1，纠正都为0时计算错误
        let outTangent0 = (p1y === p1x) ? 1 : p1y / outWeight0;

        let inWeight1 = Math.max(1 - p2x, Number.MIN_VALUE);
        let inTangent1 = ((1 - p2y) === (1 - p2x)) ? 1 : (1 - p2y) / inWeight1;

        const key0 = {
            time: 0,
            value: 0,
            inTangent: undefined, // 不使用
            inWeight: undefined, // 不使用
            outTangent: outTangent0,
            outWeight: outWeight0
        };
        const key1 = {
            time: 1,
            value: 1,
            inTangent: inTangent1,
            inWeight: inWeight1,
            outTangent: undefined, // 不使用
            outWeight: undefined // 不使用
        };

        console.log("cubicBezierValuesToKeys: values", values);
        console.log("cubicBezierValuesToKeys:", key0.outTangent, key0.outWeight, key1.inTangent, key1.inWeight);

        return [key0, key1];
    }

    /**
     * FloatKeyFrame 转为 cubic-bezier.com 数据
     * @param keys 长度为 2
     */
    public static keysToCubicBezierValues(keys: any[]): number[] {
        const key0 = keys[0];
        const key1 = keys[1];
        const p1x: number = key0.outWeight; // outWeight: cubicBezierValues[0]
        const p1y: number = key0.outTangent * key0.outWeight; // outTangent: cubicBezierValues[1] / cubicBezierValues[0]
        const p2x: number = -key1.inWeight + 1; // inWeight: 1 - cubicBezierValues[2]
        const p2y: number = -(key1.inTangent * key1.inWeight) + 1; // inTangent: (1 - cubicBezierValues[3]) / (1 - cubicBezierValues[2])
        return [p1x, p1y, p2x, p2y];
    }

    /**
     * cubic-bezier.com 数据 转为字符串
     * @param values 
     */
    public static valuesToString(values: number[]): string {
        const p1xStr = this.getFloatString(values[0]);
        const p1yStr = this.getFloatString(values[1]);
        const p2xStr = this.getFloatString(values[2]);
        const p2yStr = this.getFloatString(values[3]);
        return [p1xStr, p1yStr, p2xStr, p2yStr].toString();
    }

    /** 获取浮点数字符串 */
    public static getFloatString(n: number): string {
        n = ((n * 100) | 0) / 100;
        return n.toString().replace("0.", '.');
    }
}