import { Curve, V2 } from "./Curve";

const { regClass, property } = Laya;



@regClass()
export class TestBezier extends Laya.Script {

    private _pointsSprite: Laya.Sprite;
    private _bezierPointsSprite: Laya.Sprite;
    private _isRecording: boolean = true;
    private _points: V2[] = [];
    private _bezierPoints: V2[] = [];

    onAwake(): void {
        this._pointsSprite = new Laya.Sprite();
        this.owner.addChild(this._pointsSprite);

        this._bezierPointsSprite = new Laya.Sprite();
        this.owner.addChild(this._bezierPointsSprite);
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'c') {
            this._points.length = 0;
            this._bezierPoints.length = 0;
            console.log("已清空");
        } else if (evt.key === 'b') {
            this._bezierPoints.length = 0;
            this._bezierPoints.push(...Curve.createCurve(this._points, 0.1, false));
            console.log("已执行贝塞尔平滑-------", "顶点数:",this._bezierPoints.length);
        }
    }

    onMouseClick(evt: Laya.Event): void {
        if (this._isRecording) {
            this._points.push({ x: evt.stageX, y: evt.stageY });
            console.log("记录：", 'x:', evt.stageX, 'y:', evt.stageY);
        }
    }

    onUpdate(): void {
        // 画记录的鼠标点
        this.drawPoints(this._pointsSprite, this._points, true, false, "#FFFFFF", 3);
        // 画凸分解后的多边形
        this.drawBezierPoints();
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

    private drawBezierPoints(): void {
        this._bezierPointsSprite.graphics.clear();

        if (!this._bezierPoints || this._bezierPoints.length <= 0) return;

        this.drawPoints(this._bezierPointsSprite, this._bezierPoints, false, true, "#00FF00", 2);

    }




}