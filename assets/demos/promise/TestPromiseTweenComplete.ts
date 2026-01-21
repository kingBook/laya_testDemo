const { regClass, property } = Laya;

@regClass()
export class TestPromiseTweenComplete extends Laya.Script {

    public onAwake(): void {
        this.startTween();
        /*output:
        a
        // ...1秒后...
        b
        // ...1秒后...
        c
        */
    }

    private async startTween(): Promise<any> {
        console.log("a");
        await this.tween0();
        console.log("b");
        await this.tween1();
        console.log("c");
    }

    private tween0(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            Laya.Tween.create(this.owner).duration(1000).to("x", 100).then(tweener => {
                resolve(tweener);
            }, this);
        });

    }

    private tween1(): Promise<any> {
        return new Promise((resolve: (value: any) => void, reject: (reason?: any) => void) => {
            Laya.Tween.create(this.owner).duration(1000).to("y", 100).then(tweener => {
                resolve(tweener);
            }, this);
        });

    }

    public onKeyDown(evt: Laya.Event): void {
        if(evt.keyCode===Laya.Keyboard.H){
            Laya.Tween.killAll(this.owner);
            console.log("kill Tween");
            
        }
    }
}