import { BottomBarItem } from "./BottomBarItem";
import { DialogRole } from "./DialogRole";
import { SceneManager } from "./SceneManager";

const { regClass, property } = Laya;

@regClass()
export class BottomBar extends Laya.Script {
    declare owner: Laya.Box;

    private _iconNames: Array<string> = ["领地", "野外", "战役", "英雄", "聊天"];

    @property({ type: Laya.Prefab, private: false })
    private _dialogRolePrefab: Laya.Prefab;

    @property({ type: [Laya.Texture2D], private: false })
    private _icons: Array<Laya.Texture2D>;

    @property({ type: Laya.Button, private: false })
    private _btnRole: Laya.Button;

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
            if (i === 2) {
                this.setButtonRoleVisible(true);
            }
        }

        // 点击 “角色” 按钮
        this._btnRole.on(Laya.Event.CLICK, () => {
            // 创建 ‘角色’ 对话框
            let dialogRole = this._dialogRolePrefab.create() as Laya.Dialog;
            // 打开'角色'对话框
            Laya.Dialog.manager.open(dialogRole, false, false);
            // 开始缓出现动画
            dialogRole.getComponent(DialogRole).startTweenIn(this._btnRole);
        });
    }

    public setButtonRoleVisible(value: boolean): void {
        this._btnRole.visible = value;
    }
}