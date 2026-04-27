import Utils from "utils/Utils";
import { BezierEaseData } from "./BezierEaseData";
import LuckWheelUtil from "./LuckWheelUtil";
import { SectorData } from "./SectorData";

const { regClass, property, allowMultiple } = Laya;

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

/** 旋转对象类型 */
export enum RotationObjectType {
    /** 指针 */
    Pointer = "pointer",
    /** 外转盘 */
    Outer = "outer",
    /** 内转盘 */
    Inner = "inner"
}

enum Flag {
    /** 旋转中... */
    Rotating = 1,
    /** 暂停中... */
    Pausing = 2
}

/**
 * 幸运转盘
 * @event {@link EVENT_ROTATION_START} 旋转开始事件，由 {@link owner} 派发
 * @event {@link EVENT_POINTER_TOUCH} 指针触碰事件，由 {@link owner} 派发
 * @event {@link EVENT_ROTATION_COMPLETE} 旋转完成事件，{@link owner} 派发
 * 
 * @example
 ```
const luckWheel: LuckWheel = this.owner.getComponent(LuckWheel); 

// 设置转盘模式
luckWheel.mode = LuckWheelMode.SingleRotatePointer;

// 设置指针
luckWheel.pointer = xxx;
luckWheel.pointerAngleOffset = 90; // 指针素材的角度修正值
luckWheel.isPointerClockwise = true; // 指针的旋转方向，是否为顺时针（固定指针模式时，无须设置）

// 角度分割数据
const sectorData = new SectorData();
sectorData.itemsBox = xxx; // 必须是转盘(outerDisc/innerDisc)的子级
sectorData.sectorAngles = [0, 90, 182, 270]; // 切分区块的分割线角度值，[0-359] 小 -> 大

// 设置外转盘
luckWheel.outerDisc = xxx;
luckWheel.isOuterClockwise = true; // 外转盘的旋转方向，是否为顺时针（仅旋转指针的模式，无须设置）
luckWheel.outerSectorDatas = [sectorData,...];

// 设置内转盘（单转盘的模式，无须设置）
luckWheel.innerDisc = xxx;
luckWheel.isInnerClockwise = false; // 内转盘的旋转方向，是否为顺时针（仅旋转指针的模式，无须设置）
luckWheel.innerSectorDatas = [sectorData,...]; // 切分区块的分割线角度值，[0-359] 小 -> 大

// ================ 其他接口 ======================================
// 设置奖励的索引
luckWheel.setRewardIndex(outerRewardIndex, innerRewardIndex);
// 开始旋转
luckWheel.startRotation();
// 暂停旋转
luckWheel.setPause(true);
// 停止旋转
luckWheel.stopRotation();
// 侦听指针触碰
luckWheel.owner.on(LuckWheel.EVENT_POINTER_TOUCH, this, (luckWheel: LuckWheel, type: RotationObjectType.Outer | RotationObjectType.Inner, preSectorIndex: number, curSectorIndex: number, isRotating: boolean)=>{
    console.log(`指针触碰类型：${type}, 上一次触碰的扇区索引: ${preSectorIndex}, 当前触碰的扇区索引: ${curSectorIndex}, 正在旋转: ${isRotating}`);
});
// 侦听旋转完成
luckWheel.owner.on(LuckWheel.EVENT_ROTATION_COMPLETE, this, (luckWheel: LuckWheel)=>{
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
@allowMultiple
export class LuckWheel extends Laya.Script {

    /** 旋转开始事件，由 {@link owner} 派发，回调函数格式：`(luckWheel: LuckWheel): void` */
    public static readonly EVENT_ROTATION_START = "eventRotationStart";
    /**
     * 指针触碰事件，由 {@link owner} 派发，回调函数格式：`(luckWheel: LuckWheel, type: RotationObjectType.Outer | RotationObjectType.Inner, preSectorIndex: number, curSectorIndex: number, isRotating: boolean): void`
     * @param type 触碰类型，内转盘或外转盘
     * @param preSectorIndex 上一次触碰的扇区索引
     * @param curSectorIndex 当前触碰的扇区索引
     * @param isRotating 旋转中...
    */
    public static readonly EVENT_POINTER_TOUCH = "eventPointerTouch";
    /** 旋转完成事件，由 {@link owner} 派发，回调函数格式：`(luckWheel: LuckWheel): void` */
    public static readonly EVENT_ROTATION_COMPLETE = "eventRotationComplete";

    declare owner: Laya.Sprite;

    @property({ type: LuckWheelMode, private: true }) //  private：true，不会出现在IDE的属性面板上，只是用来存储输入
    private _mode: LuckWheelMode = LuckWheelMode.SingleRotatePointer;
    /** 转盘的模式 */
    @property({
        type: LuckWheelMode,
        /** serializable：false，不会被保存到场景文件中 */
        serializable: false,
        tips: `转盘的模式:\n${LuckWheelMode[LuckWheelMode.SingleRotatePointer]} (单转盘，旋转指针)\n${LuckWheelMode[LuckWheelMode.SingleFixedPointer]} (单转盘，固定指针)\n${LuckWheelMode[LuckWheelMode.DoubleFixedPointer]} (双转盘，固定指针)\n${LuckWheelMode[LuckWheelMode.DoubleOnlyFixedInner]} (双转盘，固定内转盘，旋转指针和外转盘)`
    })
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
    /** 指针的旋转方向, 1:顺时针; -1:逆时针 */
    @property({ type: Number, catalog: "Pointer", readonly: "data.mode==2||data.mode==4", enumSource: [{ name: "1", value: 1 }, { name: "-1", value: -1 }], tips: "指针的旋转方向, 1:顺时针; -1:逆时针" })
    public pointerRotationSign: number = 1;
    /** 指针旋转总时长<毫秒, 大于0的整数> */
    @property({ type: Number, catalog: "Pointer", readonly: "data.mode==2||data.mode==4", min: 1, step: 1, tips: "指针旋转总时长<毫秒, 大于0的整数>" })
    public pointerAniTotalTime: number = 7000;
    /** 指针旋转圈数<大于0的整数> */
    @property({ type: Number, catalog: "Pointer", readonly: "data.mode==2||data.mode==4", min: 1, step: 1, tips: "指针旋转圈数<大于0的整数>" })
    public pointerAniCircles: number = 5;
    // =====================  Pointer end  ========================


    // ===================== Outer start  =======================
    /** 外转盘 */
    @property({ type: Laya.Sprite, catalog: "Outer", tips: "外转盘" })
    public outerDisc: Laya.Sprite;
    /** 外转盘的旋转方向, 1:顺时针; -1:逆时针 */
    @property({ type: Number, catalog: "Outer", readonly: "data.mode==1", enumSource: [{ name: "1", value: 1 }, { name: "-1", value: -1 }], tips: "外转盘的旋转方向, 1:顺时针; -1:逆时针" })
    public outerRotationSign: number = 1;
    /** 外转盘旋转总时长<毫秒, 大于0的整数> */
    @property({ type: Number, catalog: "Outer", readonly: "data.mode==1", min: 1, step: 1, tips: "外转盘旋转总时长<毫秒, 大于0的整数>" })
    public outerAniTotalTime: number = 7000;
    /** 外转盘旋转圈数<大于0的整数> */
    @property({ type: Number, catalog: "Outer", readonly: "data.mode==1", min: 1, step: 1, tips: "外转盘旋转圈数<大于0的整数>" })
    public outerAniCircles: number = 5;

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
    /** 内转盘的旋转方向, 1:顺时针; -1:逆时针 */
    @property({ type: Number, catalog: "Inner", readonly: "data.mode==1||data.mode==2||data.mode==8", enumSource: [{ name: "1", value: 1 }, { name: "-1", value: -1 }], tips: "内转盘的旋转方向, 1:顺时针; -1:逆时针" })
    public innerRotationSign: number = 1;
    /** 内转盘旋转总时长<毫秒, 大于0的整数> */
    @property({ type: Number, catalog: "Inner", readonly: "data.mode==1||data.mode==2||data.mode==8", min: 1, step: 1, tips: "内转盘旋转总时长<毫秒, 大于0的整数>" })
    public innerAniTotalTime: number = 7000;
    /** 内转盘旋转圈数<大于0的整数> */
    @property({ type: Number, catalog: "Inner", readonly: "data.mode==1||data.mode==2||data.mode==8", min: 1, step: 1, tips: "内转盘旋转圈数<大于0的整数>" })
    public innerAniCircles: number = 5;

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


    /** 旋转开始处理器，格式：`(luckWheel: LuckWheel): void` */
    public onRotationStartHandler: Laya.Handler;
    /**
     * 指针触碰处理器，格式：`(luckWheel: LuckWheel, type: RotationObjectType.Outer | RotationObjectType.Inner, preSectorIndex: number, curSectorIndex: number, isRotating: boolean): void`
     * @param type 触碰类型，内转盘或外转盘
     * @param preSectorIndex 上一次触碰的扇区索引
     * @param curSectorIndex 当前触碰的扇区索引
     * @param isRotating 旋转中...
    */
    public onPointerTouchHandler: Laya.Handler;
    /** 旋转完成处理器，格式：`(luckWheel: LuckWheel): void` */
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
    private _pointerTouchOuterIndex: number;
    /** 指针触碰的外转盘扇形索引 */
    private _pointerTouchInnerIndex: number;
    /** 布尔标记 */
    private _flags: Flag;

    private _pointerRotationObj: RotationObject;
    private _outerRotationObj: RotationObject;
    private _innerRotationObj: RotationObject;

    private readonly _tempParams: any[] = [];

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
        const dy = this.pointer.y - this._center.y;
        const dx = this.pointer.x - this._center.x;
        this.setPointerAngle((Math.sqrt(dx * dx + dy * dy) < 1) ? -this.pointerAngleOffset : Laya.Utils.toAngle(Math.atan2(dy, dx))); // 指针位置与旋转的中心重叠时，保持在指针默认的偏移位置

        // 创建旋转的对象
        this._pointerRotationObj = new RotationObject();
        this._outerRotationObj = new RotationObject();
        this._innerRotationObj = new RotationObject();
        this._pointerRotationObj.on(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._outerRotationObj.on(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);
        this._innerRotationObj.on(RotationObject.EVENT_ROTATION_COMPLETE, this, this.onRotateComplete);

        // 初始化
        this.init();

        // 根据模式检测指针触碰
        this.detectPointerTouchByMode(false);
    }

    /** 初始化 */
    public init(): void {
        // 调用 setter 方法, 初始显示或隐藏转盘
        this.mode = this._mode;
        // 调用 setter 方法，初始显示或隐藏物品容器
        this.outerSelectIndex = this._outerSelectIndex;
        this.innerSelectIndex = this._innerSelectIndex;
        // 清除指针触碰索引
        this.clearPointerTouchIndices();

        // 根据模式初始化
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.init(RotationObjectType.Pointer, this._pointerAngle, this.pointerRotationSign, this.pointerAniTotalTime, this.pointerAniCircles);
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.init(RotationObjectType.Outer, this.outerDisc.rotation, this.outerRotationSign, this.outerAniTotalTime, this.outerAniCircles);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.init(RotationObjectType.Outer, this.outerDisc.rotation, this.outerRotationSign, this.outerAniTotalTime, this.outerAniCircles);
                this._innerRotationObj.init(RotationObjectType.Inner, this.innerDisc.rotation, this.innerRotationSign, this.innerAniTotalTime, this.innerAniCircles);
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.init(RotationObjectType.Pointer, this._pointerAngle, this.pointerRotationSign, this.pointerAniTotalTime, this.pointerAniCircles);
                this._outerRotationObj.init(RotationObjectType.Outer, this.outerDisc.rotation, this.outerRotationSign, this.outerAniTotalTime, this.outerAniCircles);
                break;
        }
    }

    public onUpdate(): void {
        if (!(this._flags & Flag.Rotating)) return;
        if (this._flags & Flag.Pausing) return;

        // 更新旋转对象
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.update();
                this.setPointerAngle(this._pointerRotationObj.angle360);
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.update();
                this.outerDisc.rotation = this._outerRotationObj.angle360;
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.update();
                this.outerDisc.rotation = this._outerRotationObj.angle360;

                this._innerRotationObj.update();
                this.innerDisc.rotation = this._innerRotationObj.angle360;
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.update();
                this.setPointerAngle(this._pointerRotationObj.angle360);

                this._outerRotationObj.update();
                this.outerDisc.rotation = this._outerRotationObj.angle360;
                break;
        }

        // 根据模式检测指针触碰
        this.detectPointerTouchByMode(true);

    }

    /** 开始旋转 */
    public startRotation(): void {
        if (this._flags & Flag.Rotating) return;
        this._flags |= Flag.Rotating;

        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.rotationSign = this.pointerRotationSign;
                this._pointerRotationObj.aniTotalTime = this.pointerAniTotalTime;
                this._pointerRotationObj.circles = this.pointerAniCircles;
                this._pointerRotationObj.startRotation();
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.rotationSign = this.outerRotationSign;
                this._outerRotationObj.aniTotalTime = this.outerAniTotalTime;
                this._outerRotationObj.circles = this.outerAniCircles;
                this._outerRotationObj.startRotation();
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.rotationSign = this.outerRotationSign;
                this._outerRotationObj.aniTotalTime = this.outerAniTotalTime;
                this._outerRotationObj.circles = this.outerAniCircles;
                this._outerRotationObj.startRotation();

                this._innerRotationObj.rotationSign = this.innerRotationSign;
                this._innerRotationObj.aniTotalTime = this.innerAniTotalTime;
                this._innerRotationObj.circles = this.innerAniCircles;
                this._innerRotationObj.startRotation();
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.rotationSign = this.pointerRotationSign;
                this._pointerRotationObj.aniTotalTime = this.pointerAniTotalTime;
                this._pointerRotationObj.circles = this.pointerAniCircles;
                this._pointerRotationObj.startRotation();

                this._outerRotationObj.rotationSign = this.outerRotationSign;
                this._outerRotationObj.aniTotalTime = this.outerAniTotalTime;
                this._outerRotationObj.circles = this.outerAniCircles;
                this._outerRotationObj.startRotation();
                break;
        }

        // 旋转开始事件
        this._tempParams.length = 0;
        this._tempParams.push(this);
        this.owner.event(LuckWheel.EVENT_ROTATION_START, this._tempParams);
        this.onRotationStartHandler?.runWith(this._tempParams);
    }

    /** 停止旋转 */
    public stopRotation(): void {
        this._flags &= ~Flag.Rotating;
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                this._pointerRotationObj.stopRotation();
                break;
            case LuckWheelMode.SingleFixedPointer:
                this._outerRotationObj.stopRotation();
                break;
            case LuckWheelMode.DoubleFixedPointer:
                this._outerRotationObj.stopRotation();
                this._innerRotationObj.stopRotation();
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                this._pointerRotationObj.stopRotation();
                this._outerRotationObj.stopRotation();
                break;
        }
    }

    /** 清除指针触碰索引 */
    public clearPointerTouchIndices(): void {
        this._pointerTouchOuterIndex = -1;
        this._pointerTouchInnerIndex = -1;
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
        if (this._flags & Flag.Rotating) {
            console.error(`正在旋转中, 不能设置奖励角`);
            return;
        }
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

    /** 根据模式检测指针触碰 */
    public detectPointerTouchByMode(isRotating: boolean): void {
        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
                // 检测指针触碰(外)
                this.detectPointerTouch(RotationObjectType.Outer, isRotating);
                break;
            case LuckWheelMode.SingleFixedPointer:
                // 检测指针触碰(外)
                this.detectPointerTouch(RotationObjectType.Outer, isRotating);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                // 检测指针触碰(外)
                this.detectPointerTouch(RotationObjectType.Outer, isRotating);
                // 检测指针触碰(内)
                this.detectPointerTouch(RotationObjectType.Inner, isRotating);
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                // 检测指针触碰(外)
                this.detectPointerTouch(RotationObjectType.Outer, isRotating);
                // 检测指针触碰(内)
                this.detectPointerTouch(RotationObjectType.Inner, isRotating);
                break;
        }
    }

    /** 检测指针触碰 */
    private detectPointerTouch(type: RotationObjectType.Outer | RotationObjectType.Inner, isRotating: boolean): void {
        if (type === RotationObjectType.Outer) {
            // 检测指针触碰(外)
            if (this.currentOuterSectorData) {
                const sectorIndex = this.getOuterIndexByAngle(this.pointerAngle - this.currentOuterSectorData.angleOffset - this.outerDisc.rotation);
                if (sectorIndex != this._pointerTouchOuterIndex) {
                    this._tempParams.length = 0;
                    this._tempParams.push(this, type, this._pointerTouchOuterIndex, sectorIndex, isRotating);
                    this.owner.event(LuckWheel.EVENT_POINTER_TOUCH, this._tempParams);
                    this.onPointerTouchHandler?.runWith(this._tempParams);
                    this._pointerTouchOuterIndex = sectorIndex;
                }
            }
        } else if (type === RotationObjectType.Inner) {
            // 检测指针触碰(内)
            if (this.currentInnerSectorData) {
                const sectorIndex = this.getInnerIndexByAngle(this.pointerAngle - this.currentInnerSectorData.angleOffset - this.innerDisc.rotation);
                if (sectorIndex != this._pointerTouchInnerIndex) {
                    this._tempParams.length = 0;
                    this._tempParams.push(this, type, this._pointerTouchInnerIndex, sectorIndex, isRotating);
                    this.owner.event(LuckWheel.EVENT_POINTER_TOUCH, this._tempParams);
                    this.onPointerTouchHandler?.runWith(this._tempParams);
                    this._pointerTouchInnerIndex = sectorIndex;
                }
            }
        }
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
        this._tempParams.length = 0;
        this._tempParams.push(this);

        switch (this.mode) {
            case LuckWheelMode.SingleRotatePointer:
            case LuckWheelMode.SingleFixedPointer:
                this._flags &= ~Flag.Rotating;
                this.owner.event(LuckWheel.EVENT_ROTATION_COMPLETE, this._tempParams);
                this.onRotationCompleteHandler?.runWith(this._tempParams);
                break;
            case LuckWheelMode.DoubleFixedPointer:
                if (this._outerRotationObj.isRotationComplete && this._innerRotationObj.isRotationComplete) {
                    this._flags &= ~Flag.Rotating;
                    this.owner.event(LuckWheel.EVENT_ROTATION_COMPLETE, this._tempParams);
                    this.onRotationCompleteHandler?.runWith(this._tempParams);
                }
                break;
            case LuckWheelMode.DoubleOnlyFixedInner:
                if (this._pointerRotationObj.isRotationComplete && this._outerRotationObj.isRotationComplete) {
                    this._flags &= ~Flag.Rotating;
                    this.owner.event(LuckWheel.EVENT_ROTATION_COMPLETE, this._tempParams);
                    this.onRotationCompleteHandler?.runWith(this._tempParams);
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
     * @param isDetectPointerTouch [默认：false] 设置指针角度后，是否立即检测指针触碰
     */
    public setPointerAngle(value: number, isDetectPointerTouch: boolean = false): void {
        this._pointerAngle = Laya.MathUtil.repeat(value, 360);
        // 旋转指针
        let pointerRadian = Laya.Utils.toRadian(this._pointerAngle);
        this.pointer.pos(
            this._center.x + Math.cos(pointerRadian) * this._pointerRadius,
            this._center.y + Math.sin(pointerRadian) * this._pointerRadius
        );

        this.pointer.rotation = this._pointerAngle + this.pointerAngleOffset;

        // 根据模式检测指针触碰
        if (isDetectPointerTouch) {
            Laya.timer.callLater(this, this.detectPointerTouchByMode, [false]);
        }
    }

    /**
     * 设置旋转对象角度，并同步内外转盘或指针的角度
     * @param outerRotation 外转盘旋转对象的角度值 ({@link outerDisc}.rotation); {@link LuckWheelMode.SingleRotatePointer} 模式时则表示指针旋转对象的角度值 ({@link pointer}.rotation - {@link pointerAngleOffset})
     * @param innerRotation 内转盘旋转对象的角度值 ({@link innerDisc}.rotation); {@link LuckWheelMode.DoubleOnlyFixedInner} 模式时则表示指针旋转对象的角度值 ({@link pointer}.rotation - {@link pointerAngleOffset})
     * @param isDetectPointerTouch [默认：false] 设置旋转对象角度后，是否立即检测指针触碰
     */
    public setRotationObjectAngle(outerRotation: number, innerRotation: number = NaN, isDetectPointerTouch: boolean = false): void {
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

        // 根据模式检测指针触碰
        if (isDetectPointerTouch) {
            Laya.timer.callLater(this, this.detectPointerTouchByMode, [false]);
        }
    }

    /**
     * 设置旋转对象角度到指定的索引，并同步内外转盘或指针的角度
     * @param outerIndex 外索引(正整数)，值区间: [ 0, {@link this.currentOuterSectorData.sectorAngles}.length )
     * @param innerIndex 内索引(正整数)，值区间: [ 0, {@link this.currentOuterSectorData.sectorAngles}.length )
     * @param isDetectPointerTouch [默认：false] 设置旋转对象角度后，是否立即检测指针触碰
     */
    public setRotationObjectAngleToIndex(outerIndex: number, innerIndex: number = NaN, isDetectPointerTouch: boolean = false): void {
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

        this.setRotationObjectAngle(outerRotation, innerRotation, isDetectPointerTouch);
    }

    public onDestroy(): void {
        Laya.timer.clear(this, this.detectPointerTouchByMode);
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
 * 旋转对象
 * @event {@link EVENT_ROTATION_START} 旋转开始事件，由 {@link this} 派发
 * @event {@link EVENT_ROTATION_PROGRESS} 旋转进度事件，旋转开始后，由 {@link this} 每帧派发
 * @event {@link EVENT_ROTATION_COMPLETE} 旋转完成事件，由 {@link this} 派发
 */
export class RotationObject extends Laya.EventDispatcher {

    /**
     * 旋转开始事件，由 {@link this} 派发，回调函数格式：`(rotationObj: RotationObject): void`
     * @param rotationObj this
     */
    public static readonly EVENT_ROTATION_START = "eventRotationStart";
    /** 
     * 旋转进度事件，旋转开始后，由 {@link this} 每帧派发，回调函数格式：`(rotationObj: RotationObject, progress: number): void`
     * @param rotationObj this
     * @param progress 旋转进度，范围：[0, 1]
     */
    public static readonly EVENT_ROTATION_PROGRESS = "eventRotationProgress";
    /**
     * 旋转完成事件，由 {@link this} 派发，回调函数格式：`(rotationObj: RotationObject): void`
     * @param rotationObj this
     */
    public static readonly EVENT_ROTATION_COMPLETE = "eventRotationComplete";

    private readonly _tempParams: any[] = [];

    /** 旋转对象类型 */
    private _rotationObjType: RotationObjectType;
    /** 当前所在的角 */
    private _angle: number;
    /** 奖励角度 */
    private _rewardAngle: number;
    /** 旋转起始角 */
    private _angleStart: number;
    /** 旋转最终角 */
    private _angleEnd: number;
    /** 动画当前时间<毫秒> */
    private _aniTime: number;
    /** 动画的进度 [0, 1] */
    private _progress: number;
    /** 布尔集合 */
    private _flags: RotationObjectFlag;

    /** 旋转方向，1或-1 */
    public rotationSign: number;
    /** 动画总时长<毫秒，大于0的整数>*/
    public aniTotalTime: number;
    /** 旋转圈数<大于0的整数>*/
    public circles: number;
    /** 贝塞尔缓动数据，https://cubic-bezier.com/ */
    public bezierEaseData: BezierEaseData = { precision: 8, data: [.42, 0, .58, 1] };
    /** 是否显示 log */
    public isShowLogMsg: boolean = false;

    /** 旋转对象类型 */
    public get rotationObjectType(): RotationObjectType { return this._rotationObjType; }
    /** 当前所在的角 */
    public get angle(): number { return this._angle; }
    /** 当前所在的角 [0,360] */
    public get angle360(): number { return Laya.MathUtil.repeat(this._angle, 360); }
    /** 奖励角度 */
    public get rewardAngle(): number { return this._rewardAngle; }
    /** 奖励角度[0,360] */
    public get rewardAngle360(): number { return Laya.MathUtil.repeat(this._rewardAngle, 360); }
    /** 旋转最终角 */
    public get angleEnd(): number { return this._angleEnd; }
    /** 是否旋转结束 */
    public get isRotationComplete(): boolean { return (this._flags & RotationObjectFlag.RotationComplete) > 0; }
    /** 动画的进度 [0, 1] */
    public get progress(): number { return this._progress; }



    /**
     * 初始化
     * @param rotationObjType 旋转对象类型
     * @param angle 当前所在的角 [0,360]
     * @param rotationSign 旋转方向, 1或-1
     * @param aniTotalTime 旋转总时长<毫秒，大于0的整数>
     * @param circles 旋转圈数<大于0的整数>
     * @param bezierEaseData 贝塞尔缓动数据
     */
    public init(rotationObjType: RotationObjectType, angle: number, rotationSign: number, aniTotalTime: number, circles: number, bezierEaseData: BezierEaseData = null): void {
        this._rotationObjType = rotationObjType;
        this.setAngle(Laya.MathUtil.repeat(angle, 360));
        this.rotationSign = rotationSign;
        this.aniTotalTime = aniTotalTime;
        this.circles = circles;
        this._rewardAngle = NaN;
        this._angleStart = NaN;
        this._angleEnd = NaN;
        this._aniTime = 0;
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
        const newAngle = Math.trunc(Laya.MathUtil.lerp(this._angleStart, this._angleEnd, tb) * 100) / 100;
        this.isShowLogMsg && console.log(`动画进度：${t}, tb:${tb}, newAngle:${newAngle}`);
        this.setAngle(newAngle);

        // 旋转进度事件
        this._tempParams.length = 0;
        this._tempParams.push(this, this._progress);
        this.event(RotationObject.EVENT_ROTATION_PROGRESS, this._tempParams);

        // 旋转完成
        if (t >= 1) {
            this.setAngle(this._angleEnd);
            this._flags &= ~RotationObjectFlag.Rotating;
            this._flags |= RotationObjectFlag.RotationComplete;

            this.event(RotationObject.EVENT_ROTATION_COMPLETE, this); // 旋转完成事件
        }
    }

    /**
     * 设置奖励角（将停止在指定的角度）
     * @param value 角度值, NaN：表示不设置
     */
    public setRewardAngle(value: number): void {
        if (this._flags & RotationObjectFlag.Rotating) return;

        this._rewardAngle = value;

        this.isShowLogMsg && console.log(`设置奖励角：${value}`);
    }

    /** 开始旋转 */
    public startRotation(): void {
        if (this._flags & RotationObjectFlag.Rotating) return;

        // 如果存在奖励角，重新计算旋转起始角、最终角
        // 否则会出现以下问题：
        // * 同一奖励结果，旋转完成后，再次开始旋转时出现瞬移
        // * 强制停止旋转后，再次开始旋转时出现瞬移
        this.calcAngleStartAndEnd();

        this._flags |= RotationObjectFlag.Rotating;

        this._aniTime = 0;
        this._progress = 0;
        this._flags &= ~RotationObjectFlag.RotationComplete;

        // 旋转开始事件
        this.event(RotationObject.EVENT_ROTATION_START, this);

        this.isShowLogMsg && console.log(`开始旋转, 起始角：${this._angleStart}, 最终角度:${this._rewardAngle}`);
    }

    /** 停止旋转 */
    public stopRotation(): void {
        if (!(this._flags & RotationObjectFlag.Rotating)) return;

        this._flags &= ~RotationObjectFlag.Rotating;
        this._flags |= RotationObjectFlag.RotationComplete;
    }

    /** 设置角度值 */
    public setAngle(value: number): void {
        this._angle = value;
    }

    /** 获取距离奖励角的度数，根据旋转的方向计算，此值始终为正数 */
    private getDeltaAngle(rewardAngle360: number): number {
        const targetAngle = this.rotationSign >= 0
            ? rewardAngle360
            : (360 - rewardAngle360);
        const currentAngle = this.rotationSign >= 0
            ? this._angle
            : 360 - this._angle;
        return Laya.MathUtil.repeat(targetAngle - currentAngle, 360);
    }

    /** 计算旋转起始角、最终角（{@link _rewardAngle} 非 NaN 时，才能调用这个方法） */
    private calcAngleStartAndEnd(): void {
        if (isNaN(this._rewardAngle)) return;

        // 旋转起始角
        this._angleStart = this._angle;

        // 旋转的最终角
        const rewardAngle360 = Laya.MathUtil.repeat(this._rewardAngle, 360); // 转为: [0, 360]
        const deltaAngle = this.getDeltaAngle(rewardAngle360);
        this._angleEnd = this._angleStart + this.rotationSign * (deltaAngle + this.circles * 360);
    }
}