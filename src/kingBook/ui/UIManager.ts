import { SceneLonadingPage } from "./SceneLonadingPage";
import { UIManagerFsm } from "./UIManagerFsm";
import { UIStateGameMap } from "./UIStateGameMap";
import { UIStateStart } from "./UIStateStart";

const { regClass, property } = Laya;

/** UI 管理器 */
@regClass()
export class UIManager extends Laya.Script {

    /** UI 管理器的实例 */
    private static s_instance: UIManager;
    /** 管理 UI 切换的状态机 */
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

    /** 获取显示列表中最顶层的场景 */
    public static getCurrentScene(): Laya.Scene {
        let root: Laya.Node = Laya.stage.getChild("root");
        let scene: Laya.Scene = null;
        let i = root.numChildren;
        while (--i >= 0) {
            scene = root.getChildAt(i, Laya.Scene);
            if (scene) break;
        }
        return scene;
    }

    /** 管理 UI 切换的状态机 */
    public get fsm(): UIManagerFsm {
        return this._fsm;
    }

    onAwake(): void {
        UIManager.s_instance = this;
        this._fsm = this.owner.addComponent(UIManagerFsm);
    }

    onStart(): void {
        this._fsm.addState(UIStateStart);
        this._fsm.addState(UIStateGameMap);
        this._fsm.init();

        // 切换到 ‘开始’ UI
        this._fsm.changeStateTo(UIStateStart);
    }





}