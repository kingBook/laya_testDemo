import { SceneLonadingPage } from "./SceneLonadingPage";
import { UIManagerFsm } from "./UIManagerFsm";

const { regClass, property } = Laya;

/** UI 管理器 */
@regClass()
export class UIManager extends Laya.Script {


    private static s_instance: UIManager;
    private _fsm: UIManagerFsm;

    @property({ type: Laya.Prefab, private: false })
    private _sceneLoadingPagePrefab: Laya.Prefab;
    @property({ type: Laya.Prefab, private: false })
    public panelStartPrefab: Laya.Prefab;
    @property({ type: Laya.Prefab, private: false })
    public panelGameing: Laya.Prefab;

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

    public showLoadingPage(delay: number = 500): SceneLonadingPage {
        let loadingPage=this._sceneLoadingPagePrefab.create() as Laya.Sprite;
        // 设置场景加载页
        Laya.Scene.setLoadingPage(loadingPage);
        Laya.Scene.showLoadingPage(loadingPage, delay);
        return loadingPage.getComponent(SceneLonadingPage);
    }


}