const { regClass, property } = Laya;

@regClass()
export class TestVertexWater extends Laya.Script {

    @property({ type: Laya.Image })
    image: Laya.Image;

    private _count = 0;

    onUpdate(): void {
        this.image.material.setFloat("u_Time", this._count += 0.1);


    }
}