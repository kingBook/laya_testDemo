import { LuckWheel, LuckWheelMode } from "../LuckWheel";

const { regClass, property } = Laya;


@IEditorEnv.customEditor(LuckWheel)
export class LuckWheelCustomEditor extends IEditorEnv.CustomEditor {

    declare owner: Laya.Sprite;

    private _manager: IEditorEnv.IGizmosManager;
    private _luckWheel: LuckWheel;

    private _outsidePolygon: IEditorEnv.IGizmoPolygon;
    private _innerPolygon: IEditorEnv.IGizmoPolygon;


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

        if (this._luckWheel.gizmoVisible) {
            // 画外转盘分割线
            this.drawOutsideSplitLines();

            // 画内转盘分割线
            if (this._luckWheel.mode & LuckWheelMode.DoubleFixedPointer) {
                this.drawInnerSplitLines();
            }
        }
    }

    private drawOutsideSplitLines(): void {
        // 创建外多边形
        if (!this._outsidePolygon) {
            this._outsidePolygon = this._manager.createPolygon();
            this._outsidePolygon.stroke({ color: "#ff0000", width: 2 });
            this._outsidePolygon.fill("#7c272770");
            this._outsidePolygon.touchable = false;
        }
        // 画外分割线
        this.drawSplitLines(this._outsidePolygon, this._luckWheel.outsideSplitAngles, this._luckWheel.gizmoOutsideRadius);
    }

    private drawInnerSplitLines(): void {
        // 创建内多边形
        if (!this._innerPolygon) {
            this._innerPolygon = this._manager.createPolygon();
            this._innerPolygon.stroke({ color: "#00fff6", width: 2 });
            this._innerPolygon.fill("#25807f70");
            this._innerPolygon.touchable = false;
        }
        // 画内分割线
        this.drawSplitLines(this._innerPolygon, this._luckWheel.innerSplitAngles, this._luckWheel.gizmoInnerRadius);
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
}