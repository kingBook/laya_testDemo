const { regClass, property } = Laya;

@regClass()
export class TestPromiseAfterDestroy extends Laya.Script {

    declare owner: Laya.Sprite | Laya.Sprite3D;

    private delay(time:number): Promise<string> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("delayed");
            }, time);
        });
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') { // 测试销毁后，promise 没执行完，owner 是否为空，是否还在舞台
            this.delay(1000).then(res=>{
                console.log(res);
                console.log(`owner:`,this.owner);
                if(this.owner){
                    console.log(`owner.displayedInStage:`,this.owner.displayedInStage);
                    console.log(`owner.destroyed:`,this.owner.destroyed);
                }
            });
            this.owner.destroy();
        }else if(evt.key === "k"){ // 测试从舞台移除后，promise 没执行完，owner 是否为空，是否还在舞台
            this.delay(1000).then(res=>{
                console.log(res);
                console.log(`owner:`,this.owner);
                if(this.owner){
                    console.log(`owner.displayedInStage:`,this.owner.displayedInStage);
                    console.log(`owner.destroyed:`,this.owner.destroyed);
                }
            });
            this.owner.removeSelf();
        }
    }

    onDisable(): void {
        console.log(`TestPromiseAfterDestroy::onDisable();`);
    }

    onDestroy(): void {
        console.log(`TestPromiseAfterDestroy::onDestroy();`);
    }
}