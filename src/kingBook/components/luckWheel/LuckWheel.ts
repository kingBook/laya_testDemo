
const { regClass, property } = Laya;

/** 转盘的模式 */
export enum LuckWheelMode {
    /** 单转盘，旋转指针 */
    SingleRotatePointer = 1,
    /** 单转盘，固定指针 */
    SingleFixedPointer = 2,
    /** 双转盘，固定指针 */
    DoubleFixedPointer = 4
}

enum Flag {
    Rotating = 1,
    Pausing = 2
}


@regClass()
export class LuckWheel extends Laya.Script {

    declare owner: Laya.Sprite;

    // ===================== Editor start =====================
    @property({ type: Boolean, catalog: "Gizmo" })
    public gizmoVisible: boolean = true;
    @property({ type: Number, catalog: "Gizmo", step: 1, fractionDigits: 0 })
    public gizmoOutsideRadius: number = 350;
    @property({ type: Number, catalog: "Gizmo", step: 1, fractionDigits: 0 })
    public gizmoInnerRadius: number = 200;
    // =====================  Editor end  =====================

    @property({ type: LuckWheelMode, tips: "转盘的模式" })
    public mode: LuckWheelMode = LuckWheelMode.SingleRotatePointer;

    @property({ type: Laya.Sprite, catalog: "Pointer", tips: "圆盘的指针" })
    public pointer: Laya.Sprite;
    @property({ type: Laya.Sprite, catalog: "Outside", tips: "外部的转盘" })
    public outsideDisc: Laya.Sprite;
    @property({ type: Laya.Sprite, catalog: "Inner", tips: "内部的转盘" })
    public innerDisc: Laya.Sprite;

    @property({ type: Number, catalog: "Pointer", step: 0.1, fractionDigits: 1, range: [-180, 180], tips: "指针素材的角度修正" })
    public pointerAngleOffset: number = 90;

    @property({ type: Number, catalog: "Pointer", step: 0.1, fractionDigits: 1, range: [-45, 45], tips: "初始的指针旋转速度<度>，可以是负数" })
    public pointerRpm: number = 14;
    @property({ type: Number, catalog: "Outside", step: 0.1, fractionDigits: 1, range: [-45, 45], tips: "初始的外转盘的旋转速度<度>，可以是负数" })
    public outsideDiscRpm: number = 14;
    @property({ type: Number, catalog: "Inner", step: 0.1, fractionDigits: 1, range: [-45, 45], tips: "初始的内转盘的旋转速度<度>，可以是负数" })
    public innerDiscRpm: number = 14;

    /** 外转盘的分割线角度列表，角度区间为：[0, 359] */
    @property({ type: [Number], catalog: "Outside", minArrayLength: 2, elementProps: { step: 0.1, fractionDigits: 1, range: [0, 359] }, tips: "外转盘的分割线角度列表，角度区间为：[0, 359]" })
    public outsideSplitAngles: number[] = [0, 90, 180, 270];
    /** 内转盘的分割线角度列表，角度区间为：[0, 359] */
    @property({ type: [Number], catalog: "Inner", minArrayLength: 2, elementProps: { step: 0.1, fractionDigits: 1, range: [0, 359] }, tips: "内转盘的分割线角度列表，角度区间为：[0, 359]" })
    public innerSplitAngles: number[] = [0, 45, 135, 225];

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
    private _outsideRewardIndex: number;
    /** 内转盘奖励结果索引 */
    private _innerRewardIndex: number;

    private _pointerRotationalObj: RotationalObject;
    private _outsideRotationalObj: RotationalObject;
    private _innerRotationalObj: RotationalObject;

    /** 指针半径 */
    public get pointerRadius(): number { return this._pointerRadius; }
    /** 指针的角度, [0,360] */
    public get pointerAngle(): number { return this._pointerAngle; }
    /** 是否暂停中... */
    public get isPausing(): boolean { return (this._flags & Flag.Pausing) > 0; }


    public onAwake(): void {
        this._center = new Laya.Point(this.owner.pivotX, this.owner.pivotY);
        // 计算指针半径
        this._pointerRadius = this._center.distance(this.pointer.x, this.pointer.y);

        this._pointerRotationalObj = new RotationalObject();
        this._outsideRotationalObj = new RotationalObject();
        this._innerRotationalObj = new RotationalObject();
        this._pointerRotationalObj.on(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._outsideRotationalObj.on(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._innerRotationalObj.on(RotationalObject.ROTATE_END, this, this.onRotateEnd);

        Laya.stage.on(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
    }

    public onUpdate(): void {
        if ((this._flags & Flag.Rotating) === 0) return;
        if (this._flags & Flag.Pausing) return;

        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationalObj.update();
                this.setPointerAngle(this._pointerRotationalObj.angle);
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outsideRotationalObj.update();
                this.outsideDisc.rotation = this._outsideRotationalObj.angle;
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outsideRotationalObj.update();
                this.outsideDisc.rotation = this._outsideRotationalObj.angle;

                this._innerRotationalObj.update();
                this.innerDisc.rotation = this._innerRotationalObj.angle;
                break;
        }
    }

    /** 开始旋转抽奖 */
    public startRotate(): void {
        if (this._flags & Flag.Rotating) return;
        this._flags |= Flag.Rotating;

        let tempPointerAngle = Laya.Utils.toAngle(Math.atan2(this.pointer.y - this._center.y, this.pointer.x - this._center.x));

        // 根据模式初始化
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this.setPointerAngle(tempPointerAngle);

                this._pointerRotationalObj.setRewardAngle(NaN);
                this._pointerRotationalObj.init(this._pointerAngle, this.pointerRpm, this._rotateFriction);
                break;
            case LuckWheelMode.SingleFixedPointer:
                this.setPointerAngle(tempPointerAngle);

                this._outsideRotationalObj.setRewardAngle(NaN);
                this._outsideRotationalObj.init(this.outsideDisc.rotation, this.outsideDiscRpm, this._rotateFriction);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this.setPointerAngle(tempPointerAngle);

                this._outsideRotationalObj.setRewardAngle(NaN);
                this._outsideRotationalObj.init(this.outsideDisc.rotation, this.outsideDiscRpm, this._rotateFriction);

                this._innerRotationalObj.setRewardAngle(NaN);
                this._innerRotationalObj.init(this.innerDisc.rotation, this.innerDiscRpm, this._rotateFriction);
                break;
        }
    }

    /** 旋转结束时 */
    private onRotateEnd(rotationalObj: RotationalObject): void {
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._flags &= ~Flag.Rotating;
                console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this.pointer.y - this._center.y, this.pointer.x - this._center.x)));
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._flags &= ~Flag.Rotating;
                console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this.pointer.y - this._center.y, this.pointer.x - this._center.x)));
                break;
            case LuckWheelMode.DoubleFixedPointer:
                if (this._outsideRotationalObj.isRotateEnd && this._innerRotationalObj.isRotateEnd) {
                    this._flags &= ~Flag.Rotating;
                    console.log("onRotateEnd", Laya.Utils.toAngle(Math.atan2(this.pointer.y - this._center.y, this.pointer.x - this._center.x)));
                }
                break;
        }
    }

    // test
    public onKeyDown(evt: Laya.Event): void {
        if (evt.keyCode === Laya.Keyboard.H) {
            this.startRotate();
        } else if (evt.keyCode === Laya.Keyboard.J) {
            switch (this.mode) {
                case LuckWheelMode.SingleRotatePointer:
                    this.setRewardIndex(2);
                    break;
                case LuckWheelMode.SingleFixedPointer:
                    this.setRewardIndex(2);
                    break;
                case LuckWheelMode.DoubleFixedPointer:
                    this.setRewardIndex(0, 3);
                    break;
            }
            console.log("得到开奖结果");
        } else if (evt.keyCode === Laya.Keyboard.K) {
            this.setPause(!this.isPausing);
        }
    }

    /**
     * 设置奖励索引
     * @param outsideRewardIndex 外转盘的奖励索引(正整数)，值区间: [ 0, {@link outsideSplitAngles}.length )
     * @param innerRewardIndex 内转盘的奖励索引(正整数)，值区间: [ 0, {@link innerSplitAngles}.length )
     */
    public setRewardIndex(outsideRewardIndex: number, innerRewardIndex?: number): void {
        if (outsideRewardIndex < 0 || outsideRewardIndex >= this.outsideSplitAngles.length) {
            throw new Error(`外转盘奖励索引,必须为正整数且小于分割线的数量 ${this.outsideSplitAngles.length}, 当前值: ${outsideRewardIndex}`);
        }
        if (innerRewardIndex < 0 || innerRewardIndex >= this.innerSplitAngles.length) {
            throw new Error(`内转盘奖励索引,必须为正整数且小于分割线的数量 ${this.innerSplitAngles.length}, 当前值: ${innerRewardIndex}`);
        }

        this._outsideRewardIndex = outsideRewardIndex;
        this._innerRewardIndex = innerRewardIndex;

        // 根据奖励索引设置奖励的角度
        let rewardAngle: number;
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                rewardAngle = this.getRewardAngleByIndex(this._outsideRewardIndex, this.outsideSplitAngles);
                this._pointerRotationalObj.setRewardAngle(rewardAngle);
                break;
            case LuckWheelMode.SingleFixedPointer:
                rewardAngle = this.getRewardAngleByIndex(this._outsideRewardIndex, this.outsideSplitAngles);
                this._outsideRotationalObj.setRewardAngle(rewardAngle);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                rewardAngle = this.getRewardAngleByIndex(this._outsideRewardIndex, this.outsideSplitAngles);
                this._outsideRotationalObj.setRewardAngle(rewardAngle);

                let rewardAngle2 = this.getRewardAngleByIndex(this._innerRewardIndex, this.innerSplitAngles);
                this._innerRotationalObj.setRewardAngle(rewardAngle2);
                break;
        }
    }

    /** 设置暂停 */
    public setPause(isPause: boolean): void {
        if (isPause) {
            this._flags |= Flag.Pausing;
        } else {
            this._flags &= ~Flag.Pausing;
        }
    }

    /**
     * 根据奖励索引返回奖励的角度
     * @param rewardIndex 转盘奖励索引
     * @param splitAngles 转盘分割线角度数组
     * @returns 返回角度 [0,360]
     */
    private getRewardAngleByIndex(rewardIndex: number, splitAngles: number[]): number {
        let min = splitAngles[rewardIndex]; // 区块的下限角
        let max = rewardIndex + 1 >= splitAngles.length ? 360 : splitAngles[rewardIndex + 1]; // 区块的上限角，到达分割线数组最大索引时取 360

        const t = 0.5;
        let rewardAngle = Laya.MathUtil.lerp(min, max, t);

        // 固定指针时，计算指针角度差异
        if ((this.mode & LuckWheelMode.SingleFixedPointer) || (this.mode & LuckWheelMode.DoubleFixedPointer)) {
            rewardAngle = 360 - rewardAngle;
            rewardAngle = Laya.MathUtil.repeat(rewardAngle + this._pointerAngle, 360);
        }

        return rewardAngle;
    }

    /**
     * 设置指针的角度
     * @param value 角度值
     */
    private setPointerAngle(value: number): void {
        this._pointerAngle = Laya.MathUtil.repeat(value, 360);
        // 旋转指针
        let pointerRadian = Laya.Utils.toRadian(this._pointerAngle);
        this.pointer.pos(
            this._center.x + Math.cos(pointerRadian) * this._pointerRadius,
            this._center.y + Math.sin(pointerRadian) * this._pointerRadius
        );
        this.pointer.rotation = this._pointerAngle + this.pointerAngleOffset;
    }

    /** 舞台可见性发生变化时调度（比如浏览器或者当前标签被切换到后台后调度） */
    private onStageVisibilityChange(): void {
        if (!Laya.stage.isVisibility) {
            // 切换到在后台时

        } else {
            // 从后台切回来时

        }
    }

    public onDestroy(): void {
        this._pointerRotationalObj.off(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._outsideRotationalObj.off(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        this._innerRotationalObj.off(RotationalObject.ROTATE_END, this, this.onRotateEnd);
        Laya.stage.off(Laya.Event.VISIBILITY_CHANGE, this, this.onStageVisibilityChange);
        this._pointerRotationalObj = null;
        this._outsideRotationalObj = null;
        this._innerRotationalObj = null;
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
    private _isEasing: boolean;
    /** 是否旋转结束 */
    private _isRotateEnd: boolean;

    /** 开始缓动角速度的阈值 */
    private readonly easeThreshold = 5;
    /** 缓动的角长（用于计算什么距离多少度开始缓动，以及缓动的进度插值） */
    private readonly easeAngleLen = 260;
    /** 当到达奖励角时，再多转的圈数角 */
    private readonly extraAngle: number = 360;

    /** 当前所在的角 [0,360] */
    public get angle(): number { return this._angle; }
    /** 转速<度> */
    public get rmp(): number { return this._rpm; }
    /** 奖励角度[0,360]  */
    public get rewardAngle(): number { return this._rewardAngle; }
    /** 是否处于缓中... */
    public get isEasing(): boolean { return this._isEasing; }
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
        this._isEasing = false;
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

            if (this._isEasing) {
                let t = 1 - Laya.MathUtil.clamp01(deltaAngle / this.easeAngleLen);
                t = t >= 0.999 ? 1 : t;
                if (t >= 1) {
                    let minRmp = 0.1;
                    console.log("t==1距离目标的度数:", deltaAngle);
                    if (deltaAngle > minRmp) {
                        this._rpm = Math.sign(this._rpm) * minRmp;
                        this.setAngle(this._angle + this._rpm);
                    } else {
                        this._isEasing = false; // 结束缓动
                        this._rpm = 0;
                        this.setAngle(this._rewardAngle); // 设置角为奖励角避免误差
                        this._isRotateEnd = true;
                        // 结束旋转
                        this.event(RotationalObject.ROTATE_END, this);
                    }
                } else {
                    this._rpm = Math.sign(this._rpm) * Math.ceil(Laya.MathUtil.lerp(this.easeThreshold, 0, t) * 10) / 10;
                    console.log("缓动中:", "t:" + t, "rpm:" + this._rpm);
                    this.setAngle(this._angle + this._rpm);
                }
            } else if (Math.abs(this._rpm) <= this.easeThreshold) {
                this._rpm = Math.sign(this._rpm) * this.easeThreshold; // 限制旋转速度在缓动角度的阈值
                if (Math.abs(deltaAngle) >= this.easeAngleLen) { // 距离太小，继续走，到达大角度才缓动
                    // 开始缓动
                    this._isEasing = true;
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