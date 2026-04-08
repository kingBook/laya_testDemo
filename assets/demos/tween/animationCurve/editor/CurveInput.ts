import AnimationCurveEditorUtil from "./AnimationCurveEditorUtil";
import { CurveEditDialog, EVENT_SUBMIT } from "./CurveEditDialog";
import { FloatKey } from "./FloatKey";

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
    private _keys: FloatKey[];
    /** 曲线编辑窗口 */
    private _curveEditDialog: CurveEditDialog;

    /** 关键帧点数组 */
    public get keys(): FloatKey[] {
        return this._keys;
    }

    constructor() {
        super();
        console.log("CurveInput::constructor();");

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
        const k0 = new FloatKey();
        k0.time = 0;
        k0.value = 0;
        const k1 = new FloatKey();
        k1.time = 1;
        k1.value = 1;
        this._keys = [k0, k1];

        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();

        // 点击事件侦听
        this.on("click", (e: gui.Event) => {
            // 显示曲线编辑窗口
            Editor.showDialog(CurveEditDialog, null, this).then(curveEditDialog => {
                this._curveEditDialog = curveEditDialog;
                // 侦听曲线编辑窗口修改提交
                this._curveEditDialog.contentPane.on(EVENT_SUBMIT, this.onCurveEditDialogSubmit, this);
            });
        });

        // 大小改变事件
        this.on("size_changed", (e: gui.Event) => {
            this.syncSize();
            this.redrawSVG();
        });
    }

    /** 曲线编辑窗口修改提交事件回调 */
    private onCurveEditDialogSubmit(e: gui.Event): void {
        console.log("onCurveEditDialogSubmit();");

        // 修改提交事件
        this.emit(CurveInput.EVENT_SUBMIT);

        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();
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
                x = AnimationCurveEditorUtil.mapX(x, this._svg);
                y = AnimationCurveEditorUtil.mapY(y, this._svg);

                d += `M ${x} ${y}`;
            } else {
                const prevKey = this._keys[i - 1];
                // 控制点1
                const c1 = AnimationCurveEditorUtil.outKeyToControlPoint(prevKey);
                // 控制点2
                const c2 = AnimationCurveEditorUtil.inKeyToControlPoint(k);
                // 终点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                c1.x = AnimationCurveEditorUtil.mapX(c1.x, this._svg);
                c1.y = AnimationCurveEditorUtil.mapY(c1.y, this._svg);
                c2.x = AnimationCurveEditorUtil.mapX(c2.x, this._svg);
                c2.y = AnimationCurveEditorUtil.mapY(c2.y, this._svg);
                x = AnimationCurveEditorUtil.mapX(x, this._svg);
                y = AnimationCurveEditorUtil.mapY(y, this._svg);

                // C 控制点1, 控制点2, 终点
                d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x} ${y}`;
            }
        });
        //console.log("d:", d);

        this._path.setAttribute('d', d); // M 起点 C 控制点1 控制点2 终点
    }

    /** 清空所有关键帧点 */
    public clearKeys(): void {
        this._keys.length = 0;
    }

    /** 添加一个关键帧点 */
    public addKey(): void {
        this._keys.push(new FloatKey());
    }

    /** 应用修改 */
    public applyChange(): void {
        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();

        if (this._curveEditDialog) {
            this._curveEditDialog.applyChange();
        }
    }

}