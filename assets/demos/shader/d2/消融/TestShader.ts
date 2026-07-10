const { regClass, property } = Laya;

@regClass()
export class TestShader extends Laya.Script {
    @property({ type: Laya.Sprite })
    sp: Laya.Sprite;

    onAwake(): void {



    }

    private _distance = 0;

    onUpdate(): void {
        
    }

    onKeyDown(evt: Laya.Event): void {
        this._distance += 0.01;
        this.sp.material.setFloat("u_BurnAmount", Laya.MathUtil.repeat(this._distance, 2));

        console.log("u_BurnAmount",this.sp.material.getFloat("u_BurnAmount"));
        
    }


}