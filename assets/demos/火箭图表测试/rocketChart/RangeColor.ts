import { ITEMLEVEL } from "globalCfg/GameCfg";

const { regClass, property } = Laya;

@regClass()
export default class RangeColor {

    @property({ type: Number, fractionDigits: 2, step: 0.01, tips: "开始倍数" })
    public start: number;

    @property({ type: Number, fractionDigits: 2, step: 0.01, tips: "结束倍数" })
    public end: number;

    @property({ type: ITEMLEVEL, tips: "颜色等级: 1:黄; 2:红; 3:紫; 4:蓝;" })
    public colorLevel: ITEMLEVEL;

    @property({ type: Laya.Color, tips: "颜色" })
    public color: Laya.Color;
}