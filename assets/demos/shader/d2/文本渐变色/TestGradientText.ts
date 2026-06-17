const { regClass, property } = Laya;

@regClass()
export class TestGradientText extends Laya.Script {
    
    @property({type:Laya.Label, private:false})
    private _label:Laya.Label;

    @property({type:Laya.Label, private:false})
    private _label1:Laya.Label;

    onAwake(): void {
        console.log("this._label.texture:",this._label.texture);
        console.log("this._label1.texture:",this._label1.texture);
        
    }
}