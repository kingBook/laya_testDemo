const { regClass, property } = Laya;

@regClass()
export class TestPromiseAll extends Laya.Script {

    private delay(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            setTimeout(() => {
                if (Math.random() > 0.5) resolve("delay resolve");
                else reject(new Error("delay reject"));
            }, 1000);
        });
    }

    private sleep(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            setTimeout(() => {
                if (Math.random() > 0.5) resolve("sleep resolve");
                else reject(new Error("spleep reject"));
            }, 1000);
        });
    }

    public onKeyDown(evt: Laya.Event): void {
        if (evt.keyCode === Laya.Keyboard.H) {
            Promise.all([this.delay(), this.sleep()])
                .then(res => {
                    console.log("then", res);
                })
                .catch(err => {
                    console.log("catch", err);
                });
        }
    }
}