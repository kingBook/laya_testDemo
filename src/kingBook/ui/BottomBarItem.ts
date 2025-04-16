import { BottomBar } from "./BottomBar";

const { regClass, property } = Laya;

@regClass()
export class BottomBarItem extends Laya.Script {

    declare owner: Laya.Box;

    private _bottomBar: BottomBar;

    onAwake(): void {
        this._bottomBar = this.owner.parent.parent.getComponent(BottomBar);

        let lable: Laya.Label = this.owner.getChild("Label") as Laya.Label;
        let btn: Laya.Button = this.owner.getChild("Button") as Laya.Button;

        btn.on(Laya.Event.CLICK, () => {
            console.log("click:" + lable.text);

            // 凸出选中项
            let parentHBox: Laya.HBox = this.owner.parent as Laya.HBox;
            for (let i = 0; i < parentHBox.numChildren; i++) {
                let item = parentHBox.getChildAt(i) as Laya.Box;

                let glow = item.getChild("Glow") as Laya.Sprite;
                glow.visible = item == this.owner;
                if(glow.visible){
                    this._bottomBar.setButtonRoleVisible(i === 2);
                }
            }

        });




    }
}