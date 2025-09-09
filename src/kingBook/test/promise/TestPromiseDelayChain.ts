const { regClass, property } = Laya;

@regClass()
export class TestPromiseDelayChain extends Laya.Script {


    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'h') {
            console.log("开始延时");
            this.delay(2000).then(_ => {
                console.log("延时完成");

            });
        } else if (evt.key === 'j') {
            console.log("清除延时");
            Laya.timer.clearAll(this);
        }
    }

    private async delay(ms: number) {
        new Promise((resolve: (value: TestPromiseDelayChain) => void) => {
            Laya.timer.once(ms, this, () => {
                resolve(this);
            });
        });
    }

    private sayHello(): void {
        console.log("Hello");

    }

}