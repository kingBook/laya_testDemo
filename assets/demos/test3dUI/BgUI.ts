const { regClass, property } = Laya;
const Vector3 = Laya.Vector3;

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
        // 设置背景平面的距离 --------------------------------------------------------
        this.owner.transform.position = new Vector3(0, 0, -10);


        // 计算缩放 --------------------------------------------------------
        // - 计算背景图所在锥体截面的宽
        const distance = this._camera.transform.position.z - this._ui3d.owner.transform.position.x;
        const tan = Math.tan(this._camera.fieldOfView / 2 * Math.PI / 180);
        const height = tan * distance * 2;
        const width = this._camera.aspectRatio * height;

        const bgWidth = this._ui3d.resolutionRate * this._ui3d.scale.x;
        const bgHeight = this._ui3d.resolutionRate * this._ui3d.scale.y;

        let scaleX = bgWidth / 70;
        let scaleY = bgHeight / 70;

        const sx = (width * 100) / bgWidth;
        const sy = (height * 100) / bgHeight;

        // - 匹配宽高
        // scaleX *= sx;
        // scaleY *= sy;

        // - 匹配宽
        scaleX *= sx;
        scaleY *= sx;

        // - 匹配高
        // scaleX *= sy;
        // scaleY *= sy;

        this.owner.transform.localScale = new Laya.Vector3(scaleX, scaleY, 1);


        // 对齐方式  --------------------------------------------------------
        // - 居中对齐（默认）

        // - 顶对齐



    }
}