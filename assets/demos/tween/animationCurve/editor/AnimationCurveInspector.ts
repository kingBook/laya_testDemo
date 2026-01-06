@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private _input: IEditor.CurveInput;

    public override create(): IEditor.IPropertyFieldCreateResult {
        // 创建曲线图（CurveInput）
        const input: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        input.isNormalization = true;
        input.maxKeyFrame = 10; // 默认: 4
        input.minValue = 0;
        input.maxValue = 1;
        input.isAutoFillKeyFrame = false; // 关闭这个属性，否则在曲线图双击添加点时，会自动添加点(PathPoint)，使点数量与maxKeyFrame一致
        input.isWeight = true; // 控制点可任意拖动

        // 侦听曲线图（CurveInput）被修改
        input.on("submit", this.onSubmit, this);

        this._input = input;
        return { ui: input };
    }

    public override refresh(): void {
        console.log("refresh();");

        // 当字段为空时，创建一个默认实例
        if (!this.target.getValue()) {
            this.createDefaultInstance();
        }

        // 设置值到曲线图（CurveInput）
        const value = this.target.getValue();
        const valueKeys: any[] = value.keys;
        this._input.clearPoints(); // 先清空，避免顶点数量比实际数量多
        for (let i = 0, c = valueKeys.length; i < c; i++) {
            const key = valueKeys[i];

            if (i >= this._input.points.length) {
                this._input.addPoint();
            }
            const pt: IEditor.PathPoint = this._input.points[i];
            pt.px = key.time;
            pt.py = key.value;
            pt.inTangent = key.inTangent;
            pt.outTangent = key.outTangent;
            pt.inWeight = key.inWeight;
            pt.outWeight = key.outWeight;
        }

        this._input.applyChange();
    }

    /** 创建默认实例 */
    private createDefaultInstance(): void {
        console.log("createDefaultInstance();");

        const typeDef: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const cubicBezierValues = [.25, .1, .25, 1]; // https://cubic-bezier.com/
        const initProp = Editor.typeRegistry.getInitProps(typeDef) || {};
        initProp._$type = typeDef.name;
        initProp.keys = [
            this.createFloatKeyframe({
                time: 0,
                value: 0,
                inTangent: 0,
                inWeight: 0,
                outTangent: cubicBezierValues[1] / cubicBezierValues[0],
                outWeight: cubicBezierValues[0]
            }),
            this.createFloatKeyframe({
                time: 1,
                value: 1,
                inTangent: (1 - cubicBezierValues[3]) / (1 - cubicBezierValues[2]),
                inWeight: 1 - cubicBezierValues[2],
                outTangent: 0,
                outWeight: 0
            }),
        ];

        // initProp.keys = [
        //     this.createFloatKeyframe({ time: 0, value: 0, inTangent: 0, inWeight: 0.33333, outTangent: 0, outWeight: 0.33333 }),
        //     this.createFloatKeyframe({ time: 1, value: 1, inTangent: 0, inWeight: 0.33333, outTangent: 0, outWeight: 0.33333 }),
        // ];

        this.parent.target.setPropertyValue(this.property.name, initProp);
    }

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

    /** 曲线图（CurveInput）被修改时 */
    private onSubmit(evt: gui.Event): void {
        console.log("onSubmit();");

        // 设置曲线图（CurveInput）的值到目标
        const value = this.target.getValue();
        const valueKeys: any[] = value.keys;
        for (let i = 0, c = this._input.points.length; i < c; i++) {
            const pt: IEditor.PathPoint = this._input.points[i];
            if (i >= valueKeys.length) {
                valueKeys.push(this.createFloatKeyframe({ time: 0, value: 0, inTangent: 0, inWeight: 0, outTangent: 0, outWeight: 0 }));
            }
            const key = valueKeys[i];
            key.time = pt.px;
            key.value = pt.py;
            key.inTangent = pt.inTangent;
            key.outTangent = pt.outTangent;
            key.inWeight = pt.inWeight;
            key.outWeight = pt.outWeight;
        }

        if (valueKeys.length > this._input.points.length) {
            valueKeys.length = this._input.points.length; // 删除多出的点
        }

        this.target.setValue(value);
    }


}