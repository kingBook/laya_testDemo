const { regClass, property } = Laya;

@regClass()
export class TestVertexBend extends Laya.Script {

    @property({ type: Laya.Image })
    image: Laya.Image;

    private _count = 0;

    onAwake(): void {

    }

    onUpdate(): void {
        this.image.material.setFloat("u_Time", this._count += 0.1);



    }

    onKeyDown(evt: Laya.Event): void {

    }
}