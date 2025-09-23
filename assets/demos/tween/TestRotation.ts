const { regClass, property } = Laya;

@regClass()
export class TestRotation extends Laya.Script {

    @property({type:Laya.Sprite})
    target:Laya.Sprite;

    private _tween: Laya.Tween;


    private onComplete(msg: string): void {
        console.log("onComplete: msg:", msg);
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === "h") {
            console.log("开始缓动");
            this._tween=Laya.Tween.create(this.target).duration(5000).go("rotation",-10,720).ease(Laya.Ease.sineOut);
        }
    }
}