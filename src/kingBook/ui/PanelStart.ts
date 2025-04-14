import { StateDefault } from "../fsm/StateDefault";
import { SceneLonadingPage } from "./SceneLonadingPage";
import { UIManager } from "./UIManager";
import { UIStateGameing } from "./UIStateGameing";

const { regClass, property } = Laya;

@regClass()
export class PanelStart extends Laya.Script {

    @property({ type: Laya.Button, private: false })
    private _buttonStartGame: Laya.Button;

    onAwake(): void {
        this._buttonStartGame.on(Laya.Event.CLICK, this, () => {
            UIManager.instance.fsm.changeStateTo(StateDefault); // 加载不显示非 loading 页以外的 UI

            let loadingPage:SceneLonadingPage = UIManager.instance.showLoadingPage(0);
            // 为了能查看加载进条页，延迟执行
            Laya.timer.once(1000, this, ()=>{
                let onComplete = new Laya.Handler(this, (scene: Laya.Scene) => {
                    console.log("load complete: scenes/gameing.ls");
                    // 显示 gameing UI
                    UIManager.instance.fsm.changeStateTo(UIStateGameing);
                });
        
                let onProgress = new Laya.Handler(this, (value: number) => {
                    console.log("loading:" + value);
                    loadingPage.setProgress(value);
                });
        
                Laya.Scene.open("scenes/gameing.ls", false, null, onComplete, onProgress);
            });
        });
    }


}