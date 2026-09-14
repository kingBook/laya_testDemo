const { regClass, property } = Laya;

@regClass()
export class TestAnimFsm extends Laya.Script {

    @property({ type: Laya.Animator2D, private: false })
    private _animator: Laya.Animator2D;

    onAwake(): void {
        Laya.timer.once(2000, this, () => {
            this._animator.setParamsNumber("stateFloat", 2.5);
            console.log("set stateFloat to 2.5");
        });
    }

    // onKeyDown(evt: Laya.Event): void {
    //     if (evt.key == 'j') {
    //         this._animator.crossFade("scale", 0, 0);
    //     }

    //     if (evt.key == 'k') {
    //         this._animator.crossFade("rotation", 0, 0);
    //     }
    // }
}