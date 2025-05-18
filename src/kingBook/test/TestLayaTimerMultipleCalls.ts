const { regClass, property } = Laya;

@regClass()
export class TestLayaTimerMultipleCalls extends Laya.Script {

    private onDelayed(): void {
        console.log("onDelayed");

    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.keyCode === Laya.Keyboard.H) {
            console.log("开始延时");
            Laya.timer.once(1000, this, this.onDelayed);

        }
    }
}