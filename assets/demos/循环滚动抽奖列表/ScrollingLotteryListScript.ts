import Utils from "utils/Utils";

const { regClass, property } = Laya;

/** 布尔标记 */
enum Flag {
    /** 已初始化 */
    Inited = 1,
    /** 滚动中... */
    Scrolling = 2,
    /** 暂停中... */
    Paused = 4,
}


/** 固定列表数据源长度配置 */
export type FixedLenCfg = {
    /**
     * 固定列表数据源的长度<大于 0 的整数>。（将对数据源元素进行增加或删除，使长度等于此值） 
     * * 注意： 固定后数据源实际长度并非此长度，为了能循环滚动在此长度末尾还会加入一些重复项
     */
    targetLength: number;
    /** 列表数据源始终保留的索引（避免在对齐数据源删除元素时被删除， 索引值不能超出列表原数据源长度）。例: 开奖结果索引是需要保留的 */
    reservedIndices: number | number[];
    /** 数据源填充选项 {@linkcode Utils.repeatFillWithQuality} */
    fillOptions?: {
        /** 品质 key */
        qualityKey: string,
        /** 最大连续相同品质次数，默认 2 */
        maxConsecutive?: number;
        /** 品质权重 */
        qualityWeights?: Record<string | number, number>;
    };
}

/** 贝塞尔缓动数据 */
export interface BezierEaseData {
    /** 精度<正整数> */
    precision: number;
    /** 贝塞尔曲线数据(长度为 4): https://cubic-bezier.com/ */
    data: number[];
}

/**
 * 循环滚动列表抽奖
 * 
 * @example
```
// 初始化列表
const list = this.owner.getChild("list", Laya.List);
list.scrollType = Laya.ScrollType.Horizontal; // 必须是水平/垂直滚动
list.array = [{ Label: "A" }, { Label: "B" }, { Label: "C" }, { Label: "D" }, { Label: "E" }];

// 添加滚动组件，并初始化
const lotteryScript = this.list.addComponent(ScrollingLotteryListScript);

// 固定数据源长度配置
let fixedLenCfg: FixedLenCfg = null;
// fixedLenCfg = {
//     // 固定数据源的长度（注意： 固定后数据源实际长度并非此长度，为了能循环滚动在此长度末尾还会加入一些重复项）
//     targetLength: 6, 
//     // 列表数据源始终保留的索引（避免在对齐数据源删除元素时被删除， 索引值不能超出列表原数据源长度）。例: 开奖结果索引是需要保留的
//     reservedIndices: 4,
//     // 数据源填充选项（可选）
//     fillOptions: {
//         // 品质 key
//         qualityKey: xx,
//         // 最大连续相同品质次数（可选），默认 2
//         maxConsecutive: 2,
//         // 品质权重（可选）
//         qualityWeights: {
//             4: 0.4,
//             1: 0.05
//         }
//     }
// };
lotteryScript.init(fixedLenCfg); // 初始化, 需在 list.array 赋值后调用初始化，且不能赋值空数组; 

lotteryScript.speedSign = -1; // 滚动方向, 1 或 -1
lotteryScript.aniTotalTime = 5000; // 滚动时间<毫秒>
lotteryScript.circles = 5; // 滚动圈数
lotteryScript.bezierEaseData = { precision: 16, data: [.25, .1, .25, 1] }; // 动画曲线

//lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_SCROLL_START, () => {
lotteryScript.onScrollStartHandler = new Laya.Handler(this, () => {
    console.log("滚动开始");
});

//lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_SCROLLING, (curFocusIdx: number) => {
lotteryScript.onScrollingHandler = new Laya.Handler(this, (curFocusIdx: number) => {
    const curFocusOriginalIdx = lotteryScript.getOriginalIndex(curFocusIdx);
    console.log(`滚动中. 当前聚焦的索引: ${curFocusIdx}, 当前聚焦的原始索引：${curFocusOriginalIdx}`);
});

//lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_SCROLL_PROGRESS, (progress: number) => {
lotteryScript.onScrollProgressHandler = new Laya.Handler(this, (progress: number) => {
    // progress 区间: [0, 1]
    console.log(`滚动进度: ${progress}`);
});

//lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE, (curFocusIdx: number) => {
lotteryScript.onScrollCompleteHandler = new Laya.Handler(this, (curFocusIdx: number) => {
    const curFocusOriginalIdx = lotteryScript.getOriginalIndex(curFocusIdx);
    console.log(`滚动到结果项完成, 当前聚焦的索引: ${curFocusIdx}, 当前聚焦的原始索引：${curFocusOriginalIdx}`);
});


// 设置结果索引
const resultIdx = 4; // 结果索引（未添加重复项前的索引）
const isImmediate = false; // 是否立即滚动到结果处, 默认：false
const resultFocusT = 0.5; // 结果项聚焦插值，区间为 [0, 1]，默认：0.5 表示停在中间，小于 0.5 表示停在左侧，大于 0.5 表示停在右侧
lotteryScript.setResult(resultIdx, isImmediate, resultFocusT);

// 开始滚动
lotteryScript.startScrolling();
```
 */
@regClass()
export class ScrollingLotteryListScript extends Laya.Script {

    /** 滚动开始事件，事件由 {@link owner} 派发，回调函数格式：`(): void` */
    public static readonly EVENT_SCROLL_START: string = "eventScrollStart";
    /** 滚动中事件，聚焦索引发生改变时触发，事件由 {@link owner} 派发，回调函数格式：`(curFocusIdx: number): void` */
    public static readonly EVENT_SCROLLING: string = "eventScrolling";
    /** 滚动进度事件，滚动后每帧触发，事件由 {@link owner} 派发，回调函数格式：`(progress: number): void */
    public static readonly EVENT_SCROLL_PROGRESS: string = "eventScrollProgress";
    /** 滚动到结果项完成事件，事件由 {@link owner} 派发，回调函数格式：`(curFocusIdx: number): void` */
    public static readonly EVENT_SCROLL_COMPLETE: string = "eventScrollComplete";

    declare owner: Laya.List;

    /** 聚焦点插值，范围：[0,1] */
    @property({ type: Number, range: [0, 1], tips: "聚焦点插值，范围：[0,1]" })
    public focusT = 0.5;
    /** 滚动方向, 1 或 -1 */
    @property({ type: Number, enumSource: [{ name: "1", value: 1 }, { name: "-1", value: -1 }], tips: "滚动方向, 1 或 -1" })
    public speedSign: number = 1;
    /** 动画总时长<毫秒, 大于0的整数>, 默认: 5000 */
    @property({ type: Number, min: 1, step: 1, tips: "动画总时长<毫秒, 大于0的整数>, 默认: 5000" })
    public aniTotalTime: number = 5000;
    /** 滚动的圈数<大于0的整数>, 默认:5 */
    @property({ type: Number, min: 1, step: 1, tips: "滚动的圈数<大于0的整数>, 默认:5" })
    public circles: number = 5;

    /** 贝塞尔缓动数据，https://cubic-bezier.com/ */
    public bezierEaseData: BezierEaseData = { precision: 16, data: [.25, .1, .25, 1] };
    /** 滚动开始处理器，格式： `(): void` */
    public onScrollStartHandler: Laya.Handler;
    /** 滚动中处理器，聚焦索引发生改变时触发，格式： `(curFocusIdx: number): void` */
    public onScrollingHandler: Laya.Handler;
    /** 滚动进度处理器，滚动后每帧触发，格式：`(progress: number): void` */
    public onScrollProgressHandler: Laya.Handler;
    /** 滚动到结果项完成处理器，格式： `(curFocusIdx: number): void` */
    public onScrollCompleteHandler: Laya.Handler;
    /** 是否显示 log */
    public isShowLogMsg: boolean = false;


    /** 到结果项的总距离 */
    private _totalDistance: number;
    /** 到结果项的当前距离 */
    private _distance: number;
    /** 滚动开始时的滚动值 */
    private _startScrollValue: number;
    /** 动画当前时间<毫秒> */
    private _aniTime: number;
    /** 额外添加的重复列表项数量 */
    private _extraItemNum: number;
    /** 动画的进度 [0, 1] */
    private _normalizedT: number;
    /** 滚动速度(有方向) */
    private _speed: number;
    /** 布尔标记集合 */
    private _flags: Flag;
    /** 符合结果的索引（因为列表末尾有一些项是重复的，所以符合结果的项可能会有两个, 最多只会有两个, 有可能只有一个，且[1]的值一定比[0]的值大， [0]:原索引, [1]:重复索引） */
    private _resultIndices: number[];
    /** 结果项聚焦插值，区间为 [0, 1]，默认：0.5 表示停在中间，小于 0.5 表示停在左侧，大于 0.5 表示停在右侧 */
    private _resultFocusT: number;
    /** 滚动条 */
    private _scrollBar: Laya.ScrollBar;
    /** 列表项的大小 */
    private _itemSize: number;
    /** 一格的大小（列表项大小加间距） */
    private _cellSize: number;
    /** 聚焦的位置 */
    private _focusPos: number;
    /** 当前聚焦点下的索引 */
    private _currentFocusIndex: number;
    /** 原始项数 */
    private _originalItemCount: number;
    /** 加额外重复项的总项数 */
    private _itemCount: number;
    /** 最大的滚动值 */
    private _maxScrollBarValue: number;

    /** 用于数据源的元素顺序在固定长度时打乱后，通过原结果索引能找到对应打乱后的位置 */
    private readonly _randomizedResultMap: Map<number, number> = new Map();
    private readonly _tempRect: Laya.Rectangle = new Laya.Rectangle();
    private readonly _tempNums: number[] = [];
    private readonly _itemRegExp: RegExp = /item\d+/;
    private readonly _scrollBarChangeHandler = new Laya.Handler();


    /** 是否已初始化 */
    public get isInited(): boolean { return (this._flags & Flag.Inited) > 0; }
    /** 滚动中... */
    public get isScrolling(): boolean { return (this._flags & Flag.Scrolling) > 0; }
    /** 暂停中... */
    public get isPaused(): boolean { return (this._flags & Flag.Paused) > 0; }
    /** 当前聚焦点下的索引 */
    public get currentFocusIndex(): number { return this._currentFocusIndex; }
    /** 滚动速度(有方向) */
    public get speed(): number { return this._speed; }
    /** 动画的进度 [0, 1] */
    public get normalizedT(): number { return this._normalizedT; }


    /**
     * 初始化
     * @param fixedLenCfg 固定列表数据源长度配置，默认：null 表示不固定数据源长度
     * @example
    // 固定数据源长度配置
    const fixedLenCfg: FixedLenCfg = {
        // 固定数据源的长度（注意： 固定后数据源实际长度并非此长度，为了能循环滚动在此长度末尾还会加入一些重复项）
        targetLength: 6, 
        // 列表数据源始终保留的索引（避免在对齐数据源删除元素时被删除， 索引值不能超出列表原数据源长度）。例: 开奖结果索引是需要保留的
        reservedIndices: 4,
        // 数据源填充选项（可选）
        fillOptions: {
            // 品质 key
            qualityKey: xx,
            // 最大连续相同品质次数（可选），默认 2
            maxConsecutive: 2,
            // 品质权重（可选）
            qualityWeights: {
                4: 0.4,
                1: 0.05
            }
        }
    }; 
    */
    public init(fixedLenCfg: FixedLenCfg = null): ScrollingLotteryListScript {
        this.isShowLogMsg && console.log("ScrollingLotteryListScript 初始化", "this.owner.array:", this.owner.array, "fixedLenCfg:", fixedLenCfg);

        if (this.owner.scrollType !== Laya.ScrollType.Horizontal && this.owner.scrollType !== Laya.ScrollType.Vertical) {
            throw new Error("使用此组件时, 列表必须是水平或垂直滚动类型");
        }

        if (!this.owner.array || this.owner.array.length <= 0) {
            throw new Error("必须在列表数据源数组赋值后调用此方法，且不能赋值空数组");
        }

        this._flags = Flag.Inited;

        this._aniTime = 0;
        this._speed = 0;
        this._normalizedT = 0;
        this._resultIndices ||= [];
        this._resultIndices.length = 0;

        const scrollRect = this.owner.content.scrollRect;
        const spaceX = this.owner.spaceX;
        const spaceY = this.owner.spaceY;
        const itemWidth = this.owner.itemRender.data.width;
        const itemHeight = this.owner.itemRender.data.height;
        const scrollType = this.owner.scrollType;
        const cellSize = (scrollType === Laya.ScrollType.Horizontal) ? (itemWidth + spaceX) : (itemHeight + spaceY);
        const ownerArr = this.owner.array;

        this._scrollBar = this.owner.scrollBar;
        this._itemSize = (scrollType === Laya.ScrollType.Horizontal) ? itemWidth : itemHeight;
        this._cellSize = cellSize;
        this._focusPos = (scrollType === Laya.ScrollType.Horizontal) ? scrollRect.width * this.focusT : scrollRect.height * this.focusT;

        // 计算出可视区域能容纳的项数（不超过总项数）
        this._extraItemNum = scrollType === Laya.ScrollType.Horizontal
            ? Math.ceil(scrollRect.width / cellSize)
            : Math.ceil(scrollRect.height / cellSize);

        // 固定数据源长度
        this._randomizedResultMap.clear();
        if (fixedLenCfg && fixedLenCfg.targetLength > 0) {
            if (fixedLenCfg.fillOptions) {
                this.fixedLenFillPlanA(ownerArr, fixedLenCfg);
            } else {
                this.fixedLenFillPlanB(ownerArr, fixedLenCfg);
            }
        }

        // 列表的末尾加入额外重复项
        this.owner.array = null; // 重置滚动值，避免数据源出错
        this._originalItemCount = ownerArr.length;
        for (let i = 0; i < this._extraItemNum; i++) {
            let idx = i % this._originalItemCount;
            ownerArr.push(ownerArr[idx]);
        }
        this._itemCount = ownerArr.length;
        this.owner.array = ownerArr;

        // 最大的滚动值
        this._maxScrollBarValue = this._scrollBar.min + this._originalItemCount * this._cellSize;

        // 必须设置repeatX、repeatY为列表的数据总个数，否则循环滚动设置 scrollBar.value 回开头或末尾的重复项时，会抖动
        (scrollType === Laya.ScrollType.Horizontal)
            ? this.owner.repeatX = this.owner.array.length
            : this.owner.repeatY = this.owner.array.length;

        this.isShowLogMsg && console.log(`循环列表共${this.owner.array.length}项, 其中${this._extraItemNum}个额外重复项`);

        // 初始当前焦点下的索引
        this._currentFocusIndex = this.getIndexByScrollBarValue(this._scrollBar.value, true);

        // 清除延时
        this.clearDelay();

        // 两次 callLater, 修复：项目发布后，多列表嵌套时，首次初始化，列表中间项显示不全
        Laya.timer.callLater(this, () => {
            Laya.timer.callLater(this, () => {
                // 在滚动矩形外则隐藏，优化Drawcall
                this.optimizeVisible();
                this._scrollBarChangeHandler.setTo(this, this.optimizeVisible, null);
                this.owner.scrollBar.changeHandler = this._scrollBarChangeHandler;
            });
        });
        return this;
    }

    public onUpdate(): void {
        if (!(this._flags & Flag.Inited)) return;
        if (this._flags & Flag.Paused) return;
        if (!(this._flags & Flag.Scrolling)) return;
        if (this._resultIndices.length <= 0) return; // 未设置结果

        // 动画进度
        this._aniTime += Laya.timer.delta;
        const t = Laya.MathUtil.clamp01(Math.trunc(this._aniTime / this.aniTotalTime * 1000) / 1000); // 三位小数
        this._normalizedT = t;

        // 贝塞尔曲线运动
        const tb = Utils.createBezierEase(t, this.bezierEaseData.data[0], this.bezierEaseData.data[1], this.bezierEaseData.data[2], this.bezierEaseData.data[3], this.bezierEaseData.precision);

        const curDistance = Laya.MathUtil.lerp(0, this._totalDistance, tb);
        this._speed = (curDistance - this._distance) * this.speedSign; // 计算速度
        this._distance = curDistance;

        // 滚动
        this._scrollBar.value = this._scrollBar.min + Laya.MathUtil.repeat(this._startScrollValue + this._distance * this.speedSign, this._maxScrollBarValue);

        // 滚动中
        const curFocusIdx = this.getIndexByScrollBarValue(this._scrollBar.value, true);
        if (curFocusIdx !== this._currentFocusIndex) {
            this.owner.event(ScrollingLotteryListScript.EVENT_SCROLLING, curFocusIdx); // 滚动中事件
            this.onScrollingHandler?.runWith(curFocusIdx);
            this._currentFocusIndex = curFocusIdx;
        }

        // 滚动进度事件
        this.owner.event(ScrollingLotteryListScript.EVENT_SCROLL_PROGRESS, t);
        this.onScrollProgressHandler?.runWith(t);

        // 滚动完成
        if (t >= 1) {
            this.stopScrolling();
            this.owner.event(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE, curFocusIdx); // 滚动完成事件
            this.onScrollCompleteHandler?.runWith(curFocusIdx);
        }
    }

    /** 延时 */
    public async delay(ms: number): Promise<ScrollingLotteryListScript> {
        return new Promise((resolve: (value: ScrollingLotteryListScript) => void) => {
            Laya.timer.once(ms, this, () => {
                resolve(this);
            });
        });
    }

    /** 清除延时 */
    public clearDelay(): void {
        Laya.timer.clearAll(this);
    }

    /**
     * 设置结果
     * * 注意：正在滚动时不能调这个方法，如果一定要调用，请先调用 {@link stopScrolling()} 强制停止滚动后，才能调用这个方法
     * @param index 结果索引（未添加重复项前的索引）
     * @param isImmediate 是否立即滚动到结果处, 默认：false
     * @param resultFocusT 结果项聚焦插值，区间为 [0, 1]，默认：0.5 表示停在中间，小于 0.5 表示停在左侧，大于 0.5 表示停在右侧
     * @param others 
     */
    public setResult(index: number, isImmediate: boolean = false, resultFocusT: number = 0.5, others: any = null): ScrollingLotteryListScript {
        if (!(this._flags & Flag.Inited)) throw new Error(`还未初始化, 不能设置结果`);
        if (this._flags & Flag.Scrolling) throw new Error(`正在滚动中，不能设置结果`);

        // 其他参数
        let isRandomizedIndex = false; // 是否已是打乱后的结果索引
        if (others) {
            isRandomizedIndex = others.isRandomizedIndex;
        }

        if (!isRandomizedIndex) {
            // 取数据源元素顺序打乱后的结果索引
            index = this.getRandomizedResultIndex(index);
        }

        const inRange = index >= 0 && index < this._originalItemCount;
        if (!inRange) throw new Error(`设置的结果索引 ${index} 超出范围 [0, ${this._originalItemCount})`);

        this._resultFocusT = Laya.MathUtil.clamp01(resultFocusT); // 限制区间：[0, 1]

        // 符合结果的索引
        this._resultIndices.length = 0;
        for (let i = 0, c = Math.ceil(this._itemCount / this._originalItemCount); i < c; i++) {
            const idx = i * this._originalItemCount + index;
            (idx < this._itemCount) && this._resultIndices.push(idx);
        }

        // 立即滚动到结果处
        if (isImmediate) {
            for (let i = 0; i < this._resultIndices.length; i++) {
                const idx = this._resultIndices[i];
                if (this.isItemFocusable(idx, resultFocusT)) {
                    this._scrollBar.value = this.getScrollBarValueByIndex(idx, resultFocusT) - this._focusPos;
                    break;
                }
            }
        }

        // 同步设置当前焦点下的索引
        this._currentFocusIndex = this.getIndexByScrollBarValue(this._scrollBar.value, true);

        // 清除延时
        this.clearDelay();
        return this;
    }

    /** 开始滚动 */
    public startScrolling(): ScrollingLotteryListScript {
        if (!(this._flags & Flag.Inited)) throw new Error(`还未初始化, 不能开始滚动`);
        if (this._flags & Flag.Scrolling) {
            console.warn(`正在滚动中，不能再开始滚动`);
            return;
        }
        if (this._resultIndices.length === 0) throw new Error("未设置的结果，不能开始滚动");

        this._normalizedT = 0;
        this._aniTime = 0;
        this._totalDistance = this.getResultDistance(this._resultFocusT); // 当前位置到结果的距离
        this._distance = 0;
        this._startScrollValue = this._scrollBar.value;
        this._flags |= Flag.Scrolling;

        // 滚动开始事件
        this.owner.event(ScrollingLotteryListScript.EVENT_SCROLL_START);
        this.onScrollStartHandler?.run();

        // 滚动进度事件
        this.owner.event(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE, this._normalizedT);
        this.onScrollProgressHandler?.runWith(this._normalizedT);

        // 同步设置当前焦点下的索引
        this._currentFocusIndex = this.getIndexByScrollBarValue(this._scrollBar.value, true);

        // 清除延时
        this.clearDelay();
        return this;
    }

    /** 设置暂停 */
    public setPaused(value: boolean): ScrollingLotteryListScript {
        if (value) this._flags |= Flag.Paused;
        else this._flags &= ~Flag.Paused;
        // 清除延时
        this.clearDelay();
        return this;
    }

    /** 停止滚动 */
    public stopScrolling(): ScrollingLotteryListScript {
        this._speed = 0;
        this._flags &= ~Flag.Scrolling;
        // 清除延时
        this.clearDelay();
        return this;
    }

    /**
     * 取数据源元素顺序打乱后的结果索引（原结果索引在固定数据源长度时，位置会被打乱）
     * @param resultIndex 数据源被打乱前的结果索引
     * @returns 如果字典中没有，则返回自身
     */
    public getRandomizedResultIndex(resultIndex: number): number {
        if (this._randomizedResultMap.has(resultIndex)) {
            resultIndex = this._randomizedResultMap.get(resultIndex);
        }
        return resultIndex;
    }

    // /**
    //  * 取数据源元素顺序前的结果索引
    //  * @param randomizedResultIndex 数据源元素顺序打乱后的结果索引（原结果索引在固定数据源长度时，位置会被打乱）
    //  * @returns 如果字典中没有，则返回 -1
    //  */
    // public getOriginalResultIndex(randomizedResultIndex: number): number {
    //     let originalResultIdx = -1;
    //     this._randomizedResultMap.forEach((value: number, key: number) => {
    //         if (randomizedResultIndex === value) {
    //             originalResultIdx = key;
    //         }
    //     });
    //     return originalResultIdx;
    // }

    public onDisable(): void {
        Laya.timer.clearAll(this);
        // 清除延时
        this.clearDelay();
    }


    /** 获取指定索引的原始索引 */
    public getOriginalIndex(index: number): number {
        return index % this._originalItemCount;
    }

    /**
     * 获取指定列表项的滚动值
     * @param index 列表项索引
     * @param itemFocusT 列表项聚焦插值，区间为 [0, 1]，0.5 中间，小于 0.5 左侧，大于 0.5 右侧
     */
    private getScrollBarValueByIndex(index: number, itemFocusT: number): number {
        if (index < 0 || index > this._itemCount - 1) throw new Error(`索引超出范围, i:${index}, itemCount:${this._itemCount}`);

        let val = index * this._cellSize;
        val += this._itemSize * itemFocusT;
        return val;
    }

    /**
     * 根据滚动值获取列表项索引
     * @param scrollBarValue 滚动值
     * @param isFocused 如果 true ，则获取位于焦点下的索引，false 时，则列表可视区域左/上的索引
     * @returns 
     */
    private getIndexByScrollBarValue(scrollBarValue: number, isFocused: boolean): number {
        if (isFocused) scrollBarValue += this._focusPos;
        return Math.trunc(scrollBarValue / this._cellSize);
    }

    /** 
     * 指定的列表项能被滚动到焦点处（列表头、尾处的项，就可能滚动不到）
     * @param itemFocusT 列表项聚焦插值，区间为 [0, 1]，0.5 中间，小于 0.5 左侧，大于 0.5 右侧
     */
    private isItemFocusable(index: number, itemFocusT: number): boolean {
        const itemScrollBarVal = this.getScrollBarValueByIndex(index, itemFocusT);
        let ret = itemScrollBarVal >= this._focusPos && itemScrollBarVal <= this._scrollBar.max + this._focusPos;
        return ret;
    }

    /**
     * 获取当前位置到结果的距离
     * @param resultFocusT 结果项聚焦插值，区间为 [0, 1]，0.5 表示停止在结果项的中间
     */
    private getResultDistance(resultFocusT: number): number {
        // 当前聚焦项索引
        const focusedIndex = this.getIndexByScrollBarValue(this._scrollBar.value, true);
        // 需要偏移多少能把当前聚焦项显示在焦点中间（focusedIndex项中间-可视区焦点处的偏移量）
        const distOffset = this.getScrollBarValueByIndex(focusedIndex, resultFocusT) - (this._scrollBar.value + this._focusPos);
        // 当前聚焦项距离结果项有多少个项（按照滚动方向计算）
        let distItemCount = 0;
        const retIdx = this._resultIndices[0];
        const focusedOriginalIdx = this.getOriginalIndex(focusedIndex);
        for (let i = 0; i < this._itemCount; i++) {
            const originalIdx = Laya.MathUtil.repeat(focusedOriginalIdx + this.speedSign * i, this._originalItemCount);
            // console.log("for", `i:${i}`, `originalIdx:${originalIdx}`, `retIdx:${retIdx}`);
            if (retIdx === originalIdx) break;
            distItemCount++;
        }
        // console.log(`speedSign:${this.speedSign}`, `focusedIndex:${focusedIndex}`, `distOffset:${distOffset}`, `getOriginalIndex:${this.getOriginalIndex(focusedIndex)}`, `retIdx:${retIdx}`, `distItemCount:${distItemCount}`);
        // 总距离
        const total = (this._cellSize * this._originalItemCount) * this.circles
            + (this.speedSign * distOffset)
            + (distItemCount * this._cellSize);
        // console.log(`total:${total}`, (this._cellSize * this._originalItemCount) * this.circles, (this.speedSign * distOffset), (distItemCount * this._cellSize));
        return total;
    }

    /** 在滚动矩形外则隐藏，优化Drawcall */
    private optimizeVisible(): void {
        // const cells = this.owner.cells; // 调用此属性非常慢, 此处不要使用这个方法遍历列表项
        const scrollRect = this.owner.content.scrollRect;
        for (let i = 0, c = this.owner.content.children.length; i < c; i++) {
            const cell = this.owner.content.children[i] as Laya.UIComponent;
            if (!cell) continue;
            const ret = cell.name.match(this._itemRegExp); // 找 item0,item1,item2,...命名的 child
            if (!ret || ret[0] !== ret.input) continue;
            // const cellRect = cell.getBounds(this._tempRect);
            const cellRect = this._tempRect.setTo(cell.x - cell.pivotX, cell.y - cell.pivotY, cell.width, cell.height);
            cell.visible = scrollRect.intersects(cellRect);
        }
    }

    /**
     * 固定数据源长度填充，方案A
     * @param ownerArr 
     * @param fixedLenCfg 
     */
    private fixedLenFillPlanA(ownerArr: any[], fixedLenCfg: FixedLenCfg): void {
        if (Array.isArray(fixedLenCfg.reservedIndices)) {
            const reservedLen = fixedLenCfg.reservedIndices.length;
            if (reservedLen > ownerArr.length) {
                throw new Error(`固定数据源长度配置中, reservedIndices 的长度不能大于数据源长度`);
            }
            if (reservedLen > fixedLenCfg.targetLength) {
                throw new Error(`固定数据源长度配置中, reservedIndices 的长度不能大于 targetLength`);
            }
        }

        const forcedItems: Array<{ index: number; item: any }> = []; // 强制指定某个具体对象在某位置

        // 始终保留的元素，随机放置到固定的数据源长度内
        if (Array.isArray(fixedLenCfg.reservedIndices)) {
            let min = 0;
            let len = Math.min(fixedLenCfg.targetLength, ownerArr.length);
            // 始终保留的元素，如果长度够，不固定在第一个和最后一个（对后续设置最大连续相同品质次数，首尾相连时有影响）
            if (len - 2 >= fixedLenCfg.reservedIndices.length) {
                min += 1;
                len -= 1;
            }
            const randomIndices = this.getRandomizeIndexes(min, len - 1, this._tempNums); // 随机索引，区间:[min, len)
            fixedLenCfg.reservedIndices.forEach((element, index) => {
                if (element >= 0 && element < ownerArr.length) {
                    const randomIdx = randomIndices[index];
                    const temp = ownerArr[randomIdx];
                    ownerArr[randomIdx] = ownerArr[element];
                    forcedItems.push({ index: randomIdx, item: ownerArr[element] });
                    ownerArr[element] = temp;
                    this._randomizedResultMap.set(element, randomIdx);
                } else {
                    throw new Error(`固定数据源长度配置中, reservedIndices[${index}]:${element} 索引超出范围`);
                }
            });
        } else {
            if (fixedLenCfg.reservedIndices >= 0 && fixedLenCfg.reservedIndices < ownerArr.length) {
                let min = 0;
                let len = Math.min(fixedLenCfg.targetLength, ownerArr.length);
                // 始终保留的元素，如果长度够，不固定在第一个和最后一个（对后续设置最大连续相同品质次数，首尾相连时有影响）
                if (len - 2 >= 1) {
                    min += 1;
                    len -= 1;
                }
                const randomIdx = this.rangeInt(min, len); // 随机索引，区间:[min, len)
                const temp = ownerArr[randomIdx];
                ownerArr[randomIdx] = ownerArr[fixedLenCfg.reservedIndices];
                forcedItems.push({ index: randomIdx, item: ownerArr[fixedLenCfg.reservedIndices] });
                ownerArr[fixedLenCfg.reservedIndices] = temp;
                this._randomizedResultMap.set(fixedLenCfg.reservedIndices, randomIdx);
            } else {
                throw new Error(`固定数据源长度配置中, reservedIndices:${fixedLenCfg.reservedIndices} 索引超出范围`);
            }
        }
        const options = {
            // 最大连续相同品质次数
            maxConsecutive: fixedLenCfg.fillOptions.maxConsecutive,
            // 品质权重
            qualityWeights: fixedLenCfg.fillOptions.qualityWeights,
            // 强制指定某个具体对象在某位置
            forcedItems: forcedItems
        };
        const repeatFillArr = Utils.repeatFillWithQuality(ownerArr, fixedLenCfg.fillOptions.qualityKey, fixedLenCfg.targetLength, options);
        ownerArr.length = 0;
        ownerArr.push(...repeatFillArr);
    }

    /**
     * 固定数据源长度填充，方案B
     * @param ownerArr 
     * @param fixedLenCfg 
     */
    private fixedLenFillPlanB(ownerArr: any[], fixedLenCfg: FixedLenCfg): void {
        if (Array.isArray(fixedLenCfg.reservedIndices)) {
            const reservedLen = fixedLenCfg.reservedIndices.length;
            if (reservedLen > ownerArr.length) {
                throw new Error(`固定数据源长度配置中, reservedIndices 的长度不能大于数据源长度`);
            }
            if (reservedLen > fixedLenCfg.targetLength) {
                throw new Error(`固定数据源长度配置中, reservedIndices 的长度不能大于 targetLength`);
            }
        }

        const cloneArr = ownerArr.concat();
        ownerArr.length = 0;

        // 始终保留的元素存入到 ownerArr
        if (Array.isArray(fixedLenCfg.reservedIndices)) {
            fixedLenCfg.reservedIndices.forEach((element, index) => {
                if (element > -1 && element < cloneArr.length) {
                    ownerArr.push(cloneArr[element]);
                    this._randomizedResultMap.set(element, ownerArr.length - 1);
                } else {
                    throw new Error(`固定数据源长度配置中, reservedIndices[${index}]:${element} 索引超出范围`);
                }
            });
        } else {
            if (fixedLenCfg.reservedIndices > -1 && fixedLenCfg.reservedIndices < cloneArr.length) {
                ownerArr.push(cloneArr[fixedLenCfg.reservedIndices]);
                this._randomizedResultMap.set(fixedLenCfg.reservedIndices, ownerArr.length - 1);
            } else {
                throw new Error(`固定数据源长度配置中, reservedIndices:${fixedLenCfg.reservedIndices} 索引超出范围`);
            }
        }
        // console.log("始终保留的元素存入到 ownerArr:", ownerArr.concat());

        // 从 cloneArr 移除已存入 ownerArr 的元素
        for (let i = cloneArr.length - 1; i >= 0; i--) {
            if (ownerArr.indexOf(cloneArr[i]) > -1) {
                cloneArr.splice(i, 1);
            }
        }
        // console.log("从 cloneArr 移除已存入 ownerArr 的元素后：", cloneArr);

        // 排除始终保留的元素外，还要存入多少到达固定长度
        const fixedCount = ownerArr.length;
        const c = fixedLenCfg.targetLength - fixedCount; // 还要存入多少到达固定长度
        // --方案1, 随机一个索引开始循环填充
        const randomFactor = (Math.random() * cloneArr.length) | 0; // 索引区间：[0, cloneArr.length)
        for (let i = 0; i < c; i++) {
            const randomIdx = Laya.MathUtil.repeat(randomFactor + i, cloneArr.length) | 0; // 索引区间：[0, cloneArr.length)
            ownerArr.push(cloneArr[randomIdx]); // 随机取元素，存入到 ownerArr
        }
        // --方案2
        // if (cloneArr.length > c) { // 余数超过存入数时，随机存入
        //     for (let i = 0; i < c; i++) {
        //         const randomIdx = (Math.random() * cloneArr.length) | 0; // 索引区间：[0, cloneArr.length)
        //         ownerArr.push(cloneArr[randomIdx]); // 随机取元素，存入到 ownerArr
        //     }
        // } else { // 余数小于等于存入数时，整个数组直接存入，还未到达固定长度再随机存入
        //     const n = (c / cloneArr.length) | 0;
        //     for (let i = 0; i < n; i++) {
        //         ownerArr.push(...cloneArr);
        //     }
        //     // 按整数组存入，还差多少到达固定长度
        //     const c2 = c - ownerArr.length;
        //     for (let i = 0; i < c2; i++) {
        //         const randomIdx = (Math.random() * cloneArr.length) | 0; // 索引区间：[0, cloneArr.length)
        //         ownerArr.push(cloneArr[randomIdx]); // 随机取元素，存入到 ownerArr
        //     }
        // }

        // 打乱始终保留的元素的位置
        if (Array.isArray(fixedLenCfg.reservedIndices)) {
            fixedLenCfg.reservedIndices.forEach((element, index) => {
                const i = this._randomizedResultMap.get(element);
                const temp = ownerArr[i];
                const randomIdx = (Math.random() * ownerArr.length) | 0; // 索引区间：[0, ownerArr.length)
                ownerArr[i] = ownerArr[randomIdx];
                ownerArr[randomIdx] = temp;
                this._randomizedResultMap.set(element, randomIdx);
            });
        } else {
            const i = this._randomizedResultMap.get(fixedLenCfg.reservedIndices);
            const temp = ownerArr[i];
            const randomIdx = (Math.random() * ownerArr.length) | 0; // 索引区间：[0, ownerArr.length)
            ownerArr[i] = ownerArr[randomIdx];
            ownerArr[randomIdx] = temp;

            this._randomizedResultMap.set(fixedLenCfg.reservedIndices, randomIdx);
        }
    }

    //#region Util
    /**
     * 获取一个随机的索引数组(索引不重复，可以是负数)，索引值区间为：[minInt, maxInt]
     * @param minInt 整数，索引最小值
     * @param maxInt 整数，索引最大值
     * @returns 
     */
    private getRandomizeIndexes(minInt: number, maxInt: number, output?: number[]): number[] {
        minInt |= 0, maxInt |= 0;
        output ||= [];
        output.length = 0;
        for (let i = minInt; i <= maxInt; i++) {
            output.push(i);
        }
        this.randomizeArray(output);
        return output;
    }

    /** 随机化的一个数组 */
    private randomizeArray(collection: any[], length?: number): void {
        if (length === undefined) {
            length = collection.length;
        }
        for (let i = 0; i < length; i++) {
            let randomIndex = this.rangeInt(0, length);
            let val = collection[i];
            collection[i] = collection[randomIndex];
            collection[randomIndex] = val;
        }
    }

    /** 返回 [min,max) 的随机整数 */
    private rangeInt(min: number, max: number): number {
        min = Math.floor(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }
    //#endregion

}