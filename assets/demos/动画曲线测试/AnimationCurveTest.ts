import AnimationCurve from "./animationCurve/AnimationCurve";


const { regClass, property } = Laya;

@regClass()
export class AnimationCurveTest extends Laya.Script {

    @property({ type: AnimationCurve, inspector: AnimationCurve.name })
    animationCurve: AnimationCurve;

    @property({ type: Laya.Box })
    box: Laya.Box;

    @property({ type: Laya.Box })
    box2: Laya.Box;

    private _time: number;
    private _totalTime: number;
    private _startY: number;
    private _targetY: number;
    private _isMoveing: boolean;

    onUpdate(): void {
        if (!this._isMoveing) return;

        this._time = Math.min(this._time + Laya.timer.delta, this._totalTime);
        const t = Laya.MathUtil.clamp01(Math.trunc(this._time / this._totalTime * 1000) / 1000); // [0,1]三位小数

        const tb = this.animationCurve.getValue(t);
        this.box2.y = Laya.MathUtil.lerp(this._startY, this._targetY, tb);

        if (t >= 1) {
            this._isMoveing = false;
        }
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            this._totalTime = 2000;
            this._targetY = 800;
            this._startY = 120;

            // 两个 box 起始 y 一致
            this.box.pos(375, this._startY);
            this.box2.pos(615, this._startY);

            // 示例1： tween 
            Laya.Tween.killAll(this.box);
            Laya.Tween.create(this.box).to('y', this._targetY).duration(this._totalTime).ease(this.animationCurve.easeFn);

            // 示例2：
            this._time = 0;
            this._isMoveing = true;
        }
    }
}