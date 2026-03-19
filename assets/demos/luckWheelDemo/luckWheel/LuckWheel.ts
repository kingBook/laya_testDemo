import Utils from "utils/Utils";
import { BezierEaseData } from "./BezierEaseData";
import LuckWheelUtil from "./LuckWheelUtil";
import { SectorData } from "./SectorData";

const { regClass, property } = Laya;

/** 转盘的模式 */
export enum LuckWheelMode {
    /** 单转盘，旋转指针 */
    SingleRotatePointer = 1,
    /** 单转盘，固定指针 */
    SingleFixedPointer = 2,
    /** 双转盘，固定指针 */
    DoubleFixedPointer = 4,
    /** 双转盘，固定内转盘，旋转指针和外转盘 */
    DoubleOnlyFixedInner = 8
}

enum Flag {
    /** 旋转中... */
    Rotating = 1,
    /** 暂停中... */
    Pausing = 2
}

/**
 * 幸运转盘
 * 
 * 旋转完成时，{@link owner} 将派发 {@link EVENT_ROTATION_COMPLETE} 事件
 * 
 * @example
 ```
const luckWheel: LuckWheel = this.owner.getComponent(LuckWheel); 

// 设置转盘模式
luckWheel.mode = LuckWheelMode.SingleRotatePointer;

// 设置指针
luckWheel.pointer = xxx;
luckWheel.pointerAngleOffset = 90; // 指针素材的角度修正值
luckWheel.isInitPointerClockwise = true; // 固定指针的模式，可以不设置

// 角度分割数据
const sectorData = new SectorData();
sectorData.itemsContainer = xxx; // 必须是转盘(outerDisc/innerDisc)的子级
sectorData.sectorAngles = [0, 90, 182, 270]; // 切分区块的分割线角度值，[0-359] 小 -> 大

// 设置外转盘
luckWheel.outerDisc = xxx;
luckWheel.isInitOuterClockwise = true; // 只旋转指针的模式，可以不设置
luckWheel.outerSectorDatas = [sectorData,...];

// 设置内转盘（单转盘的模式，可以不设置）
luckWheel.innerDisc = xxx;
luckWheel.isInitInnerClockwise = false; // 只旋转指针的模式，可以不设置
luckWheel.innerSectorDatas = [sectorData,...]; // 切分区块的分割线角度值，[0-359] 小 -> 大

// ================ 其他接口 ======================================
// 设置奖励的索引
luckWheel.setRewardIndex(outerRewardIndex, innerRewardIndex);
// 暂停旋转
luckWheel.setPause(true);
// 停止旋转
luckWheel.stopRotation();
// 侦听旋转完成
luckWheel.owner.on(LuckWheel.EVENT_ROTATION_COMPLETE, this, ()=>{
    // 旋转完成
});

// 获取外转盘各个分割的区块对称轴线上的位置（多用于动态摆放奖品图标时的位置）
luckWheel.getOuterSectorPositions(radius, isAddCenter, out);
// 获取外转盘各个分割的区块对称轴线上的位置（多用于动态摆放奖品图标时的位置）
luckWheel.getInnerSectorPositions(radius, isAddCenter, out);
// 根据角度获取外转盘分割后的扇形区域索引
luckWheel.getOuterIndexByAngle(ousideAngle);
// 根据角度获取内转盘分割后的扇形区域索引
luckWheel.getInnerIndexByAngle(innerAngle);
```
 */
@regClass()
export class LuckWheel extends Laya.Script {

    /** 旋转完成事件 */
    public static readonly EVENT_ROTATION_COMPLETE: string = "eventRotationComplete";

    declare owner: Laya.Sprite;

    @property({ type: LuckWheelMode, private: true }) //  private：true，不会出现在IDE的属性面板上，只是用来存储输入
    private _mode: LuckWheelMode = LuckWheelMode.SingleRotatePointer;
    /** 转盘的模式 */
    @property({ type: LuckWheelMode, serializable: false, tips: "转盘的模式" }) // serializable：false，不会被保存到场景文件中
    public get mode(): LuckWheelMode { return this._mode; }



    // ===================== Editor start =========================
    @property({ type: Boolean, private: false, catalog: "Gizmo", tips: "是否在场景视图中显示 Gizmo 绘制的圆, 直观地查看角度分割线, 注意：仅显示 outerSelectIndex 和 innerSelectIndex 指定的圆" })
    private _gizmoVisible: boolean = false;
    @property({ type: Number, private: false, catalog: "Gizmo", step: 1, fractionDigits: 0, tips: "Gizmo 绘制的外圆半径" })
    private _gizmoOuterRadius: number = 350;
    @property({ type: Number, private: false, catalog: "Gizmo", step: 1, fractionDigits: 0, readonly: "data.mode==1||data.mode==2", tips: "Gizmo 绘制的内圆半径" })
    private _gizmoInnerRadius: number = 200;
    // =====================  Editor end  =========================


    // ===================== Pointer start  =======================
    /** 圆盘的指针 */
    @property({ type: Laya.Sprite, catalog: "Pointer", tips: "圆盘的指针" })
    public pointer: Laya.Sprite;
    /** 指针素材的角度修正 */
    @property({ type: Number, catalog: "Pointer", step: 0.1, fractionDigits: 1, range: [-180, 180], tips: "指针素材的角度修正" })
    public pointerAngleOffset: number = 90;
    /** 初始指针的旋转方向，是否为顺时针 */
    @property({ type: Boolean, catalog: "Pointer", readonly: "data.mode==2||data.mode==4", tips: "初始指针的旋转方向，是否为顺时针" })
    public isInitPointerClockwise: boolean = true;
    // =====================  Pointer end  ========================


    // ===================== Outer start  =======================
    /** 外转盘 */
    @property({ type: Laya.Sprite, catalog: "Outer", tips: "外转盘" })
    public outerDisc: Laya.Sprite;
    /** 初始外转盘的旋转方向，是否为顺时针 */
    @property({ type: Boolean, catalog: "Outer", readonly: "data.mode==1", tips: "初始外转盘的旋转方向，是否为顺时针" })
    public isInitOuterClockwise: boolean = true;

    @property({ type: Number, private: true }) //  private：true，不会出现在IDE的属性面板上，只是用来存储输入
    private _outerSelectIndex: number = 0;
    /** 外转盘选择的分割数据索引 */
    @property({ type: Number, catalog: "Outer", serializable: false, enumSource: "outerSelectIndexEnumSource", min: 0, step: 1, fractionDigits: 0, tips: "外转盘选择的分割数据索引" }) // serializable：false，不会被保存到场景文件中
    public get outerSelectIndex(): number { return this._outerSelectIndex; }
    /** outerSelectIndex 枚举源 (仅用于编辑器) */
    @property({ type: [["Record", String]], hidden: true, serializable: false })
    public get outerSelectIndexEnumSource() {
        const result: { name: string, value: number }[] = [];
        this.outerSectorDatas.forEach((item, index) => {
            result[index] = { name: index.toString(), value: index };
        }, this);
        return result;
    }

    /** 外转盘的分割数据数组 */
    @property({ type: [SectorData], catalog: "Outer", nullable: false, minArrayLength: 1, onChange: "onChangeOuterSectorDatas", tips: "外转盘的分割数据数组" })
    public outerSectorDatas: SectorData[] = [];
    /** 在编辑器中改变 {@link outerSectorDatas} 属性时的回调 (仅用于编辑器) */
    private onChangeOuterSectorDatas(key?: string): void {
        this.outerSectorDatas.forEach((sectorData, index) => {
            if (!sectorData.itemsBox) return;
            // 只激活并显示选择的
            sectorData.itemsBox.active = sectorData.itemsBox.visible = this._outerSelectIndex === index;
        });
    }
    // =====================  Outer end   =======================


    // ===================== Inner start  =========================
    /** 内转盘 */
    @property({ type: Laya.Sprite, catalog: "Inner", readonly: "data.mode==1||data.mode==2", tips: "内转盘" })
    public innerDisc: Laya.Sprite;
    /** 初始内转盘的旋转方向，是否为顺时针 */
    @property({ type: Boolean, catalog: "Inner", readonly: "data.mode==1||data.mode==2||data.mode==8", tips: "初始内转盘的旋转方向，是否为顺时针" })
    public isInitInnerClockwise: boolean = true;

    @property({ type: Number, private: true }) //  private：true，不会出现在IDE的属性面板上，只是用来存储输入
    private _innerSelectIndex: number = 0;
    /** 内转盘选择的分割数据索引 */
    @property({ type: Number, catalog: "Inner", serializable: false, enumSource: "innerSelectIndexEnumSource", min: 0, step: 1, fractionDigits: 0, readonly: "data.mode==1||data.mode==2", tips: "内转盘选择的分割数据索引" }) // serializable：false，不会被保存到场景文件中
    public get innerSelectIndex(): number { return this._innerSelectIndex; }
    /** innerSelectIndex 枚举源 (仅用于编辑器) */
    @property({ type: [["Record", String]], hidden: true, serializable: false })
    public get innerSelectIndexEnumSource() {
        const result: { name: string, value: number }[] = [];
        this.innerSectorDatas.forEach((item, index) => {
            result[index] = { name: index.toString(), value: index };
        }, this);
        return result;
    }

    /** 内转盘的分割数据数组 */
    @property({ type: [SectorData], catalog: "Inner", nullable: false, readonly: "data.mode==1||data.mode==2", minArrayLength: 1, onChange: "onChangeInnerSectorDatas", tips: "内转盘的分割数据数组" })
    public innerSectorDatas: SectorData[] = [];
    /** 在编辑器中改变 {@link innerSectorDatas} 属性时的回调 (仅用于编辑器) */
    private onChangeInnerSectorDatas(key?: string): void {
        this.innerSectorDatas.forEach((sectorData, index) => {
            if (!sectorData.itemsBox) return;
            // 只激活并显示选择的
            sectorData.itemsBox.active = sectorData.itemsBox.visible = this._innerSelectIndex === index;
        });
    }
    // =====================  Inner end   =========================

    /** 指针触碰处理器，格式：`(type: "inner" | "outer", sectorIndex: number): void` */
    public onPointerTouchedHandler: Laya.Handler;
    /** 旋转完成处理器，格式：`(): void` */
    public onRotationCompleteHandler: Laya.Handler;


    /** 旋转的中心 */
    private _center: Laya.Point;
    /** 指针半径 */
    private _pointerRadius: number;
    /** 指针的角度, [0,360] */
    private _pointerAngle: number;
    /** 外转盘奖励结果索引 */
    private _outerRewardIndex: number;
    /** 内转盘奖励结果索引 */
    private _innerRewardIndex: number;
    /** 指针触碰的外转盘扇形索引 */
    private _pointerTouchedOuterIndex: number;
    /** 指针触碰的外转盘扇形索引 */
    private _pointerTouchedInnerIndex: number;
    /** 布尔标记 */
    private _flags: Flag;

    private _pointerRotationObj: RotationObject;
    private _outerRotationObj: RotationObject;
    private _innerRotationObj: RotationObject;

    /** 指针半径 */
    public get pointerRadius(): number { return this._pointerRadius; }
    /** 指针的角度, [0,360] */
    public get pointerAngle(): number { return this._pointerAngle; }
    /** 是否暂停中... */
    public get isPausing(): boolean { return (this._flags & Flag.Pausing) > 0; }
    /** 是否正在旋转中... */
    public get isRotating(): boolean { return (this._flags & Flag.Rotating) > 0; }
    /** 外转盘奖励结果索引 */
    public get outerRewardIndex(): number { return this._outerRewardIndex; }
    /** 内转盘奖励结果索引 */
    public get innerRewardIndex(): number { return this._innerRewardIndex; }
    /** 指针旋转对象 */
    public get pointerRotationObject(): RotationObject { return this._pointerRotationObj; }
    /** 外转盘旋转对象 */
    public get outerRotationObject(): RotationObject { return this._outerRotationObj; }
    /** 内转盘旋转对象 */
    public get innerRotationObject(): RotationObject { return this._innerRotationObj; }
    /** 当前选择的外转盘索引指定的分割数据 */
    public get currentOuterSectorData() { return this.outerSectorDatas[this._outerSelectIndex]; }
    /** 当前选择的内转盘索引指定的分割数据 */
    public get currentInnerSectorData() { return this.innerSectorDatas[this._innerSelectIndex]; }

    /** 设置转盘的模式 */
    public set mode(value: LuckWheelMode) {
        this._mode = value;

        switch (this._mode) {
            case LuckWheelMode.SingleFixedPointer:
            case LuckWheelMode.SingleRotatePointer:
                if (this.outerDisc) this.outerDisc.active = this.outerDisc.visible = true;
                // 单转盘时，隐藏内转盘
                if (this.innerDisc) this.innerDisc.active = this.innerDisc.visible = false;
                break;
            case LuckWheelMode.DoubleFixedPointer:
            case LuckWheelMode.DoubleOnlyFixedInner:
                // 双转盘时，显示内外转盘
                if (this.outerDisc) this.outerDisc.active = this.outerDisc.visible = true;
                if (this.innerDisc) this.innerDisc.active = this.innerDisc.visible = true;
                break;
        }
    }

    /** 设置外转盘选择的数据索引，不能超出数组 {@link outerSectorDatas} 的索引范围 */
    public set outerSelectIndex(value: number) {
        value = Laya.MathUtil.clamp(value, 0, this.outerSectorDatas.length - 1); // 选择的索引不能超过分割数据数组的范围
        this._outerSelectIndex = value;
        this.outerSectorDatas.forEach((data, index) => {
            if (data.itemsBox) {
                // 在盘面中显示选中索引指定的容器，其他容器隐藏
                data.itemsBox.active = data.itemsBox.visible = (value === index);
            }
        });
    }

    /** 设置内转盘选择的数据索引，不能超出数组 {@link innerSectorDatas} 的索引范围 */
    public set innerSelectIndex(value: number) {
        value = Laya.MathUtil.clamp(value, 0, this.innerSectorDatas.length - 1); // 选择的索引不能超过分割数据数组的范围
        this._innerSelectIndex = value;
        this.innerSectorDatas.forEach((data, index) => {
            if (data.itemsBox) {
                // 在盘面中显示选中索引指定的容器，其他容器隐藏
                data.itemsBox.active = data.itemsBox.visible = (value === index);
            }
        });
    }


    public onAwake(): void {
        // 指针、外转盘、内转盘为空时，赋值一个 sprite 避免报错
        this.pointer ||= new Laya.Sprite();
        this.outerDisc ||= new Laya.Sprite();
        this.innerDisc ||= new Laya.Sprite();

        // 中心坐标
        this._center = new Laya.Point(this.owner.pivotX, this.owner.pivotY);
        // 计算指针半径
        this._pointerRadius = this._center.distance(this.pointer.x, this.pointer.y);
        // 指针角度
        this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this.pointer.y - this._center.y, this.pointer.x - this._center.x)));

        // 创建旋转的对象
        this._pointerRotationObj = new RotationObject();
        this._outerRotationObj = new RotationObject();
        this._innerRotationObj = new RotationObject();
        this._pointerRotationObj.on(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._outerRotationObj.on(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._innerRotationObj.on(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);

        // 调用 setter 方法, 初始显示或隐藏转盘
        this.mode = this._mode;
        // 调用 setter 方法，初始显示或隐藏物品容器
        this.outerSelectIndex = this._outerSelectIndex;
        this.innerSelectIndex = this._innerSelectIndex;

        //
        this.setPause(false);

        //this.setPointerAngle(Laya.Utils.toAngle(Math.atan2(this.pointer.y - this._center.y, this.pointer.x - this._center.x)));

        // 根据模式初始化
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.setRewardAngle(NaN);
                this._pointerRotationObj.init(this._pointerAngle, this.isInitPointerClockwise ? 1 : -1);
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.setRewardAngle(NaN);
                this._outerRotationObj.init(this.outerDisc.rotation, this.isInitOuterClockwise ? 1 : -1);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.setRewardAngle(NaN);
                this._outerRotationObj.init(this.outerDisc.rotation, this.isInitOuterClockwise ? 1 : -1);

                this._innerRotationObj.setRewardAngle(NaN);
                this._innerRotationObj.init(this.innerDisc.rotation, this.isInitInnerClockwise ? 1 : -1);
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.setRewardAngle(NaN);
                this._pointerRotationObj.init(this._pointerAngle, this.isInitPointerClockwise ? 1 : -1);

                this._outerRotationObj.setRewardAngle(NaN);
                this._outerRotationObj.init(this.outerDisc.rotation, this.isInitOuterClockwise ? 1 : -1);
                break;
        }
    }

    public onUpdate(): void {
        if (!(this._flags & Flag.Rotating)) return;
        if (this._flags & Flag.Pausing) return;

        let sectorIndex: number;

        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.update();
                this.setPointerAngle(this._pointerRotationObj.angle360);

                // 检测指针触碰(外)
                sectorIndex = this.getOuterIndexByAngle(this.pointerAngle - this.currentOuterSectorData.angleOffset - this.outerDisc.rotation);
                if (sectorIndex != this._pointerTouchedOuterIndex) {
                    this._pointerTouchedOuterIndex = sectorIndex;
                    this.onPointerTouchedHandler?.runWith(["outer", sectorIndex]);
                }
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.update();
                this.outerDisc.rotation = this._outerRotationObj.angle360;

                // 检测指针触碰(外)
                sectorIndex = this.getOuterIndexByAngle(this.pointerAngle - this.currentOuterSectorData.angleOffset - this.outerDisc.rotation);
                if (sectorIndex != this._pointerTouchedOuterIndex) {
                    this._pointerTouchedOuterIndex = sectorIndex;
                    this.onPointerTouchedHandler?.runWith(["outer", sectorIndex]);
                }
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.update();
                this.outerDisc.rotation = this._outerRotationObj.angle360;

                this._innerRotationObj.update();
                this.innerDisc.rotation = this._innerRotationObj.angle360;

                // 检测指针触碰(外)
                sectorIndex = this.getOuterIndexByAngle(this.pointerAngle - this.currentOuterSectorData.angleOffset - this.outerDisc.rotation);
                if (sectorIndex != this._pointerTouchedOuterIndex) {
                    this._pointerTouchedOuterIndex = sectorIndex;
                    this.onPointerTouchedHandler?.runWith(["outer", sectorIndex]);
                }

                // 检测指针触碰(内)
                sectorIndex = this.getInnerIndexByAngle(this.pointerAngle - this.currentInnerSectorData.angleOffset - this.innerDisc.rotation);
                if (sectorIndex != this._pointerTouchedInnerIndex) {
                    this._pointerTouchedInnerIndex = sectorIndex;
                    this.onPointerTouchedHandler?.runWith(["inner", sectorIndex]);
                }
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.update();
                this.setPointerAngle(this._pointerRotationObj.angle360);

                this._outerRotationObj.update();
                this.outerDisc.rotation = this._outerRotationObj.angle360;

                // 检测指针触碰(外)
                sectorIndex = this.getOuterIndexByAngle(this.pointerAngle - this.currentOuterSectorData.angleOffset - this.outerDisc.rotation);
                if (sectorIndex != this._pointerTouchedOuterIndex) {
                    this._pointerTouchedOuterIndex = sectorIndex;
                    this.onPointerTouchedHandler?.runWith(["outer", sectorIndex]);
                }

                // 检测指针触碰(内)
                sectorIndex = this.getInnerIndexByAngle(this.pointerAngle - this.currentInnerSectorData.angleOffset - this.innerDisc.rotation);
                if (sectorIndex != this._pointerTouchedInnerIndex) {
                    this._pointerTouchedInnerIndex = sectorIndex;
                    this.onPointerTouchedHandler?.runWith(["inner", sectorIndex]);
                }
                break;
        }
    }

    /** 开始旋转 */
    public startRotation(): void {
        this._flags |= Flag.Rotating;
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.startRotation();
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.startRotation();
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.startRotation();
                this._innerRotationObj.startRotation();
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.startRotation();
                this._outerRotationObj.startRotation();
                break;
        }
    }

    /** 停止旋转 */
    public stopRotation(): void {
        this._flags &= ~Flag.Rotating;
    }

    /**
     * 设置奖励索引
     * @param outerRewardIndex 外转盘的奖励索引(正整数)，值区间: [ 0, {@link outerSectorDatas}.length )
     * @param innerRewardIndex 内转盘的奖励索引(正整数)，值区间: [ 0, {@link innerSectorDatas}.length )
     */
    public setRewardIndex(outerRewardIndex: number, innerRewardIndex?: number): void {
        // 储存用索引计算得到的奖励角
        let outerRewardAngle: number, innerRewardAngle: number;

        // 设置外奖励索引
        const outerSectorData = this.currentOuterSectorData;
        if (outerRewardIndex < 0 || outerRewardIndex >= outerSectorData.sectorAngles.length) {
            throw new Error(`外转盘奖励索引,必须为正整数且小于分割线的数量 ${outerSectorData.sectorAngles.length}, 当前值: ${outerRewardIndex}`);
        }
        this._outerRewardIndex = outerRewardIndex;
        // 获取外奖励角
        outerRewardAngle = this.getRewardAngleByIndex(this._outerRewardIndex, outerSectorData);

        // 设置内奖励索引
        let innerSectorData: SectorData = null;
        if (!isNaN(innerRewardIndex)) {
            innerSectorData = this.currentInnerSectorData;
            if (innerRewardIndex < 0 || innerRewardIndex >= innerSectorData.sectorAngles.length) {
                throw new Error(`内转盘奖励索引,必须为正整数且小于分割线的数量 ${innerSectorData.sectorAngles.length}, 当前值: ${innerRewardIndex}`);
            }
            this._innerRewardIndex = innerRewardIndex;
            // 获取内奖励角
            innerRewardAngle = this.getRewardAngleByIndex(this._innerRewardIndex, innerSectorData);
        }
        // 设置奖励角
        this.setRewardAngle(outerRewardAngle, innerRewardAngle);
    }

    /**
     * 设置奖励角
     * @param outerRewardAngle 外转盘的奖励角 [0, 360],（角度分割线的第一条线为0度, 顺时针）
     * @param innerRewardAngle 内转盘的奖励角 [0, 360],（角度分割线的第一条线为0度, 顺时针）
     */
    public setRewardAngle(outerRewardAngle: number, innerRewardAngle?: number): void {
        // 加上偏移量
        outerRewardAngle += this.currentOuterSectorData.angleOffset + this.currentOuterSectorData.sectorAngles[0];
        // 转为 [0, 360]
        outerRewardAngle = Laya.MathUtil.repeat(outerRewardAngle, 360);

        // 根据奖励角获取外转盘奖励索引
        this._outerRewardIndex = this.getOuterIndexByAngle(outerRewardAngle - this.currentOuterSectorData.angleOffset);

        if (!isNaN(innerRewardAngle)) {
            // 加上偏移量
            innerRewardAngle += this.currentInnerSectorData.angleOffset + this.currentInnerSectorData.sectorAngles[0];
            // 转为 [0, 360]
            innerRewardAngle = Laya.MathUtil.repeat(innerRewardAngle, 360);

            // 根据奖励角获取内转盘奖励索引
            this._innerRewardIndex = this.getInnerIndexByAngle(innerRewardAngle - this.currentInnerSectorData.angleOffset);
        }

        if ((this.mode & LuckWheelMode.SingleFixedPointer) || (this.mode & LuckWheelMode.DoubleFixedPointer)) {
            // 外奖励角，固定指针时，计算指针角度偏移
            outerRewardAngle = 360 - outerRewardAngle; // 与 sectorAngles[0] 角度分割线对齐
            outerRewardAngle = Laya.MathUtil.repeat(outerRewardAngle + this._pointerAngle, 360); // 加上指针角度偏移

            // 内奖励角，固定指针时，计算指针角度偏移
            if (!isNaN(innerRewardAngle)) {
                innerRewardAngle = 360 - innerRewardAngle; // 与 sectorAngles[0] 角度分割线对齐
                innerRewardAngle = Laya.MathUtil.repeat(innerRewardAngle + this._pointerAngle, 360); // 加上指针角度偏移
            }
        } else if (this.mode === LuckWheelMode.DoubleOnlyFixedInner) {
            // 外奖励角，固定指针时，计算内奖励角偏移
            outerRewardAngle = 360 - outerRewardAngle; // 与 sectorAngles[0] 角度分割线对齐
            outerRewardAngle = Laya.MathUtil.repeat(outerRewardAngle + innerRewardAngle, 360); // 加上内奖励角偏移
        }

        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.setRewardAngle(outerRewardAngle);
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.setRewardAngle(outerRewardAngle);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.setRewardAngle(outerRewardAngle);

                if (isNaN(innerRewardAngle)) throw new Error(`innerRewardAngle 未设置, ${LuckWheelMode[LuckWheelMode.DoubleFixedPointer]} 模式时，必须设置内转盘的奖励角`);
                this._innerRotationObj.setRewardAngle(innerRewardAngle);
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                if (isNaN(innerRewardAngle)) throw new Error(`innerRewardAngle 未设置, ${LuckWheelMode[LuckWheelMode.DoubleOnlyFixedInner]} 模式时，必须设置内转盘的奖励角`);
                this._pointerRotationObj.setRewardAngle(innerRewardAngle);
                this._outerRotationObj.setRewardAngle(outerRewardAngle);
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
     * 获取外转盘分割线切分的各个扇形对称轴线的位置（多用于动态摆放奖品图标时的位置）
     * @param radius 半径
     * @param isAddCenter 计算时是否添加中心坐标
     * @param out 存储输出结果的数组，数组的长度为: {@link currentOuterSectorData.sectorAngles}.length * 2
     * @returns 返回位置数组，结果以 [x,y,...] 格式存储，数组的长度为: {@link currentOuterSectorData.sectorAngles}.length * 2, 当 {@link currentOuterSectorData.sectorAngles} 未定义或长度为 0 时返回空数组
     */
    public getOuterSectorPositions(radius: number, isAddCenter: boolean, out?: number[]): number[] {
        const angleOffset = this.currentOuterSectorData.angleOffset;
        const sectorAngles = this.currentOuterSectorData.sectorAngles;
        const centerOffsetPoint = isAddCenter ? this._center : null;
        return LuckWheelUtil.getSectorPositions(angleOffset, sectorAngles, radius, centerOffsetPoint, out);
    }

    /**
     * 获取内转盘分割线切分的各个扇形对称轴线的位置（多用于动态摆放奖品图标时的位置）
     * @param radius 半径
     * @param isAddCenter 计算时是否添加中心坐标 
     * @param out 存储输出结果的数组，数组的长度为: {@link currentInnerSectorData.sectorAngles}.length * 2
     * @returns 返回位置数组，结果以 [x,y,...] 格式存储，数组的长度为: {@link currentInnerSectorData.sectorAngles}.length * 2, 当 {@link currentInnerSectorData.sectorAngles} 未定义或长度为 0 时返回空数组
     */
    public getInnerSectorPositions(radius: number, isAddCenter: boolean, out?: number[]): number[] {
        const angleOffset = this.currentInnerSectorData.angleOffset;
        const sectorAngles = this.currentInnerSectorData.sectorAngles;
        const centerOffsetPoint = isAddCenter ? this._center : null;
        return LuckWheelUtil.getSectorPositions(angleOffset, sectorAngles, radius, centerOffsetPoint, out);
    }

    /**
     * 根据角度获取外转盘分割后的扇形区域索引（根据角度分割线取，计算时包含起始角度线，不包含末尾角度线）
     * @param outerAngle 外转盘中的角度 [0, 360]
     * @example
     * ```
     * // 指针触碰的外转盘扇区索引
     * const sectorIndex2 = this.luckWheel.getOuterIndexByAngle(this.luckWheel.pointerAngle - this.luckWheel.currentInnerSectorData.angleOffset - this.luckWheel.outerDisc.rotation);
     * ```
     */
    public getOuterIndexByAngle(outerAngle: number): number {
        return this.getIndexByAngle(outerAngle, this.currentOuterSectorData.sectorAngles);
    }

    /**
     * 根据角度获取内转盘分割后的扇区索引（根据角度分割线取，计算时包含起始角度线，不包含末尾角度线）
     * @param innerAngle 内转盘中的角度 [0, 360]
     * @example
     * ```
     * // 指针触碰的内转盘扇区索引
     * const sectorIndex = this.luckWheel.getInnerIndexByAngle(this.luckWheel.pointerAngle - this.luckWheel.currentInnerSectorData.angleOffset - this.luckWheel.innerDisc.rotation);
     * ```
     */
    public getInnerIndexByAngle(innerAngle: number): number {
        return this.getIndexByAngle(innerAngle, this.currentInnerSectorData.sectorAngles);
    }

    /**
     * 根据角度获取分割后的扇形区域索引（根据角度分割线取，计算时包含起始角度线，不包含末尾角度线）
     * @param angle 用来获取索引的的角度, 将直接使用此值与分割线的角度列表的值直接比较，不在 [0, 360] 内时，将被自动转换为: [0, 360]
     * @param sectorAngles 转盘分割线的角度列表, 元素的值区间为: [0, 359]
     * @returns 返回索引，区间为: [0, {@link sectorAngles}.length]
     */
    private getIndexByAngle(angle: number, sectorAngles: number[]): number {
        // 取 [0, 360]
        angle = Laya.MathUtil.repeat(angle, 360);

        // 由于判断的是包含下限角，小于下限角，当前角和上限角都为360时就会出错，所以转为0度
        // 例 ：如果当前角度为 360, 下限角为350, 上限角为360，则当前角不在上下限范围内，便出错了
        if (angle === 360) {
            angle = 0;
        }

        let result = -1;

        for (let i = 0, len = sectorAngles.length; i < len; i++) {
            // 当前角
            const curAngle = sectorAngles[i];
            // 下一个角
            let nextAngle = sectorAngles[i + 1];
            if (i >= len - 1) {
                // 到达末尾索引时，取（360+起始角）
                nextAngle = (360 + sectorAngles[0]);
                // 奖励角小于当前角时，也要+360才能正确计算
                if (angle < curAngle) angle += 360;
            }
            // 区间处于 [curAngle, nextAngle) 则找到了索引
            if (angle >= curAngle && angle < nextAngle) {
                result = i;
                break;
            }
        }

        if (result === -1) {
            throw new Error(`根据角度未能找到索引, 角度为：${angle}`);
        }
        return result;
    }

    /** 旋转完成时 */
    private onRotateComplete(rotationObj: RotationObject): void {
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
            case LuckWheelMode.SingleFixedPointer:
                this._flags &= ~Flag.Rotating;
                this.owner.event(LuckWheel.EVENT_ROTATION_COMPLETE);
                this.onRotationCompleteHandler?.run();
                break;
            case LuckWheelMode.DoubleFixedPointer:
                if (this._outerRotationObj.isRotationComplete && this._innerRotationObj.isRotationComplete) {
                    this._flags &= ~Flag.Rotating;
                    this.owner.event(LuckWheel.EVENT_ROTATION_COMPLETE);
                    this.onRotationCompleteHandler?.run();
                }
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                if (this._pointerRotationObj.isRotationComplete && this._outerRotationObj.isRotationComplete) {
                    this._flags &= ~Flag.Rotating;
                    this.owner.event(LuckWheel.EVENT_ROTATION_COMPLETE);
                    this.onRotationCompleteHandler?.run();
                }
                break;
        }
    }

    /**
     * 根据奖励索引返回奖励的角度
     * @param rewardIndex 转盘奖励索引
     * @param sectorData 转盘分割数据
     * @returns 返回角度 [0, 360],（角度分割线的第一条线为0度, 顺时针）
     */
    private getRewardAngleByIndex(rewardIndex: number, sectorData: SectorData): number {
        const sectorAngles = sectorData.sectorAngles;
        // 区块的下限角
        const min = sectorAngles[rewardIndex];
        // 区块的上限角，到达分割线数组最大索引时取 (360+sectorAngles[0])
        const max = rewardIndex >= sectorAngles.length - 1 ? (360 + sectorAngles[0]) : sectorAngles[rewardIndex + 1];

        const t = 0.5; // 取扇形中间
        let rewardAngle = Laya.MathUtil.lerp(min, max, t); // sectorAngles[0]>0 时，此值可能大于 360

        // 角度分割线的第一条线为0度，所以此处减去第一条线的角度，并转为 [0, 360]
        rewardAngle = Laya.MathUtil.repeat(rewardAngle - sectorAngles[0], 360);
        return rewardAngle;
    }

    /**
     * 设置指针的角度
     * @param value 角度值
     */
    public setPointerAngle(value: number): void {
        this._pointerAngle = Laya.MathUtil.repeat(value, 360);
        // 旋转指针
        let pointerRadian = Laya.Utils.toRadian(this._pointerAngle);
        this.pointer.pos(
            this._center.x + Math.cos(pointerRadian) * this._pointerRadius,
            this._center.y + Math.sin(pointerRadian) * this._pointerRadius
        );

        this.pointer.rotation = this._pointerAngle + this.pointerAngleOffset;
    }

    /**
     * 设置旋转对象角度，并同步内外转盘或指针的角度
     * @param outerRotation 外转盘旋转对象的角度值 ({@link outerDisc}.rotation); {@link LuckWheelMode.SingleRotatePointer} 模式时则表示指针旋转对象的角度值 ({@link pointer}.rotation - {@link pointerAngleOffset})
     * @param innerRotation 内转盘旋转对象的角度值 ({@link innerDisc}.rotation); {@link LuckWheelMode.DoubleOnlyFixedInner} 模式时则表示指针旋转对象的角度值 ({@link pointer}.rotation - {@link pointerAngleOffset})
     */
    public setRotationObjectAngle(outerRotation: number, innerRotation: number = NaN): void {
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                // 指针
                this._pointerRotationObj.setAngle(outerRotation);
                this.setPointerAngle(this._pointerRotationObj.angle360);
                break;
            case LuckWheelMode.SingleFixedPointer:
                // 外转盘
                this._outerRotationObj.setAngle(outerRotation);
                this.outerDisc.rotation = this._outerRotationObj.angle360;
                break;
            case LuckWheelMode.DoubleFixedPointer:
                // 外转盘
                this._outerRotationObj.setAngle(outerRotation);
                this.outerDisc.rotation = this._outerRotationObj.angle360;
                // 内转盘
                if (!isNaN(innerRotation)) {
                    this._innerRotationObj.setAngle(innerRotation);
                    this.innerDisc.rotation = this._innerRotationObj.angle360;
                }
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                // 外转盘
                this._outerRotationObj.setAngle(outerRotation);
                this.outerDisc.rotation = this._outerRotationObj.angle360;
                // 指针
                if (!isNaN(innerRotation)) {
                    this._pointerRotationObj.setAngle(innerRotation);
                    this.setPointerAngle(this._pointerRotationObj.angle360);
                }
                break;

        }
    }

    /**
     * 设置旋转对象角度到指定的索引，并同步内外转盘或指针的角度
     * @param outerIndex 外索引(正整数)，值区间: [ 0, {@link currentOuterSectorData.sectorAngles}.length )
     * @param innerIndex 内索引(正整数)，值区间: [ 0, {@link currentOuterSectorData.sectorAngles}.length )
     */
    public setRotationObjectAngleToIndex(outerIndex: number, innerIndex: number = NaN): void {
        let outerRotation: number = NaN;
        let innerRotation: number = NaN;

        outerRotation = this.getRewardAngleByIndex(outerIndex, this.currentOuterSectorData);
        // 加上偏移量
        outerRotation += this.currentOuterSectorData.angleOffset + this.currentOuterSectorData.sectorAngles[0];
        // 转为 [0, 360]
        outerRotation = Laya.MathUtil.repeat(outerRotation, 360);

        if (!isNaN(innerIndex)) {
            innerRotation = this.getRewardAngleByIndex(innerIndex, this.currentInnerSectorData);
            // 加上偏移量
            innerRotation += this.currentInnerSectorData.angleOffset + this.currentInnerSectorData.sectorAngles[0];
            // 转为 [0, 360]
            innerRotation = Laya.MathUtil.repeat(innerRotation, 360);
        }

        // 固定指针时，计算指针角度偏移
        if ((this.mode & LuckWheelMode.SingleFixedPointer) || (this.mode & LuckWheelMode.DoubleFixedPointer)) {
            outerRotation = 360 - outerRotation; // 与 sectorAngles[0] 角度分割线对齐
            outerRotation = Laya.MathUtil.repeat(outerRotation + this._pointerAngle, 360); // 加上指针角度偏移
            if (!isNaN(innerRotation)) {
                // 固定指针时，计算指针角度偏移
                innerRotation = 360 - innerRotation; // 与 sectorAngles[0] 角度分割线对齐
                innerRotation = Laya.MathUtil.repeat(innerRotation + this._pointerAngle, 360); // 加上指针角度偏移
            }
        } else if (this.mode === LuckWheelMode.DoubleOnlyFixedInner) {
            // 外奖励角，固定指针时，计算内奖励角偏移
            outerRotation = 360 - outerRotation; // 与 sectorAngles[0] 角度分割线对齐
            outerRotation = Laya.MathUtil.repeat(outerRotation + innerRotation, 360); // 加上内角度偏移
        }

        this.setRotationObjectAngle(outerRotation, innerRotation);
    }

    public onDestroy(): void {
        this._pointerRotationObj.off(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._outerRotationObj.off(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._innerRotationObj.off(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._pointerRotationObj = null;
        this._outerRotationObj = null;
        this._innerRotationObj = null;
        this.pointer?.destroy();
        this.outerDisc?.destroy();
        this.innerDisc?.destroy();
    }

}

enum RotationObjectFlag {
    /** 已初始化 */
    Inited = 1,
    /** 旋转中... */
    Rotating = 2,
    /** 旋转完成 */
    RotationComplete = 4
}

/**
 * 旋转的对象
 * 
 * 开始旋转时，this 派发 {@link EVENT_START_ROTATION} 事件
 * 
 * 旋转完成时，this 派发 {@link EVENT_ROTATION_COMPLETE} 事件
 */
export class RotationObject extends Laya.EventDispatcher {


    /** 开始旋转事件(this 派发) */
    public static readonly EVENT_START_ROTATION: string = "eventStartRotation";
    /** 旋转完成事件(this 派发) */
    public static readonly EVENT_ROTATION_COMPLETE: string = "eventRotationComplete";


    /** 当前所在的角 */
    private _angle: number;
    /** 旋转的方向，1或-1 */
    private _rotationSign: number;
    /** 奖励角度 */
    private _rewardAngle: number;
    /** 旋转开始时的角度 */
    private _angleStart: number;
    /** 动画当前时间<毫秒> */
    private _aniTime: number;
    /** 动画的进度 [0, 1] */
    private _progress: number;
    /** 布尔集合 */
    private _flags: RotationObjectFlag;

    /** 动画总时长<毫秒，大于0的整数>，默认：7000 */
    public aniTotalTime: number = 7000;
    /** 旋转的圈数<大于0的整数>，默认：5 */
    public circles: number = 5;
    /** 贝塞尔缓动数据，https://cubic-bezier.com/ */
    public bezierEaseData: BezierEaseData = { precision: 8, data: [.42, 0, .58, 1] };
    /** 是否显示 log */
    public isShowLogMsg: boolean = false;

    /** 当前所在的角 */
    public get angle(): number { return this._angle; }
    /** 当前所在的角 [0,360] */
    public get angle360(): number { return Laya.MathUtil.repeat(this._angle, 360); }
    /** 奖励角度 */
    public get rewardAngle(): number { return this._rewardAngle; }
    /** 奖励角度[0,360] */
    public get rewardAngle360(): number { return Laya.MathUtil.repeat(this._rewardAngle, 360); }
    /** 是否旋转结束 */
    public get isRotationComplete(): boolean { return (this._flags & RotationObjectFlag.RotationComplete) > 0; }
    /** 动画的进度 [0, 1] */
    public get progress(): number { return this._progress; }



    /**
     * 初始化
     * @param angle 当前所在的角 [0,360]
     * @param rotationSign 旋转方向, 1或-1
     * @param bezierEaseData 贝塞尔缓动数据
     */
    public init(angle: number, rotationSign: number, bezierEaseData: BezierEaseData = null): void {
        this.setAngle(Laya.MathUtil.repeat(angle, 360));

        this._rotationSign = rotationSign;
        this._progress = 0;
        this._flags = RotationObjectFlag.Inited;

        bezierEaseData && (this.bezierEaseData = bezierEaseData);
    }

    public update(): void {
        if (!(this._flags & RotationObjectFlag.Rotating)) return;
        if (this._flags & RotationObjectFlag.RotationComplete) return;
        if (isNaN(this._rewardAngle)) return;

        // 时间，进度
        this._aniTime += Laya.timer.delta;
        const t = Laya.MathUtil.clamp01(Math.trunc(this._aniTime / this.aniTotalTime * 1000) / 1000);
        this._progress = t;

        // 贝塞尔曲线运动
        const tb = Utils.createBezierEase(t, this.bezierEaseData.data[0], this.bezierEaseData.data[1], this.bezierEaseData.data[2], this.bezierEaseData.data[3], this.bezierEaseData.precision);
        const newAngle = Math.trunc(Laya.MathUtil.lerp(this._angleStart, this._rewardAngle, tb) * 100) / 100;
        this.isShowLogMsg && console.log(`动画进度：${t}, tb:${tb}, newAngle:${newAngle}`);
        this.setAngle(newAngle);

        // 旋转完成
        if (t >= 1) {
            this.setAngle(this._rewardAngle);
            this.event(RotationObject.EVENT_ROTATION_COMPLETE, this);
            this._flags |= RotationObjectFlag.RotationComplete;
        }
    }

    /**
     * 设置奖励角（将停止在指定的角度）
     * @param value 角度值, NaN：表示不设置
     */
    public setRewardAngle(value: number): void {
        // 旋转起始角度
        this._angleStart = this._angle;

        // 旋转的最终角度
        const rewardAngle360 = Laya.MathUtil.repeat(value, 360); // 转为: [0, 360]
        const deltaAngle = this.getDeltaAngle(rewardAngle360);
        this._rewardAngle = this._angleStart + this._rotationSign * (deltaAngle + this.circles * 360);

        this.isShowLogMsg && console.log(`设置奖励角：${rewardAngle360}, 起始角：${this._angleStart}, 最终角度:${this._rewardAngle}`);
    }

    /** 开始旋转 */
    public startRotation(): void {
        if (this._flags & RotationObjectFlag.Rotating) return;
        this._flags |= RotationObjectFlag.Rotating;

        this._aniTime = 0;
        this._progress = 0;
        this._flags &= ~RotationObjectFlag.RotationComplete;

        // 开始旋转事件
        this.event(RotationObject.EVENT_START_ROTATION, this);
        this.isShowLogMsg && console.log(`开始旋转 起始角：${this._angleStart}, 最终角度:${this._rewardAngle}`);
    }

    /** 设置角度值 */
    public setAngle(value: number): void {
        this._angle = value;
    }

    /** 获取距离奖励角的度数，根据旋转的方向计算，此值始终为正数 */
    private getDeltaAngle(rewardAngle360: number): number {
        const targetAngle = this._rotationSign >= 0
            ? rewardAngle360
            : (360 - rewardAngle360);
        const currentAngle = this._rotationSign >= 0
            ? this._angle
            : 360 - this._angle;
        return Laya.MathUtil.repeat(targetAngle - currentAngle, 360);
    }
}