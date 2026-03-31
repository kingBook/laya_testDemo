import AnimationCurveUtil from "../AnimationCurveUtil";
import { CurveInput } from "./CurveInput";

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

        return { ui: this._curveInput };
    }

    public override refresh(): void {
        console.log("refresh();");

        //console.log("target.getValue:", this.target.getValue());

        // 当字段为空时，创建一个默认实例
        if (!this.target.getValue()) {
            this.createDefaultInstance();
        }


        // 同步值到 CurveInput
        this.syncValueToCurveInput();
    }

    /** 同步值到 CurveInput */
    private syncValueToCurveInput(): void {
        const value = this.target.getValue();
        const keys: any[] = value.keys;

        //console.log("refresh();", keys[0].outWeight, keys[0].outTangent, keys[1].inWeight, keys[1].inTangent);
        // 先清空，避免顶点数量比实际数量多
        this._curveInput.clearKeys();

        // 设置 CurveInput 的值，等于当前值
        keys.forEach((key, i) => {
            if (i >= this._curveInput.keys.length) {
                this._curveInput.addKey();
            }
            const ikey = this._curveInput.keys[i];
            //ikey.inTangentMode = 2;
            //ikey.outTangentMode = 2;
            ikey.time = key.time;
            ikey.value = key.value;
            ikey.inTangent = key.inTangent;
            ikey.outTangent = key.outTangent;
            ikey.inWeight = key.inWeight;
            ikey.outWeight = key.outWeight;
        });
    }

    /** 创建默认实例 */
    private createDefaultInstance(): void {
        //console.log("createDefaultInstance();");
        const typeDescriptor: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const initProp = Editor.typeRegistry.getInitProps(typeDescriptor) || {};
        initProp._$type = typeDescriptor.name;

        // _easeComboBoxDatas 中默认值项，转为 FloatKeyFrame 数组
        const retKeys = AnimationCurveUtil.cubicBezierValuesToKeys(this._easeComboBoxDatas.find(item => item.isDefault).values);

        initProp.keys = [
            {
                _$type: "FloatKeyframe", // Laya.FloatKeyframe
                time: 0,
                value: 0,
                inTangent: 0,
                inWeight: 0,
                outTangent: retKeys[0].outTangent,
                outWeight: retKeys[0].outWeight
                // "weightedMode": 0
            },
            {
                _$type: "FloatKeyframe", // Laya.FloatKeyframe
                time: 1,
                value: 1,
                inTangent: retKeys[1].inTangent,
                inWeight: retKeys[1].inWeight,
                outTangent: 0,
                outWeight: 0
                // "weightedMode": 0
            }
        ];

        // test
        // initProp.keys = [
        //     this.createFloatKeyframe({ time: 0, value: 0, inTangent: 0, inWeight: 0.33333, outTangent: 0, outWeight: 0.33333 }),
        //     this.createFloatKeyframe({ time: 1, value: 1, inTangent: 0, inWeight: 0.33333, outTangent: 0, outWeight: 0.33333 })
        // ];

        // 设置新属性值
        this.parent.target.setPropertyValue(this.property.name, initProp);
    }




}