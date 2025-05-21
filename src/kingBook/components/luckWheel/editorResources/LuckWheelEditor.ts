import { LuckWheel, RotationalMode } from "../LuckWheel";

const { regClass, property } = Laya;


@IEditorEnv.customEditor(LuckWheel)
export class LuckWheelCustomEditor extends IEditorEnv.CustomEditor {

    declare owner: Laya.Sprite;

    private _manager: IEditorEnv.IGizmosManager;
    private _luckWheel: any;

    private _outsidePolygon: IEditorEnv.IGizmoPolygon;

    public onDrawGizmosSelected() {
        this._manager = IEditorEnv.Gizmos2D.getManager(this.owner);
        this._luckWheel = this.owner.getComponent(LuckWheel);

        if (this._luckWheel.gizmoVisible) {
            //console.log("luckWheel", this._luckWheel.gizmoOutsideRadius);
            this.drawOutsideSplitLines();
        } else {
            if (this._outsidePolygon) {
                this._outsidePolygon.points.length = 0;
                this._outsidePolygon.refresh();
            }
        }
    }

    private drawOutsideSplitLines(): void {
        if (!this._outsidePolygon) {
            this._outsidePolygon = this._manager.createPolygon();
            this._outsidePolygon.stroke({ color: "#ff0000", width: 2 });
            this._outsidePolygon.fill("#7c272770");
            this._outsidePolygon.touchable = false;
        }
        this._outsidePolygon.points.length = 0;

        let outAngles: number[] = this._luckWheel._outsideDiscSplitAngles;
        let angleIndex = 0;

        for (let i = 0; i < 360; i++) {
            let rad = Laya.Utils.toRadian(i);
            let x = Math.cos(rad) * this._luckWheel.gizmoOutsideRadius * this.owner.globalScaleX;
            let y = Math.sin(rad) * this._luckWheel.gizmoOutsideRadius * this.owner.globalScaleY;
            this._outsidePolygon.points.push(x, y);

            if (angleIndex < outAngles.length && outAngles[angleIndex] - i <= 1) {
                rad = Laya.Utils.toRadian(outAngles[angleIndex]);
                x = Math.cos(rad) * this._luckWheel.gizmoOutsideRadius * this.owner.globalScaleX;
                y = Math.sin(rad) * this._luckWheel.gizmoOutsideRadius * this.owner.globalScaleY;
                this._outsidePolygon.points.push(x, y);
                this._outsidePolygon.points.push(0, 0);
                this._outsidePolygon.points.push(x, y);
                angleIndex++;
            }
        }

        this._outsidePolygon.refresh();
        this._outsidePolygon.setLocalPos(this.owner.pivotX, this.owner.pivotY);





    }
}