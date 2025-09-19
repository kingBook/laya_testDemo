import { Intersection } from "./Intersection";

const { regClass, property } = Laya;

@regClass()
export class TestIntersect extends Laya.Script {

    @property({ type: Laya.Label, private: false })
    private _tips: Laya.Label;

    private _points: Laya.Point[] = [];
    private _linePts: number[] = [];
    private _sprite: Laya.Sprite;
    private _spriteRedCircle: Laya.Sprite;
    private _spriteGreenCircle: Laya.Sprite;

    onAwake(): void {
        this._sprite = new Laya.Sprite();
        this.owner.addChild(this._sprite);

        this._spriteRedCircle = new Laya.Sprite();
        this._spriteRedCircle.graphics.drawCircle(0, 0, 10, "#FF0000");
        this.owner.addChild(this._spriteRedCircle);

        this._spriteGreenCircle = new Laya.Sprite();
        this._spriteGreenCircle.graphics.drawCircle(0, 0, 5, "#00FF00");
        this.owner.addChild(this._spriteGreenCircle);
    }

    onMouseClick(evt: Laya.Event): void {
        if (this._points.length >= 4) return;

        this._points.push(new Laya.Point(evt.stageX, evt.stageY));
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'c') {
            // 清除
            this._points.length = 0;
        }
    }

    private updateTips(): void {
        let tip: string = "点击绘制第1条线段";
        switch (this._points.length) {
            case 0:
            case 1:
                tip = "点击绘制第1条线段";
                break;
            case 2:
            case 3:
                tip = "点击绘制第2条线段";
                break;
            case 4:
                tip = "按 C, 清除";
                break;
        }
        this._tips.text = tip;
    }

    private drawLines(): void {
        this._sprite.graphics.clear();
        this._linePts.length = 0;
        if (this._points.length === 0) return;


        this._points.forEach(pt => {
            this._linePts.push(pt.x, pt.y);
        });
        // 1,3 长度，添加鼠标位置
        if (this._points.length === 1 || this._points.length === 3) {
            this._linePts.push(Laya.stage.mouseX, Laya.stage.mouseY);
        }

        if (this._linePts.length === 2 * 2) {
            this._sprite.graphics.drawLines(0, 0, this._linePts, "#00FFFF", 2);
        } else if (this._linePts.length === 4 * 2) {
            this._sprite.graphics.drawLines(0, 0, this._linePts.toSpliced(0, 4), "#00FFFF", 2);
            this._sprite.graphics.drawLines(0, 0, this._linePts.toSpliced(4), "#00FFFF", 2);
        }

    }

    private drawIntersection(): void {
        this._spriteRedCircle.visible = !(this._points.length < 3);
        this._spriteGreenCircle.visible = !(this._points.length < 3);
        if (this._points.length < 3) return;

        if (this._points.length === 3) {
            const its = Intersection.getIntersection(
                this._points[0].x, this._points[0].y,
                this._points[1].x, this._points[1].y,
                this._points[2].x, this._points[2].y,
                Laya.stage.mouseX, Laya.stage.mouseY
            );

            this._spriteRedCircle.pos(its[0].x, its[0].y);
            this._spriteGreenCircle.pos(its[1].x, its[1].y);
        } else { // length === 4
            const its = Intersection.getIntersection(
                this._points[0].x, this._points[0].y,
                this._points[1].x, this._points[1].y,
                this._points[2].x, this._points[2].y,
                this._points[3].x, this._points[3].y
            );

            this._spriteRedCircle.pos(its[0].x, its[0].y);
            this._spriteGreenCircle.pos(its[1].x, its[1].y);
        }
    }

    onUpdate(): void {
        this.updateTips();
        this.drawLines();
        this.drawIntersection();
    }

}