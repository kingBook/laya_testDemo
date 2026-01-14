@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private readonly _easeComboBoxDatas = [
        // 0 "ease"
        [.25, .1, .25, 1],
        // 1 "linear"
        [0, 0, 1, 1],
        // 2 "ease-in"
        [.42, 0, 1, 1],
        // 3 "ease-out"
        [0, 0, .58, 1],
        // 4 "ease-in-out"
        [.42, 0, .58, 1],
        // 5 "custom"
    ];

    private _curveInput: IEditor.CurveInput;
    private _easeInputTxt: IEditor.TextInput;
    private _easeComboBox: gui.ComboBox;
    private _oldEaseInputText: string;

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

        // 侦听曲线对话框提交数据
        curveInput.on("submit", this.onCurveEditDialogSubmit, this);

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
        const easeBoxH = 19;

        // 加高最顶层容器
        curveInput.height += easeBoxH + space * 2;

        // 创建一个水平布局的子容器
        const easeBox = new gui.Box();
        easeBox.x = canvas.x;
        easeBox.y = n5.height + space;
        easeBox.width = canvas.width;
        easeBox.height = easeBoxH;
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
        easeInputTxt.text = this._easeComboBoxDatas[0].toString();
        easeInputTxt.on("submit", this.onEaseInputSubmit, this);
        easeBox.addChild(easeInputTxt);
        this._easeInputTxt = easeInputTxt;
        this._oldEaseInputText = this._easeInputTxt.text;

        // 下拉列表
        const easeComboBox = IEditor.GUIUtils.createComboBox();
        easeComboBox.x = easeInputTxt.x + easeInputTxt.width + space;
        easeComboBox.items = ["ease", "linear", "ease-in", "ease-out", "ease-in-out", "custom"];
        easeComboBox.on("changed", (evt: gui.Event) => {
            console.log("下拉列表改变:", easeComboBox.selectedIndex);
            // if (easeComboBox.selectedIndex >= 0 && easeComboBox.selectedIndex <= 4) {
            //     this._easeInputTxt.text = this._easeComboBoxDatas[easeComboBox.selectedIndex].toString();
            // }
            // this.onEaseInputSubmit(null);
        }, this);
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
        const keys: any[] = value.keys;
        this._curveInput.clearPoints(); // 先清空，避免顶点数量比实际数量多
        for (let i = 0, c = keys.length; i < c; i++) {
            const key = keys[i];

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


        // 设置值到 cubic-bezier.com 数据输入框
        if (keys.length === 2) {
            const key0 = keys[0];
            const key1 = keys[1];
            const p1x: number = key0.outWeight; // outWeight: cubicBezierValues[0]
            const p1y: number = key0.outTangent * key0.outWeight; // outTangent: cubicBezierValues[1] / cubicBezierValues[0]
            const p2x: number = -key1.inWeight + 1; // inWeight: 1 - cubicBezierValues[2]
            const p2y: number = -(key1.inTangent * key1.inWeight) + 1; // inTangent: (1 - cubicBezierValues[3]) / (1 - cubicBezierValues[2])
            const p1xStr: string = this.getFloatString(p1x);
            const p1yStr: string = this.getFloatString(p1y);
            const p2xStr: string = this.getFloatString(p2x);
            const p2yStr: string = this.getFloatString(p2y);
            this._easeInputTxt.text = [p1xStr, p1yStr, p2xStr, p2yStr].toString();
            this._oldEaseInputText = this._easeInputTxt.text;
            this._easeInputTxt.editable = true;
            this._easeInputTxt.alpha = 1;
        } else {
            this._easeInputTxt.text = "vertices is not 2";
            this._easeInputTxt.editable = false;
            this._easeInputTxt.alpha = 0.7;
        }
    }

    /** 创建默认实例 */
    private createDefaultInstance(): void {
        console.log("createDefaultInstance();");
        const typeDescriptor: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        // 默认值
        const initProp = Editor.typeRegistry.getInitProps(typeDescriptor) || {};
        initProp._$type = typeDescriptor.name;
        const defaultCubicBezierValues = this._easeComboBoxDatas[0];
        initProp.keys = [
            this.createFloatKeyframe({
                time: 0,
                value: 0,
                inTangent: 0,
                inWeight: 0,
                outTangent: defaultCubicBezierValues[1] / defaultCubicBezierValues[0],
                outWeight: defaultCubicBezierValues[0]
            }),
            this.createFloatKeyframe({
                time: 1,
                value: 1,
                inTangent: (1 - defaultCubicBezierValues[3]) / (1 - defaultCubicBezierValues[2]),
                inWeight: 1 - defaultCubicBezierValues[2],
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

    /** 曲线编辑窗口提交数据 */
    private onCurveEditDialogSubmit(evt: gui.Event): void {
        console.log("onCurveEditDialogSubmit();");

        // 设置值到目标
        const value = this.target.getValue();
        const keys: any[] = value.keys;

        for (let i = 0, c = this._curveInput.points.length; i < c; i++) {
            const pt: IEditor.PathPoint = this._curveInput.points[i];
            if (i >= keys.length) {
                keys.push(this.createFloatKeyframe({ time: 0, value: 0, inTangent: 0, inWeight: 0, outTangent: 0, outWeight: 0 }));
            }
            const key = keys[i];
            key.time = pt.px;
            key.value = pt.py;
            key.inTangent = pt.inTangent;
            key.outTangent = pt.outTangent;
            key.inWeight = pt.inWeight;
            key.outWeight = pt.outWeight;
        }

        if (keys.length > this._curveInput.points.length) {
            keys.length = this._curveInput.points.length; // 删除多出的点
        }

        this.target.setValue(value);
    }

    /** cubic-bezier.com 数据输入框提交数据 */
    private onEaseInputSubmit(evt?: gui.Event): void {
        console.log("onEaseInputSubmit();", this._easeInputTxt.text);

        let values: number[];
        let isRight = true;
        const strings = this._easeInputTxt.text.split(',');

        // 判断格式是否输入正确
        if (strings.length === 4) {
            values = strings.map(str => Number.parseFloat(str));
            for (let i = 0; i < 4; i++) {
                const val = values[i];
                if (isNaN(val) || val < 0 || val > 1) {
                    isRight = false;
                    break;
                }
            }
        } else {
            isRight = false;
        }

        if (isRight) {
            this._oldEaseInputText = this._easeInputTxt.text;

            // 设置值到目标
            const value = this.target.getValue();
            const keys: any[] = value.keys;
            const key0 = keys[0];
            const key1 = keys[1];
            key0.outTangent = values[1] / values[0];
            key0.outWeight = values[0];
            key1.inTangent = (1 - values[3]) / (1 - values[2]);
            key1.inWeight = 1 - values[2];

            //if (values[0] === 0) key0.outTangent = 0;
           // if ((1 - values[2]) === 0) key1.inTangent = 0;

            console.log("key0.outTangent:", key0.outTangent, " key0.outWeight:", key0.outWeight, " key1.inTangent:", key1.inTangent, " key1.inWeight:", key1.inWeight);

            if (keys.length > this._curveInput.points.length) {
                keys.length = this._curveInput.points.length; // 删除多出的点
            }

            this.target.setValue(value);
        } else {
            this._easeInputTxt.text = this._oldEaseInputText;
            Editor.alert("输入错误");
        }
    }

    /** 获取浮点数字符串 */
    private getFloatString(n: number): string {
        n = ((n * 100) | 0) / 100;
        return n.toString().replace("0.", '.');
    }


}