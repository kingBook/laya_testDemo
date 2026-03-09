const { regClass, property } = Laya;

@regClass()
export class TestParticle2D extends Laya.Script {

    @property({ type: Laya.ShurikenParticle2DRenderer, private: false })
    private _particle2Dnode: Laya.ShurikenParticle2DRenderer;

    onAwake(): void {
        
    }

    onUpdate(): void {
        this._particle2Dnode.owner.pos(Laya.stage.mouseX, Laya.stage.mouseY);
    }

}