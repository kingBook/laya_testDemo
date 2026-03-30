import { FloatKeyFrame } from "./CurveInput";

/** svg 命名空间 URI */
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

    /** 曲线画布 */
    private _curveCanvas: CurveCanvas;
    /** 序列化的目标对象 */
    private _target: IEditor.IInspectingTarget;

    /** 序列化的目标对象 */
    public get target(): IEditor.IInspectingTarget { return this._target; }

    async create() {
        // 窗口
        const contentPane = new gui.Widget();
        const w = CurveEditDialog.dialogCanvasSize.width + CurveEditDialog.marginLeft + CurveEditDialog.marginRight;
        const h = CurveEditDialog.dialogCanvasSize.height + CurveEditDialog.dialogTopSpace + CurveEditDialog.marginTop + CurveEditDialog.marginBottom;
        contentPane.setSize(w, h);
        this.contentPane = contentPane;
        this.title = "CurveEdit"; // 窗口标题
        this.resizable = false; // 窗口大小，是否可调节

        // 下拉列表
        const comboBox = await gui.UIPackage.createWidget<gui.ComboBox>("~/ui/basic/ComboBox/ComboBox.widget");
        contentPane.addChild(comboBox);

        /** 曲线画布 */
        this._curveCanvas = new CurveCanvas(this);

    }

    /** 展示窗口 */
    protected onShown(...args: any[]): void {
        this._target = args[0];

        // 曲线画布 onShown
        this._curveCanvas.emit(CurveCanvas.EVENT_SHOWN, [this._groot]);
    }

    /** 隐藏窗口 */
    protected onHide(): void {
        // 曲线画布 onHide
        this._curveCanvas.emit(CurveCanvas.EVENT_HIDE);
    }

    protected onAction(): void {

    }

    // protected handleKeyEvent(evt: gui.Event): void {

    // }




}

/** 曲线画布 */
class CurveCanvas extends gui.EventDispatcher {

    /** 展示事件 */
    public static readonly EVENT_SHOWN = "eventShown";
    /** 隐藏事件 */
    public static readonly EVENT_HIDE = "eventHide";

    /** 曲线编辑对话框 */
    private _curveEditDialog: CurveEditDialog;
    /** 鼠标侦听的 GRoot */
    private _groot: gui.GRoot;
    /** svg 节点 */
    private _svg: SVGSVGElement;
    /** 临时 SVgPoint，用于储存位置信息，放便矩阵运算 */
    private _tempSvgPoint: SVGPoint;
    /** 曲线上的关键帧点 */
    private readonly _keyPoints: KeyPoint[] = [];

    constructor(curveEditDialog: CurveEditDialog) {
        super();

        // 曲线编辑对话框
        this._curveEditDialog = curveEditDialog;

        // 画布
        const canvas = new gui.Shape();
        canvas.x = CurveEditDialog.marginLeft;
        canvas.y = CurveEditDialog.dialogTopSpace + CurveEditDialog.marginTop;
        canvas.width = CurveEditDialog.dialogCanvasSize.width;
        canvas.height = CurveEditDialog.dialogCanvasSize.height;
        canvas.drawRect(0, gui.Color.BLACK, new gui.Color("#434343")); // 不要设置轮廓线宽，会导致位置偏差
        curveEditDialog.contentPane.addChild(canvas);

        // svg 节点
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
        svg.style.pointerEvents = "auto"; // 鼠标指针事件
        svg.setAttribute("overflow", "visible"); // 溢出时显示
        canvas.element.appendChild(svg);
        this._svg = svg;

        // 临时 DOMPoint
        this._tempSvgPoint ||= this._svg.createSVGPoint();


        // 侦听展示事件
        this.on(CurveCanvas.EVENT_SHOWN, (e: gui.Event) => {
            this.onShown(e.data[0]);
        });
        // 侦听隐藏事件
        this.on(CurveCanvas.EVENT_HIDE, (e: gui.Event) => {
            this.onHide();
        });
    }

    /** 展示窗口 */
    private onShown(groot: gui.GRoot): void {
        this._groot = groot;


        // 创建 KeyPoint
        const keys: any[] = this._curveEditDialog.target.getValue().keys;
        keys.forEach((key, index) => {
            const floatKey = <FloatKeyFrame>key;
            const keyPoint = new KeyPoint(this._groot, this._svg, floatKey);
            this._keyPoints.push(keyPoint);
        });

        // 添加鼠标侦听
        this.addListeners();
    }

    /** 隐藏窗口 */
    private onHide(): void {
        // 移除鼠标侦听
        this.removeListeners();
        // 销毁所有 KeyPoint
        this.destroyAllKeyPoints();
    }

    /** 添加鼠标侦听 */
    private addListeners(): void {
        this._groot.on("pointer_down", this.onPointerDown, this);
        this._groot.on("pointer_move", this.onPointerMove, this);
        this._groot.on("pointer_up", this.onPointerUp, this);
    }

    /** 移除鼠标侦听 */
    private removeListeners(): void {
        this._groot.off("pointer_down", this.onPointerDown, this);
        this._groot.off("pointer_move", this.onPointerMove, this);
        this._groot.off("pointer_up", this.onPointerUp, this);
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {
        let i = this._keyPoints.length;
        let hasSelected = false;
        while (--i >= 0) {
            const kpt = this._keyPoints[i];

            // 如果已经有已选关键帧点，其它设置成未选
            if (hasSelected) {
                kpt.isSelected = false;
                continue;
            }

            // 是否选中，鼠标按下触碰关键帧点及其控制点都视为选中
            const isTouchKeyPoint = kpt.containsPoint(e.input);
            const touchedControlPoint = kpt.controlPoints.find(cpt => cpt.visible && cpt.containsPoint(e.input));
            kpt.isSelected = Boolean(isTouchKeyPoint || touchedControlPoint);
            if (kpt.isSelected) {
                hasSelected = true;

                if (isTouchKeyPoint) { // 鼠标按下触碰关键帧点，则拖动关键帧点
                    kpt.startDrag();
                } else { // 鼠标按下触碰控制点，则拖动控制点
                    touchedControlPoint.startDrag();
                }
            }
        }
    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {

    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {

    }

    /** 销毁所有 KeyPoint */
    private destroyAllKeyPoints(): void {
        this._keyPoints.forEach(keyPoint => {
            keyPoint.onDestroy();
        });
    }

}

/** 曲线上的关键帧点 */
class KeyPoint {

    /** 关键帧点大小 */
    public readonly size = 10;
    /** 关键帧点的控制点数组 */
    public readonly controlPoints: ControlPoint[] = [];

    /** 鼠标侦听的 GRoot */
    private _groot: gui.GRoot;
    /** 曲线画布的 svg 节点 */
    private _svg: SVGSVGElement;
    /** 旋转45度的矩形节点 */
    private _rect: SVGRectElement;
    /** 容器节点 */
    private _group: SVGGElement;
    /** 被选中 */
    private _isSelected: boolean;
    /** 临时 SVgPoint，用于储存位置信息，放便矩阵运算 */
    private _tempSvgPoint: SVGPoint;
    /** 关键帧点 */
    private _floatKeyFrame: FloatKeyFrame;
    /** 坐标x */
    private _x: number;
    /** 坐标y */
    private _y: number;
    /** 拖动中... */
    private _draging: boolean;

    /** 拖动中... */
    public draging(): boolean { return this._draging; }

    /** 关键帧点在曲线图的横坐标 */
    public get time(): number {
        return this._floatKeyFrame.time;
    }
    /** 关键帧点在曲线图的横坐标 */
    public set time(v: number) {
        this._floatKeyFrame.time = v;
    }

    /** 关键帧点在曲线图的纵坐标 */
    public get value(): number {
        return this._floatKeyFrame.value;
    }
    /** 关键帧点在曲线图的纵坐标 */
    public set value(v: number) {
        this._floatKeyFrame.value = v;
    }

    public get x(): number {
        return this._x;
    }
    public set x(v: number) {
        this._x = v;
    }

    public get y(): number {
        return this._y;
    }
    public set y(v: number) {
        this._y = v;
    }

    /** 容器节点 */
    public get group(): SVGGElement {
        return this._group;
    }

    /** 被选中 */
    public get isSelected(): boolean {
        return this._isSelected;
    }

    /** 被选中 */
    public set isSelected(v: boolean) {
        this._isSelected = v;

        // 边框色
        this._rect.setAttribute("stroke", v ? "#ffffff" : "#000000");

        // 显示控制点
        this.controlPoints.forEach(cpt => {
            cpt.visible = v;
        });
    }


    constructor(groot: gui.GRoot, svg: SVGSVGElement, floatKeyFrame: FloatKeyFrame) {
        this._groot = groot;
        this._svg = svg;
        this._floatKeyFrame = floatKeyFrame;

        // 矩形，旋转 45 度
        const rect = document.createElementNS(svgNS, "rect");
        const rx = -this.size / 2;
        const ry = -this.size / 2;
        rect.setAttribute("x", rx.toString());
        rect.setAttribute("y", ry.toString());
        rect.setAttribute("width", this.size.toString());
        rect.setAttribute("height", this.size.toString());
        rect.setAttribute("fill", "#ff0000");
        rect.setAttribute("stroke", "#000000");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("transform", `rotate(45 ${0} ${0})`); // 旋转 45 度
        this._rect = rect;

        // 容器节点
        const group = document.createElementNS(svgNS, "g");
        this.x = this.mapX(this.time, svg);
        this.y = this.mapY(this.value, svg);
        group.setAttribute("transform", `translate(${this.x} ${this.y})`);
        group.appendChild(rect);
        svg.appendChild(group);
        this._group = group;

        // 临时 SvgPoint
        this._tempSvgPoint ||= this._svg.createSVGPoint();

        // 创建控制点
        for (let i = 0; i < 2; i++) {
            const ctrlP = new ControlPoint(this._groot, this._svg, this);
            this.controlPoints[i] = ctrlP;
        }

        // 添加鼠标侦听
        this.addListeners();
    }

    /** 添加鼠标侦听 */
    private addListeners(): void {
        this._groot.on("pointer_down", this.onPointerDown, this);
        this._groot.on("pointer_move", this.onPointerMove, this);
        this._groot.on("pointer_up", this.onPointerUp, this);
    }

    /** 移除鼠标侦听 */
    private removeListeners(): void {
        this._groot.off("pointer_down", this.onPointerDown, this);
        this._groot.off("pointer_move", this.onPointerMove, this);
        this._groot.off("pointer_up", this.onPointerUp, this);
    }

    /**
     * 是否包含输入点
     * @param input 输入点
     */
    public containsPoint(input: gui.InputInfo): boolean {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        // 输入点转到 svg 局部坐标
        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());

        // 计算矩形与输入点的距离
        const groupMatrix = this._group.getCTM();
        const dx = mousePoint.x - groupMatrix.e;
        const dy = mousePoint.y - groupMatrix.f;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 小于一定距离，表示包含输入点
        return distance < this.size;
    }

    /** 开始拖动 */
    public startDrag(): void {
        this._draging = true;

    }

    /** 停止拖动 */
    public stopDrag(): void {
        this._draging = false;
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {

    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        if (this._draging) {
            this.move(e.input);
        }
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        this.stopDrag();
    }

    /** 移动 */
    private move(input: gui.InputInfo): void {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());

        // 新位置，限制在 svg 矩形框内
        const xmax = parseFloat(this._svg.getAttribute("width"));
        const ymax = parseFloat(this._svg.getAttribute("height"));
        mousePoint.x = Math.min(Math.max(mousePoint.x, 0), xmax);
        mousePoint.y = Math.min(Math.max(mousePoint.y, 0), ymax);

        // 赋值
        this.x = mousePoint.x;
        this.y = mousePoint.y;
        this._group.setAttribute('transform', `translate(${mousePoint.x} ${mousePoint.y})`);

        // 更新
        this.time = mousePoint.x / xmax;
        this.value = mousePoint.y / ymax;
    }

    /**
    * x坐标映射函数
    * @param px [0,1]
    * @param svg 父容器节点
    * @returns 
    */
    private mapX(px: number, svg: SVGSVGElement) {
        return px * parseFloat(svg.getAttribute("width"));
    }

    /**
     * y坐标映射函数
     * @param py [0,1]
     * @param svg 父容器节点
     * @returns 
     */
    private mapY(py: number, svg: SVGSVGElement) {
        return (1 - py) * parseFloat(svg.getAttribute("height"));
    }

    public onDestroy(): void {
        // 停止拖动
        this.stopDrag();

        // 移除鼠标侦听
        this.removeListeners();

        // 移除容器节点
        this._group.remove();

        // 销毁控制点
        this.controlPoints.forEach(cpt => {
            cpt.onDestroy();
        });
    }
}

/** 曲线关键帧点的控制点 */
class ControlPoint {

    /** 控制点大小 */
    public readonly size = 8;

    /** 鼠标侦听的 GRoot */
    private _groot: gui.GRoot;
    /** 曲线画布的 svg 节点 */
    private _svg: SVGSVGElement;
    /** 旋转45度的矩形节点 */
    private _rect: SVGRectElement;
    /** 线节点 */
    private _line: SVGLineElement;
    /** 旋转45度矩形的容器 */
    private _group: SVGGElement;
    /** 矩形容器、线的父级 */
    private _parent: SVGGElement;
    /** 临时 SVgPoint，用于储存位置信息，放便矩阵运算 */
    private _tempSvgPoint: SVGPoint;
    /** 控制点所属的关键帧点 */
    private _keyPoint: KeyPoint;
    /** 拖动中... */
    private _draging: boolean;

    /** 拖动中... */
    public draging(): boolean { return this._draging; }

    public get visible(): boolean {
        return this._group.style.visibility === "visible";
    }

    public set visible(v: boolean) {
        const visibility = v ? "visible" : "hidden";
        this._group.style.visibility = visibility
        this._line.style.visibility = visibility;
    }

    constructor(groot: gui.GRoot, svg: SVGSVGElement, keyPoint: KeyPoint) {
        this._groot = groot;
        this._svg = svg;
        this._keyPoint = keyPoint;

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
        rect.setAttribute("stroke-width", `${1}`);
        rect.setAttribute("transform", `rotate(45 ${0} ${0})`); // 旋转 45 度
        this._rect = rect;

        // 矩形容器、线的父级
        this._parent = keyPoint.group;

        // 初始位置
        const initX = 20;
        const initY = 0;

        // 线
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", `${0}`);
        line.setAttribute("y1", `${0}`);
        line.setAttribute("x2", `${initX}`);
        line.setAttribute("y2", `${initY}`);
        line.setAttribute("stroke", "#ffffff");
        line.setAttribute("stroke-width", `${1}`);
        this._line = line;
        this._parent.insertBefore(line, this._parent.firstChild);

        // 矩形容器
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("transform", `translate(${initX} ${initY})`);
        group.appendChild(rect);
        this._parent.appendChild(group);
        this._group = group;

        // 默认不显示
        this.visible = false;

        // 临时 DOMPoint
        this._tempSvgPoint ||= this._svg.createSVGPoint();

        // 添加鼠标侦听
        this.addListeners();
    }

    /** 添加鼠标侦听 */
    private addListeners(): void {
        this._groot.on("pointer_down", this.onPointerDown, this);
        this._groot.on("pointer_move", this.onPointerMove, this);
        this._groot.on("pointer_up", this.onPointerUp, this);
    }

    /** 移除鼠标侦听 */
    private removeListeners(): void {
        this._groot.off("pointer_down", this.onPointerDown, this);
        this._groot.off("pointer_move", this.onPointerMove, this);
        this._groot.off("pointer_up", this.onPointerUp, this);
    }

    /** 开始拖动 */
    public startDrag(): void {
        this._draging = true;

    }

    /** 停止拖动 */
    public stopDrag(): void {
        this._draging = false;
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {

    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        if (this._draging) {
            this.move(e.input);
        }
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        this.stopDrag();
    }

    /**
     * 是否包含输入点
     * @param input 输入点
     */
    public containsPoint(input: gui.InputInfo): boolean {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        // 输入点转到 svg 局部坐标
        const mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());

        // 计算矩形与输入点的距离
        const groupMatrix = this._group.getCTM();
        const dx = mousePoint.x - groupMatrix.e;
        const dy = mousePoint.y - groupMatrix.f;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 小于一定距离，表示包含输入点
        return distance < this.size;
    }

    /** 移动 */
    private move(input: gui.InputInfo): void {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        let mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());
        mousePoint = mousePoint.matrixTransform(this._parent.getCTM().inverse());

        // 矩形容器位置
        this._group.setAttribute('transform', `translate(${mousePoint.x} ${mousePoint.y})`);

        // 线位置
        this._line.setAttribute("x2", `${mousePoint.x}`);
        this._line.setAttribute("y2", `${mousePoint.y}`);
    }

    public onDestroy(): void {
        // 移除鼠标侦听
        this.removeListeners();
        // 移除线节点
        this._line.remove();
        // 移除矩形容器节点
        this._group.remove();

    }

}