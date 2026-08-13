const { regClass, property } = Laya;


@regClass()
export class BgUI extends Laya.Script {

    declare owner: Laya.Sprite3D;

    @property({ type: Laya.Camera, private: false })
    private _camera: Laya.Camera;

    private _ui3d: Laya.UI3D;

    onAwake(): void {
        this._ui3d = this.owner.getComponent(Laya.UI3D);

        this.onStageResize(null);
        Laya.stage.on(Laya.Event.RESIZE, this, this.onStageResize);
    }

    onDestroy(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.onStageResize);
    }

    private onStageResize(e: Laya.Event): void {
        const tan = Math.tan(this._camera.fieldOfView / 2 * Math.PI / 180);
        //this._camera.aspectRatio
        //console.log(this._camera.clientWidth, this._camera.clientHeight);

        this.owner.transform.position = new Laya.Vector3(0, 0, -10);
        const scaleX = (this._ui3d.resolutionRate * this._ui3d.scale.x) / 100;
        const scaleY = (this._ui3d.resolutionRate * this._ui3d.scale.y) / 100;
        this.owner.transform.localScale = new Laya.Vector3(scaleX, scaleY, 1);



    }
}