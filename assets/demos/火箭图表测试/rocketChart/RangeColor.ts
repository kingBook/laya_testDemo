const { regClass, property } = Laya;

@regClass()
export default class RangeColor {

    @property({ type: Number, fractionDigits: 2, step: 0.01, tips: "开始倍数" })
    public start: number;

    @property({ type: Number, fractionDigits: 2, step: 0.01, tips: "结束倍数" })
    public end: number;

    @property({ type: Number, range: [1, 4], step: 1, fractionDigits: 0, tips: "颜色等级: 1:黄; 2:红; 3:紫; 4:蓝;" })
    public colorLevel: number;

    @property({ type: Laya.Color, tips: "颜色" })
    public color: Laya.Color;
}