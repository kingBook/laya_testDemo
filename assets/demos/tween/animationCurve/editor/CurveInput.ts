import { CurveEditDialog } from "./CurveEditDialog";
import { FloatKeyFrame } from "./FloatKeyFrame";

/**
 * 
 * @event {@link EVENT_SUBMIT} 修改后的提交事件, 事件由 {@link this} 派发，回调函数格式: `(): void`
 */
export class CurveInput extends gui.Widget {

    /** 修改后的提交事件, 事件由 {@link this} 派发，回调函数格式: `(): void` */
    public static readonly EVENT_SUBMIT = "eventSubmit";

    private _canvas: gui.Shape;
    private _svg: SVGSVGElement;
    /** svg 路径节点 */
    private _path: SVGPathElement;
    /** 关键帧点数组 */
    private _keys: FloatKeyFrame[];

    /** 关键帧点数组 */
    public get keys(): readonly FloatKeyFrame[] {
        return this._keys;
    }

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

        // 创建 Path 节点（曲线）
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#00ff00");
        path.setAttribute("stroke-width", "1");
        this._path = path;
        this._svg.appendChild(path);

        // 默认点
        const k0 = new FloatKeyFrame();
        k0.time = 0;
        k0.value = 0;
        const k1 = new FloatKeyFrame();
        k1.time = 1;
        k1.value = 1;
        this._keys = [k0, k1];

        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();

        // 点击事件侦听
        this.on("click", (e: gui.Event) => {
            Editor.showDialog(CurveEditDialog, null, this._keys); // 显示曲线编辑窗口
        });

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
        let d = "";
        this._keys.forEach((k, i) => {
            if (i === 0) {
                // 起点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                x = this.mapX(x);
                y = this.mapY(y);

                d += `M ${x} ${y}`;
            } else {
                const prevKey = this._keys[i - 1];
                // 控制点1
                let c1x = prevKey.outWeight; // outWeight = c1.x
                let c1y = prevKey.outTangent * prevKey.outWeight; // outTangent = c1.y / c1.x
                // 控制点2
                let c2x = -k.inWeight + 1; // inWeight = 1 - c2.x
                let c2y = -(k.inTangent * k.inWeight) + 1; // inTangent = (1 - c2.y) / (1 - c2.x)
                // 终点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                c1x = this.mapX(c1x);
                c1y = this.mapY(c1y);
                c2x = this.mapX(c2x);
                c2y = this.mapY(c2y);
                x = this.mapX(x);
                y = this.mapY(y);

                // C 控制点1, 控制点2, 终点
                d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y}`;
            }
        });

        console.log("d:", d);

        this._path.setAttribute('d', d); // M 起点 C 控制点1 控制点2 终点
    }

    /** x坐标映射函数 */
    private mapX(px: number): number {
        return px * Number(this._svg.getAttribute("width"));
    }

    /** y坐标映射函数 */
    private mapY(py: number): number {
        return (1 - py) * Number(this._svg.getAttribute("height"));
    }

    /** 清空所有关键帧点 */
    public clearKeys(): void {
        this._keys.length = 0;
    }

    /** 添加一个关键帧点 */
    public addKey(): void {
        this._keys.push(new FloatKeyFrame());
    }

    /** 应用修改 */
    public applyChange(): void {
        this.emit(CurveInput.EVENT_SUBMIT);
    }

}