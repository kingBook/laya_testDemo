const { regClass, property } = Laya;

@regClass()
export class SceneManager extends Laya.Script {

    private static s_instance: SceneManager;
    private _currentScene: Laya.Scene | Laya.Scene3D;

    public static get instance(): SceneManager {
        return SceneManager.s_instance;
    }

    public get currentScene(): Laya.Scene | Laya.Scene3D {
        return this._currentScene;
    }

    onAwake(): void {
        SceneManager.s_instance = this;
        this._currentScene = this.owner.scene;
    }

    public open(url: string, closeOther?: boolean, param?: any, complete?: Laya.Handler, progress?: Laya.Handler): Promise<Laya.Scene> {
        let onComplete = new Laya.Handler(this, (scene: Laya.Scene) => {
            this._currentScene = scene;
            complete?.runWith(scene);
        });
        let onProgress = new Laya.Handler(this, (value: number) => {
            progress?.runWith(value);
        });
        return Laya.Scene.open(url, closeOther, param, onComplete, onProgress);
    }

    public close(scene:Laya.Scene):void{
        Laya.Scene.close(scene.url);
    }

    public showLoadingPage(param?: any, delay: number = 500): void {
        Laya.Scene.showLoadingPage(param, delay);
    }

    public setLoadingPage(loadPage: Laya.Sprite): void {
        Laya.Scene.setLoadingPage(loadPage);
    }

}