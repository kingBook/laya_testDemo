import { LuckWheel } from "../LuckWheel";

const { regClass, property } = Laya;


@IEditorEnv.customEditor(LuckWheel)
export class LuckWheelCustomEditor extends IEditorEnv.CustomEditor {

    private _circle: IEditorEnv.IGizmoCircle;
    private _handle:IEditorEnv.IGizmoHandle;

    public onDrawGizmosSelected() {
        let manager = IEditorEnv.Gizmos2D.getManager(this.owner);
        if (!this._circle) {
            this._circle = manager.createCircle(10);
            this._circle.fill("#ff0");
        }
        this._circle.setLocalPos(10, 10);

        if(!this._handle){
            this._handle = manager.createHandle("rect",20,"#ffffff");
        }
        this._handle.setLocalPos(30, 30);

    }
}