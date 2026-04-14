import AnimationCurveUtil from "../AnimationCurveUtil";
import { CurveInput } from "./CurveInput";
import { FloatKey } from "./FloatKey";

/** svg 命名空间 URI */
const svgNS = "http://www.w3.org/2000/svg";

/** 提交修改事件 */
export const EVENT_SUBMIT = "eventSubmit";

/**
 * 曲线编辑窗口
 * @emit {@link EVENT_SUBMIT } 修改后的提交事件, 事件由 {@link contentPane} 派发, 回调函数格式: `(): void`
 */
export class CurveEditDialog extends IEditor.Dialog {

    /** 曲线画布大小 */
    public static readonly curveCanvasSize = { width: 350, height: 350 };
    /** 边距 */
    public static readonly margin = { top: 50, bottom: 50, left: 50, right: 50 };

    /** 曲线画布 */
    private _curveCanvas: CurveCanvas;
    /** 曲线输入 */
    private _curveInput: CurveInput;

    async create() {
        // 窗口
        const contentPane = new gui.Widget();
        const contentWidth = CurveEditDialog.curveCanvasSize.width + CurveEditDialog.margin.left + CurveEditDialog.margin.right;
        const contentHeight = CurveEditDialog.curveCanvasSize.height + CurveEditDialog.margin.top + CurveEditDialog.margin.bottom;
        contentPane.setSize(contentWidth, contentHeight);
        this.contentPane = contentPane;

        this.title = "CurveEdit"; // 窗口标题
        this.resizable = false; // 窗口大小，是否可调节
        this.showType = "popup"; // 点击窗口外时，关闭（必须，否则在未关闭窗口的情况下不保存场景打开其他场景调节曲线无法侦测修改）

        // 曲线画布
        const canvasX = CurveEditDialog.margin.left;
        const canvasY = CurveEditDialog.margin.top;
        const canvasWidth = CurveEditDialog.curveCanvasSize.width;
        const canvasHeight = CurveEditDialog.curveCanvasSize.height;
        this._curveCanvas = new CurveCanvas(this.contentPane, canvasX, canvasY, canvasWidth, canvasHeight);
    }

    /** 展示 */
    protected onShown(...args: any[]): void {
        this._curveInput = args[0];

        this._curveCanvas.on(EVENT_SUBMIT, this.onCurveCanvasSubmit, this);
        this._curveCanvas.onShown(this._groot, this._curveInput.keys);
    }

    /** 隐藏 */
    protected onHide(): void {
        this._curveCanvas.onHide();
        this._curveCanvas.off(EVENT_SUBMIT, this.onCurveCanvasSubmit, this);
    }

    /** 曲线画布修改事件回调 */
    private onCurveCanvasSubmit(e: gui.Event): void {
        this.contentPane.emit(EVENT_SUBMIT);
    }

    /** 应用修改 */
    public applyChange(): void {
        this._curveCanvas.setKeys(this._curveInput.keys);
    }

}

/** 曲线画布 */
class CurveCanvas extends gui.Shape {

    /** 关键帧点数组 */
    private _keys: FloatKey[];
    /** 鼠标侦听的 GRoot */
    private _groot: gui.GRoot;
    /** svg 节点 */
    private _svg: SVGSVGElement;
    /** svg 路径节点 */
    private _path: SVGPathElement;
    /** 临时 SVgPoint */
    private _tempSvgPoint: SVGPoint;

    /** 曲线上的关键帧点 */
    private readonly _keyPoints: KeyPoint[] = [];

    /** 鼠标侦听的 GRoot */
    public get groot(): gui.GRoot { return this._groot; }
    /** svg 节点 */
    public get svg(): SVGSVGElement { return this._svg; }


    constructor(parent: gui.Widget, x: number, y: number, width: number, height: number) {
        super();

        // 位置、宽高、颜色
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.drawRect(0, gui.Color.BLACK, new gui.Color("#434343")); // 不要设置轮廓线宽，会导致位置偏差
        parent.addChild(this);

        // svg 节点
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("x", "0");
        svg.setAttribute("y", "0");
        svg.setAttribute("width", CurveEditDialog.curveCanvasSize.width.toString());
        svg.setAttribute("height", CurveEditDialog.curveCanvasSize.height.toString());
        svg.style.position = "absolute";
        svg.style.left = "0";
        svg.style.right = "0";
        svg.style.top = "0";
        svg.style.bottom = "0";
        svg.style.pointerEvents = "auto"; // 鼠标指针事件
        svg.setAttribute("overflow", "visible"); // 溢出时显示
        this.element.appendChild(svg);
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
    }

    /** 设置关键帧点数组 */
    public setKeys(keys: FloatKey[]): void {
        console.log("setKeys();");

        this._keys = keys;

        // 销毁所有 KeyPoint
        this.destroyAllKeyPoints();

        // 创建 KeyPoint
        this._keys.forEach((k, i) => {
            const isFirst = i === 0;
            const isLast = i === keys.length - 1;
            const allowMovement = !isFirst && !isLast; // 非第一或最后一个才可移动
            const isSelected = true; // 默认选中状态
            const enabledControlPoint0 = !isFirst; // 第一个关键帧点，内控制点不可用
            const enabledControlPoint1 = !isLast; // 最后一个关键帧点，外控制点不可用
            this.createKeyPoint(k, allowMovement, isSelected, enabledControlPoint0, enabledControlPoint1);
        });

        // 重画曲线
        this.redrawCurve();
    }

    public insertKey(key: FloatKey): void {

    }

    /** 重画曲线 */
    public redrawCurve(): void {
        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();
    }

    /** 提交修改 */
    public submit(): void {
        // 提交修改事件
        this.emit(EVENT_SUBMIT);
    }

    /** 展示窗口 */
    public onShown(groot: gui.GRoot, keys: FloatKey[]): void {
        this._groot = groot;
        this.setKeys(keys);

        // 添加侦听
        this.addListeners();
    }

    /** 隐藏窗口 */
    public onHide(): void {
        // 移除侦听
        this.removeListeners();
        // 销毁所有 KeyPoint
        this.destroyAllKeyPoints();
    }

    /** 添加侦听 */
    private addListeners(): void {
        this._groot.on("pointer_down", this.onPointerDown, this);
        this._groot.on("pointer_move", this.onPointerMove, this);
        this._groot.on("pointer_up", this.onPointerUp, this);
    }

    /** 移除侦听 */
    private removeListeners(): void {
        this._groot.off("pointer_down", this.onPointerDown, this);
        this._groot.off("pointer_move", this.onPointerMove, this);
        this._groot.off("pointer_up", this.onPointerUp, this);
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {
        // 已触碰的关键帧点，鼠标按下触碰关键帧点及其控制点都视为已触碰
        const touchedKeyPoint = this._keyPoints.find(kpt => kpt.containsPoint(e.input) || (kpt.controlPoints.some(cpt => cpt.enabled && cpt.visible && cpt.containsPoint(e.input))));
        if (touchedKeyPoint) {
            touchedKeyPoint.isSelected = true; // 已触碰关键帧点设置为选中
            const touchedControlPoint = touchedKeyPoint.controlPoints.find(cpt => cpt.enabled && cpt.visible && cpt.containsPoint(e.input)); // 已触碰的控制点
            if (touchedControlPoint) {
                touchedControlPoint.startDrag(); // 拖动控制点
            } else {
                touchedKeyPoint.allowMovement && touchedKeyPoint.startDrag(); // 拖动关键帧点
            }
        } else {
            // 没有触碰的关键帧点和控制点，取消选中所有
            this._keyPoints.forEach(kpt => {
                kpt.isSelected = false;
            });
        }
    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        // 计算鼠标与曲线距离
        this._tempSvgPoint.x = e.input.x;
        this._tempSvgPoint.y = e.input.y;

        this._tempSvgPoint = this._tempSvgPoint.matrixTransform(this._svg.getScreenCTM().inverse());
        const px = this._tempSvgPoint.x / parseFloat(this._svg.getAttribute("width"));
        const py = 1 - this._tempSvgPoint.y / parseFloat(this._svg.getAttribute("height"));
        const { t, distance } = AnimationCurveUtil.getClosestPointOnCubicBezierCurve(px, py, this._keys);
        console.log("p:", px, py, "closestT:", t, "distance:", distance);


    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {

    }

    /** 创建一个关键帧点 */
    private createKeyPoint(k: FloatKey, allowMovement: boolean, isSelected: boolean, enabledControlPoint0: boolean, enabledControlPoint1: boolean): void {
        const keyPoint = new KeyPoint(this, k);
        keyPoint.allowMovement = allowMovement;
        keyPoint.controlPoints[0].enabled = enabledControlPoint0;
        keyPoint.controlPoints[1].enabled = enabledControlPoint1;
        keyPoint.isSelected = isSelected;
        this._keyPoints.push(keyPoint);
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
        const w = this.width;
        const h = this.height;
        this._svg.setAttribute("width", `${w}`);
        this._svg.setAttribute("height", `${h}`);
        this._svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        this._svg.style.width = `${w}px`;
        this._svg.style.height = `${h}px`;
    }

    /** 重画SVG */
    private redrawSVG(): void {
        const mapWidth = parseFloat(this._svg.getAttribute("width"));
        const mapHeight = parseFloat(this._svg.getAttribute("height"));
        let d = "";
        this._keys.forEach((k, i) => {
            if (i === 0) {
                // 起点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                x = AnimationCurveUtil.mapX(x, mapWidth);
                y = AnimationCurveUtil.mapY(y, mapHeight);

                d += `M ${x} ${y}`;
            } else {
                const prevKey = this._keys[i - 1];

                // 控制点1
                const c1 = AnimationCurveUtil.outKeyToControlPoint(prevKey, 1, 1, AnimationCurveUtil.tempPoint1);
                // 控制点2
                const c2 = AnimationCurveUtil.inKeyToControlPoint(k, 1, 1, AnimationCurveUtil.tempPoint2);
                // 终点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                c1.x = AnimationCurveUtil.mapX(c1.x, mapWidth);
                c1.y = AnimationCurveUtil.mapY(c1.y, mapHeight);
                c2.x = AnimationCurveUtil.mapX(c2.x, mapWidth);
                c2.y = AnimationCurveUtil.mapY(c2.y, mapHeight);
                x = AnimationCurveUtil.mapX(x, mapWidth);
                y = AnimationCurveUtil.mapY(y, mapHeight);

                // C 控制点1, 控制点2, 终点
                d += ` C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${x} ${y}`;
            }
        });
        this._path.setAttribute('d', d); // M 起点 C 控制点1 控制点2 终点
    }
}

/** 曲线上的关键帧点 */
class KeyPoint {

    /** 关键帧点大小 */
    private readonly _size = 10;
    /** 关键帧点的控制点数组, [0]: 内控制点; [1]: 外控制点 */
    public readonly controlPoints: ControlPoint[] = [];

    /** 曲线画布 */
    private _curveCanvas: CurveCanvas;
    /** 旋转45度的矩形节点 */
    private _rect: SVGRectElement;
    /** 容器节点 */
    private _shapeBox: SVGGElement;
    /** 被选中 */
    private _isSelected: boolean;
    /** 临时 SVgPoint，用于储存位置信息，放便矩阵运算 */
    private _tempSvgPoint: SVGPoint;
    /** 关键帧点 */
    private _key: FloatKey;
    /** 拖动中... */
    private _draging: boolean;


    /** 允许移动 */
    public allowMovement: boolean = true;
    /** 坐标x */
    public x: number;
    /** 坐标y */
    public y: number;


    /** 曲线画布 */
    public get curveCanvas(): CurveCanvas {
        return this._curveCanvas;
    }

    /** 关键帧点 */
    public get key(): FloatKey {
        return this._key;
    }

    /** 拖动中... */
    public get draging(): boolean {
        return this._draging;
    }

    /** 容器节点 */
    public get shapeBox(): SVGGElement {
        return this._shapeBox;
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
            if (cpt.enabled) {
                cpt.visible = v;
            }
        });
    }


    constructor(curveCanvas: CurveCanvas, key: FloatKey) {
        this._curveCanvas = curveCanvas;
        this._key = key;
        this._tempSvgPoint ||= this._curveCanvas.svg.createSVGPoint(); // 临时 SvgPoint

        // 矩形，旋转 45 度
        const rect = document.createElementNS(svgNS, "rect");
        const rx = -this._size / 2;
        const ry = -this._size / 2;
        rect.setAttribute("x", rx.toString());
        rect.setAttribute("y", ry.toString());
        rect.setAttribute("width", this._size.toString());
        rect.setAttribute("height", this._size.toString());
        rect.setAttribute("fill", "#ff0000");
        rect.setAttribute("stroke", "#000000");
        rect.setAttribute("stroke-width", "1");
        rect.setAttribute("transform", `rotate(45 ${0} ${0})`); // 旋转 45 度
        this._rect = rect;

        // 容器节点
        const shapeBox = document.createElementNS(svgNS, "g");
        const mapWidth = parseFloat(this._curveCanvas.svg.getAttribute("width"));
        const mapHeight = parseFloat(this._curveCanvas.svg.getAttribute("height"));
        this.x = AnimationCurveUtil.mapX(this._key.time, mapWidth);
        this.y = AnimationCurveUtil.mapY(this._key.value, mapHeight);
        shapeBox.setAttribute("transform", `translate(${this.x} ${this.y})`);
        shapeBox.appendChild(rect);
        this._curveCanvas.svg.appendChild(shapeBox);
        this._shapeBox = shapeBox;

        // 创建控制点
        for (let i = 0; i < 2; i++) {
            const type = i === 0 ? ControlPointType.In : ControlPointType.Out;
            const ctrlP = new ControlPoint(this, type);
            this.controlPoints[i] = ctrlP;
        }

        // 添加侦听
        this.addListeners();
    }

    /** 添加侦听 */
    private addListeners(): void {
        this._curveCanvas.groot.on("pointer_down", this.onPointerDown, this);
        this._curveCanvas.groot.on("pointer_move", this.onPointerMove, this);
        this._curveCanvas.groot.on("pointer_up", this.onPointerUp, this);
    }

    /** 移除侦听 */
    private removeListeners(): void {
        this._curveCanvas.groot.off("pointer_down", this.onPointerDown, this);
        this._curveCanvas.groot.off("pointer_move", this.onPointerMove, this);
        this._curveCanvas.groot.off("pointer_up", this.onPointerUp, this);
    }

    /**
     * 是否包含输入点
     * @param input 输入点
     */
    public containsPoint(input: gui.InputInfo): boolean {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        // 输入点转到 svg 局部坐标
        const mousePoint = this._tempSvgPoint.matrixTransform(this._curveCanvas.svg.getScreenCTM().inverse());

        // 计算矩形与输入点的距离
        const mat = this._shapeBox.getCTM();
        const dx = mousePoint.x - mat.e;
        const dy = mousePoint.y - mat.f;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 小于一定距离，表示包含输入点
        return distance < this._size;
    }

    /** 开始拖动 */
    public startDrag(): void {
        if (!this.allowMovement) return;
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
            /** 重画曲线 */
            this._curveCanvas.redrawCurve();
        }
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        // 应用修改
        if (this.allowMovement && this._draging) {
            // 提交修改
            this._curveCanvas.submit();
        }

        // 停止拖动
        this.stopDrag();
    }

    /** 移动 */
    private move(input: gui.InputInfo): void {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        const mousePoint = this._tempSvgPoint.matrixTransform(this._curveCanvas.svg.getScreenCTM().inverse());

        // 新位置，限制在 svg 矩形框内
        const xmax = parseFloat(this._curveCanvas.svg.getAttribute("width"));
        const ymax = parseFloat(this._curveCanvas.svg.getAttribute("height"));
        mousePoint.x = Math.min(Math.max(mousePoint.x, 0), xmax);
        mousePoint.y = Math.min(Math.max(mousePoint.y, 0), ymax);

        // 赋值
        this.x = mousePoint.x;
        this.y = mousePoint.y;
        this._shapeBox.setAttribute('transform', `translate(${mousePoint.x} ${mousePoint.y})`);

        // 更新
        this._key.time = mousePoint.x / xmax;
        this._key.value = mousePoint.y / ymax;
    }

    public onDestroy(): void {
        // 停止拖动
        this.stopDrag();

        // 移除侦听
        this.removeListeners();

        // 移除容器节点
        this._shapeBox.remove();

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
    private readonly _size = 8;

    /** 控制点所属的关键帧点 */
    private _keyPoint: KeyPoint;
    /** 控制点类型 */
    private _type: ControlPointType;
    /** 线节点 */
    private _line: SVGLineElement;
    /** 矩形的容器 */
    private _shapeBox: SVGGElement;
    /** 矩形容器、线的父级 */
    private _parent: SVGGElement;
    /** 拖动中... */
    private _draging: boolean;


    private _tempSvgPoint: SVGPoint;
    private _tempRangePoint: SVGPoint;

    /** 可用 */
    public enabled: boolean = true;

    /** 拖动中... */
    public get draging(): boolean {
        return this._draging;
    }

    public get visible(): boolean {
        return this._shapeBox.style.visibility === "visible";
    }

    public set visible(v: boolean) {
        const visibility = v ? "visible" : "hidden";
        this._shapeBox.style.visibility = visibility
        this._line.style.visibility = visibility;
    }

    /**
     * 构造函数
     * @param keyPoint 控制点所属的关键帧点 (KeyPoint)
     * @param type 控制点类型（内/外）
     */
    constructor(keyPoint: KeyPoint, type: ControlPointType) {
        this._keyPoint = keyPoint;
        this._type = type;
        this._tempSvgPoint ||= keyPoint.curveCanvas.svg.createSVGPoint();
        this._tempRangePoint ||= keyPoint.curveCanvas.svg.createSVGPoint();

        // 矩形，旋转 45 度
        const rect = document.createElementNS(svgNS, "rect");
        const rx = -this._size / 2;
        const ry = -this._size / 2;
        rect.setAttribute("x", rx.toString());
        rect.setAttribute("y", ry.toString());
        rect.setAttribute("width", this._size.toString());
        rect.setAttribute("height", this._size.toString());
        rect.setAttribute("fill", "#ffffff");
        rect.setAttribute("stroke", "#ffffff");
        rect.setAttribute("stroke-width", `${1}`);
        rect.setAttribute("transform", `rotate(45 ${0} ${0})`); // 旋转 45 度

        // 矩形容器、线的父级
        this._parent = keyPoint.shapeBox;

        // 初始位置
        let pt: { x: number, y: number };
        if (this._type === ControlPointType.In) {
            pt = AnimationCurveUtil.inKeyToControlPoint(keyPoint.key, 1, 1, AnimationCurveUtil.tempPoint1);
        } else {
            pt = AnimationCurveUtil.outKeyToControlPoint(keyPoint.key, 1, 1, AnimationCurveUtil.tempPoint2);
        }

        const mapWidth = parseFloat(keyPoint.curveCanvas.svg.getAttribute("width"));
        const mapHeight = parseFloat(keyPoint.curveCanvas.svg.getAttribute("height"));
        pt.x = AnimationCurveUtil.mapX(pt.x, mapWidth);
        pt.y = AnimationCurveUtil.mapY(pt.y, mapHeight);

        // 转换初始位置，由 svg -> parent
        this._tempSvgPoint.x = pt.x;
        this._tempSvgPoint.y = pt.y;
        this._tempSvgPoint = this._tempSvgPoint.matrixTransform(this._parent.getCTM().inverse());
        pt.x = this._tempSvgPoint.x;
        pt.y = this._tempSvgPoint.y;

        // 线
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", `${0}`);
        line.setAttribute("y1", `${0}`);
        line.setAttribute("x2", `${pt.x}`);
        line.setAttribute("y2", `${pt.y}`);
        line.setAttribute("stroke", "#ffffff");
        line.setAttribute("stroke-width", `${1}`);
        this._line = line;
        this._parent.insertBefore(line, this._parent.firstChild); // 放置在最底层

        // 矩形容器
        const shapeBox = document.createElementNS(svgNS, "g");
        shapeBox.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        shapeBox.appendChild(rect);
        this._parent.appendChild(shapeBox);
        this._shapeBox = shapeBox;

        // 默认不显示
        this.visible = false;

        // 添加侦听
        this.addListeners();
    }

    /** 添加侦听 */
    private addListeners(): void {
        this._keyPoint.curveCanvas.groot.on("pointer_down", this.onPointerDown, this);
        this._keyPoint.curveCanvas.groot.on("pointer_move", this.onPointerMove, this);
        this._keyPoint.curveCanvas.groot.on("pointer_up", this.onPointerUp, this);
    }

    /** 移除侦听 */
    private removeListeners(): void {
        this._keyPoint.curveCanvas.groot.off("pointer_down", this.onPointerDown, this);
        this._keyPoint.curveCanvas.groot.off("pointer_move", this.onPointerMove, this);
        this._keyPoint.curveCanvas.groot.off("pointer_up", this.onPointerUp, this);
    }

    /** 鼠标按下 */
    private onPointerDown(e: gui.Event): void {

    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        if (!this.enabled) return;
        if (!this.visible) return;

        // 拖动
        if (this._draging) {
            this.move(e.input);
        }
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        if (this.enabled && this.visible && this._draging) {
            // 提交修改
            this._keyPoint.curveCanvas.submit();
        }

        // 停止拖动
        this.stopDrag();
    }

    /** 移动 */
    private move(input: gui.InputInfo): void {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        // xmax
        this._tempRangePoint.x = parseFloat(this._keyPoint.curveCanvas.svg.getAttribute("width"));
        this._tempRangePoint = this._tempRangePoint.matrixTransform(this._keyPoint.curveCanvas.svg.getScreenCTM());
        const xmax = this._tempRangePoint.x;
        // xmin
        this._tempRangePoint.x = 0;
        this._tempRangePoint = this._tempRangePoint.matrixTransform(this._keyPoint.curveCanvas.svg.getScreenCTM());
        const xmin = this._tempRangePoint.x;
        // 限制范围 
        this._tempSvgPoint.x = Math.min(Math.max(this._tempSvgPoint.x, xmin), xmax);
        this._tempSvgPoint.y = Math.min(Math.max(this._tempSvgPoint.y, 0), this._keyPoint.curveCanvas.groot.height);

        // groot -> parent
        const mousePoint = this._tempSvgPoint.matrixTransform(this._parent.getScreenCTM().inverse());

        // 矩形容器位置
        this._shapeBox.setAttribute('transform', `translate(${mousePoint.x} ${mousePoint.y})`);

        // 线位置
        this._line.setAttribute("x2", `${mousePoint.x}`);
        this._line.setAttribute("y2", `${mousePoint.y}`);

        // ----------------------------------------------------------------------------
        // 计算控制点xy
        this._tempSvgPoint.x = mousePoint.x;
        this._tempSvgPoint.y = mousePoint.y;
        // - 转换坐标，由 parent -> svg 
        this._tempSvgPoint = this._tempSvgPoint.matrixTransform(this._parent.getCTM());

        // - 映射
        let cx = this._tempSvgPoint.x / parseFloat(this._keyPoint.curveCanvas.svg.getAttribute("width"));
        cx = Math.min(Math.max(cx, 0), 1); // 限制在 [0,1]
        const cy = 1 - this._tempSvgPoint.y / parseFloat(this._keyPoint.curveCanvas.svg.getAttribute("height"));

        switch (this._type) {
            case ControlPointType.In:
                const inKey = AnimationCurveUtil.controlPointToInKey(cx, cy, 1, 1, AnimationCurveUtil.tempInKey);
                this._keyPoint.key.inTangent = inKey.inTangent;
                this._keyPoint.key.inWeight = inKey.inWeight;
                break;
            case ControlPointType.Out:
                const outKey = AnimationCurveUtil.controlPointToOutKey(cx, cy, 1, 1, AnimationCurveUtil.tempOutKey);
                this._keyPoint.key.outTangent = outKey.outTangent;
                this._keyPoint.key.outWeight = outKey.outWeight;
                break;
        }
        // ----------------------------------------------------------------------------

        // 重画曲线
        this._keyPoint.curveCanvas.redrawCurve();
    }

    /**
     * 是否包含输入点
     * @param input 输入点
     */
    public containsPoint(input: gui.InputInfo): boolean {
        this._tempSvgPoint.x = input.x;
        this._tempSvgPoint.y = input.y;

        // 坐标转换，由 groot ->  svg 
        const mousePoint = this._tempSvgPoint.matrixTransform(this._keyPoint.curveCanvas.svg.getScreenCTM().inverse());

        // 计算矩形中心与输入点的距离
        const mat = this._shapeBox.getCTM();
        const dx = mousePoint.x - mat.e;
        const dy = mousePoint.y - mat.f;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 小于一定距离，表示包含输入点
        return distance < this._size;
    }

    /** 开始拖动 */
    public startDrag(): void {
        this._draging = true;
    }

    /** 停止拖动 */
    public stopDrag(): void {
        this._draging = false;
    }

    public onDestroy(): void {
        // 移除侦听
        this.removeListeners();
        // 移除线节点
        this._line.remove();
        // 移除矩形容器节点
        this._shapeBox.remove();
    }

}