import { BottomBarItem } from "./BottomBarItem";
import { PanelRole } from "./PanelRole";
import { UIManager } from "./UIManager";

const { regClass, property } = Laya;

@regClass()
export class BottomBar extends Laya.Script {
    declare owner: Laya.Box;

    private _iconNames: string[] = ["领地", "野外", "战役", "英雄", "聊天"];

    @property({ type: [Laya.Texture2D], private: false })
    private _icons: Laya.Texture2D[];

    onAwake(): void {
        let hbox = this.owner.getChild("HBox") as Laya.HBox;

        for (let i = 0; i < hbox.numChildren; i++) {
            let item = hbox.getChildAt(i) as Laya.Box;
            let btn = item.getChild("Button") as Laya.Button;
            let lable = item.getChild("Label") as Laya.Label;
            let glow = item.getChild("Glow") as Laya.Sprite;
            btn.skin = this._icons[i].url;
            lable.text = this._iconNames[i];
            glow.visible = i === 2;
        }


    }


}