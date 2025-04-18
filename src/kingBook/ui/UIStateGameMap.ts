import { Fsm } from "../fsm/Fsm";
import { State } from "../fsm/State";
import { PanelGameMap } from "./PanelGameMap";
import { SceneManager } from "./SceneManager";
import { UIManager } from "./UIManager";

const { regClass, property } = Laya;

@regClass()
export class UIStateGameMap extends State {

    private _panelGameMap: PanelGameMap;

    public onStateEnter(fsm: Fsm): void {
        console.log("UIStateGameMap::onStateEnter");
        this._panelGameMap = UIManager.instance.panelGameMapPrefab.create().getComponent(PanelGameMap);
        UIManager.getCurrentScene().addChild(this._panelGameMap.owner);

    }

    public onStateExit(fsm: Fsm): void {
        this._panelGameMap.owner.removeSelf();
    }

}