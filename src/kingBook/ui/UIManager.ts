import { SceneLonadingPage } from "./SceneLonadingPage";
import { UIManagerFsm } from "./UIManagerFsm";

const { regClass, property } = Laya;

/** UI 管理器 */
@regClass()
export class UIManager extends Laya.Script {


    private static s_instance: UIManager;
    private _fsm: UIManagerFsm;

    @property({ type: Laya.Prefab })
    public sceneLoadingPagePrefab: Laya.Prefab;
    @property({ type: Laya.Prefab })
    public panelStartPrefab: Laya.Prefab;
    @property({ type: Laya.Prefab })
    public panelGameMapPrefab: Laya.Prefab;

    /** UI 管理器的实例 */
    public static get instance(): UIManager {
        return UIManager.s_instance;
    }

    /** UI 管理器的状态机 */
    public get fsm(): UIManagerFsm {
        return this._fsm;
    }

    onAwake(): void {
        UIManager.s_instance = this;
        this._fsm = this.owner.addComponent(UIManagerFsm);

    }



}