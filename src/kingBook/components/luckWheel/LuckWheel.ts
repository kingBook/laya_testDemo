
const { regClass, property } = Laya;

/** 定义转盘的模式 */
export enum Mode {
    /** 单转盘，旋转指针 */
    RotatePointer = 0x0001,
    /** 单转盘，固定指针 */
    FixedPointer = 0x0010,
    /** 双转盘，旋转指针 */
    DoubleRotatePointer = 0x0100,
    /** 双转盘，固定指针 */
    DoubleFixedPointer = 0x1000
}

export enum Flag {
    Rotating = 0x0001,
    Tweening = 0x0010
}


@regClass()
export class LuckWheel extends Laya.Script {

    declare owner: Laya.Sprite;

    @property({ type: Mode, private: false, tips: "转盘的模式" })
    private _mode: Mode = Mode.RotatePointer;
    @property({ type: Laya.Sprite, private: false, tips: "圆盘的指针" })

    private _pointer: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "外部的转盘" })
    private _outsideDisc: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, tips: "内部的转盘" })
    private _innerDisc: Laya.Sprite;

    @property({ type: Number, private: false, range: [-180, 180], tips: "指针素材的角度修正" })
    private _pointerAngleOffset: number;

    @property({ type: Number, private: false, range: [-90, 90], tips: "初始的指针旋转速度<度>，可以是负数" })
    private _initPointerRpm: number = 14;
    @property({ type: Number, private: false, range: [-90, 90], tips: "初始的外部转盘的旋转速度<度>，可以是负数" })
    private _initOutsideDiscRpm: number = 14;
    @property({ type: Number, private: false, range: [-90, 90], tips: "初始的内部转盘的旋转速度<度>，可以是负数" })
    private _initInnerDiscRpm: number = 14;

    @property({ type: [Number], private: false, elementProps: { range: [0, 360] }, tips: "分割外部转盘的分割线角度列表，角度区间为：[0, 360]" })
    private _splitOutsideDiscAngles: number[] = [0, 180];
    @property({ type: [Number], private: false, elementProps: { range: [0, 360] }, tips: "分割内部转盘的分割线角度列表，角度区间为：[0, 360]" })
    private _splitInnerDiscAngles: number[] = [0, 180];

    /** 旋转摩擦系数 */
    private readonly _rotateFriction: number = 0.985;

    /** 旋转的中心 */
    private _center: Laya.Point;
    /** 指针半径 */
    private _pointerRadius: number;

    private _flags: number;

    /** 指针的角度, [0,360] */
    private _pointerAngle: number;
    /** 外部转盘的角度 */
    private _outsideDiscAngle: number;
    /** 内部转盘的角度 */
    private _innerDiscAngle: number;

    /** 指针的旋转速度 */
    private _pointerRpm: number;
    /** 外部转盘的旋转速度 */
    private _outsideDiscRpm: number;
    /** 内部转盘的旋转速度 */
    private _innerDiscRpm: number;

    /** 外转盘奖励结果索引 */
    private _outsideDiscRewardIndex: number;
    /** 内转盘奖励结果索引 */
    private _innderDiscRewardIndex: number;

    /** 指针奖励结果的角度*/
    private _pointerRewardAngle: number;
    /** 外部转盘奖励结果的角度 */
    private _outsideDiscRewardAngle: number;
    /** 内部转盘奖励结果的角度 */
    private _innerDiscRewardAngle: number;


    public onAwake(): void {
        this._center = new Laya.Point(this.owner.pivotX, this.owner.pivotY);
        // 计算指针半径
        this._pointerRadius = this._center.distance(this._pointer.x, this._pointer.y);

        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
    }

    /*public init(mode: Mode): void {
        this._mode = mode;
    }*/

    public onUpdate(): void {
        if ((this._flags & Flag.Rotating) > 0) {
            this.updateRotation();
        }
    }

    private _pointerTweenStartAngle: number;
    /** 更新圆盘旋转 */
    private updateRotation(): void {
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
                if (!isNaN(this._pointerRewardAngle)) {
                    const tweenThreshold = 2//5; // 开始缓动角度的阈值
                    const tweenAngleLen = 260;
                    // 与奖励角的距离
                    let deltaAngle: number = Laya.MathUtil.repeat(this._pointerRewardAngle - this._pointerAngle, 360);

                    if ((this._flags & Flag.Tweening) > 0) {

                        let t = 1 - Laya.MathUtil.clamp01(deltaAngle / tweenAngleLen);
                        t = t >= 0.999 ? 1 : t;
                        if (t >= 1) {
                            let minRmp = 0.1;
                            console.log("t>=1距离目标：", deltaAngle);
                            if (deltaAngle > 0.1) {
                                this._pointerRpm = Math.sign(this._pointerRpm) * minRmp;
                            } else {
                                this._flags &= ~Flag.Tweening; // 结束缓动
                                this.setPointerAngle(this._pointerRewardAngle);
                                // 结束旋转
                                this.onRotateEnd();
                            }
                        } else {
                            this._pointerRpm = Math.sign(this._pointerRpm) * Math.ceil(Laya.MathUtil.lerp(tweenThreshold, 0, t) * 10) / 10;
                            console.log(t, this._pointerRpm);
                        }
                        this.setPointerAngle(this._pointerAngle + this._pointerRpm);
                    } else if (Math.abs(this._pointerRpm) <= tweenThreshold) {
                        this._pointerRpm = Math.sign(this._pointerRpm) * tweenThreshold; // 限制旋转速度在缓动角度的阈值
                        console.log(deltaAngle, this._pointerRewardAngle);
                        
                        if (Math.abs(deltaAngle) >= tweenAngleLen) { // 距离太小，继续走，到达大角度才缓动
                            // 开始缓动
                            //this._flags |= Flag.Tweening;
                            //this._pointerTweenStartAngle = this._pointerAngle;
                            //console.log("开始缓动", this._pointerTweenStartAngle, this._pointerRewardAngle);
                        }
                        this.setPointerAngle(this._pointerAngle + this._pointerRpm);
                    } else {
                        this._pointerRpm *= this._rotateFriction;
                        console.log("降速:", this._pointerRpm);
                        this.setPointerAngle(this._pointerAngle + this._pointerRpm);
                    }
                } else {
                    this.setPointerAngle(this._pointerAngle + this._pointerRpm);
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
     * 设置指针的角度
     * @param value 角度值
     */
    private setPointerAngle(value: number): void {
        this._pointerAngle = Laya.MathUtil.repeat(value, 360);
        // 旋转指针
        let pointerRadian = Laya.Utils.toRadian(this._pointerAngle);
        this._pointer.pos(
            this._center.x + Math.cos(pointerRadian) * this._pointerRadius,
            this._center.y + Math.sin(pointerRadian) * this._pointerRadius
        );
        this._pointer.rotation = this._pointerAngle + this._pointerAngleOffset;
    }

    /**
     * 设置奖励结果的角度（转盘将停止在指定的角度）
     * 注意：需设置了旋转速度才能调用该方法
     * @param pointerRewardAgnle 指针, 角度值 [0, 360], NaN：表示不设置
     * @param outsideRewardAngle 外转盘, 角度值 [0, 360], NaN：表示不设置
     * @param innerDiscRewardAngle 内转盘, 角度值 [0, 360], NaN：表示不设置
     */
    private setRewardAngles(pointerRewardAgnle?: number, outsideRewardAngle?: number, innerDiscRewardAngle?: number): void {
        const extraAngle: number = 360;
        this._pointerRewardAngle = pointerRewardAgnle + Math.sign(this._pointerRpm) * extraAngle;
        this._outsideDiscRewardAngle = outsideRewardAngle + Math.sign(this._outsideDiscRpm) * extraAngle;
        this._innerDiscRewardAngle = innerDiscRewardAngle + Math.sign(this._innerDiscRpm) * extraAngle;
    }

    /** 开始旋转抽奖 */
    public startRotate(): void {
        if (this._flags & Flag.Rotating) return;
        this._flags |= Flag.Rotating;

        // 设置初始转速
        switch (this._mode) {
            case Mode.RotatePointer:
                this._pointerRpm = this._initPointerRpm;
                this._outsideDiscRpm = 0;
                this._innerDiscRpm = 0;
                break;
            case Mode.FixedPointer:
                this._pointerRpm = 0;
                this._outsideDiscRpm = this._initOutsideDiscRpm;
                this._innerDiscRpm = 0;
                break;
            case Mode.DoubleRotatePointer:
                this._pointerRpm = this._initPointerRpm;
                this._outsideDiscRpm = 0;
                this._innerDiscRpm = 0;
                break;
            case Mode.DoubleFixedPointer:
                this._pointerRpm = 0;
                this._outsideDiscRpm = this._initOutsideDiscRpm;
                this._innerDiscRpm = this._initInnerDiscRpm;
                break;
        }

        // 清空奖励结果
        this.setRewardAngles(NaN, NaN, NaN);

        // 记录指针当前所在弧度
        this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
    }

    /** 旋转结束时 */
    private onRotateEnd(): void {
        this._flags &= ~Flag.Rotating;
        console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
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
            this.setRewardAngles(75);
            console.log("得到开奖结果", "isTweening:", (this._flags & Flag.Tweening) > 0, "_pointerRpm:", Math.abs(this._pointerRpm));
        }
    }

    public onDestroy(): void {
        Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
    }


}