const { regClass, property } = Laya;

@regClass()
export class Test3DUI extends Laya.Script {

    onAwake(): void {
        Laya.stage.on(Laya.Event.CLICK, (e: Laya.Event) => {
           // console.log("onStageClick", e.target.name);

        });
    }
}