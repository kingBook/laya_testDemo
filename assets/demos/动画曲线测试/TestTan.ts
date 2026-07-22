import AnimationCurve from "views/prefabs/animationCurve/AnimationCurve";

const { regClass, property } = Laya;

@regClass()
export class TestTan extends Laya.Script {

    @property({ type: AnimationCurve, inspector: AnimationCurve.name, private: false })
    private _curve: AnimationCurve = new AnimationCurve();

    @property({ type: Laya.Box, private: false })
    private _canvas: Laya.Box;

    @property({ type: Laya.Box, private: false })
    private _curveDrawer: Laya.Box;

    @property({ type: Laya.Box, private: false })
    private _tangentDrawer: Laya.Box;

    private _nx: number = 0;

    onAwake(): void {
        this.drawCurve();
    }

    onUpdate(): void {
        const c = 1000;
        this._nx = Laya.MathUtil.repeat(this._nx + 1, c);
        const t = this._nx / c;

        this.drawTangent(t);

    }

    /** 画曲线 */
    private drawCurve(): void {
        this._curveDrawer.graphics.clear();

        const points: number[] = [];

        for (let i = 0, c = 100; i <= c; i++) {
            const nx = i / c;
            const ny = this._curve.getValue(nx);
            points.push(this.mapX(nx), this.mapY(ny));
        }

        this._curveDrawer.graphics.drawLines(0, 0, points, "#00ffff", 4);
    }

    /**
     * 画切线
     * @param t 
     */
    private drawTangent(t: number): void {
        const fromX = t;
        const formY = this._curve.getValue(t);

        const len = 0.5; // 切线长(单位化)
        const rad = Math.atan(this._curve.getTangent(t)); // 切线弧度
        // console.log("angle", Laya.Utils.toAngle(rad));

        const toX = fromX + Math.cos(rad) * len;
        const toY = formY + Math.sin(rad) * len;

        this._tangentDrawer.graphics.clear();
        this._tangentDrawer.graphics.drawLine(this.mapX(fromX), this.mapY(formY), this.mapX(toX), this.mapY(toY), "#ff0000", 4);
    }

    private mapX(nx: number): number {
        return this._canvas.width * nx;
    }

    private mapY(ny: number): number {
        return -this._canvas.height * ny + this._canvas.height;
    }


}