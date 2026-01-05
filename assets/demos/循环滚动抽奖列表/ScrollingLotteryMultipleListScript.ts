import { BezierEaseData, ScrollingLotteryListScript } from "./ScrollingLotteryListScript";

const { regClass, property, classInfo } = Laya;

/** 布尔标记 */
enum Flag {
    /** 已初始化 */
    Inited = 1,
    /** 滚动中... */
    Scrolling = 2,
    /** 暂停中... */
    Paused = 4,
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
 * multipleLottry.subListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
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
 * //multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLL_COMPLETE, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
 * multipleLottry.onScrollCompleteHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
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
    /** 滚动到结果项完成事件，事件由 {@link owner} 派发，回调函数格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number): void` */
    public static readonly EVENT_SCROLL_COMPLETE: string = "eventScrollComplete";

    declare owner: Laya.List;

    @property({ type: Laya.List, private: false, tips: "子列表模板" })
    private _subListTemplate: Laya.List;
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
    /** 滚动到结果项完成处理器，格式：`(subLottery:ScrollingLotteryListScript, subListIdx:number): void` */
    public onScrollCompleteHandler: Laya.Handler;


    /** 子列表抽奖组件数组 */
    private _subLotteries: ScrollingLotteryListScript[];
    /** 布尔标记集合 */
    private _flags: Flag;


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
        // 父列表
        this.owner.array = this.array; // 父列表数据源
        this.owner.renderHandler = this.parentListItemRender ? this.parentListItemRender : new Laya.Handler(this, this.onRenderParentListItem);

        // 子列表
        this._subLotteries ||= [];
        for (let i = 0, c = this.owner.content.children.length; i < c; i++) {
            const child = this.owner.content.children[i];
            const ret = child.name.match(/item\d+/); // 找 item0,item1,item2,...命名的 child
            if (ret && ret[0] === ret.input) {
                const subListIdx = Number.parseInt(ret[0].replace("item", "")); // 取 item0,item1,item2,... 后的数字

                const subList = child.getChild(this._subListTemplate.name, Laya.List);
                subList.array = this.owner.array[subListIdx]; // 子列表数据源

                if (subList.array && subList.array.length > 0) {
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
                    subLottery.onScrollCompleteHandler = new Laya.Handler(this, () => {
                        if (subListIdx >= this.owner.array.length - 1) { // 最后一个子列表滚动完成
                            this._flags &= ~Flag.Scrolling;
                        }
                        this.owner.event(ScrollingLotteryMultipleListScript.EVENT_SCROLL_COMPLETE, [subLottery, subListIdx]); // 滚动完成
                        this.onScrollCompleteHandler?.runWith([subLottery, subListIdx]);
                    });

                    this._subLotteries[subListIdx] = subLottery; // 保存到子列表抽奖组件数组
                }
            }
        }

        // 初始化完成
        this._flags = Flag.Inited;
        return this;
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
    * @param resultIndices 结果索引数组（未添加重复项前的索引）
    * @param isImmediate 是否立即设置，默认：false 滚动慢慢停止在结果处；true：立即设置到结果处
    * @param resultsFocusT 结果项聚焦插值数组，区间为 [0, 1]，默认：0.5 表示停在中间，小于 0.5 表示停在左侧，大于 0.5 表示停在右侧
    * @param startScrollingInterval 开始滚动间隔<毫秒>, 非立即设置时有效，默认：1000
    */
    public async setResults(resultIndices: number[], isImmediate: boolean = false, resultsFocusT: number[], startScrollingInterval: number = 1000): Promise<void> {
        if (!(this._flags & Flag.Inited)) throw new Error(`还未初始化, 不能设置结果`);
        if (this._flags & Flag.Scrolling) throw new Error(`正在滚动中，不能设置结果`);
        if (isImmediate) {
            this._subLotteries.forEach((lottery, i) => {
                lottery.setResult(resultIndices[i], isImmediate, resultsFocusT[i]);
            });
        } else {
            for (let i = 0, c = this._subLotteries.length; i < c; i++) {
                const lottery = this._subLotteries[i];
                await lottery.delay(startScrollingInterval);
                lottery.setResult(resultIndices[i], isImmediate, resultsFocusT[i]);
            }
        }
    }

    /** 设置暂停 */
    public setPaused(value: boolean): void {
        if (value) this._flags |= Flag.Paused;
        else this._flags &= ~Flag.Paused;

        this._subLotteries.forEach(lottery => {
            lottery.setPaused(value);
        });
    }

    /** 停止滚动 */
    public stopScrolling(): void {
        this._flags &= ~Flag.Scrolling;
        this._subLotteries.forEach(lottery => {
            lottery.stopScrolling();
        });
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
}