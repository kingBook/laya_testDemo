const { regClass, property } = Laya;

@regClass()
export class TestMouseJoint extends Laya.Script {

    @property({ type: Laya.MouseJoint, private: false })
    private _mouseJoint: Laya.MouseJoint;

    onAwake(): void {

    }



    onDisable(): void {

    }


}