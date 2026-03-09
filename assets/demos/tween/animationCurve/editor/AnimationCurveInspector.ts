import { CurveEditDialog } from "./CurveEditDialog";

@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private readonly _easeComboBoxDatas = [
        { name: "ease", index: 0, values: [.25, .1, .25, 1] },
        { name: "linear", index: 1, values: [0, 0, 1, 1] },
        { name: "ease-in", index: 2, values: [.42, 0, 1, 1] },
        { name: "ease-out", index: 3, values: [0, 0, .58, 1] },
        { name: "ease-in-out", index: 4, values: [.42, 0, .58, 1] },
        { name: "custom", index: 5, values: null }
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
        

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        svg.setAttribute("xmlns", svgNS);
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.pointerEvents = "none";

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
        canvas.element.appendChild(svg as any);

        function mapX(px: number) { return px * Number(svg.getAttribute("width")); }
        function mapY(py: number) { return (1 - py) * Number(svg.getAttribute("height")); }

        const pathEl = document.createElementNS(svgNS, "path");
        pathEl.setAttribute("fill", "none");
        pathEl.setAttribute("stroke", "#00ff00");
        pathEl.setAttribute("stroke-width", "1");
        svg.appendChild(pathEl);

        const c1 = { x: 0.42, y: 0.0 };
        const c2 = { x: 0.58, y: 1.0 };

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

        (this._curveInput as any)._redrawOverlay = () => { syncSize(); redrawSVG(); };
        redrawSVG();

        this._curveInput.on("click", (e: gui.Event) => {
            Editor.showDialog(CurveEditDialog, null, this.target);
        });

        this._curveInput.on("size_changed", (e: gui.Event) => {
            (this._curveInput as any)._redrawOverlay();
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
        // 当字段为空时，创建一个默认实例
        if (!this.target.getValue()) {
            //this.createDefaultInstance();
        }

    }



















}