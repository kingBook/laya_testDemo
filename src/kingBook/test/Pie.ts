const { regClass, property } = Laya;

@regClass()
export default class Pie {

    @property({ type: Number, catalog: "adv" })
    min: number;
    @property({ type: Number, catalog: "adv" })
    max: number
    @property({ type: String, catalog: "adv", inspector: "color", defaultColor: "rgba(217, 232, 0, 1)" })
    color: string;
}