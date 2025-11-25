import { AnimationCurve } from "./animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class AnimationCurveTest extends Laya.Script {


    @property({ type: AnimationCurve, serializable: true/*, inspector: "AnimationCurve"*/ })
    animationCurve: AnimationCurve = new AnimationCurve();



    @property({ type: Laya.ParticleMinMaxCurve })
    particleMinMaxCurve: Laya.ParticleMinMaxCurve;

    // @property({ type: Laya.Node })
    // testNode: Laya.Node;

    @property({ type: Laya.GradientDataNumber })
    gradientDataNumber: Laya.GradientDataNumber;

    @property({ type: Laya.FloatKeyframe })
    protected widthCurve: Laya.FloatKeyframe[];

    onAwake(): void {
        console.log("animationCurve:", this.animationCurve);
    }

    onStart(): void {
        console.log("onStart");
        console.log("animationCurve:", this.animationCurve);
        // console.log("gradientDataNumber:", this.gradientDataNumber);
        //console.log("particleMinMaxCurve:", this.particleMinMaxCurve);




    }
}