import { Convexdecomposition } from "./Convexdecomposition";
import { Separator, V2 } from "./Separator";

const { regClass, property } = Laya;

@regClass()
export class TestConvexdecomposition extends Laya.Script {

    private _pointsSprite: Laya.Sprite;
    private _polygonPointsSprite: Laya.Sprite;
    private _isRecording: boolean = true;
    private _points: V2[] = [];
    private _polygonPoints: V2[][];

    onAwake(): void {
        this._pointsSprite = new Laya.Sprite();
        this.owner.addChild(this._pointsSprite);

        this._polygonPointsSprite = new Laya.Sprite();
        this.owner.addChild(this._polygonPointsSprite);
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'c') {
            this._points && (this._points.length = 0);
            this._polygonPoints && (this._polygonPoints.length = 0);
            console.log("已清空");
        } else if (evt.key === 'v') {
            console.log("凸分解检验：", Separator.validate(this._points).msg);
        } else if (evt.key === 'b') {
            this._polygonPoints = Convexdecomposition.separate(this._points);
            console.log("凸分解-----------------", "凸多形数量:", this._polygonPoints.length);
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
        this.drawPolygonPoints();
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

    private drawPolygonPoints(): void {
        this._polygonPointsSprite.graphics.clear();

        if (!this._polygonPoints || this._polygonPoints.length <= 0) return;

        this._polygonPoints.forEach(pts => {
            console.log(pts);

            this.drawPoints(this._polygonPointsSprite, pts, false, true, "#00FF00", 2);
        });

    }




}