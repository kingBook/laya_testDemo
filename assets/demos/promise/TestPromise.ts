const { regClass, property } = Laya;

@regClass()
export class TestPromise extends Laya.Script {

    public onAwake(): void {
        console.log("start");
        this.delay().then((value: any) => {
            console.log("end", value);
        });

        /*output: 
        start
        ...3秒后...
        end hello
        */
    }

    private delay(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            setTimeout(() => {
                resolve("hello");
            }, 3000);
        });
    }

}