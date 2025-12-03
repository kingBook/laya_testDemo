const { regClass, property } = Laya;

class CurvePoint {
    /** 位置 */
    pos = new Laya.Point(0, 0);
    /** 控制点1 */
    c1 = new Laya.Point(0, 0);
    /** 控制点2 */
    c2 = new Laya.Point(0, 0);

    constructor(posx: number = 0, posy: number = 0, c1x: number = 0, c1y: number = 0, c2x: number = 0, c2y: number = 0) {
        this.pos.setTo(posx, posy);
        this.c1.setTo(c1x, c1y);
        this.c2.setTo(c2x, c2y);
    }
}


@regClass()
export class AnimationCurve {

    private _points: CurvePoint[] = [new CurvePoint(0, 0), new CurvePoint(1, 1)];

    private keys:Laya.FloatKeyframe[]=[];



}