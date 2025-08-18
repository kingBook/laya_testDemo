import { Separator, V2 } from "./Separator";

const { regClass, property } = Laya;

@regClass()
export class TestConvexdecomposition extends Laya.Script {

    /** 用于显示鼠标点击绘制的凹多边形的sprite */
    private _polOriginPointsSprite: Laya.Sprite;
    /** 用于显示凸分解后的多边形的sprite */
    private _polygonPointsSprite: Laya.Sprite;
    /** 已开始画多边形 */
    private _isBeginDrawPol: boolean = true;
    /** 鼠标点击绘制的凹多边形顶点*/
    private _polOriginPoints: V2[] = [];
    /** 凸分解后的多边形顶点 */
    private _polygonPoints: V2[][];

    /** 用于显示孔洞的sprite */
    private _holePointsSpirte: Laya.Sprite;
    /** 已开始画孔洞 */
    private _isBeginDrawHole: boolean;
    /** 孔洞顶点列表 */
    private _holePoints: V2[][] = [];
    /** 当前绘制的孔洞索引 */
    private _holeIndex: number = 0;

    onAwake(): void {
        // 用于显示鼠标点击绘制的凹多边形
        this._polOriginPointsSprite = new Laya.Sprite();
        this.owner.addChild(this._polOriginPointsSprite);

        // 用于显示凸分解后的多边形
        this._polygonPointsSprite = new Laya.Sprite();
        this.owner.addChild(this._polygonPointsSprite);

        // 用于显示孔洞
        this._holePointsSpirte = new Laya.Sprite();
        this.owner.addChild(this._holePointsSpirte);
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'h') {
            this._isBeginDrawHole = !this._isBeginDrawHole;
            console.log(this._isBeginDrawHole ? "绘制孔洞开启" : "绘制孔洞结束");
        } else if (evt.key === ' ') {
            this._holeIndex++;
            console.log("完成一个孔洞绘制");
        } else if (evt.key === 'c') {
            // 清空鼠标绘制的凹多边形
            this._polOriginPoints && (this._polOriginPoints.length = 0);
            // 清空凸分解后的多边形
            this._polygonPoints && (this._polygonPoints.length = 0);
            // 清空孔洞
            this._holePoints.length = 0;
            this._holeIndex = 0;

            console.log("已清空");
        } else if (evt.key === 'v') {
            console.log("凸分解检验：", Separator.validate(this._polOriginPoints).msg);
        } else if (evt.key === 'b') {
            console.time("separate");
            this._polygonPoints = Separator.separate(this._polOriginPoints, this._holePoints);
            console.timeEnd("separate");
            console.log("凸分解-----------------", "凸多形数量:", this._polygonPoints.length);
        }
    }

    onMouseClick(evt: Laya.Event): void {
        if (this._isBeginDrawHole) {
            this._holePoints[this._holeIndex] ||= [];
            this._holePoints[this._holeIndex].push({ x: evt.stageX, y: evt.stageY });
            console.log("绘制孔洞：", 'x:', evt.stageX, 'y:', evt.stageY);
        } else if (this._isBeginDrawPol) {
            this._polOriginPoints.push({ x: evt.stageX, y: evt.stageY });
            console.log("绘制凹多边形：", 'x:', evt.stageX, 'y:', evt.stageY);
        }
    }

    onUpdate(): void {
        // 画鼠标绘制的凹多边形
        this.drawPoints(this._polOriginPointsSprite, this._polOriginPoints, true, false, "#FFFFFF", 4);

        // 画凸分解后的多边形
        this.drawPolygonPoints();

        // 画孔洞
        this.drawHolePoints();
    }

    private drawPoints(sprite: Laya.Sprite, pts: V2[], clearOnBegin: boolean, close: boolean, lineColor: string = "#FFFFFF", lineWidth: number = 2): void {
        clearOnBegin && sprite.graphics.clear();
        if (pts.length <= 0) return;

        const xys: number[] = [];
        pts.forEach(p => {
            xys.push(p.x, p.y);
        });

        // 闭合
        if (close) {
            if (xys.length >= 2) {
                xys.push(xys[0], xys[1]);
            }
        }
        sprite.graphics.drawLines(0, 0, xys, lineColor, lineWidth);
    }

    /** 画凸分解后的多边形 */
    private drawPolygonPoints(): void {
        this._polygonPointsSprite.graphics.clear();

        if (!this._polygonPoints || this._polygonPoints.length <= 0) return;

        this._polygonPoints.forEach(pts => {
            this.drawPoints(this._polygonPointsSprite, pts, false, true, "#00FF00", 2);
        });
    }

    /** 画孔洞 */
    private drawHolePoints(): void {
        this._holePointsSpirte.graphics.clear();

        if (!this._holePoints || this._holePoints.length <= 0) return;

        this._holePoints.forEach(pts => {
            this.drawPoints(this._holePointsSpirte, pts, false, false, "#00FFFF", 2);
        });
    }




}