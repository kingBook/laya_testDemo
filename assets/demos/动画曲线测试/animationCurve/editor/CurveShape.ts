import AnimationCurveUtil from "../AnimationCurveUtil";
import { FloatKey } from "./FloatKey";

/** svg 命名空间 URI */
export const svgNS = "http://www.w3.org/2000/svg";

/** 曲线图形 */
export class CurveShape extends gui.Shape {

    /** 关键帧点数组 */
    private _keys: FloatKey[];
    /** svg 节点 */
    protected _svg: SVGSVGElement;
    /** svg 路径节点 */
    protected _path: SVGPathElement;

    /** svg 节点 */
    public get svg(): SVGSVGElement { return this._svg; }
    /** 关键帧点数组 */
    public get keys(): FloatKey[] { return this._keys; }
    public set keys(value: FloatKey[]) {
        this._keys = value;

        this.redrawCurve(); // 重画曲线
    }

    constructor(parent: gui.Widget, x: number, y: number, width: number, height: number, bgColor: string = "#434343", lineColor: string = "#ff0000") {
        super();

        // 位置、宽高、颜色
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.drawRect(0, gui.Color.BLACK, new gui.Color(bgColor)); // 不要设置轮廓线宽，会导致位置偏差
        parent.addChild(this);

        // svg 节点
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("xmlns", svgNS);
        svg.setAttribute("x", "0");
        svg.setAttribute("y", "0");
        svg.setAttribute("width", `${width}`);
        svg.setAttribute("height", `${height}`);
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
        path.setAttribute("stroke", lineColor);
        path.setAttribute("stroke-width", "1");
        this._path = path;
        this._svg.appendChild(path);
    }

    /** 重画曲线 */
    public redrawCurve(): void {
        // 同步大小
        this.syncSize();
        // 重画SVG
        this.redrawSVG();
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