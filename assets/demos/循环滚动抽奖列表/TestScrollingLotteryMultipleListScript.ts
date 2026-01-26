import { ScrollingLotteryListScript } from "./ScrollingLotteryListScript";
import { FixedSubLenCfg, PosMode, ScrollingLotteryMultipleListScript } from "./ScrollingLotteryMultipleListScript";

const { regClass, property } = Laya;

@regClass()
export class TestScrollingLotteryMultipleListScript extends Laya.Script {

    @property({ type: ScrollingLotteryMultipleListScript, private: false, tips: "多列表滚动抽奖" })
    private _multipleLottry: ScrollingLotteryMultipleListScript;

    /** 结果索引数组 */
    private _resultIndices: number[] = [
        0, 1, 2, 3,
        0, 1, 2, 3
    ];

    onAwake() {
        // 数据源，二维数组
        this._multipleLottry.array = [
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],

            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }],
            [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
        ];
        // 父列表项渲染处理器
        this._multipleLottry.subListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {

        });
        // 子列表项渲染处理器
        this._multipleLottry.subListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            const cellDataSource = cell.dataSource;
            if (!cellDataSource) return;

            const idxLabel = cell.getChild("idxLabel", Laya.Label);
            if (idxLabel) {
                idxLabel.text = `${cellDataSource.id}`;
            }
        });

        let fixedSubLenCfg: FixedSubLenCfg = null;
        fixedSubLenCfg = {
            fixedSubLength: 8,
            fixedSubIndices: this._resultIndices
        };

        this._multipleLottry.init(fixedSubLenCfg); // 初始化
        this._multipleLottry.speedSign = -1; // 滚动方向, 1 或 -1
        this._multipleLottry.aniTotalTime = 5000; // 滚动时间<毫秒>
        this._multipleLottry.circles = 5; // 滚动圈数
        this._multipleLottry.bezierEaseData = { precision: 16, data: [.25, .1, .25, 1] }; // 动画曲线

        //this._multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLL_START, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
        this._multipleLottry.onScrollStartHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
            console.log(`滚动开始, 子列表索引:${subListIdx}`);
        });

        //this._multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLLING, (subLottery: ScrollingLotteryListScript, subListIdx: number, curFocusIdx: number) => {
        this._multipleLottry.onScrollingHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number, curFocusIdx: number) => {
            //console.log(`滚动中, 子列表索引:${subListIdx}, 当前聚焦子列表索引:${curFocusIdx}`);
        });

        //this._multipleLottry.owner.on(ScrollingLotteryMultipleListScript.EVENT_SCROLL_COMPLETE, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
        this._multipleLottry.onScrollCompleteHandler = new Laya.Handler(this, (subLottery: ScrollingLotteryListScript, subListIdx: number) => {
            console.log(`滚动完成, 子列表索引:${subListIdx}`);
        });

    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {

            // 结果项聚焦插值数组，区间为 [0, 1]，0.5 中间, <0.5 左, >0.5 右
            const resultsFocusT = [
                // 0.1, 0.5, 0.7, 0.9,
                // 0.1, 0.5, 0.7, 0.9
                0.5, 0.5, 0.5, 0.5,
                0.5, 0.5, 0.5, 0.5
            ];

            // 位置模式
            const posMode = PosMode.AlignStartPoint;

            // 设置结果
            this._multipleLottry.setResults(this._resultIndices, resultsFocusT, posMode);
        } else if (evt.key === 'k') {
            const startScrollingInterval = 500; // 开始滚动间隔<毫秒>
            this._multipleLottry.startScrolling(startScrollingInterval); // 开始滚动
        }
    }
}