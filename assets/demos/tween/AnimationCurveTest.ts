import { AnimationCurve } from "./animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class AnimationCurveTest extends Laya.Script {


    @property({ type: AnimationCurve, inspector: "AnimationCurve" })
    animationCurve: AnimationCurve = new AnimationCurve();

    //@property({ type: [Laya.FloatKeyframe], nullable: false, minArrayLength: 2, inspector: "curve" })
    //protected widthCurve: Laya.FloatKeyframe[] = [];

    onAwake(): void {
        console.log("animationCurve:", this.animationCurve);
        console.log(this.owner.getComponent(Laya.Trail2DRender).widthCurve);
        

    }

    onStart(): void {
        console.log("onStart");

    }
}