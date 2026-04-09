import AnimationCurve from "./animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class AnimationCurveTest extends Laya.Script {

    declare owner: Laya.Sprite;

    @property({ type: AnimationCurve, inspector: AnimationCurve.name })
    animationCurve: AnimationCurve;

    // @property({ type: AnimationCurve, inspector: "AnimationCurveOld" })
    // animationCurveOld: AnimationCurve;

    @property({ type: [Laya.FloatKeyframe], inspector: "curve" })
    public keys: Laya.FloatKeyframe[];

    @property({ type: Laya.TextArea })
    text: Laya.TextArea;

    onAwake(): void {
        //console.log("animationCurve:", this.animationCurve);
        //console.log(this.owner.getComponent(Laya.Trail2DRender).widthCurve);

        const canvas: Laya.Sprite = this.owner.getChild("canvas");

        const pts: Laya.PathPoint[] = [];
        canvas.children.forEach((child: any) => {
            const c1 = child.getChild("c1", Laya.Sprite);
            const c2 = child.getChild("c2", Laya.Sprite);

            const pathPt = Laya.PathPoint.create(child.x, child.y, 0);

            pathPt.c1.x = c1.x;
            pathPt.c1.y = c1.y;

            pathPt.c2.x = c2.x;
            pathPt.c2.y = c2.y;

            pts.push(pathPt);
        });


        let path = new Laya.CurvePath();
        path.create(...pts);

        for (let i = 0, c = 40; i <= c; i++) {
            const t = i / c;
            const p = path.getPointAt(t);
            console.log(`t:${t}, x:${p.x}, y:${p.y}`);

            canvas.graphics.drawCircle(p.x, p.y, 10, "#ff0000", "#ffffff", 3);
        }

        // this.owner.graphics.drawCurves(10, 58, [0, 0, 19, -100, 100, 0], "#ff0000", 3);
    }

    onStart(): void {
        console.log("onStart");
        console.log("this.animationCurve:", this.animationCurve);

        for (let i = 0, len = 10; i <= len; i++) {
            const t = i / len;
            const y = this.animationCurve.getValue(t);
            console.log("t:", t, y);

        }




    }
}