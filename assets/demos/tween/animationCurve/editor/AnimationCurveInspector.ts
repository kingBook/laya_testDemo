import { CurveEditDialog } from "./CurveEditDialog";
import CurveInput from "./CurveInput";

@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private readonly _easeComboBoxDatas = [
        { name: "ease", index: 0, values: [.25, .1, .25, 1], isDefault: true },
        { name: "linear", index: 1, values: [0, 0, 1, 1], isDefault: false },
        { name: "ease-in", index: 2, values: [.42, 0, 1, 1], isDefault: false },
        { name: "ease-out", index: 3, values: [0, 0, .58, 1], isDefault: false },
        { name: "ease-in-out", index: 4, values: [.42, 0, .58, 1], isDefault: false },
        { name: "custom", index: 5, values: null, isDefault: false }
    ];

    private _curveInput: CurveInput;

    // @IEditor.onLoad
    // static async onLoad(){
    //     await gui.UIPackage.resourceMgr.load("~/ui/basic/CurveEdit/CurveInput.widget");
    // }

    public override create(): IEditor.IPropertyFieldCreateResult {
        console.log("create();");
        this._curveInput = new CurveInput();

        // 点击事件侦听
        this._curveInput.on("click", (e: gui.Event) => {
            Editor.showDialog(CurveEditDialog, null, this.target); // 显示曲线编辑窗口
        });
        return { ui: this._curveInput };
    }

    public override refresh(): void {
        console.log("refresh();");

        //console.log("target.getValue:", this.target.getValue());

        // 当字段为空时，创建一个默认实例
        if (!this.target.getValue()) {
            this.createDefaultInstance();
        }
    }

    /** 创建默认实例 */
    private createDefaultInstance(): void {
        //console.log("createDefaultInstance();");
        const typeDescriptor: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const initProp = Editor.typeRegistry.getInitProps(typeDescriptor) || {};
        initProp._$type = typeDescriptor.name;

        // _easeComboBoxDatas 中默认值项，转为 FloatKeyFrame 数组
        const retKeys = this.cubicBezierValuesToKeys(this._easeComboBoxDatas.find(item => item.isDefault).values);

        initProp.keys = [
            this.createFloatKeyframe({
                time: 0,
                value: 0,
                inTangent: 0,
                inWeight: 0,
                outTangent: retKeys[0].outTangent,
                outWeight: retKeys[0].outWeight
            }),
            this.createFloatKeyframe({
                time: 1,
                value: 1,
                inTangent: retKeys[1].inTangent,
                inWeight: retKeys[1].inWeight,
                outTangent: 0,
                outWeight: 0
            })
        ];

        // test
        // initProp.keys = [
        //     this.createFloatKeyframe({ time: 0, value: 0, inTangent: 0, inWeight: 0.33333, outTangent: 0, outWeight: 0.33333 }),
        //     this.createFloatKeyframe({ time: 1, value: 1, inTangent: 0, inWeight: 0.33333, outTangent: 0, outWeight: 0.33333 })
        // ];

        // 设置新属性值
        this.parent.target.setPropertyValue(this.property.name, initProp);
    }

    /** 创建一个 FloatKeyframe */
    private createFloatKeyframe(params: { time: number, value: number, inTangent: number, inWeight: number, outTangent: number, outWeight: number }) {
        console.log("createFloatKeyframe();");
        return {
            "_$type": "FloatKeyframe", // Laya.FloatKeyframe
            "time": params.time,
            "value": params.value,
            "inTangent": params.inTangent,
            "inWeight": params.inWeight,
            "outTangent": params.outTangent,
            "outWeight": params.outWeight
            // "weightedMode": 0
        };
    }

    /**
     * cubic-bezier.com 数据转为 FloatKeyFrame
     * @param values 长度为 4
     */
    private cubicBezierValuesToKeys(values: readonly number[]) {
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

        // console.log("cubicBezierValuesToKeys: values", values);
        // console.log("cubicBezierValuesToKeys:", key0.outTangent, key0.outWeight, key1.inTangent, key1.inWeight);

        return [key0, key1];
    }

}