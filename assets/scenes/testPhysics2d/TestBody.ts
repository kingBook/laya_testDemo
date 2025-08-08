
const { regClass, property } = Laya;

@regClass()
export class TestBody extends Laya.Script {

    @property({ type: Laya.Sprite })
    polygon_graphics: Laya.Sprite;

    private _bodyb2: any;

    onAwake(): void {

        const xys = [
            -31, 37,
            0, 0,
            62, -30,
            55, 54,
            147, 71,
            243, 42,
            346, 30,
            324, 102,
            308, 231,
            231, 188,
            237, 132,
            117, 131,
            0, 100
        ];

        const body = this.polygon_graphics.addComponent(Laya.RigidBody);

        //body.shapes = [poly];
        const bodyb2 = body.getBox2DBody();
        this._bodyb2 = bodyb2;

        //const polyb2 = new b2PolygonShape();Laya.Box2DShape
        // polyb2.SetAsBox(40 / 50, 40 / 50);
        //polyb2.Set(xys);

        // bodyb2.CreateFixture(polyb2, 1);
    }

    onUpdate(): void {
        //console.log("pos", this._bodyb2.GetPosition());
    }

}