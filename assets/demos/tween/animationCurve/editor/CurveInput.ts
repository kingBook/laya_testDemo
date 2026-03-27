import { CurveEditDialog } from "./CurveEditDialog";

export default class CurveInput extends gui.Widget {

    private _canvas: gui.Shape;
    private _svg: SVGSVGElement;
    private _path: SVGPathElement;
    public c1: { x: number, y: number } = { x: 0.42, y: 0.0 };
    public c2: { x: number, y: number } = { x: 0.58, y: 1.0 };

    constructor() {
        super();

        // 画布
        const w = 87, h = 17;
        const canvas = new gui.Shape();
        canvas.name = "canvas";
        canvas.width = w;
        canvas.height = h;
        canvas.x = 3;
        canvas.y = 3;
        canvas.drawRect(0, gui.Color.BLACK, new gui.Color("#666666"));
        this._canvas = canvas;

        // 背景
        const bgW = 93, bgH = 23;
        const bg = new gui.Image();
        bg.name = "bg";
        bg.src = "~/ui/images/input_bg.png";
        bg.width = bgW;
        bg.height = bgH;

        // 宽高
        this.width = bgW;
        this.height = bgH;

        // 显示
        this.addChild(bg);
        this.addChild(canvas);

        // 适配
        canvas.addRelation(this, gui.RelationType.Size);
        bg.addRelation(this, gui.RelationType.Size);

        // 创建 svg 节点
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        svg.setAttribute("xmlns", svgNS);
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.top = "0";
        svg.style.pointerEvents = "none";
        this._svg = svg;
        this._canvas.element.appendChild(svg as any);

        // 同步大小
        this.syncSize();

        // 创建 Path 节点（曲线）
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#00ff00");
        path.setAttribute("stroke-width", "1");
        this._path = path;
        this._svg.appendChild(path);

        // 
        this.redrawSVG();

        // // 点击事件侦听
        // this.on("click", (e: gui.Event) => {
        //     Editor.showDialog(CurveEditDialog, null, this.target); // 显示曲线编辑窗口
        // });

        // 大小改变事件
        this.on("size_changed", (e: gui.Event) => {
            this.syncSize();
            this.redrawSVG();
        });
    }

    /** 同步大小 */
    private syncSize(): void {
        const w = this._canvas.width;
        const h = this._canvas.height;
        this._svg.setAttribute("width", `${w}`);
        this._svg.setAttribute("height", `${h}`);
        this._svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        this._svg.style.width = `${w}px`;
        this._svg.style.height = `${h}px`;
    }

    /** 重画SVG */
    private redrawSVG(): void {
        const w = Number(this._svg.getAttribute("width"));
        const h = Number(this._svg.getAttribute("height"));
        if (!w || !h) return;
        const x0 = this.mapX(0), y0 = this.mapY(0);
        const x1 = this.mapX(this.c1.x), y1 = this.mapY(this.c1.y);
        const x2 = this.mapX(this.c2.x), y2 = this.mapY(this.c2.y);
        const x3 = this.mapX(1), y3 = this.mapY(1);
        const d = `M ${x0} ${y0} C ${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`;
        this._path.setAttribute("d", d);
    }

    /** x坐标映射函数 */
    private mapX(px: number): number {
        return px * Number(this._svg.getAttribute("width"));
    }
    /** y坐标映射函数 */
    private mapY(py: number): number {
        return (1 - py) * Number(this._svg.getAttribute("height"));
    }

}