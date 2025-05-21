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
            this._outsidePolygon.stroke("#ff0000");
            this._outsidePolygon.fill("#ff000000");

        }

        this._outsidePolygon.points.length = 0;


        let outAngles: number[] = this._luckWheel._outsideDiscSplitAngles;
        for (let i = 0, len = outAngles.length; i < len; i++) {
            let prevRad = Laya.Utils.toRadian(outAngles[(i - 1 + len) % len]);
            let curRad = Laya.Utils.toRadian(outAngles[i]);

            let prevX = Math.cos(prevRad) * this._luckWheel.gizmoOutsideRadius;
            let prevY = Math.sin(prevRad) * this._luckWheel.gizmoOutsideRadius;

            let curX = Math.cos(curRad) * this._luckWheel.gizmoOutsideRadius;
            let curY = Math.sin(curRad) * this._luckWheel.gizmoOutsideRadius;

            let matrix = this.owner.globalTrans.getMatrix().clone();
            
            console.log(matrix.tx, this.owner.globalTrans.getPos(new Laya.Point()), this.owner.globalTrans.getScenePos(new Laya.Point()));
            matrix.tx = this.owner.globalTrans.x;
            //matrix.tx = gpt.x;
           // matrix.ty = gpt.y;
            IEditorEnv.Gizmos2D.drawLines([0, 0, 100, 100], matrix);
            //IEditorEnv.Gizmos2D.drawLines([prevX, prevY, curX, curY], matrix);
            /*this._outsidePolygon.points.push(
                0, 0,
                prevX, prevY,
                curX, curY
            );*/
        }

        this._outsidePolygon.points.push(
            0, 0,
            100, 100,
            0, 50
        );

        this._outsidePolygon.refresh();
        //console.log("_outsidePolygon",this._outsidePolygon);


        this._outsidePolygon.setLocalPos(this.owner.pivotX, this.owner.pivotY);

    }
}