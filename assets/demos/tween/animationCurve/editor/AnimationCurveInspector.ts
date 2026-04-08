import AnimationCurveEditorUtil from "./AnimationCurveEditorUtil";
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
        console.log("create getValue", this.target.getValue());
        this._curveInput = new CurveInput();
        // 侦听修改
        this._curveInput.on(CurveInput.EVENT_SUBMIT, e => {
            this.onCurveInputSubmit();
        });

        return { ui: this._curveInput };
    }

    /** 当数据发生改变时，会调用这个方法 */
    public override refresh(): void {
        console.log("refresh();");

        //console.log("target.getValue:", this.target.getValue());

        // 当字段为空时，创建默认属性
        if (!this.target.getValue()) {
            this.createDefaultProperty();
        }

        const value = this.target.getValue();
        const valueKeys: any[] = value.keys;

        //console.log("refresh();", keys[0].outWeight, keys[0].outTangent, keys[1].inWeight, keys[1].inTangent);

        // 清空 (避免顶点数量比实际数量多)
        this._curveInput.clearKeys();

        // 目标值 -> CurveInput
        valueKeys.forEach((key, i) => {
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

        this._curveInput.applyChange();
    }

    /** CurveInput 修改后提交 */
    private onCurveInputSubmit(): void {
        console.log("onCurveInputSubmit();");
        // CurveInput -> 目标值
        const value = this.target.getValue();
        const valueKeys: any[] = value.keys;

        this._curveInput.keys.forEach((k, i) => {
            if (i >= valueKeys.length) {
                valueKeys.push(this.createFloatKeyframe());
            }
            const key = valueKeys[i];
            key.time = k.time;
            key.value = k.value;
            key.inTangent = k.inTangent;
            key.outTangent = k.outTangent;
            key.inWeight = k.inWeight;
            key.outWeight = k.outWeight;
        });

        // 删除多出的点
        if (valueKeys.length > this._curveInput.keys.length) {
            valueKeys.length = this._curveInput.keys.length;
        }

        // // 第一个点永远为(0,0)
        // keys[0].time = 0;
        // keys[0].value = 0;
        // // 最后一个永远点为(1,1)
        // keys[keys.length - 1].time = 1;
        // keys[keys.length - 1].value = 1;

        //this.target.setValue(value);
    }


    /** 创建默认属性 */
    private createDefaultProperty(): void {
        console.log("createDefaultProperty();");

        // 类型描述
        const typeDescriptor: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const initProp = Editor.typeRegistry.getInitProps(typeDescriptor) || {};
        initProp._$type = typeDescriptor.name;

        // _easeComboBoxDatas 中默认值项，转为 FloatKey 数组
        const floatKeys = AnimationCurveEditorUtil.cubicBezierValuesToKeys(this._easeComboBoxDatas.find(item => item.isDefault).values);

        // FloatKey 数组，转为序列化后的 FloatKeyframe 数组
        initProp.keys = floatKeys.map(k => {
            return this.createFloatKeyframe(k.time, k.value, k.inTangent, k.inWeight, k.outTangent, k.outWeight);
        });

        // 设置新属性值
        this.parent.target.setPropertyValue(this.property.name, initProp);
    }

    private createFloatKeyframe(time: number = 0, value: number = 0, inTangent: number = 0, inWeight: number = 0, outTangent: number = 0, outWeight: number = 0) {
        console.log("createFloatKeyframe();");
        return {
            _$type: "FloatKeyframe", // Laya.FloatKeyframe
            time: time,
            value: value,
            inTangent: inTangent,
            inWeight: inWeight,
            outTangent: outTangent,
            outWeight: outWeight
            // "weightedMode": 0
        };
    }




}