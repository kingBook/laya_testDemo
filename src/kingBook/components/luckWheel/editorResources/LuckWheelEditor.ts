import { LuckWheel, LuckWheelMode } from "../LuckWheel";

const { regClass, property } = Laya;


@IEditorEnv.customEditor(LuckWheel)
export class LuckWheelCustomEditor extends IEditorEnv.CustomEditor {

    declare owner: Laya.Sprite;

    private readonly outsideStrokeColor: string = "#ff0000";
    private readonly outsideFillColor: string = "#7c272770";

    private readonly innerStrokeColor: string = "#00fff6";
    private readonly innerFillColor: string = "#25807f70";

    private _manager: IEditorEnv.IGizmosManager;
    private _luckWheel: LuckWheel;

    private _outsidePolygon: IEditorEnv.IGizmoPolygon;
    private _innerPolygon: IEditorEnv.IGizmoPolygon;
    private _outsideNumberTexts: IEditorEnv.IGizmoText[] = [];
    private _innerNumberTexts: IEditorEnv.IGizmoText[] = [];


    public onDrawGizmosSelected() {
        this._manager = IEditorEnv.Gizmos2D.getManager(this.owner);
        this._luckWheel = this.owner.getComponent(LuckWheel);

        // 清空绘图
        if (this._outsidePolygon) {
            this._outsidePolygon.points.length = 0;
            this._outsidePolygon.refresh();
        }
        if (this._innerPolygon) {
            this._innerPolygon.points.length = 0;
            this._innerPolygon.refresh();
        }
        if (this._outsideNumberTexts.length > 0) {
            for (let i = 0; i < this._outsideNumberTexts.length; i++) {
                this._outsideNumberTexts[i].node.remove();
            }
            this._outsideNumberTexts.length = 0;
        }
        if (this._innerNumberTexts.length > 0) {
            for (let i = 0; i < this._innerNumberTexts.length; i++) {
                this._innerNumberTexts[i].node.remove();
            }
            this._innerNumberTexts.length = 0;
        }


        if ((this._luckWheel as any).gizmoVisible) {
            // 外转盘
            this.drawOutsideSplitLines();
            this.drawOutsideNumberTexts();

            // 内转盘
            if (this._luckWheel.mode & LuckWheelMode.DoubleFixedPointer) {
                this.drawInnerSplitLines();
                this.drawInnerNumberTexts();
            }
        }
    }

    private drawOutsideSplitLines(): void {
        // 创建外多边形
        if (!this._outsidePolygon) {
            this._outsidePolygon = this._manager.createPolygon();
            this._outsidePolygon.stroke({ color: this.outsideStrokeColor, width: 2 });
            this._outsidePolygon.fill(this.outsideFillColor);
            this._outsidePolygon.touchable = false;
        }
        // 画外分割线
        this.drawSplitLines(this._outsidePolygon, this._luckWheel.outsideSplitAngles, (this._luckWheel as any).gizmoOutsideRadius);
    }

    private drawInnerSplitLines(): void {
        // 创建内多边形
        if (!this._innerPolygon) {
            this._innerPolygon = this._manager.createPolygon();
            this._innerPolygon.stroke({ color: this.innerStrokeColor, width: 2 });
            this._innerPolygon.fill(this.innerFillColor);
            this._innerPolygon.touchable = false;
        }
        // 画内分割线
        this.drawSplitLines(this._innerPolygon, this._luckWheel.innerSplitAngles, (this._luckWheel as any).gizmoInnerRadius);
    }

    private drawSplitLines(polygon: IEditorEnv.IGizmoPolygon, splitAngles: number[], radius: number): void {
        polygon.points.length = 0; // 清空

        let angleIndex = 0; // 分割线角度数组的索引

        for (let i = 0; i < 360; i++) {
            let rad = Laya.Utils.toRadian(i);
            let x = Math.cos(rad) * radius * this.owner.globalScaleX;
            let y = Math.sin(rad) * radius * this.owner.globalScaleY;
            polygon.points.push(x, y);

            // 距离分割线角<=1度，则添加分割线点
            if (angleIndex < splitAngles.length && splitAngles[angleIndex] - i <= 1) {
                rad = Laya.Utils.toRadian(splitAngles[angleIndex]);
                x = Math.cos(rad) * radius * this.owner.globalScaleX;
                y = Math.sin(rad) * radius * this.owner.globalScaleY;
                polygon.points.push(x, y);
                polygon.points.push(0, 0);
                polygon.points.push(x, y);
                angleIndex++;
            }
        }

        polygon.refresh();
        polygon.setLocalPos(this.owner.pivotX, this.owner.pivotY);
    }

    private drawOutsideNumberTexts(): void {
        let radius = (this._luckWheel as any).gizmoOutsideRadius * 0.8; // 数字显示在圆内，半径不取全长
        let splitPositions: number[] = this._luckWheel.getOutsideSplitPositions(radius, false);
        this.drawNumberTexts(splitPositions, radius, this.outsideStrokeColor, this._outsideNumberTexts);
    }

    private drawInnerNumberTexts(): void {
        let radius = (this._luckWheel as any).gizmoInnerRadius * 0.8; // 数字显示在圆内，半径不取全长
        let splitPositions: number[] = this._luckWheel.getInnerSplitPositions(radius, false);
        this.drawNumberTexts(splitPositions, radius, this.innerStrokeColor, this._innerNumberTexts);
    }

    private drawNumberTexts(splitPositions: number[], radius: number, textColor: string, outTexts: IEditorEnv.IGizmoText[]): void {
        for (let i = 0, len = splitPositions.length; i < len; i += 2) {
            let x = splitPositions[i] + this.owner.pivotX;
            let y = splitPositions[i + 1] + this.owner.pivotY;
            let i2 = Math.trunc((i + 1) / 2);

            let text = outTexts[i2];
            if (!text) {
                text = this._manager.createText(i2.toString());
                text.fill(textColor);
                text.setFontProp("size", 15 * radius * this.owner.globalScaleX * 0.015); // 字体大小与圆大小成正比
                text.touchable = false;
                outTexts[i2] = text;
            }
            text.setLocalPos(x, y);
        }
    }
}