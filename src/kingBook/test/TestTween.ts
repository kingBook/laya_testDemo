const { regClass, property } = Laya;

@regClass()
export class TestTween extends Laya.Script {

    private _tween: Laya.Tween;
    private _msg: string;


    private onComplete(msg: string): void {
        console.log("onComplete: msg:",msg);
    }

    onKeyDown(evt: Laya.Event): void {
        
        
        if (evt.key === "h") {
            console.log("开始缓动");

            this._msg = "缓动完成";

            const tempMsg=this._msg;
            this._tween = Laya.Tween.create(this).duration(5000).to(null,0).then(tweener => {
                this.onComplete(tempMsg);
            });

            this._msg = "第二次赋值";
        } else if (evt.key === "j") {
            console.log("结束缓动");

            // 结束缓动，并执行完成回调
            this._tween?.kill(true);
        }
    }
}