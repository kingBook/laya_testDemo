import { SceneManager } from "./SceneManager";

const { regClass, property } = Laya;

@regClass()
export class PanelRole extends Laya.Script {
    declare owner: Laya.Box;

    @property({ type: Laya.Button, private: false })
    private _btnBack: Laya.Button;

    onAwake(): void {
        this._btnBack.on(Laya.Event.CLICK, () => {
            SceneManager.instance.close(this.owner.scene);
        });
    }
}