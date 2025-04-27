import { SceneLonadingPage } from "./SceneLonadingPage";

const { regClass, property } = Laya;

/** UI 管理器 */
@regClass()
export class UIManager extends Laya.Script {

    /** UI 管理器的实例 */
    private static s_instance: UIManager;

    @property({ type: Laya.Prefab, tips: "开始UI预制件", private: false })
    public _panelStartPrefab: Laya.Prefab;

    @property({ type: Laya.Sprite, private: false, tips: "加载场景时的进度页面" })
    private _loadingPage: Laya.Sprite;

    /** 开始UI预制件 */
    public get panelStartPrefab(): Laya.Prefab { return this._panelStartPrefab; }


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
    }

    onStart(): void {
        // 创建 ‘开始’ UI
        this.createPanelStart();
    }

    /**
     * 加载并打开场景
     * （注：此方法是对 Laya.Scene.open 的二次封装，增加显示加载进度功能）
     * @param url 场景地址
     * @param closeOther 是否关闭其他场景，默认为true（可选）。注意：被关闭的场景，如果没有设置autoDestroyAtRemoved=true，则资源可能不能被回收，需要自己手动回收
     * @param param 打开页面的参数，会传递给onOpened方法（可选）
     * @param complete 打开完成回调，返回场景实例（可选）
     * @param progress 加载进度回调（可选）
     * @returns 
     */
    public openScene(url: string, closeOther: boolean = true, param?: any, complete?: Laya.Handler, progress?: Laya.Handler): void{
        this._loadingPage.visible = true;
        Laya.Scene.setLoadingPage(this._loadingPage);
        Laya.Scene.showLoadingPage(null, 0);

        let sceneLoadingPage: SceneLonadingPage = this._loadingPage.getComponent(SceneLonadingPage);
        sceneLoadingPage.setProgress(0);

        let onComplete = new Laya.Handler(this, (scene: Laya.Scene) => {
            complete?.runWith(scene);
        });

        let onProgress = new Laya.Handler(this, (value: number) => {
            progress?.runWith(value);
            sceneLoadingPage.setProgress(value);
        });

        // test 
        Laya.timer.once(1000,this,()=>{
            Laya.Scene.open(url, closeOther, param, onComplete, onProgress);
        });

        //Laya.Scene.open(url, closeOther, param, onComplete, onProgress);
    }

    private createPanelStart(): void {
        let panelStart = UIManager.instance.panelStartPrefab.create();
        UIManager.getCurrentScene().addChild(panelStart);
    }





}