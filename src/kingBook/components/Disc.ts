import { MathUtil } from "../utils/MathUtil";

const { regClass, property } = Laya;

/** 定义转盘的模式 */
export enum Mode {
    /** 单转盘，旋转指针 */
    RotatePointer,
    /** 单转盘，固定指针 */
    FixedPointer,
    /** 双转盘，旋转指针 */
    DoubleRotatePointer,
    /** 双转盘，固定指针 */
    DoubleFixedPointer
}


@regClass()
export class Disc extends Laya.Script {

    /** 旋转摩擦系数 */
    //private readonly _rotateFriction: number = 0.985;

    @property({ type: Mode, private: false, tips: "转盘的模式" })
    private _mode: Mode = Mode.RotatePointer;
    @property({ type: Laya.Sprite, private: false, tips: "圆盘的指针" })
    private _pointer: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "外部的转盘背景" })
    private _bgOutside: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "内部的转盘背景" })
    private _bgInner: Laya.Sprite;
    @property({ type: Number, private: false, min: -180, max: 180, tips: "指针素材的角度修正" })
    private _pointerAngleOffset: number;
    /** 初始的旋转速度<角度> */
    @property({ type: [Number], private: false, fixedLength: true, tips: "初始的旋转速度<角度>，可以是负数" })
    private _initRotateSpeeds: number[] = [14, 0];
    @property({ type: [Number], private: false, elementProps: { range: [0, 360] }, tips: "分割外部转盘的分割线角度列表，角度区间为：[0, 360]" })
    private _splitOutsideAngles: number[] = [0, 180];
    @property({ type: [Number], private: false, elementProps: { range: [0, 360] }, tips: "分割内部转盘的分割线角度列表，角度区间为：[0, 360]" })
    private _splitInnerAngles: number[] = [0, 180];

    declare owner: Laya.Sprite;

    /** 旋转的中心 */
    private _center: Laya.Point;
    /** 当前的角度（[0]：指针/外部转盘的角度， [1]： 内部转盘的角度） */
    private _currentAngles: number[] = [];
    /** 指针半径 */
    private _pointerRadius: number;
    /** 是否在旋转中... */
    private _isRotating: boolean;
    /** 旋转的速度<弧度> */
    private _rotateSpeeds: number[] = [];
    /** 奖励的索引数组，长度不超过 2 */
    private _rewardIndices: number[] = [];
    /** 奖励的角度数组，长度不超过 2 */
    private _rewardAngles: number[] = [];

    public onAwake(): void {
        this._center = new Laya.Point(this._bgOutside.x, this._bgOutside.y);
        // 计算指针半径
        this._pointerRadius = this._center.distance(this._pointer.x, this._pointer.y);

        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
    }

    public init(mode: Mode): void {
        this._mode = mode;
    }

    public onUpdate(): void {
        if (this._isRotating) {
            this.updateRotation();
        }
    }

    /** 更新圆盘旋转 */
    private updateRotation(): void {
        let isGotRewardResult: boolean = this._rewardAngles.length > 0; // 是否已得到奖励结果

        this.setCurrentAngles(this._currentAngles[0] + this._rotateSpeeds[0], this._currentAngles[1] + this._rotateSpeeds[1]);



        switch (this._mode) {
            case Mode.RotatePointer:
                // 超出高速旋转持续时间，开始降速
                /*if (Laya.timer.currTimer - this._startRotatingTime > this._highSpeedRotateDuration) {
                    this._rotateSpeed *= this._rotateFriction;
        
                    // 速度降至很慢时，则结束旋转
                    if (this._rotateSpeed < 0.005) {
                        this._rotateSpeed = 0;
                        this.onRotateEnd();
                    }
                }*/
                if (isGotRewardResult) {


                } else {
                    this.setCurrentAngles(this._currentAngles + this._rotateSpeed);
                }


                break;
            case Mode.FixedPointer:

                break;
            case Mode.DoubleRotatePointer:

                break;
            case Mode.DoubleFixedPointer:

                break;
        }
    }

    /**
     * 设置当前的角度
     * @param angle0 指针/外转盘的度数
     * @param angle1 内转盘的度数
     */
    private setCurrentAngles(angle0: number, angle1?: number): void {

        this._currentAngles[0] = angle0;
        if (angle1 !== undefined) {

        }

        // 旋转指针
        let pointerRadian = Laya.Utils.toRadian(this._currentAngles);
        this._pointer.pos(
            this._center.x + Math.cos(pointerRadian) * this._pointerRadius,
            this._center.y + Math.sin(pointerRadian) * this._pointerRadius
        );
        this._pointer.rotation = this._currentAngles + this._pointerAngleOffset;
    }

    /**
     * 设置奖励结果的角度（转盘将停止在指定的角度）
     * @param index [0]：外转盘；[1]：内转盘 
     * @param value 角度值 [0, 360]
     */
    private setRewardAngles(index: number, value: number): void {
        index = Laya.MathUtil.clamp(index, 0, 1);

        //let pointerAngleClamp = Laya.MathUtil.repeat(this._pointerAngle, 360);
        //et deltaAngle: number = Laya.MathUtil.repeat(this._rewardAngles[0] - pointerAngleClamp, 360);

        let sign = this._rotateSpeeds[index] >= 0 ? 1 : -1;
        this._rewardAngles[index] = value + 360 * sign;
    }

    /** 开始旋转抽奖 */
    public startRotate(): void {
        this._isRotating = true;

        this._rotateSpeeds[0] = this._initRotateSpeeds[0];
        this._rotateSpeeds[1] = this._initRotateSpeeds[1];

        // 清空奖励结果
        this._rewardIndices.length = 0;
        this._rewardAngles.length = 0;

        // 记录指针当前所在弧度
        this.setCurrentAngles(Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
    }

    /** 旋转结束时 */
    private onRotateEnd(): void {
        this._isRotating = false;
        console.log("onRotateEnd");
    }

    /** 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度） */
    private onStageVisibilityChange(): void {
        if (!Laya.stage.isVisibility) {
            // 切换到在后台时

        } else {
            // 从后台切回来时

        }
    }

    // test
    public onKeyDown(evt: Laya.Event): void {
        if (evt.keyCode === Laya.Keyboard.H) {
            this.startRotate();
        } else if (evt.keyCode === Laya.Keyboard.J) {
            this.setRewardAngles(0, 75);
            console.log("得到开奖结果");
        }
    }

    public onDestroy(): void {
        Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
    }


}