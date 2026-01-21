import { SceneLonadingPage } from "./SceneLonadingPage";
import { UIManager } from "./UIManager";

const { regClass, property } = Laya;

@regClass()
export class PanelStart extends Laya.Script {

    @property({ type: Laya.Button, private: false })
    private _buttonStartGame: Laya.Button;

    onAwake(): void {
        this._buttonStartGame.once(Laya.Event.CLICK, this, this.onClickButtonStartGame);
    }

    /** 点击 '开始游戏' 按钮 */
    private onClickButtonStartGame(): void {
        let onComplete = new Laya.Handler(this, (scene: Laya.Scene) => {
            console.log("load complete: demos/gameMap.ls");
            // 销毁 PanelStart
            this.owner.destroy();
        });

        let onProgress = new Laya.Handler(this, (value: number) => {
            console.log("loading:" + value);
        });

        // 加载并打开 gameMap 场景
        UIManager.instance.openScene("demos/gameMap.ls", false, null, onComplete, onProgress);

    }


}