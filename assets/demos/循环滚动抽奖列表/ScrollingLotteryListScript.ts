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

/** 贝塞尔缓动数据 */
interface BezierEaseData {
    /** 精度<正整数> */
    precision: number;
    /** 贝塞尔曲线数据(长度为 4): https://cubic-bezier.com/ */
    data: number[];
}

/**
 * 循环滚动抽奖列表
 * 
 * * 用法示例：
 * ```
 * // 初始化列表
 * const list = this.owner.getChild("list", Laya.List);
 * list.scrollType = Laya.ScrollType.Horizontal; // 必须是水平/垂直滚动
 * list.array = [{ Label: "A" }, { Label: "B" }, { Label: "C" }, { Label: "D" }, { Label: "E" }];
 * 
 * // 添加滚动组件，并初始化
 * const lotteryScript = this.list.addComponent(ScrollingLotteryListScript).init(); // 需在 list.array 赋值后调用初始化，且不能赋值空数组
 * lotteryScript.speedSign = -1; // 滚动方向, 1 或 -1
 * lotteryScript.aniTotalTime = 5000; // 滚动时间<毫秒>
 * lotteryScript.circles = 5; // 滚动圈数
 * lotteryScript.bezierEaseData = { precision: 16, data: [.25, .1, .25, 1] }; // 动画曲线
 * 
 * lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_START_SCROLLING, () => {
 *     console.log("开始滚动");
 * });
 * 
 * lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_CHANGE_FOCUS_INDEX, (curFocusIdx: number) => {
 *     const curFocusOriginalIdx = lotteryScript.getOriginalIndex(curFocusIdx);
 *     console.log(`滚动时，当前焦点下的索引发生改变. 当前焦点下的索引: ${curFocusIdx}, 当前焦点下的原始索引：${curFocusOriginalIdx}`);
 * });
 * 
 * lotteryScript.owner.on(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE, () => {
 *     console.log("滚动到结果项完成");
 * });
 * 
 * 
 * // 设置结果, 开始滚动
 * lotteryScript.setResult(4, false); // false: 非立即设置到结果处
 * ```
 */
@regClass()
export class ScrollingLotteryListScript extends Laya.Script {

    /** 开始滚动事件 (事件由 {@link owner} 派发) */
    public static readonly EVENT_START_SCROLLING: string = "eventStartScrolling";
    /** 滚动时，当前焦点下的索引发生改变时触发的事件 (事件由 {@link owner} 派发， 回调函数格式： (curFocusIdx: number): void )*/
    public static readonly EVENT_CHANGE_FOCUS_INDEX: string = "eventChangeFocusIndex";
    /** 滚动到结果项完成事件 (事件由 {@link owner} 派发) */
    public static readonly EVENT_SCROLL_COMPLETE: string = "eventScrollComplete";

    declare owner: Laya.List;

    /** 聚集点插值，范围：[0,1] */
    @property({ type: Number, range: [0, 1], tips: "聚集点插值，范围：[0,1]" })
    public focusT = 0.5;
    /** 滚动方向, 1 或 -1 */
    @property({ type: Number, enumSource: [{ name: "1", value: 1 }, { name: "-1", value: 0 }], tips: "滚动方向, 1 或 -1" })
    public speedSign: number = 1;
    /** 动画总时长<毫秒, 大于0的整数>, 默认: 5000 */
    @property({ type: Number, tips: "动画总时长<毫秒, 大于0的整数>, 默认: 5000" })
    public aniTotalTime: number = 5000;
    /** 滚动的圈数<大于0的整数>, 默认:5 */
    @property({ type: Number, tips: "滚动的圈数<大于0的整数>, 默认:5" })
    public circles: number = 5;

    /** 贝塞尔缓动数据，https://cubic-bezier.com/ */
    public bezierEaseData: BezierEaseData = { precision: 16, data: [.25, .1, .25, 1] };
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
    private _flags: number;
    /** 符合结果的索引（因为列表末尾有一些项是重复的，所以符合结果的项可能会有两个, 最多只会有两个, 有可能只有一个，且[1]的值一定比[0]的值大， [0]:原索引, [1]:重复索引） */
    private _resultIndices: number[];
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


    /** 初始化 */
    public init(): ScrollingLotteryListScript {
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

        this._scrollBar = this.owner.scrollBar;
        this._itemSize = (scrollType === Laya.ScrollType.Horizontal) ? itemWidth : itemHeight;
        this._cellSize = cellSize;
        this._focusPos = (scrollType === Laya.ScrollType.Horizontal) ? scrollRect.width * this.focusT : scrollRect.height * this.focusT;

        // 计算出可视区域能容纳的项数（不超过总项数）
        this._extraItemNum = scrollType === Laya.ScrollType.Horizontal
            ? Math.ceil(scrollRect.width / cellSize)
            : Math.ceil(scrollRect.height / cellSize);

        // 列表的末尾加入额外重复项
        this._originalItemCount = this.owner.array.length;
        for (let i = 0; i < this._extraItemNum; i++) {
            let idx = i % this._originalItemCount;
            this.owner.array.push(this.owner.array[idx]);
        }
        this._itemCount = this.owner.array.length;

        // 最大的滚动值
        this._maxScrollBarValue = this._scrollBar.min + this._originalItemCount * this._cellSize;

        // 必须设置repeatX、repeatY为列表的数据总个数，否则循环滚动设置 scrollBar.value 回开头或末尾的重复项时，会抖动
        (scrollType === Laya.ScrollType.Horizontal)
            ? this.owner.repeatX = this.owner.array.length
            : this.owner.repeatY = this.owner.array.length;

        this.isShowLogMsg && console.log(`循环列表共${this.owner.array.length}项, 其中${this._extraItemNum}个额外重复项`);

        // 刷新列表
        this.owner.refresh();

        // 初始当前焦点下的索引
        this._currentFocusIndex = this.getIndexByScrollBarValue(this._scrollBar.value, true);

        // 清除延时
        this.clearDelay();
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

        // 滚动中，当前焦点下的索引改变时，派发事件
        const curFocusIdx = this.getIndexByScrollBarValue(this._scrollBar.value, true);
        if (curFocusIdx !== this._currentFocusIndex) {
            this.owner.event(ScrollingLotteryListScript.EVENT_CHANGE_FOCUS_INDEX, curFocusIdx);
            this._currentFocusIndex = curFocusIdx;
        }

        // 滚动完成
        if (t >= 1) {
            this.stopScrolling();
            this.owner.event(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE); // 滚动完成事件
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
     * 
     * * 注意：正在滚动时不能调这个方法，如果一定要调用，请先调用 {@link stopScrolling()} 强制停止滚动后，才能调用这个方法
     * @param index 未添加重复项前的索引
     * @param isImmediate 是否立即设置，默认：false 滚动慢慢停止在结果处；true：立即设置到结果处
     */
    public setResult(index: number, isImmediate: boolean = false): ScrollingLotteryListScript {
        if (!(this._flags & Flag.Inited)) throw new Error(`还未初始化, 不能设置结果`);
        if (this._flags & Flag.Scrolling) throw new Error(`正在滚动中，不能设置结果`);

        const inRange = index >= 0 && index < this._originalItemCount;
        if (!inRange) throw new Error("设置的结果超出范围");

        // 符合结果的索引
        this._resultIndices.length = 0;
        for (let i = 0, c = Math.ceil(this._itemCount / this._originalItemCount); i < c; i++) {
            const idx = i * this._originalItemCount + index;
            (idx < this._itemCount) && this._resultIndices.push(idx);
        }

        if (isImmediate) { // 立即设置到结果处
            for (let i = 0; i < this._resultIndices.length; i++) {
                const idx = this._resultIndices[i];
                if (this.isItemFocusable(idx)) {
                    this._scrollBar.value = this.getScrollBarValueByIndex(idx, true) - this._focusPos;
                    break;
                }
            }
            this._resultIndices.length = 0;
            this._normalizedT = 1;
        } else { // 非立即设置到结果处
            this._normalizedT = 0;
            this._aniTime = 0;
            this._totalDistance = this.getResultDistance(); // 当前位置到结果的距离
            this._distance = 0;
            this._startScrollValue = this._scrollBar.value;
            this._flags |= Flag.Scrolling;
            this.owner.event(ScrollingLotteryListScript.EVENT_START_SCROLLING); // 开始滚动事件
        }

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
        this._resultIndices.length = 0;
        this._speed = 0;
        this._flags &= ~Flag.Scrolling;
        // 清除延时
        this.clearDelay();
        return this;
    }

    public onDisable(): void {
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
     * @param isCentral 是否取列表项中间的滚动条值，默认： false 取列表项左/上在列表可视区左/上的滚动条值；true：取列表项的中间在列表可视区左/上的滚动条值
     */
    private getScrollBarValueByIndex(index: number, isCentral: boolean = false): number {
        if (index < 0 || index > this._itemCount - 1) throw new Error(`索引超出范围, i:${index}, itemCount:${this._itemCount}`);

        let val = index * this._cellSize;
        if (isCentral) val += this._itemSize / 2;
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

    /** 指定的列表项能被滚动到焦点处（列表头、尾处的项，就可能滚动不到） */
    private isItemFocusable(index: number): boolean {
        const itemScrollBarVal = this.getScrollBarValueByIndex(index, true);
        let ret = itemScrollBarVal >= this._focusPos && itemScrollBarVal <= this._scrollBar.max + this._focusPos;
        return ret;
    }

    /** 获取当前位置到结果的距离 */
    private getResultDistance(): number {
        // 当前聚焦项索引
        const focusedIndex = this.getIndexByScrollBarValue(this._scrollBar.value, true);
        // 需要偏移多少能把当前聚焦项显示在焦点中间（focusedIndex项中间-可视区焦点处的偏移量）
        const distOffset = this.getScrollBarValueByIndex(focusedIndex, true) - (this._scrollBar.value + this._focusPos);
        // 当前聚焦项距离结果有多少个项
        const distItemCount = (this._resultIndices[0] - this.getOriginalIndex(focusedIndex)) * this.speedSign;
        // 总距离
        const total = (this._cellSize * this._originalItemCount) * this.circles
            + (distItemCount * this._cellSize)
            + (this.speedSign * distOffset);
        return total;
    }

}