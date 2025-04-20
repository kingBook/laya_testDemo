import { PanelGameMapRuntimeScript } from "./PanelGameMapRuntimeScript";
import { PanelRole } from "./PanelRole";
import { UIManager } from "./UIManager";

const { regClass, property } = Laya;

@regClass()
export class PanelGameMap extends Laya.Script {
    declare owner: PanelGameMapRuntimeScript;

    @property({ type: Laya.Prefab, private: false })
    private _dialogTestListPrefab: Laya.Prefab;

    @property({ type: Laya.Prefab, private: false })
    private _panelRolePrefab: Laya.Prefab;


    onAwake(): void {
        this.owner.buttonTestList.on(Laya.Event.CLICK, () => {
            // 各种功能测试列表
            let dialogTestList = this._dialogTestListPrefab.create() as Laya.Dialog;
            this.owner.addChild(dialogTestList);
            dialogTestList.popup(false, true);
            
            Laya.SoundManager.playSound("resources/audios/弹出.mp3");
        });

        this.owner.buttonRole.on(Laya.Event.CLICK, () => {
            // 创建 ‘角色’ 面板
            let panelRole = this._panelRolePrefab.create() as Laya.Box;
            UIManager.getCurrentScene().addChild(panelRole);
            // 开始缓出现动画
            panelRole.getComponent(PanelRole).startTweenIn(this.owner.buttonRole);
            
            Laya.SoundManager.playSound("resources/audios/弹出.mp3");
        });
    }




}