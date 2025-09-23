const { regClass, property } = Laya;

@regClass()
export class TestRotation extends Laya.Script {

    @property({ type: Laya.Sprite })
    target: Laya.Sprite;

    private _tween: Laya.Tween;
    private _isTweening: boolean;
    private _isRotating: boolean;
    private _rotationSpeed: number;

    private onComplete(msg: string): void {
        console.log("onComplete: msg:", msg);
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === "h") {
            console.log("开始旋转");
            this._rotationSpeed = 5//(Math.random() > 0.5 ? 1 : -1) * 5;
            this._isRotating = true;
        } else if (evt.key === 'j') {
            const targetRotation = Math.random()*360;
            console.log("开始缓动", "rotation",this.target.rotation, "targetRotation", targetRotation);
            this._tween = Laya.Tween.create(this.target).duration(5000).to("rotation", targetRotation).ease(Laya.Ease.sineOut);
            this._isTweening=true;
        }
    }

    onUpdate(): void {
        if (this._isTweening) {

            return;
        }

        if (this._isRotating) {
            this.target.rotation+=this._rotationSpeed;
        }
    }
}