const svgNS = "http://www.w3.org/2000/svg";

export class CurveEditDialog extends IEditor.Dialog {

    /** 对话框画布大小 */
    public static readonly dialogCanvasSize = { width: 350, height: 350 };
    /** 对话框顶部空白大小 */
    public static readonly dialogTopSpace = 20;
    /** 顶边距 */
    public static readonly marginTop = 50;
    /** 底边距 */
    public static readonly marginBottom = 50;
    /** 左边距 */
    public static readonly marginLeft = 50;
    /** 右边距 */
    public static readonly marginRight = 50;

    private _curveCanvas: CurveCanvas;
    private _target:IEditor.IInspectingTarget;

    async create() {
        const panel = new gui.Widget();
        const w = CurveEditDialog.dialogCanvasSize.width + CurveEditDialog.marginLeft + CurveEditDialog.marginRight;
        const h = CurveEditDialog.dialogCanvasSize.height + CurveEditDialog.dialogTopSpace + CurveEditDialog.marginTop + CurveEditDialog.marginBottom;
        panel.setSize(w, h);

        const comboBox = await gui.UIPackage.createWidget<gui.ComboBox>("~/ui/basic/ComboBox/ComboBox.widget");
        panel.addChild(comboBox);

        this._curveCanvas = new CurveCanvas(panel);

        this.contentPane = panel;
        this.title = "CurveEdit";
        this.resizable = false;

    }

    protected onShown(...args: any[]): void {
        this._target = args[0];
        
        console.log("target:",this._target);
        
        this._curveCanvas.keyPoints.forEach(key => {
            key.addListeners(this._groot);
        });
    }

    protected onHide(): void {
        // this._curveCanvas.onDestroy();
        this._curveCanvas.keyPoints.forEach(key => {
            key.removeListeners(this._groot);
        });
    }

    protected onAction(): void {

    }

    // protected handleKeyEvent(evt: gui.Event): void {
    //     console.log("handleKeyEvent:", evt);
    // }




}


class CurveCanvas {

    public readonly keyPoints: KeyPoint[] = [];

    constructor(parent: gui.Widget) {
        // canvas
        const canvas = new gui.Shape();
        canvas.x = CurveEditDialog.marginLeft;
        canvas.y = CurveEditDialog.dialogTopSpace + CurveEditDialog.marginTop;
        canvas.width = CurveEditDialog.dialogCanvasSize.width;
        canvas.height = CurveEditDialog.dialogCanvasSize.height;
        canvas.drawRect(0, gui.Color.BLACK, new gui.Color("#434343")); // 不要设置轮廓线宽，会导致位置偏差
        parent.addChild(canvas);

        // bg
        // const bg = new gui.Shape();
        // bg.x = CurveEditDialog.margin;
        // bg.y = CurveEditDialog.margin;
        // bg.width = canvas.width - CurveEditDialog.margin * 2;
        // bg.height = canvas.height - CurveEditDialog.margin * 2;
        // bg.drawRect(1, gui.Color.BLACK, new gui.Color("#434343"));
        // canvas.addChild(bg);

        // svg
        const svg = document.createElementNS(svgNS, "svg") as SVGSVGElement;
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("x", "0");
        svg.setAttribute("y", "0");
        svg.setAttribute("width", CurveEditDialog.dialogCanvasSize.width.toString());
        svg.setAttribute("height", CurveEditDialog.dialogCanvasSize.height.toString());
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.right = "0";
        svg.style.top = "0";
        svg.style.bottom = "0";
        svg.style.pointerEvents = "auto";
        svg.setAttribute("overflow", "visible"); // 溢出时显示

        canvas.element.appendChild(svg);

        // 创建 KeyPoint
        const keyPoint = new KeyPoint(svg, 0, 0);
        this.keyPoints.push(keyPoint);

    }


    // public onDestroy(): void {

    // }
}

class KeyPoint {

    private readonly size = 10;
    private readonly controlPoints: ControlPoint[] = [];

    private _group: SVGGElement;
    private _svg: SVGSVGElement;
    private _dragging: boolean;
    private _tempSvgPoint: SVGPoint;
    private _time: number;
    private _value: number;

    constructor(svg: SVGSVGElement, time: number, value: number) {
        this._svg = svg;
        this._time = time;
        this._value = value;

        // 矩形，旋转 45 度
        const rect = document.createElementNS(svgNS, "rect");
        const rx = -this.size / 2;
        const ry = -this.size / 2;
        rect.setAttribute("x", rx.toString());
        rect.setAttribute("y", ry.toString());
        rect.setAttribute("width", this.size.toString());
        rect.setAttribute("height", this.size.toString());
        rect.setAttribute("fill", "#ff0000");
        rect.setAttribute("stroke", "#ffffff");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("transform", `rotate(45 ${0} ${0})`); // 旋转 45 度

        // 矩形容器
        const group = document.createElementNS(svgNS, "g");
        const initX = 0;
        const initY = 0;
        group.setAttribute("transform", `translate(${initX} ${initY})`);
        group.appendChild(rect);
        svg.appendChild(group);
        this._group = group;

        // 临时 DOMPoint
        this._tempSvgPoint ||= this._svg.createSVGPoint();
    }

    /** 鼠标侦听 */
    public addListeners(groot: gui.GRoot): void {
        groot.on("pointer_down", this.onPointerDown, this);
        groot.on("pointer_move", this.onPointerMove, this);
        groot.on("pointer_up", this.onPointerUp, this);
    }

    public removeListeners(groot: gui.GRoot): void {
        groot.offAll("pointer_down");
        groot.offAll("pointer_move");
        groot.offAll("pointer_up");
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {
        this._tempSvgPoint.x = e.input.x;
        this._tempSvgPoint.y = e.input.y;

        // 鼠标位置转到 svg 局部坐标
        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());
        console.log(mousePoint.x, mousePoint.y);

        // 矩形与鼠标距离
        const groupMatrix = this._group.getCTM();
        const dx = mousePoint.x - groupMatrix.e;
        const dy = mousePoint.y - groupMatrix.f;
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log("distance:", distance);

        // 小于一定距离，表示点击到了矩形，开始拖动
        if (distance < this.size) {
            this._dragging = true;
        }
    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        if (!this._dragging) return;

        this._tempSvgPoint.x = e.input.x;
        this._tempSvgPoint.y = e.input.y;

        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());

        // 新位置
        let newX = mousePoint.x;
        let newY = mousePoint.y;

        // 新位置，限制在 svg 矩形框内
        const xmax = parseFloat(this._svg.getAttribute("width"));
        const ymax = parseFloat(this._svg.getAttribute("height"));
        newX = Math.min(Math.max(newX, 0), xmax);
        newY = Math.min(Math.max(newY, 0), ymax);

        // 赋值
        this._group.setAttribute('transform', `translate(${newX} ${newY})`);
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        this._dragging = false;
    }

    // public onDestroy(): void {

    // }
}

class ControlPoint {

    private readonly size = 10;

    private _group: SVGGElement;
    private _svg: SVGSVGElement;
    private _dragging: boolean;
    private _tempSvgPoint: SVGPoint;

    constructor(svg: SVGSVGElement) {
        this._svg = svg;

        // 矩形，旋转 45 度
        const rect = document.createElementNS(svgNS, "rect");
        const rx = -this.size / 2;
        const ry = -this.size / 2;
        rect.setAttribute("x", rx.toString());
        rect.setAttribute("y", ry.toString());
        rect.setAttribute("width", this.size.toString());
        rect.setAttribute("height", this.size.toString());
        rect.setAttribute("fill", "#ffffff");
        rect.setAttribute("stroke", "#ffffff");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("transform", `rotate(45 ${0} ${0})`); // 旋转 45 度

        // 矩形容器
        const group = document.createElementNS(svgNS, "g");
        const initX = 0;
        const initY = 0;
        group.setAttribute("transform", `translate(${initX} ${initY})`);
        group.appendChild(rect);
        svg.appendChild(group);
        this._group = group;

        // 临时 DOMPoint
        this._tempSvgPoint ||= this._svg.createSVGPoint();
    }

    /** 鼠标侦听 */
    public addListeners(groot: gui.GRoot): void {
        groot.on("pointer_down", this.onPointerDown, this);
        groot.on("pointer_move", this.onPointerMove, this);
        groot.on("pointer_up", this.onPointerUp, this);
    }

    public removeListeners(groot: gui.GRoot): void {
        groot.offAll("pointer_down");
        groot.offAll("pointer_move");
        groot.offAll("pointer_up");
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {
        this._tempSvgPoint.x = e.input.x;
        this._tempSvgPoint.y = e.input.y;

        // 鼠标位置转到 svg 局部坐标
        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());
        console.log(mousePoint.x, mousePoint.y);

        // 矩形与鼠标距离
        const groupMatrix = this._group.getCTM();
        const dx = mousePoint.x - groupMatrix.e;
        const dy = mousePoint.y - groupMatrix.f;
        const distance = Math.sqrt(dx * dx + dy * dy);
        console.log("distance:", distance);

        // 小于一定距离，表示点击到了矩形，开始拖动
        if (distance < this.size) {
            this._dragging = true;
        }
    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        if (!this._dragging) return;

        this._tempSvgPoint.x = e.input.x;
        this._tempSvgPoint.y = e.input.y;

        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());

        // 新位置
        let newX = mousePoint.x;
        let newY = mousePoint.y;

        // 新位置，限制在 svg 矩形框内
        const xmax = parseFloat(this._svg.getAttribute("width"));
        const ymax = parseFloat(this._svg.getAttribute("height"));
        newX = Math.min(Math.max(newX, 0), xmax);
        newY = Math.min(Math.max(newY, 0), ymax);

        // 赋值
        this._group.setAttribute('transform', `translate(${newX} ${newY})`);
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        this._dragging = false;
    }

    // public onDestroy(): void {

    // }
}
