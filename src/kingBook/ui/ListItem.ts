const { regClass, property } = Laya;

@regClass()
export class ListItem extends Laya.Script {

    declare owner: Laya.Box;

    onAwake(): void {
        let lable: Laya.Label = this.owner.getChild("Label") as Laya.Label;
        let btn: Laya.Button = this.owner.getChild("Button") as Laya.Button;

        btn.on(Laya.Event.CLICK, ()=>{
            console.log("click:"+lable.text);
            
        });
    }
}