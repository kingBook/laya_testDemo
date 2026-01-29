import Utils from "utils/Utils";
import { ScrollingLotteryListScript } from "./ScrollingLotteryListScript";
import { FixedSubLenCfg, PosMode, ScrollingLotteryMultipleListScript } from "./ScrollingLotteryMultipleListScript";

const { regClass, property } = Laya;

@regClass()
export class TestScrollingLotteryMultipleListScript extends Laya.Script {

    @property({ type: ScrollingLotteryMultipleListScript, private: false, tips: "多列表滚动抽奖" })
    private _multipleLottry: ScrollingLotteryMultipleListScript;

    /** 品质颜色 */
    private _qualityColors = {
        1: "#9a9a04",
        2: "#b00202",
        3: "#9b079b",
        4: "#040494"
    };

    /** 结果索引数组 */
    private _resultIndices: number[] = [
        0, 1, 2, 3,
        0, 1, 2, 3
    ];

    /** 结果项聚焦插值数组，区间为 [0, 1]，0.5 中间, <0.5 左, >0.5 右 */
    private _resultsFocusT: number[] = [
        // 0.1, 0.5, 0.7, 0.9,
        // 0.1, 0.5, 0.7, 0.9
        0.5, 0.5, 0.5, 0.5,
        0.5, 0.5, 0.5, 0.5
    ];

    private _arrayDatas: any[][] = [
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],

        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }]
    ];

    private _arrayDatas2: any[][] = [
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }, { id: 4, quality: 1 }, { id: 5, quality: 2 }, { id: 6, quality: 3 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }, { id: 4, quality: 1 }, { id: 5, quality: 2 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],

        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }, { id: 4, quality: 1 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }, { id: 4, quality: 1 }, { id: 5, quality: 2 }],
        [{ id: 0, quality: 1 }, { id: 1, quality: 2 }, { id: 2, quality: 3 }, { id: 3, quality: 4 }]
    ];

    private _fixedSubLenCfg: FixedSubLenCfg = {
        subTargetLength: 6,
        subReservedIndices: this._resultIndices,
        subFillOptions: {
            qualityKey: "quality"
        }
    };

    onAwake() {
        // const items = [
        //     { id: 1, name: "蓝A", quality: 2 },
        //     { id: 2, name: "蓝B", quality: 2 },
        //     { id: 3, name: "紫C", quality: 3 },
        //     { id: 4, name: "橙D", quality: 4 },
        //     { id: 5, name: "白E", quality: 1 },
        //     { id: 6, name: "橙F", quality: 4 }  // 另一个橙装
        // ];

        // // 强制指定具体对象出现在特定位置
        // const orangeD = items[3];  // 橙D

        // console.log(Utils.repeatFillWithQuality(items, 'quality', 10, {
        //     forcedItems: [
        //         { index: 0, item: orangeD },      // 第1位强制放橙D
        //         { index: 10, item: items[5] }     // 第11位强制放橙F
        //     ],
        //     forcedPositions: [
        //         { index: 5, quality: 3 },         // 第6位强制紫装（如果位置没被具体对象占用）
        //     ],
        //     qualityWeights: {
        //         4: 0.4,  // 橙装出现概率高
        //         1: 0.05  // 白装很少
        //     }
        // }));
        

        // 数据源，二维数组
        this._multipleLottry.array = this._arrayDatas2;
        // 父列表项渲染处理器
        this._multipleLottry.subListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {

        });
        // 子列表项渲染处理器
        this._multipleLottry.subListItemRender = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            const cellDataSource = cell.dataSource;
            if (!cellDataSource) return;
            
            cell.bgColor = this._qualityColors[cellDataSource.quality];
            const idxLabel = cell.getChild("idxLabel", Laya.Label);
            if (idxLabel) {
                idxLabel.text = `${cellDataSource.id}`;
            }
        });

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
            // 初始化
            this._multipleLottry.init(this._fixedSubLenCfg);
            // 设置结果
            this._multipleLottry.setResults(this._resultIndices, this._resultsFocusT, PosMode.AlignStartPoint);
        } else if (evt.key === 'k') {
            // 开始滚动
            this._multipleLottry.startScrolling(500);
        }
    }
}