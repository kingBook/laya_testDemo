import { SceneLonadingPage } from "./SceneLonadingPage";

const { regClass, property } = Laya;

/** UI 管理器 */
@regClass()
export class UIManager extends Laya.Script {

    /** UI 管理器的实例 */
    private static s_instance: UIManager;

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

    onAwake(): void {
        UIManager.s_instance = this;

        Laya.SoundManager.autoStopMusic = false;
    }

    onStart(): void {
        // 创建 ‘开始’ UI
        this.createPanelStart();
    }

    private createPanelStart(): void {
        let panelStart = UIManager.instance.panelStartPrefab.create();
        UIManager.getCurrentScene().addChild(panelStart);
    }





}