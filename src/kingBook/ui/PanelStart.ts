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

    private onClickButtonStartGame(): void {
        let loadingPage: Laya.Sprite = UIManager.instance.sceneLoadingPagePrefab.create() as Laya.Sprite;
        Laya.Scene.setLoadingPage(loadingPage);
        Laya.Scene.showLoadingPage(null, 0);

        let sceneLoadingPage: SceneLonadingPage = loadingPage.getComponent(SceneLonadingPage);
        sceneLoadingPage.setProgress(0);

        // 为了能查看加载进条页，延迟执行
        Laya.timer.once(500, this, () => {
            let onComplete = new Laya.Handler(this, (scene: Laya.Scene) => {
                console.log("load complete: scenes/gameMap.ls");
                // 销毁 PanelStart
                this.owner.destroy();
            });

            let onProgress = new Laya.Handler(this, (value: number) => {
                console.log("loading:" + value);
                sceneLoadingPage.setProgress(value);
            });

            Laya.Scene.open("scenes/gameMap.ls", false, null, onComplete, onProgress);
        });


    }


}