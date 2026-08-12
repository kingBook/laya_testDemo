const { regClass, property } = Laya;

@regClass()
export class TestTwoColorGradient extends Laya.Script {
    
    @property({type:Laya.Gradient, private:false, inspector:"TwoColorGradient"})
    private _twoColorGradient:Laya.Gradient;

    @property({type:Laya.Gradient, private:false})
    private _gradient:Laya.Gradient;
}