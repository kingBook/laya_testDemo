import { CurveEditDialog } from "./CurveEditDialog";

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

    private _curveInput: gui.Widget;

    // @IEditor.onLoad
    // static async onLoad(){
    //     await gui.UIPackage.resourceMgr.load("~/ui/basic/CurveEdit/CurveInput.widget");
    // }


    public override create(): IEditor.IPropertyFieldCreateResult {
        console.log("create();");
        this._curveInput = this.createCurveInput();

        const canvas = this._curveInput.getChild("canvas");

        // 创建 svg 节点
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        svg.setAttribute("xmlns", svgNS);
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.pointerEvents = "none";
        canvas.element.appendChild(svg as any);

        // 同步大小
        function syncSize() {
            const w = canvas.width;
            const h = canvas.height;
            svg.setAttribute("width", `${w}`);
            svg.setAttribute("height", `${h}`);
            svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
            svg.style.width = `${w}px`;
            svg.style.height = `${h}px`;
        }
        syncSize();

        // 坐标映射函数
        function mapX(px: number) { return px * Number(svg.getAttribute("width")); }
        function mapY(py: number) { return (1 - py) * Number(svg.getAttribute("height")); }

        // 创建 Path 节点（曲线）
        const pathEl = document.createElementNS(svgNS, "path");
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke", "#00ff00");
        pathEl.setAttribute("stroke-width", "1");
        svg.appendChild(pathEl);

        // 控制点
        const c1 = { x: 0.42, y: 0.0 };
        const c2 = { x: 0.58, y: 1.0 };

        // 重画
        function redrawSVG() {
            const w = Number(svg.getAttribute("width"));
            const h = Number(svg.getAttribute("height"));
            if (!w || !h) return;
            const x0 = mapX(0), y0 = mapY(0);
            const x1 = mapX(c1.x), y1 = mapY(c1.y);
            const x2 = mapX(c2.x), y2 = mapY(c2.y);
            const x3 = mapX(1), y3 = mapY(1);
            const d = `M ${x0} ${y0} C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
            pathEl.setAttribute("d", d);
        }
        redrawSVG();

        // 同步大小、重新画全并为一个方法，动态属性 _redrawOverlay
        (this._curveInput as any)._redrawOverlay = () => { syncSize(); redrawSVG(); };

        // 点击事件侦听
        this._curveInput.on("click", (e: gui.Event) => {
            Editor.showDialog(CurveEditDialog, null, this.target); // 显示曲线编辑窗口
        });

        // 大小改变事件
        this._curveInput.on("size_changed", (e: gui.Event) => {
            (this._curveInput as any)._redrawOverlay(); // 同步大小、重新画
        });

        return { ui: this._curveInput };
    }

    private createCurveInput(): gui.Widget {
        // canvas
        const w = 87, h = 17;
        const canvas = new gui.Shape();
        canvas.name = "canvas";
        canvas.width = w;
        canvas.height = h;
        canvas.x = 3;
        canvas.y = 3;
        canvas.drawRect(0, gui.Color.BLACK, new gui.Color("#666666"));

        // bg
        const bgW = 93, bgH = 23;
        const bg = new gui.Image();
        bg.name = "bg";
        bg.src = "~/ui/images/input_bg.png";
        bg.width = bgW;
        bg.height = bgH;

        // curveInput
        const curveInput = new gui.Widget();
        curveInput.width = bgW;
        curveInput.height = bgH;

        // 显示
        curveInput.addChild(bg);
        curveInput.addChild(canvas);

        // 适配
        canvas.addRelation(curveInput, gui.RelationType.Size);
        bg.addRelation(curveInput, gui.RelationType.Size);

        return curveInput;
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
    private cubicBezierValuesToKeys(values: number[]) {
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