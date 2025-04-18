import { StateDefault } from "../fsm/StateDefault";
import { SceneLonadingPage } from "./SceneLonadingPage";
import { SceneManager } from "./SceneManager";
import { UIManager } from "./UIManager";
import { UIStateGameMap } from "./UIStateGameMap";

const { regClass, property } = Laya;

@regClass()
export class PanelStart extends Laya.Script {

    @property({ type: Laya.Button, private: false })
    private _buttonStartGame: Laya.Button;

    onAwake(): void {
        this._buttonStartGame.on(Laya.Event.CLICK, this, () => {
            UIManager.instance.fsm.changeStateTo(StateDefault); // 加载不显示非 loading 页以外的 UI

            let loadingPage: Laya.Sprite = UIManager.instance.sceneLoadingPagePrefab.create() as Laya.Sprite;
            Laya.Scene.setLoadingPage(loadingPage);
            Laya.Scene.showLoadingPage(null, 0);

            let sceneLoadingPage: SceneLonadingPage = loadingPage.getComponent(SceneLonadingPage);
            sceneLoadingPage.setProgress(0);

            // 为了能查看加载进条页，延迟执行
            Laya.timer.once(500, this, () => {
                let onComplete = new Laya.Handler(this, (scene: Laya.Scene) => {
                    console.log("load complete: scenes/gameMap.ls");
                    // 显示 gameMap UI
                    UIManager.instance.fsm.changeStateTo(UIStateGameMap);
                });

                let onProgress = new Laya.Handler(this, (value: number) => {
                    console.log("loading:" + value);
                    sceneLoadingPage.setProgress(value);
                });

               Laya.Scene.open("scenes/gameMap.ls", false, null, onComplete, onProgress);
            });
        });
    }


}