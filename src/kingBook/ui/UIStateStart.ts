import { Fsm } from "../fsm/Fsm";
import { State } from "../fsm/State";
import { StateDefault } from "../fsm/StateDefault";
import { PanelStart } from "./PanelStart";
import { UIManager } from "./UIManager";

const { regClass, property } = Laya;

@regClass()
export class UIStateStart extends State {

    private _panelStart: PanelStart;

    public onStateEnter(fsm: Fsm): void {
        // 创建 ‘开始面板’ 
        this._panelStart = UIManager.instance.panelStartPrefab.create().getComponent(PanelStart);
        UIManager.getCurrentScene().addChild(this._panelStart.owner);
    }

    public onStateExit(fsm: Fsm): void {
        this._panelStart.owner.removeSelf();
    }
}