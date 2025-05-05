const { regClass, property } = Laya;

@regClass()
export class TestLayaTimer extends Laya.Script {

    onAwake(): void {
        console.log("onAwake start");
        Laya.timer.callLater(this, this.callLater);
        Laya.timer.runCallLater(this, this.callLater);
        //
        Laya.timer.frameOnce(1, this, () => {
            console.log("frameOnce");

        });
        console.log("onAwake end");
    }

    onStart(): void {
        console.log("onStart");

    }

    callLater(): void {
        console.log("callLater");
    }

    onUpdate(): void {
        console.log("onUpdate", Laya.timer.currFrame);

    }
}