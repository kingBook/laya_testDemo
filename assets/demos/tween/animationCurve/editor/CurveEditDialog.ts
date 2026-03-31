import AnimationCurveUtil from "../AnimationCurveUtil";
import { FloatKey } from "./FloatKey";

/** svg 命名空间 URI */
const svgNS = "http://www.w3.org/2000/svg";

/**
 * 曲线编辑窗口
 * @event {@link EVENT_SUBMIT } 修改后的提交事件, 事件由 {@link contentPane} 派发, 回调函数格式: `(): void`
 */
export class CurveEditDialog extends IEditor.Dialog {

    /** 修改后的提交事件, 事件由 {@link contentPane} 派发, 回调函数格式: `(): void` */
    public static readonly EVENT_SUBMIT = "eventSubmit";
    /** 对话框画布大小 */
    public static readonly dialogCanvasSize = { width: 350, height: 350 };
    /** 对话框顶部空白大小 */
    public static readonly dialogTopSpace = 20;
    /** 边距 */
    public static readonly margin = { top: 50, bottom: 50, left: 50, right: 50 };

    /** 曲线画布 */
    private _curveCanvas: CurveCanvas;
    /** 关键帧点数组 */
    private _keys: FloatKey[] = [];

    /** 关键帧点数组 */
    public get keys(): readonly FloatKey[] {
        return this._keys;
    }

    async create() {
        // 窗口
        const contentPane = new gui.Widget();
        const w = CurveEditDialog.dialogCanvasSize.width + CurveEditDialog.margin.left + CurveEditDialog.margin.right;
        const h = CurveEditDialog.dialogCanvasSize.height + CurveEditDialog.dialogTopSpace + CurveEditDialog.margin.top + CurveEditDialog.margin.bottom;
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
        this._keys = args[0];
        console.log("CurveEditDialog::onShown() _keys:", this._keys);
        
        // 曲线画布 onShown
        this._curveCanvas.emit(CurveCanvas.EVENT_SHOWN, [this._groot]);
    }

    /** 隐藏窗口 */
    protected onHide(): void {
        // 曲线画布 onHide
        this._curveCanvas.emit(CurveCanvas.EVENT_HIDE);
    }


}

/** 曲线画布 */
class CurveCanvas extends gui.EventDispatcher {

    /** 展示事件 */
    public static readonly EVENT_SHOWN = "eventShown";
    /** 隐藏事件 */
    public static readonly EVENT_HIDE = "eventHide";

    private _canvas: gui.Shape;
    /** 曲线编辑对话框 */
    private _curveEditDialog: CurveEditDialog;
    /** 鼠标侦听的 GRoot */
    private _groot: gui.GRoot;
    /** svg 节点 */
    private _svg: SVGSVGElement;
    /** svg 路径节点 */
    private _path: SVGPathElement;
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
        canvas.x = CurveEditDialog.margin.left;
        canvas.y = CurveEditDialog.dialogTopSpace + CurveEditDialog.margin.top;
        canvas.width = CurveEditDialog.dialogCanvasSize.width;
        canvas.height = CurveEditDialog.dialogCanvasSize.height;
        canvas.drawRect(0, gui.Color.BLACK, new gui.Color("#434343")); // 不要设置轮廓线宽，会导致位置偏差
        curveEditDialog.contentPane.addChild(canvas);
        this._canvas = canvas;

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

        // 创建 Path 节点（曲线）
        const path = document.createElementNS(svgNS, "path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#ff0000");
        path.setAttribute("stroke-width", "1");
        this._path = path;
        this._svg.appendChild(path);

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
        const keys = this._curveEditDialog.keys;
        keys.forEach((k, i) => {
            const keyPoint = new KeyPoint(this._groot, this._svg, k);
            this._keyPoints.push(keyPoint);
        });

        this.syncSize();
        this.redrawSVG();

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
        this._keyPoints.length = 0;
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
        this._curveEditDialog.keys.forEach((k, i) => {
            if (i === 0) {
                // 起点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                x = this.mapX(x);
                y = this.mapY(y);

                d += `M ${x} ${y}`;
            } else {
                const prevKey = this._curveEditDialog.keys[i - 1];
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

}

/** 曲线上的关键帧点 */
class KeyPoint {

    /** 关键帧点大小 */
    public readonly size = 10;
    /** 关键帧点的控制点数组, [0]: 内控制点; [1]: 外控制点 */
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
    private _key: FloatKey;
    /** 拖动中... */
    private _draging: boolean;


    /** 坐标x */
    public x: number;
    /** 坐标y */
    public y: number;


    /** 关键帧点 */
    public get key(): FloatKey {
        return this._key;
    }

    /** 拖动中... */
    public get draging(): boolean {
        return this._draging;
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


    constructor(groot: gui.GRoot, svg: SVGSVGElement, key: FloatKey) {
        this._groot = groot;
        this._svg = svg;
        this._key = key;

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
        this.x = this.mapX(this._key.time, svg);
        this.y = this.mapY(this._key.value, svg);
        group.setAttribute("transform", `translate(${this.x} ${this.y})`);
        group.appendChild(rect);
        svg.appendChild(group);
        this._group = group;

        // 临时 SvgPoint
        this._tempSvgPoint ||= this._svg.createSVGPoint();

        // 创建控制点
        for (let i = 0; i < 2; i++) {
            const type = i === 0 ? ControlPointType.In : ControlPointType.Out;
            const ctrlP = new ControlPoint(this._groot, this._svg, this, type);
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
        this._key.time = mousePoint.x / xmax;
        this._key.value = mousePoint.y / ymax;
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
        this.controlPoints.length = 0;
    }
}

/** 控制点类型枚举 */
enum ControlPointType {
    In = "in",
    Out = "out"
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
    /** 控制点类型 */
    private _type: ControlPointType;

    /** 拖动中... */
    public get draging(): boolean {
        return this._draging;
    }

    public get visible(): boolean {
        return this._group.style.visibility === "visible";
    }

    public set visible(v: boolean) {
        const visibility = v ? "visible" : "hidden";
        this._group.style.visibility = visibility
        this._line.style.visibility = visibility;
    }

    /**
     * 构造函数
     * @param groot 鼠标侦听的 GRoot
     * @param svg 画图所用的 svg 节点
     * @param keyPoint 控制点所属的 KeyPoint
     * @param type 控制点类型（内/外）
     */
    constructor(groot: gui.GRoot, svg: SVGSVGElement, keyPoint: KeyPoint, type: ControlPointType) {
        this._groot = groot;
        this._svg = svg;
        this._keyPoint = keyPoint;
        this._type = type;
        this._tempSvgPoint ||= this._svg.createSVGPoint(); // 临时 DOMPoint

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
        let initX: number, initY: number;
        if (this._type === ControlPointType.In) {
            initX = AnimationCurveUtil.mapX(-keyPoint.key.inWeight + 1, svg);
            initY = AnimationCurveUtil.mapY(-(keyPoint.key.inTangent * keyPoint.key.inWeight) + 1, svg);
        } else {
            initX = AnimationCurveUtil.mapX(keyPoint.key.outWeight, svg);
            initY = AnimationCurveUtil.mapY(keyPoint.key.outTangent * keyPoint.key.outWeight, svg);
        }
        console.log("ControlPoint:", `type:${this._type}`, initX, initY, `in:`, keyPoint.key.inWeight, keyPoint.key.inTangent, `out:`, keyPoint.key.outWeight, keyPoint.key.outTangent);
        // 转换初始位置，由 svg -> parent
        this._tempSvgPoint.x = initX;
        this._tempSvgPoint.y = initY;
        this._tempSvgPoint = this._tempSvgPoint.matrixTransform(this._parent.getCTM().inverse());
        initX = this._tempSvgPoint.x;
        initY = this._tempSvgPoint.y;

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

        // 输入点 ->  svg 局部坐标
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

        // 输入点 -> svg 局部坐标
        let mousePoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());
        // svg 局部坐标 -> 父级
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