const { regClass, property } = Laya;

Laya.addBeforeInitCallback(stageCfg => {
    console.log("TestDefaultFont-> Laya.addBeforeInitCallback();");
    
    switch (Laya.Browser.platform) {
        case Laya.Browser.PLATFORM_ANDROID:
            console.log("PLATFORM_ANDROID");
            break;
        case Laya.Browser.PLATFORM_IOS:
            console.log("PLATFORM_IOS");
            break;
        case Laya.Browser.PLATFORM_PC:
            console.log("PLATFORM_PC");
            break;
    }
    //Laya.Config.defaultFont = "resources/font/迷你简剪纸.ttf";
});

@regClass()
export class TestDefaultFont extends Laya.Script {

    onStart(): void {
        const label = new Laya.Label(`${Laya.Browser.platform},也是她这国中是要在地一ABCDEFGHIJKLMNOPQRSTUVWXYZ`);
        this.owner.addChild(label);
    }


}