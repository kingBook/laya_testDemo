const { regClass, property } = Laya;

@regClass()
export class TestWater extends Laya.Script {

    @property({ type: Laya.Camera })
    private camera: Laya.Camera;

    onAwake(): void {
        this.camera.depthTextureMode=Laya.DepthTextureMode.Depth;
        console.log(this.camera.depthTextureMode);
        
        console.log("depthTexture:", this.camera.depthTexture);
    }

    
}