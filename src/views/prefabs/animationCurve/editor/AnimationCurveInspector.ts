import AnimationCurveUtil from "../AnimationCurveUtil";
import { CurveInput } from "./CurveInput";
import Presets from "./Presets";

@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private _curveInput: CurveInput;

    public override create(): IEditor.IPropertyFieldCreateResult {
        //console.log("create(); getValue", this.target.getValue());
        this._curveInput = new CurveInput(this.target);
        // 侦听修改
        this._curveInput.on(CurveInput.EVENT_SUBMIT, e => {
            this.onCurveInputSubmit();
        });
        return { ui: this._curveInput };
    }

    /** 当数据发生改变时，会调用这个方法 */
    public override refresh(): void {
        //console.log("refresh();");

        // 当字段为空时，创建默认属性
        if (!this.target.getValue()) {
            this.createDefaultProperty();
        }

        const value = this.target.getValue();
        const valueKeys: any[] = value.keys;

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

    /** CurveInput 提交修改 */
    private onCurveInputSubmit(): void {
        //console.log("onCurveInputSubmit();");

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

        //this.target.setValue(value);
    }


    /** 创建默认属性 */
    private createDefaultProperty(): void {
        //console.log("createDefaultProperty();");

        // 类型描述
        const typeDescriptor: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const initProp = Editor.typeRegistry.getInitProps(typeDescriptor) || {};
        initProp._$type = typeDescriptor.name;

        // 默认值项，转为关键帧点数组
        const defaultValues = Presets.easeDatas[0].values;
        const keys = AnimationCurveUtil.controlPointValuesToKeys(defaultValues[0], defaultValues[1], defaultValues[2], defaultValues[3]);

        // 关键帧点数组，转为序列化后的 FloatKeyframe 数组
        initProp.keys = keys.map(k => {
            return this.createFloatKeyframe(k.time, k.value, k.inTangent, k.inWeight, k.outTangent, k.outWeight);
        });

        // 设置新属性值
        this.parent.target.setPropertyValue(this.property.name, initProp);
    }

    /** 创建序列化后的 Laya.FloatKeyframe */
    private createFloatKeyframe(time: number = 0, value: number = 0, inTangent: number = 0, inWeight: number = 0, outTangent: number = 0, outWeight: number = 0) {
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