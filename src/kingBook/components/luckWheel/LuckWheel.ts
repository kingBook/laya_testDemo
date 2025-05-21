
const { regClass, property } = Laya;

/** 定义转盘的模式 */
export enum RotationalMode {
    /** 单转盘，旋转指针 */
    SingleRotatePointer = 0x0001,
    /** 单转盘，固定指针 */
    SingleFixedPointer = 0x0010,
    /** 双转盘，旋转指针 */
    DoubleRotatePointer = 0x0100,
    /** 双转盘，固定指针 */
    DoubleFixedPointer = 0x1000
}

export enum Flag {
    Rotating = 0x0001,
    Tweening = 0x0010,
    Pausing = 0x0100
}


@regClass()
export class LuckWheel extends Laya.Script {

    declare owner: Laya.Sprite;

    // ===================== Editor start =====================
    @property({ type: Boolean, catalog: "Gizmo" })
    public gizmoVisible: boolean = true;
    @property({ type: Number, catalog: "Gizmo", step: 1, fractionDigits: 0 })
    public gizmoOutsideRadius: number = 750;
    @property({ type: Number, catalog: "Gizmo", step: 1, fractionDigits: 0 })
    public gizmoInnerRadius: number = 5;
    // =====================  Editor end  =====================

    @property({ type: RotationalMode, private: false, tips: "转盘的模式" })
    private _mode: RotationalMode = RotationalMode.SingleRotatePointer;

    @property({ type: Laya.Sprite, private: false, catalog: "Pointer", tips: "圆盘的指针" })
    private _pointer: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, catalog: "OutsideDisc", tips: "外部的转盘" })
    private _outsideDisc: Laya.Sprite;
    @property({ type: Laya.Sprite, private: false, catalog: "InnerDisc", tips: "内部的转盘" })
    private _innerDisc: Laya.Sprite;

    @property({ type: Number, private: false, catalog: "Pointer", step: 0.1, fractionDigits: 1, range: [-180, 180], tips: "指针素材的角度修正" })
    private _pointerAngleOffset: number = 90;

    @property({ type: Number, private: false, catalog: "Pointer", step: 0.1, fractionDigits: 1, range: [-90, 90], tips: "初始的指针旋转速度<度>，可以是负数" })
    private _pointerRpm: number = 14;
    @property({ type: Number, private: false, catalog: "OutsideDisc", step: 0.1, fractionDigits: 1, range: [-90, 90], tips: "初始的外部转盘的旋转速度<度>，可以是负数" })
    private _outsideDiscRpm: number = 14;
    @property({ type: Number, private: false, catalog: "InnerDisc", step: 0.1, fractionDigits: 1, range: [-90, 90], tips: "初始的内部转盘的旋转速度<度>，可以是负数" })
    private _innerDiscRpm: number = 14;

    @property({ type: [Number], private: false, catalog: "OutsideDisc", elementProps: { step: 0.1, fractionDigits: 1, range: [0, 360] }, tips: "分割外部转盘的分割线角度列表，角度区间为：[0, 360]" })
    private _outsideDiscSplitAngles: number[] = [0, 90, 180, 270];
    @property({ type: [Number], private: false, catalog: "InnerDisc", elementProps: { step: 0.1, fractionDigits: 1, range: [0, 360] }, tips: "分割内部转盘的分割线角度列表，角度区间为：[0, 360]" })
    private _innerDiscSplitAngles: number[] = [0, 180];

    /** 旋转摩擦系数 */
    private readonly _rotateFriction: number = 0.985;

    /** 旋转的中心 */
    private _center: Laya.Point;
    /** 指针半径 */
    private _pointerRadius: number;

    private _flags: number;

    /** 指针的角度, [0,360] */
    private _pointerAngle: number;


    /** 外转盘奖励结果索引 */
    private _outsideDiscRewardIndex: number;
    /** 内转盘奖励结果索引 */
    private _innderDiscRewardIndex: number;

    private _pointerRotationalObj: RotationalObject;
    private _outsideDiscRotationalObj: RotationalObject;
    private _innerDiscRotationalObj: RotationalObject;

    /** 指针半径 */
    //public get pointerRadius(): number { return this._pointerRadius; }

    public onAwake(): void {
        this._center = new Laya.Point(this.owner.pivotX, this.owner.pivotY);
        // 计算指针半径
        this._pointerRadius = this._center.distance(this._pointer.x, this._pointer.y);

        this._pointerRotationalObj = new RotationalObject();
        this._outsideDiscRotationalObj = new RotationalObject();
        this._innerDiscRotationalObj = new RotationalObject();
        this._pointerRotationalObj.on(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._outsideDiscRotationalObj.on(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._innerDiscRotationalObj.on(RotationalObject.ROTATE_END, this, this.onRotateEnd);

        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
    }

    public onUpdate(): void {
        if ((this._flags & Flag.Rotating) === 0) return;
        if (this._flags & Flag.Pausing) return;

        switch (this._mode) {
            case RotationalMode.SingleRotatePointer:
                this._pointerRotationalObj.update();
                this.setPointerAngle(this._pointerRotationalObj.angle);
                break;
            case RotationalMode.SingleFixedPointer:
                this._outsideDiscRotationalObj.update();
                this._outsideDisc.rotation = this._outsideDiscRotationalObj.angle;
                break;
            case RotationalMode.DoubleRotatePointer:
                this._pointerRotationalObj.update();
                this.setPointerAngle(this._pointerRotationalObj.angle);
                break;
            case RotationalMode.DoubleFixedPointer:
                this._outsideDiscRotationalObj.update();
                this._outsideDisc.rotation = this._outsideDiscRotationalObj.angle;

                this._innerDiscRotationalObj.update();
                this._innerDisc.rotation = this._innerDiscRotationalObj.angle;
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


    /** 开始旋转抽奖 */
    public startRotate(): void {
        if (this._flags & Flag.Rotating) return;
        this._flags |= Flag.Rotating;

        // 根据模式初始化
        switch (this._mode) {
            case RotationalMode.SingleRotatePointer:
                this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));

                this._pointerRotationalObj.setRewardAngle(NaN);
                this._pointerRotationalObj.init(this._pointerAngle, this._pointerRpm);
                break;
            case RotationalMode.SingleFixedPointer:
                this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));

                this._outsideDiscRotationalObj.setRewardAngle(NaN);
                this._outsideDiscRotationalObj.init(this._outsideDisc.rotation, this._outsideDiscRpm);
                break;
            case RotationalMode.DoubleRotatePointer:
                this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));

                this._pointerRotationalObj.setRewardAngle(NaN);
                this._pointerRotationalObj.init(this._pointerAngle, this._pointerRpm);
                break;
            case RotationalMode.DoubleFixedPointer:
                this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));

                this._outsideDiscRotationalObj.setRewardAngle(NaN);
                this._outsideDiscRotationalObj.init(this._outsideDisc.rotation, this._outsideDiscRpm);

                this._innerDiscRotationalObj.setRewardAngle(NaN);
                this._innerDiscRotationalObj.init(this._innerDisc.rotation, this._innerDiscRpm);
                break;
        }
    }

    /** 旋转结束时 */
    private onRotateEnd(rotationalObj: RotationalObject): void {
        switch (this._mode) {
            case RotationalMode.SingleRotatePointer:
                this._flags &= ~Flag.Rotating;
                console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
                break;
            case RotationalMode.SingleFixedPointer:
                this._flags &= ~Flag.Rotating;
                console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
                break;
            case RotationalMode.DoubleRotatePointer:
                this._flags &= ~Flag.Rotating;
                console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
                break;
            case RotationalMode.DoubleFixedPointer:
                if (this._outsideDiscRotationalObj.isRotateEnd && this._innerDiscRotationalObj.isRotateEnd) {
                    this._flags &= ~Flag.Rotating;
                    console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this._pointer.y - this._center.y, this._pointer.x - this._center.x)));
                }
                break;
        }
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
            switch (this._mode) {
                case RotationalMode.SingleRotatePointer:
                    this._pointerRotationalObj.setRewardAngle(120);
                    break;
                case RotationalMode.SingleFixedPointer:
                    this._outsideDiscRotationalObj.setRewardAngle(75);
                    break;
                case RotationalMode.DoubleRotatePointer:
                    this._pointerRotationalObj.setRewardAngle(120);
                    break;
                case RotationalMode.DoubleFixedPointer:
                    this._outsideDiscRotationalObj.setRewardAngle(75);
                    this._innerDiscRotationalObj.setRewardAngle(75);
                    break;
            }
            console.log("得到开奖结果");
        } else if (evt.keyCode === Laya.Keyboard.K) {
            if (this._flags & Flag.Pausing) {
                this._flags &= ~Flag.Pausing;
            } else {
                this._flags |= Flag.Pausing;
            }
        }
    }

    public onDestroy(): void {
        this._pointerRotationalObj.off(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._outsideDiscRotationalObj.off(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._innerDiscRotationalObj.off(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
        this._pointerRotationalObj = null;
        this._outsideDiscRotationalObj = null;
        this._innerDiscRotationalObj = null;
    }

}

class RotationalObject extends Laya.EventDispatcher {

    /** 旋转结束事件 */
    public static readonly ROTATE_END: string = "rotateEnd";

    /** 当前所在的角 [0,360]*/
    private _angle: number;
    /** 转速<度> */
    private _rpm: number;
    /** 奖励角度[0,360] */
    private _rewardAngle: number;
    /** 旋转摩擦系数 */
    private _rotateFriction: number;

    /** 是否处于缓中... */
    private _isTweening: boolean;
    /** 是否旋转结束 */
    private _isRotateEnd: boolean;

    /** 开始缓动角度的阈值 */
    private readonly tweenThreshold = 5;
    private readonly tweenAngleLen = 260;
    /** 与奖励角的距离 */
    private readonly extraAngle: number = 360;

    /** 当前所在的角 [0,360] */
    public get angle(): number { return this._angle; }
    /** 转速<度> */
    public get rmp(): number { return this._rpm; }
    /** 奖励角度[0,360]  */
    public get rewardAngle(): number { return this._rewardAngle; }
    /** 是否处于缓中... */
    public get isTweening(): boolean { return this._isTweening; }
    /** 是否旋转结束 */
    public get isRotateEnd(): boolean { return this._isRotateEnd; }


    /**
     * 初始化
     * @param angle 
     * @param rpm 
     * @param rotateFriction 
     */
    public init(angle: number, rpm: number, rotateFriction: number = 0.985): void {
        this.setAngle(angle);
        this._rpm = rpm;
        this._rotateFriction = rotateFriction;

        this.setRewardAngle(NaN);
        this._isTweening = false;
        this._isRotateEnd = false;
    }

    public update(): void {
        if (this._isRotateEnd) return;

        if (!isNaN(this._rewardAngle)) {

            // 计算与奖励角的距离
            let targetAngle = Math.sign(this._rpm) >= 0
                ? this._rewardAngle + this.extraAngle
                : (360 - this._rewardAngle) + this.extraAngle;

            let currentAngle = Math.sign(this._rpm) >= 0
                ? this._angle
                : 360 - this._angle;

            let deltaAngle: number = Laya.MathUtil.repeat(targetAngle - currentAngle, 360);

            //console.log("deltaAngle:", deltaAngle, this._rewardAngle, (360 - this._angle));

            if (this._isTweening) {
                let t = 1 - Laya.MathUtil.clamp01(deltaAngle / this.tweenAngleLen);
                t = t >= 0.999 ? 1 : t;
                if (t >= 1) {
                    let minRmp = 0.1;
                    console.log("t==1距离目标的度数:", deltaAngle);
                    if (deltaAngle > minRmp) {
                        this._rpm = Math.sign(this._rpm) * minRmp;
                        this.setAngle(this._angle + this._rpm);
                    } else {
                        this._isTweening = false; // 结束缓动
                        this._rpm = 0;
                        this.setAngle(this._rewardAngle); // 设置角为奖励角避免误差
                        this._isRotateEnd = true;
                        // 结束旋转
                        this.event(RotationalObject.ROTATE_END, this);
                    }
                } else {
                    this._rpm = Math.sign(this._rpm) * Math.ceil(Laya.MathUtil.lerp(this.tweenThreshold, 0, t) * 10) / 10;
                    console.log("缓动中:", "t:" + t, "rpm:" + this._rpm);
                    this.setAngle(this._angle + this._rpm);
                }
            } else if (Math.abs(this._rpm) <= this.tweenThreshold) {
                this._rpm = Math.sign(this._rpm) * this.tweenThreshold; // 限制旋转速度在缓动角度的阈值
                if (Math.abs(deltaAngle) >= this.tweenAngleLen) { // 距离太小，继续走，到达大角度才缓动
                    // 开始缓动
                    this._isTweening = true;
                    console.log("开始缓动", this._rewardAngle);
                }
                this.setAngle(this._angle + this._rpm);
            } else {
                this._rpm *= this._rotateFriction;
                console.log("降速:", "rpm:" + this._rpm);
                this.setAngle(this._angle + this._rpm);
            }
        } else {
            this.setAngle(this._angle + this._rpm);
        }
    }

    /**
     * 设置奖励结果的角度（将停止在指定的角度）
     * @param value 角度值 [0, 360], NaN：表示不设置
     */
    public setRewardAngle(value: number): void {
        this._rewardAngle = Laya.MathUtil.repeat(value, 360);
    }

    private setAngle(value: number): void {
        this._angle = Laya.MathUtil.repeat(value, 360);
    }


}