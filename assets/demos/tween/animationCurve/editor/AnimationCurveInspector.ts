@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private readonly _defaultCubicBezierValues = [.25, .1, .25, 1]; // https://cubic-bezier.com/

    private _curveInput: IEditor.CurveInput;
    private _easeInputTxt: IEditor.TextInput;
    private _easeComboBox: gui.ComboBox;

    public override create(): IEditor.IPropertyFieldCreateResult {
        console.log("create();");

        // 创建曲线图（CurveInput）
        const curveInput: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        curveInput.setDefaultPoints();
        curveInput.isCurve = true;
        curveInput.isNormalization = true;
        curveInput.maxKeyFrame = 10; // 默认: 4
        curveInput.minValue = 0;
        curveInput.maxValue = 1;
        curveInput.isAutoFillKeyFrame = false; // 关闭这个属性，否则在曲线图双击添加点时，会自动添加点(PathPoint)，使点数量与maxKeyFrame一致
        curveInput.isWeight = true; // 控制点可任意拖动

        // 侦听曲线图（CurveInput）被修改
        curveInput.on("submit", this.onSubmit, this);

        this._curveInput = curveInput;

        //
        // =================== 创建 cubic-bezier.com 数据设置栏 ===================
        //
        // curveInput 子对象
        const n5 = curveInput.getChild("n5");
        const n1 = curveInput.getChild("n1");
        const canvas = curveInput.getChild("canvas");

        // 调整 curveInput 子对象的对齐策略，取消高度拉伸
        n5.removeRelation(curveInput, gui.RelationType.Height);
        n1.removeRelation(curveInput, gui.RelationType.Height);
        canvas.removeRelation(curveInput, gui.RelationType.Height);

        // 间隔
        const space = 5;
        // 高
        const txtBoxH = 19;

        // 加高最顶层容器
        curveInput.height += txtBoxH + space * 2;

        // 创建一个子容器放输入文本框、下拉列表、url 
        const easeBox = new gui.Box();
        easeBox.x = canvas.x;
        easeBox.y = n5.height + space;
        easeBox.width = canvas.width;
        easeBox.height = txtBoxH;
        easeBox.layout.type = gui.LayoutType.SingleRow;
        easeBox.layout.columnGap = space;
        easeBox.layout.stretchX = gui.StretchMode.Stretch;
        easeBox.layout.stretchY = gui.StretchMode.Stretch;
        const stretchParams0 = new gui.StretchParam();
        const stretchParams1 = new gui.StretchParam();
        const stretchParams2 = new gui.StretchParam();
        stretchParams0.setRatio(0.4);
        stretchParams1.setRatio(0.4);
        stretchParams2.setRatio(0.2);
        stretchParams1.max = 90;
        stretchParams2.max = 50;
        easeBox.layout.stretchParamsX.push(stretchParams0, stretchParams1, stretchParams2);
        easeBox.addRelation(curveInput, gui.RelationType.Width);
        curveInput.addChild(easeBox);

        // 输入文本框
        const easeInputTxt = IEditor.GUIUtils.createTextInput();
        easeInputTxt.text = ".25, .1, .25, 1";
        easeBox.addChild(easeInputTxt);
        this._easeInputTxt = easeInputTxt;

        // 下拉列表
        const easeComboBox = IEditor.GUIUtils.createComboBox();
        easeComboBox.x = easeInputTxt.x + easeInputTxt.width + space;
        easeComboBox.items = ["ease", "linear", "ease-in", "ease-out", "ease-in-out"];
        easeBox.addChild(easeComboBox);
        this._easeComboBox = easeComboBox;

        // cubic-bezier.com 链接文本
        const toPageTxt = new gui.TextField();
        toPageTxt.x = easeComboBox.x + easeComboBox.width + space;
        toPageTxt.color = easeInputTxt.titleColor;
        toPageTxt.style.fontSize = easeInputTxt.titleFontSize;
        toPageTxt.style.align = gui.AlignType.Left;
        toPageTxt.style.underline = true;
        toPageTxt.text = "To Page";
        toPageTxt.onClick((evt: gui.Event) => {
            IEditor.utils.openBrowser("https://cubic-bezier.com/");
        }, this);
        easeBox.addChild(toPageTxt);

        return { ui: curveInput };
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
        this._curveInput.clearPoints(); // 先清空，避免顶点数量比实际数量多
        for (let i = 0, c = valueKeys.length; i < c; i++) {
            const key = valueKeys[i];

            if (i >= this._curveInput.points.length) {
                this._curveInput.addPoint();
            }
            const pt: IEditor.PathPoint = this._curveInput.points[i];
            pt.px = key.time;
            pt.py = key.value;
            pt.inTangent = key.inTangent;
            pt.outTangent = key.outTangent;
            pt.inWeight = key.inWeight;
            pt.outWeight = key.outWeight;
        }

        this._curveInput.applyChange();
    }

    /** 创建默认实例 */
    private createDefaultInstance(): void {
        console.log("createDefaultInstance();");

        const typeDescriptor: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const initProp = Editor.typeRegistry.getInitProps(typeDescriptor) || {};
        initProp._$type = typeDescriptor.name;
        initProp.keys = [
            this.createFloatKeyframe({
                time: 0,
                value: 0,
                inTangent: 0,
                inWeight: 0,
                outTangent: this._defaultCubicBezierValues[1] / this._defaultCubicBezierValues[0],
                outWeight: this._defaultCubicBezierValues[0]
            }),
            this.createFloatKeyframe({
                time: 1,
                value: 1,
                inTangent: (1 - this._defaultCubicBezierValues[3]) / (1 - this._defaultCubicBezierValues[2]),
                inWeight: 1 - this._defaultCubicBezierValues[2],
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
        for (let i = 0, c = this._curveInput.points.length; i < c; i++) {
            const pt: IEditor.PathPoint = this._curveInput.points[i];
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

        if (valueKeys.length > this._curveInput.points.length) {
            valueKeys.length = this._curveInput.points.length; // 删除多出的点
        }

        this.target.setValue(value);
    }


}