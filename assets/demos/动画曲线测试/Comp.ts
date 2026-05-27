import AnimationCurve from "views/prefabs/animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class Comp extends Laya.Script {

    @property({type:AnimationCurve, inspector:AnimationCurve.name})
    animCurve:AnimationCurve=new AnimationCurve();

    onAwake(): void {
        console.log("Comp:", this.animCurve.getValue(0));
        
    }

}