import { PanelRole } from "./PanelRole";
import { UIManager } from "./UIManager";

const { regClass, property } = Laya;

/** 游戏地图场景中的 UI 面板*/
@regClass()
export class PanelGameMap extends Laya.Script {

    declare owner: Laya.Box;

    @property({ type: Laya.Prefab, private: false, tips: "测试上/下拉刷新列表的对话框预制件" })
    private _dialogTestListPrefab: Laya.Prefab;

    @property({ type: Laya.Prefab, private: false, tips: "角色展示 UI 预制件" })
    private _panelRolePrefab: Laya.Prefab;

    /** '下拉刷新列表' 按钮 */
    private _buttonTestList: Laya.Button;
    /** '角色面板' 按钮 */
    private _buttonRole: Laya.Button;

    onAwake(): void {
        this._buttonTestList = this.owner.getChild("buttonTestList", Laya.Button);
        this._buttonRole = this.owner.getChild("buttonRole", Laya.Button);

        // 点击 '下拉刷新列表' 按钮时
        this._buttonTestList.on(Laya.Event.CLICK, () => {
            // 实例化 测试上/下拉刷新列表的对话框预制件
            let dialogTestList = this._dialogTestListPrefab.create() as Laya.Dialog;
            this.owner.addChild(dialogTestList);
            // 以窗口方式弹出
            dialogTestList.popup(false, true);
            // 播放弹出窗口时音效
            Laya.SoundManager.playSound("resources/audios/弹出.mp3");
        });

        // 点击 '角色面板' 按钮时
        this._buttonRole.on(Laya.Event.CLICK, () => {
            // 创建 ‘角色’ 面板
            let panelRole = this._panelRolePrefab.create() as Laya.Box;
            UIManager.getCurrentScene().addChild(panelRole);
            // 开始缓出现动画
            panelRole.getComponent(PanelRole).startTweenIn(this._buttonRole);
            // 播放弹出窗口时音效
            Laya.SoundManager.playSound("resources/audios/弹出.mp3");
        });
    }

}