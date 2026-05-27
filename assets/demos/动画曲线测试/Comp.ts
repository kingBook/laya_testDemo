import AnimationCurve from "views/prefabs/animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class Comp extends Laya.Script {

    @property({type:AnimationCurve, inspector:AnimationCurve.name})
    animCurve:AnimationCurve=new AnimationCurve();

    onAwake(): void {
        console.log("Comp1:", this.animCurve.toControlPointValues());
        this.animCurve.setTo(.25, .1, .25, 1);
        console.log("Comp2:", this.animCurve.toControlPointValues());
        
    }

}