import { BezierEaseData, ScrollingLotteryListScript } from "./ScrollingLotteryListScript";

const { regClass, property, classInfo } = Laya;

/** 布尔标记 */
enum Flag {
    /** 已初始化 */
    Inited = 1,
    /** 滚动中... */
    Scrolling = 1 << 1,
    /** 暂停中... */
    Paused = 1 << 2,
    /** 父列表滚动到已出结果子列表缓动正在进行... */
    ScrollingToSubResult = 1 << 3,
    /** 中断父列表滚动到已出结果子列表缓动 */
    InterruptScrollToSubResult = 1 << 4
}

export enum PosMode {
    None,
    Result,
    AlignStartPoint
}

/**
 * 多列表循环滚动抽奖
 * * 用法示例：
 * ```
 * const multipleLottry = this.owner.getComponent(ScrollingLotteryMultipleListScript);
 * 
 * // 数据源，二维数组
 * multipleLottry.array = [
 *     [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
 *     [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
 *     [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
 *     [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
 * ];
 * // 父列表项渲染处理器
 * multipleLottry.parentListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
 *     
 * });
 * // 子列表项渲染处理器
 * multipleLottry.subListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
 *     const cellDataSource = cell.dataSource;
 *     if (!cellDataSource) return;
 * 
 *     const idxLabel = cell.getChild("idxLabel", Laya.Label);
 *     if (idxLabel) {
 *         idxLabel.text = `${cellDataSource.id}`;
 *     }
 * });
 * 
 * multipleLottry.init(); // 初始化
 * multipleLottry.speedSign = 1; // 滚动方向, 1 或 -1
 * multipleLottry.aniTotalTime = 5000; // 滚动时间<毫秒>
 * multipleLottry.circles = 5; // 滚动圈数
 * multipleLottry.bezierEaseData = { precision: 16, data: [.25, .1, .25, 1] }; // 动画曲线
 * 
 * // 如果要求子列表动画数据不一样，在 init() 初始化后遍历以下数组进行设置
 * multipleLottry.subLotteries.forEach((element, index) => {
 *     element.speedSign = 1; // 滚动方向, 1 或 -1
 *     element.aniTotalTime = 5000; // 滚动时间<毫秒>
 *     element.circles = 5; // 滚动圈数
 *     element.bezierEaseData = { precision: 16, data: [.25, .1, .25, 1] }; // 动画曲线
 * });
 * 
 * //multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLL_START, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
 * multipleLottry.onScrollStartHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
 *     console.log(`滚动开始, 子列表索引:${subListIdx}`);
 * });
 * 
 * //multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLLING, (subLottery: ScrollingLotteryListScript, subListIdx: number, curFocusIdx: number) => {
 * multipleLottry.onScrollingHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number, curFocusIdx: number) => {
 *     const curFocusOriginalIdx = subLottery.getOriginalIndex(curFocusIdx);
 *     console.log(`滚动中, 子列表索引:${subListIdx}, 当前聚焦的原始索引：${curFocusOriginalIdx}`);
 * });
 * 
 * //multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLL_COMPLETE, (subLottery: ScrollingLotteryListScript, subListIdx: number, subCell: UIComponent) => {
 * multipleLottry.onScrollCompleteHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number, subCell: UIComponent) => {
 *     console.log(`滚动完成, 子列表索引:${subListIdx}`);
 * });
 * 
 * 
 * // 设置结果，开始滚动
 * const resultIndices = [0, 1, 2, 3]; // 结果索引数组
 * const isImmediate = false; // 是否立即设置，false 滚动慢慢停止在结果处；true：立即设置到结果处
 * const resultsFocusT = [0.1, 0.5, 0.7, 0.9]; // 结果项聚焦插值数组，区间为 [0, 1]，0.5 中间, <0.5 左, >0.5 右
 * const startScrollingInterval = 1000; // 开始滚动间隔<毫秒>
 * multipleLottry.setResults(resultIndices, isImmediate, resultsFocusT, startScrollingInterval);
 * ```
 */
@regClass()
export class ScrollingLotteryMultipleListScript extends Laya.Script {

    /** 滚动开始事件，事件由 {@link owner} 派发，回调函数格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number): void` */
    public static readonly EVENT_SCROLL_START: string = "eventScrollStart";
    /** 滚动中事件，事件由 {@link owner} 派发，回调函数格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number, curFocusIdx: number): void` */
    public static readonly EVENT_SCROLLING: string = "eventScrolling";
    /** 滚动到结果项完成事件，事件由 {@link owner} 派发，回调函数格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number, subCell: UIComponent): void` */
    public static readonly EVENT_SCROLL_COMPLETE: string = "eventScrollComplete";

    declare owner: Laya.List;

    @property({ type: Laya.List, private: false, tips: "子列表模板" })
    private _subListTemplate: Laya.List;
    /** 子列表滚动方向, 1 或 -1 */
    @property({ type: Number, enumSource: [{ name: "1", value: 1 }, { name: "-1", value: -1 }], tips: "子列表滚动方向, 1 或 -1" })
    public speedSign: number = 1;
    /** 子列表动画总时长<毫秒, 大于0的整数>, 默认: 5000 */
    @property({ type: Number, min: 1, step: 1, tips: "子列表动画总时长<毫秒, 大于0的整数>, 默认: 5000" })
    public aniTotalTime: number = 5000;
    /** 子列表滚动的圈数<大于0的整数>, 默认:5 */
    @property({ type: Number, min: 1, step: 1, tips: "子列表滚动的圈数<大于0的整数>, 默认:5" })
    public circles: number = 5;

    @property({ type: Boolean, catalog: "ScrollToSubResult", tips: "是否启用父列表滚动到已出结果子列表（缓动）" })
    public enableScrollToSubResult: boolean = true;
    @property({ type: Number, catalog: "ScrollToSubResult", readonly: "data.enableScrollToSubResult!=true", min: 1, step: 1, tips: "父列表滚动到已出结果子列表缓动的时间" })
    public scrollToSubResultDuration: number = 500;

    /** 子列表动画曲线数据，https://cubic-bezier.com/ */
    public bezierEaseData: BezierEaseData; // = { precision: 16, data: [.25, .1, .25, 1] };

    /** 列表数据源 */
    public array: any[][] = [
        [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
        [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
        [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
        [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
    ];

    /** 父列表渲染处理器，格式：`(cell: Laya.UIComponent, index: number): void` */
    public parentListItemRender: Laya.Handler;
    /** 子列表渲染处理器，格式：`(cell: Laya.UIComponent, index: number): void` */
    public subListItemRender: Laya.Handler;

    /** 滚动开始处理器，格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number): void` */
    public onScrollStartHandler: Laya.Handler;
    /** 滚动中处理器，格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number, curFocusIdx: number): void` */
    public onScrollingHandler: Laya.Handler;
    /** 滚动到结果项完成处理器，格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number, subCell: UIComponent): void` */
    public onScrollCompleteHandler: Laya.Handler;


    /** 子列表抽奖组件数组 */
    private _subLotteries: ScrollingLotteryListScript[];
    /** 布尔标记集合 */
    private _flags: Flag;
    /** 开奖结果最大索引数组 */
    private _resultMaxIndices: number[];
    /** 父列表滚动到已出结果子列表的缓动 */
    private _scrollToSubResultTweener: Laya.Tween;
    /** 子列表最大的数据源长度 */
    private _maxSubArraryLen: number;

    private _tempRect: Laya.Rectangle = new Laya.Rectangle();


    /** 子列表抽奖组件数组，注意：需要在初始化完成后调用 */
    public get subLotteries(): ScrollingLotteryListScript[] { return this._subLotteries; }
    /** 是否已初始化 */
    public get isInited(): boolean { return (this._flags & Flag.Inited) > 0; }
    /** 滚动中... */
    public get isScrolling(): boolean { return (this._flags & Flag.Scrolling) > 0; }
    /** 暂停中... */
    public get isPaused(): boolean { return (this._flags & Flag.Paused) > 0; }


    /** 初始化 */
    public init(): ScrollingLotteryMultipleListScript {
        // 父列表滚动到已出结果子列表的缓动
        this.killScrollToSubResultTweener();

        // 重置滚动值
        if (this.owner.scrollBar) {
            this.owner.scrollBar.value = 0;
        }

        // 填平、对齐子列表数据源
        this._resultMaxIndices ||= [];
        this._resultMaxIndices.length = 0;
        let maxSubArrayLen = 0;
        this.array.forEach((subArray, index) => {
            this._resultMaxIndices[index] = subArray.length - 1; // 记录开奖结果最大索引
            maxSubArrayLen = Math.max(maxSubArrayLen, subArray.length);
        });
        this._maxSubArraryLen = maxSubArrayLen;
        this.array.forEach((subArray, index) => {
            if (subArray.length < maxSubArrayLen) {
                for (let i = 0, c = maxSubArrayLen - subArray.length; i < c; i++) {
                    const ranIdx = Math.min((Math.random() * subArray.length) | 0, subArray.length - 1); // subArray 的随机索引
                    subArray.push(subArray[ranIdx]);
                }
            }
        });

        // 父列表 ========================
        if (this.owner.scrollType === Laya.ScrollType.Vertical) {
            this.owner.repeatX = 1;
            this.owner.repeatY = this.array.length;
        } else if (this.owner.scrollType === Laya.ScrollType.Horizontal) {
            this.owner.repeatX = this.array.length;
            this.owner.repeatY = 1;
        }
        this.owner.array = this.array; // 父列表数据源
        this.owner.renderHandler = this.parentListItemRender ? this.parentListItemRender : new Laya.Handler(this, this.onRenderParentListItem);

        // 子列表 ========================
        this._subLotteries ||= [];
        this._subLotteries.length = 0; // 清空
        for (let i = 0, c = this.owner.content.children.length; i < c; i++) {
            const child = this.owner.content.children[i];
            const ret = child.name.match(/item\d+/); // 找 item0,item1,item2,...命名的 child
            if (!ret || ret[0] !== ret.input) continue;

            const subListIdx = Number.parseInt(ret[0].replace("item", "")); // 取 item0,item1,item2,... 后的数字

            const subList = child.findChild(this._subListTemplate.name, Laya.List);
            subList.array = this.owner.array[subListIdx]; // 子列表数据源

            if (!subList.array || subList.array.length <= 0) continue;

            subList.renderHandler = this.subListItemRender ? this.subListItemRender : new Laya.Handler(this, this.onRenderSubListItem);

            let subLottery = subList.getComponent(ScrollingLotteryListScript);
            subLottery ||= subList.addComponent(ScrollingLotteryListScript);
            subLottery.init();

            // 子列表动画数据
            subLottery.speedSign = this.speedSign;
            subLottery.aniTotalTime = this.aniTotalTime;
            subLottery.circles = this.circles;
            if (this.bezierEaseData) subLottery.bezierEaseData = this.bezierEaseData;

            // 子列表滚动开始
            subLottery.onScrollStartHandler = new Laya.Handler(this, () => {
                if (subListIdx === 0) { // 第一个子列表滚动开始
                    this._flags |= Flag.Scrolling;
                }
                this.owner.event(ScrollingLotteryMultipleListScript.EVENT_SCROLL_START, [subLottery, subListIdx]);
                this.onScrollStartHandler?.runWith([subLottery, subListIdx]);
            });

            // 子列表滚动中
            subLottery.onScrollingHandler = new Laya.Handler(this, (curFocusIdx: number) => {
                this.owner.event(ScrollingLotteryMultipleListScript.EVENT_SCROLLING, [subLottery, subListIdx, curFocusIdx]);
                this.onScrollingHandler?.runWith([subLottery, subListIdx, curFocusIdx]);
            });

            // 子列表滚动完成
            subLottery.onScrollCompleteHandler = new Laya.Handler(this, (curFocusIdx: number) => {
                if (subListIdx >= this.owner.array.length - 1) { // 最后一个子列表滚动完成
                    this._flags &= ~Flag.Scrolling;
                }

                const subCell = subList.getCell(curFocusIdx);
                this.owner.event(ScrollingLotteryMultipleListScript.EVENT_SCROLL_COMPLETE, [subLottery, subListIdx, subCell]); // 滚动完成
                this.onScrollCompleteHandler?.runWith([subLottery, subListIdx, subCell]);


                // 父列表滚动到已出结果子列表的缓动
                if (this.enableScrollToSubResult) {
                    this.ScrollToSubResult(subListIdx);
                }
            });

            this._subLotteries[subListIdx] = subLottery; // 保存到子列表抽奖组件数组
        }

        if (this.enableScrollToSubResult) {
            if (this.owner.parent && this.owner.parent instanceof Laya.Panel) {
                this.owner.parent.on(Laya.Event.MOUSE_DOWN, this, this.onMouseHandler);
                this.owner.parent.on(Laya.Event.MOUSE_WHEEL, this, this.onMouseHandler);
            } else {
                this.owner.on(Laya.Event.MOUSE_DOWN, this, this.onMouseHandler);
                this.owner.on(Laya.Event.MOUSE_WHEEL, this, this.onMouseHandler);
            }
        }

        // 初始化完成
        this._flags = Flag.Inited;
        return this;
    }

    public onUpdate(): void {
        if (!(this._flags & Flag.Inited)) return;

        // 如果父级是 Panel 时，在滚动矩形外则隐藏，优化Drawcall 
        this.optimizeVisible();
    }

    /** 清除延时 */
    public clearDelay(): void {
        this._subLotteries.forEach((lottery, i) => {
            lottery.clearDelay();
        });
    }

    /**
     * 设置结果
     * * 注意：正在滚动时不能调这个方法，如果一定要调用，请先调用 {@link stopScrolling()} 强制停止滚动后，才能调用这个方法
     * @param resultIndices 结果索引数组（数组长度：已设置 {@link array} 的长度；元素区间：[0, 子列表数据源长度-1]）
     * @param resultsFocusT 结果项聚焦插值数组，默认: null 表示都停在中间（数组长度：已设置 {@link array} 的长度；元素区间：[0, 1]，默认：0.5 表示停在中间，小于 0.5 表示停在左侧，大于 0.5 表示停在右侧）
     * @param posMode 
     */
    public setResults(resultIndices: number[], resultsFocusT: number[], posMode: PosMode): void {
        if (!(this._flags & Flag.Inited)) throw new Error(`还未初始化, 不能设置结果`);
        if (this._flags & Flag.Scrolling) throw new Error(`正在滚动中，不能设置结果`);

        if (resultIndices && resultIndices.length !== this.array.length) throw new Error(`resultIndices 的长度必须与 array 一致`);
        if (resultsFocusT && resultsFocusT.length !== this.array.length) throw new Error(`resultsFocusT 的长度必须与 array 一致`);

        this._subLotteries.forEach((lottery, i) => {
            const resultIdx = resultIndices[i];
            const maxResultIdx = this._resultMaxIndices[i];
            if (resultIdx < 0 || resultIdx > maxResultIdx) throw new Error(`resultIndices[${i}] 等于 ${resultIdx}, 不在 [0, ${maxResultIdx}] 区间内`);
        });

        // 父列表滚动到已出结果子列表的缓动
        this.killScrollToSubResultTweener();

        switch (posMode) {
            case PosMode.None:
                this._subLotteries.forEach((lottery, i) => {
                    const resultIdx = resultIndices[i]; //  结果索引
                    const resultFocusT = resultsFocusT[i]; // 结果项聚焦插值
                    const isImmediate = false; // 是否立即滚动到结果处
                    lottery.setResult(resultIdx, isImmediate, resultFocusT);
                });
                break;
            case PosMode.Result:
                this._subLotteries.forEach((lottery, i) => {
                    const resultIdx = resultIndices[i]; //  结果索引
                    const resultFocusT = resultsFocusT[i]; // 结果项聚焦插值
                    const isImmediate = true; // 是否立即滚动到结果处
                    lottery.setResult(resultIdx, isImmediate, resultFocusT);
                });
                break;
            case PosMode.AlignStartPoint:
                const ranFactor = (((Math.random() * this._maxSubArraryLen - 1) + 1)) | 0; // 区间: [1, this._maxSubArraryLen)
                const ranSign = Math.random() >= 0.5 ? 1 : -1; // 1或-1

                this._subLotteries.forEach((lottery, i) => {
                    let resultIdx = Laya.MathUtil.repeat(resultIndices[i]-1 /*+ ranSign * ranFactor*/, this._maxSubArraryLen); //  结果索引， 区间: [0, this._maxSubArraryLen)
                    const resultFocusT = resultsFocusT[i]; // 结果项聚焦插值
                    let isImmediate = true; // 是否立即滚动到结果处
                    lottery.setResult(resultIdx, isImmediate, resultFocusT);
                    // ----------------------------------------------------
                    resultIdx = resultIndices[i]; //  结果索引
                    isImmediate = false; // 是否立即滚动到结果处
                    lottery.setResult(resultIdx, isImmediate, resultFocusT);
                });
                break;
        }
    }

    /**
     * 开始滚动
     * @param startInterval 子列表开始滚动间隔<毫秒>, 非立即设置时有效，默认：1000
     */
    public async startScrolling(startInterval: number = 1000): Promise<void> {
        if (!(this._flags & Flag.Inited)) throw new Error(`还未初始化, 不能开始滚动`);
        if (this._flags & Flag.Scrolling) throw new Error(`正在滚动中，不能开始滚动`);

        // 父列表滚动到已出结果子列表的缓动
        this.killScrollToSubResultTweener();

        for (let i = 0, c = this._subLotteries.length; i < c; i++) {
            const lottery = this._subLotteries[i];
            await lottery.delay(startInterval);
            lottery.startScrolling();
            console.log("_totalDistance:",lottery["_totalDistance"]);
        }
    }

    /** 设置暂停 */
    public setPaused(value: boolean): void {
        if (value) this._flags |= Flag.Paused;
        else this._flags &= ~Flag.Paused;

        this._subLotteries.forEach(lottery => {
            lottery.setPaused(value);
        });

        // 父列表滚动到已出结果子列表的缓动
        if (this._scrollToSubResultTweener && !this._scrollToSubResultTweener.completed) {
            value ? this._scrollToSubResultTweener.pause() : this._scrollToSubResultTweener.resume();
        }
    }

    /** 停止滚动 */
    public stopScrolling(): void {
        this._flags &= ~Flag.Scrolling;
        this._subLotteries.forEach(lottery => {
            lottery.stopScrolling();
        });

        // 父列表滚动到已出结果子列表的缓动
        this.killScrollToSubResultTweener();
    }


    /**
     * 获取父列表项
     * @param subListIdx 子列表索引
     * @returns 
     */
    public getParentCell(subListIdx: number): Laya.UIComponent | null {
        let cell: any = this._subLotteries[subListIdx].owner.parent;
        while (cell.parent && (cell.parent !== this.owner.content)) {
            cell = cell.parent;
        }
        return cell as Laya.UIComponent;
    }

    public onDisable(): void {
        // 父列表滚动到已出结果子列表的缓动
        this.killScrollToSubResultTweener();

        if (this.owner.parent) {
            this.owner.parent.off(Laya.Event.MOUSE_DOWN, this, this.onMouseHandler);
            this.owner.parent.off(Laya.Event.MOUSE_WHEEL, this, this.onMouseHandler);
        }
        this.owner.off(Laya.Event.MOUSE_DOWN, this, this.onMouseHandler);
        this.owner.off(Laya.Event.MOUSE_WHEEL, this, this.onMouseHandler);
    }

    /** 渲染父列表项 */
    private onRenderParentListItem(cell: Laya.Box, index: number): void {

    }

    /** 渲染子列表项 */
    private onRenderSubListItem(cell: Laya.Box, index: number): void {
        const cellDataSource = cell.dataSource;
        if (!cellDataSource) return;

        const idxLabel = cell.getChild("idxLabel", Laya.Label);
        if (idxLabel) {
            idxLabel.text = `${cellDataSource.id}`;
        }
    }

    /** 如果父级是 Panel 时，在滚动矩形外则隐藏，优化Drawcall */
    private optimizeVisible(): void {
        if (!this.owner.parent || !(this.owner.parent instanceof Laya.Panel)) return;

        const panel = this.owner.parent as Laya.Panel;
        const panelScrollRect = panel.content.scrollRect;

        this.owner.cells.forEach((cell: Laya.UIComponent, index: number) => {
            const cellRect = cell.getBounds(this._tempRect);
            cellRect.x += this.owner.x;
            cellRect.y += this.owner.y;
            cell.visible = panelScrollRect.intersects(cellRect);
        });
    }

    /**
     * 父列表滚动到已出结果子列表的缓动
     * @param subListIdx 已出结果的子列表索引
     */
    private ScrollToSubResult(subListIdx: number): void {
        const focusParentCell = this.getParentCell(subListIdx); // 子列表出结果后，父列表要滚动到的列表项
        if (!focusParentCell) return;

        // 第一个
        if (subListIdx === 0) {
            this._flags &= ~Flag.InterruptScrollToSubResult; // 取出用户中断标记
            this._flags |= Flag.ScrollingToSubResult; // 标记滚动进行中..
        }

        // 用户中断
        if (this._flags & Flag.InterruptScrollToSubResult) return;

        let targetScrollBar: Laya.ScrollBar = null;
        let targetValue: number = NaN;

        if (this.owner.parent && this.owner.parent instanceof Laya.Panel) { // 父级是Panel时
            const panel = this.owner.parent as Laya.Panel;
            if (panel.scrollType === Laya.ScrollType.Vertical) { // 垂直滚动Panel
                targetScrollBar = panel.vScrollBar;
                targetValue = this.owner.toParentPoint(Laya.Point.TEMP.setTo(0, focusParentCell.y + focusParentCell.height * 0.5)).y
                    - panel.height * 0.5;
            } else if (panel.scrollType === Laya.ScrollType.Horizontal) { // 水平滚动Panel
                targetScrollBar = panel.hScrollBar;
                targetValue = this.owner.toParentPoint(Laya.Point.TEMP.setTo(focusParentCell.x + focusParentCell.width * 0.5, 0)).x
                    - panel.width * 0.5;
            }
        } else { // 父级非Panel时
            if (this.owner.scrollType === Laya.ScrollType.Vertical) { // 垂直滚动列表
                targetScrollBar = this.owner.scrollBar;
                targetValue = focusParentCell.y + focusParentCell.height * 0.5
                    - this.owner.height * 0.5;
            } else if (this.owner.scrollType === Laya.ScrollType.Horizontal) { // 水平滚动列表
                targetScrollBar = this.owner.scrollBar;
                targetValue = focusParentCell.x + focusParentCell.width * 0.5
                    - this.owner.width * 0.5;
            }
        }

        if (targetScrollBar && !isNaN(targetValue) && targetScrollBar.value < targetValue) {
            this._scrollToSubResultTweener = Laya.Tween.create(targetScrollBar).duration(this.scrollToSubResultDuration).to("value", targetValue);
            // 缓动更新回调
            this._scrollToSubResultTweener.onUpdate(tweener => {
                // 用户中断则停止
                if (this._flags & Flag.InterruptScrollToSubResult) {
                    this.killScrollToSubResultTweener();
                }
            });
            // 缓动完成回调
            this._scrollToSubResultTweener.then(tweener => {
                // 最后一个完成标记滚动结束
                if (subListIdx >= this.array.length - 1) {
                    this._flags &= ~Flag.ScrollingToSubResult;
                }
                this._scrollToSubResultTweener = null;
            });
        }
    }

    private killScrollToSubResultTweener(): void {
        this._scrollToSubResultTweener?.kill();
        this._scrollToSubResultTweener = null;
        this._flags &= ~Flag.ScrollingToSubResult;
    }

    private onMouseHandler(e: Laya.Event): void {
        switch (e.type) {
            case Laya.Event.MOUSE_DOWN:
            case Laya.Event.MOUSE_WHEEL:
                if (this._flags & Flag.ScrollingToSubResult) {
                    this._flags |= Flag.InterruptScrollToSubResult;
                }
                break;
        }
    }
}