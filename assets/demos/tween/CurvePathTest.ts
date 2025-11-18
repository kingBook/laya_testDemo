const { regClass, property } = Laya;

@regClass()
export class CurvePathTest extends Laya.Script {

    declare owner: Laya.Sprite;

    @property({ type: [Laya.Sprite], nullable: false })
    pathPointSprites: Laya.Sprite[] = [];

    private _pathPoints: Laya.PathPoint[] = [];
    private _curvePath = new Laya.CurvePath();

    onAwake(): void {

    }

    onUpdate(): void {
        this.updatePathPoints();
        this.drawPath();
    }

    private updatePathPoints(): void {
        this.pathPointSprites.forEach((sp, index) => {
            const anchorSp1 = sp.getChild("anchor_1", Laya.Sprite);
            const anchorSp2 = sp.getChild("anchor_2", Laya.Sprite);

            const ppt = new Laya.PathPoint();
            ppt.pos = new Laya.Vector3(sp.x, sp.y, 0);
            ppt.c1 = new Laya.Vector3(sp.x + anchorSp1.x, sp.y + anchorSp1.y, 0);
            ppt.c2 = new Laya.Vector3(sp.x + anchorSp2.x, sp.y + anchorSp2.y, 0);
            ppt.curve = Laya.CurveType.Bezier;
            this._pathPoints[index] = ppt;
        });

        this._curvePath.create(...this._pathPoints);
    }

    private drawPath(): void {
        const path: any[] = [];
        for (let i = 0, len = 100; i <= len; i++) {
            const t: number = i / len;
            const p: Laya.Vector3 = this._curvePath.getPointAt(t);

            path.push([i == 0 ? "moveTo" : "lineTo", p.x, p.y]);
        }

        this.owner.graphics.clear();
        this.owner.graphics.drawPath(0, 0, path, null/*{ fillStyle: "#ff0000" }*/, { "strokeStyle": "#ffffff", "lineWidth": "10" });

    }
}