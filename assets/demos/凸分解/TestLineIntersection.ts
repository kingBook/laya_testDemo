import { Separator } from "./Separator";

const { regClass, property } = Laya;

@regClass()
export class TestLineIntersection extends Laya.Script {

    @property({ type: Laya.Sprite })
    p0: Laya.Sprite;

    @property({ type: Laya.Sprite })
    p1: Laya.Sprite;

    @property({ type: Laya.Sprite })
    p2: Laya.Sprite;

    @property({ type: Laya.Label })
    infoLabel: Laya.Label;

    onAwake(): void {

    }

    onUpdate(): void {
        // 线段[p1,p2]与线段[p2,p1]是否相交
        const hit1 = Separator.hitSegment(
            this.p1.x, this.p1.y, this.p2.x, this.p2.y,
            this.p2.x, this.p2.y, this.p1.x, this.p1.y
        );

        // 线段[p0,p1]与线段[p1,p2]是否相交
        const hit2 = Separator.hitSegment(
            this.p0.x, this.p0.y, this.p1.x, this.p1.y,
            this.p1.x, this.p1.y, this.p2.x, this.p2.y
        );

        // 线段[p0,p1]与线段[p2,p1]是否相交
        const hit3 = Separator.hitSegment(
            this.p0.x, this.p0.y, this.p1.x, this.p1.y,
            this.p2.x, this.p2.y, this.p1.x, this.p1.y
        );

        this.infoLabel.text = `线段[p1,p2]与线段[p2,p1]是否相交 ${Boolean(hit1)}\n`
            + `线段[p0,p1]与线段[p1,p2]是否相交  ${Boolean(hit2)}\n`
            + `线段[p0,p1]与线段[p2,p1]是否相交  ${Boolean(hit3)}`;
    }


}