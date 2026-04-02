import AnimationCurveEditorUtil from "./AnimationCurveEditorUtil";
import { CurveInput } from "./CurveInput";
import { FloatKey } from "./FloatKey";

/** svg 命名空间 URI */
const svgNS = "http://www.w3.org/2000/svg";

/** 修改后的提交事件 */
export const EVENT_SUBMIT = "eventSubmit";

/**
 * 曲线编辑窗口
 * @emit {@link EVENT_SUBMIT } 修改后的提交事件, 事件由 {@link contentPane} 派发, 回调函数格式: `(): void`
 */
export class CurveEditDialog extends IEditor.Dialog {

    /** 对话框画布大小 */
    public static readonly dialogCanvasSize = { width: 350, height: 350 };
    /** 对话框顶部空白大小 */
    public static readonly dialogTopSpace = 20;
    /** 边距 */
    public static readonly margin = { top: 50, bottom: 50, left: 50, right: 50 };

    /** 曲线画布 */
    private _curveCanvas: CurveCanvas;
    /** 曲线输入 */
    private _curveInput: CurveInput;

    /** 曲线输入 */
    public get curveInput(): CurveInput {
        return this._curveInput;
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
        this._curveCanvas.on(EVENT_SUBMIT, this.onCurveCanvasSubmit, this);
    }

    /** 展示窗口 */
    protected onShown(...args: any[]): void {
        this._curveInput = args[0];

        // 曲线画布 onShown
        this._curveCanvas.onShown(this._groot);
    }

    /** 隐藏窗口 */
    protected onHide(): void {
        // 曲线画布 onHide
        this._curveCanvas.onHide();
        // 移除曲线画布修改侦听
        this._curveCanvas.off(EVENT_SUBMIT, this.onCurveCanvasSubmit, this);
    }

    /** 曲线画布修改事件回调 */
    private onCurveCanvasSubmit(e: gui.Event): void {
        // 应用修改
        this.applyChange();
    }

    /** 应用修改 */
    private applyChange(): void {
        // 修改提交事件
        this.contentPane.emit(EVENT_SUBMIT);
    }

}

/** 曲线画布 */
class CurveCanvas extends gui.EventDispatcher {

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
    }

    /** 展示窗口 */
    public onShown(groot: gui.GRoot): void {
        this._groot = groot;

        // 创建 KeyPoint
        const keys = this._curveEditDialog.curveInput.keys;
        keys.forEach((k, i) => {
            const isFirst = i === 0;
            const isLast = i === keys.length - 1;
            const allowMovement = !isFirst && !isLast; // 非第一或最后一个才可移动
            const isSelected = true; // 默认选中状态
            const enabledControlPoint0 = !isFirst; // 第一个关键帧点，内控制点不可用
            const enabledControlPoint1 = !isLast; // 最后一个关键帧点，外控制点不可用
            this.createKeyPoint(k, allowMovement, isSelected, enabledControlPoint0, enabledControlPoint1);
        });

        // 应用修改
        this.applyChange();

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

        // 移除所有关键帧点侦听
        this._keyPoints.forEach(kpt => {
            kpt.off(EVENT_SUBMIT, this.onKeyPointSubmit, this);
        });
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
        
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {

    }

    /** 创建一个关键帧点 */
    private createKeyPoint(k: FloatKey, allowMovement: boolean, isSelected: boolean, enabledControlPoint0: boolean, enabledControlPoint1: boolean): void {
        const keyPoint = new KeyPoint(this._groot, this._svg, k);
        keyPoint.allowMovement = allowMovement;
        keyPoint.controlPoints[0].enabled = enabledControlPoint0;
        keyPoint.controlPoints[1].enabled = enabledControlPoint1;
        keyPoint.isSelected = isSelected;
        keyPoint.on(EVENT_SUBMIT, this.onKeyPointSubmit, this);
        this._keyPoints.push(keyPoint);
    }

    /** 关键帧点修改提交事件回调 */
    private onKeyPointSubmit(e: gui.Event): void {
        // 应用修改
        this.applyChange();
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
        this._curveEditDialog.curveInput.keys.forEach((k, i) => {
            if (i === 0) {
                // 起点
                let x = k.time;
                let y = k.value;

                // 坐标映射
                x = AnimationCurveEditorUtil.mapX(x, this._svg);
                y = AnimationCurveEditorUtil.mapY(y, this._svg);

                d += `M ${x} ${y}`;
            } else {
                const prevKey = this._curveEditDialog.curveInput.keys[i - 1];
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

        console.log("d:", d);

        this._path.setAttribute('d', d); // M 起点 C 控制点1 控制点2 终点
    }

    /** 应用修改 */
    public applyChange(): void {
        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();
        // 修改提交事件
        this.emit(EVENT_SUBMIT);
    }

}

/** 曲线上的关键帧点 */
class KeyPoint extends gui.EventDispatcher {

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


    /** 允许移动 */
    public allowMovement: boolean = true;
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
            if (cpt.enabled) {
                cpt.visible = v;
            }
        });
    }


    constructor(groot: gui.GRoot, svg: SVGSVGElement, key: FloatKey) {
        super();

        this._groot = groot;
        this._svg = svg;
        this._key = key;
        this._tempSvgPoint ||= this._svg.createSVGPoint(); // 临时 SvgPoint

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
        this.x = AnimationCurveEditorUtil.mapX(this._key.time, svg);
        this.y = AnimationCurveEditorUtil.mapY(this._key.value, svg);
        group.setAttribute("transform", `translate(${this.x} ${this.y})`);
        group.appendChild(rect);
        svg.appendChild(group);
        this._group = group;

        // 创建控制点
        for (let i = 0; i < 2; i++) {
            const type = i === 0 ? ControlPointType.In : ControlPointType.Out;
            const ctrlP = new ControlPoint(this._groot, this._svg, this, type);
            this.controlPoints[i] = ctrlP;
        }

        // 添加侦听
        this.addListeners();
    }

    /** 添加侦听 */
    private addListeners(): void {
        this._groot.on("pointer_down", this.onPointerDown, this);
        this._groot.on("pointer_move", this.onPointerMove, this);
        this._groot.on("pointer_up", this.onPointerUp, this);

        // 控制点修改提交侦听
        this.controlPoints.forEach(cpt => {
            cpt.on(EVENT_SUBMIT, this.onControlPointSubmit, this);
        });
    }

    /** 移除侦听 */
    private removeListeners(): void {
        this._groot.off("pointer_down", this.onPointerDown, this);
        this._groot.off("pointer_move", this.onPointerMove, this);
        this._groot.off("pointer_up", this.onPointerUp, this);

        // 移除控制点修改提交侦听
        this.controlPoints.forEach(cpt => {
            cpt.off(EVENT_SUBMIT, this.onControlPointSubmit, this);
        });
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
        }
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        // 应用修改
        if (this.allowMovement && this._draging) {
            this.applyChange();
        }

        // 停止拖动
        this.stopDrag();
    }

    /** 控制点修改提交回调 */
    private onControlPointSubmit(e: gui.Event): void {
        // 应用修改
        this.applyChange();
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

    /** 应用修改 */
    private applyChange(): void {
        // 修改提交事件
        this.emit(EVENT_SUBMIT);
    }

    public onDestroy(): void {
        // 停止拖动
        this.stopDrag();

        // 移除侦听
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
class ControlPoint extends gui.EventDispatcher {

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

    /** 可用 */
    public enabled: boolean = true;

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
     * @param keyPoint 控制点所属的关键帧点 (KeyPoint)
     * @param type 控制点类型（内/外）
     */
    constructor(groot: gui.GRoot, svg: SVGSVGElement, keyPoint: KeyPoint, type: ControlPointType) {
        super();

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
        let pt: { x: number, y: number };
        if (this._type === ControlPointType.In) {
            pt = AnimationCurveEditorUtil.inKeyToControlPoint(keyPoint.key);
        } else {
            pt = AnimationCurveEditorUtil.outKeyToControlPoint(keyPoint.key);
        }
        console.log(`ControlPoint: type:${this._type}`, pt.x, pt.y, `in:`, keyPoint.key.inWeight, keyPoint.key.inTangent, `out:`, keyPoint.key.outWeight, keyPoint.key.outTangent);
        pt.x = AnimationCurveEditorUtil.mapX(pt.x, svg);
        pt.y = AnimationCurveEditorUtil.mapY(pt.y, svg);

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
        this._parent.insertBefore(line, this._parent.firstChild);

        // 矩形容器
        const group = document.createElementNS(svgNS, "g");
        group.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
        group.appendChild(rect);
        this._parent.appendChild(group);
        this._group = group;

        // 默认不显示
        this.visible = false;

        // 添加侦听
        this.addListeners();
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

    }

    /** 鼠标移动 */
    private onPointerMove(e: gui.Event): void {
        if (!this.enabled) return;
        if (!this.visible) return;

        if (this._draging) {
            this.move(e.input);
        }
    }

    /** 鼠标释放 */
    private onPointerUp(e: gui.Event): void {
        // 应用修改
        if (this.enabled && this.visible && this._draging) {
            this.applyChange();
        }

        // 停止拖动
        this.stopDrag();
    }

    /** 应用修改 */
    private applyChange(): void {
        // 计算控制点xy
        this._tempSvgPoint.x = parseFloat(this._line.getAttribute("x2"));
        this._tempSvgPoint.y = parseFloat(this._line.getAttribute("y2"));
        // -- 父级 -> svg 局部坐标
        this._tempSvgPoint = this._tempSvgPoint.matrixTransform(this._parent.getCTM());
        // -- 单位化
        const cx = this._tempSvgPoint.x / parseFloat(this._svg.getAttribute("width"));
        const cy = 1 - this._tempSvgPoint.y / parseFloat(this._svg.getAttribute("height"));
        console.log("cx", cx, "cy", cy);

        switch (this._type) {
            case ControlPointType.In:
                const inKey = AnimationCurveEditorUtil.controlPointToInKey(cx, cy);
                this._keyPoint.key.inTangent = inKey.inTangent;
                this._keyPoint.key.inWeight = inKey.inWeight;
                break;
            case ControlPointType.Out:
                const outKey = AnimationCurveEditorUtil.controlPointToOutKey(cx, cy);
                this._keyPoint.key.outTangent = outKey.outTangent;
                this._keyPoint.key.outWeight = outKey.outTangent;
                break;
        }

        // 修改提交事件
        this.emit(EVENT_SUBMIT);
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
        this._group.remove();

    }

}