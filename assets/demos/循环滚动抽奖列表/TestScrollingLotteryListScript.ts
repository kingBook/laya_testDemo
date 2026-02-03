import { FixedLenCfg, ScrollingLotteryListScript } from "./ScrollingLotteryListScript";

const { regClass, property } = Laya;


@regClass()
export class TestScrollingLotteryListScript extends Laya.Script {

    @property({ type: Laya.List })
    hList: Laya.List;

    @property({ type: Laya.List })
    vList: Laya.List;

    @property({ type: Laya.List })
    letterList: Laya.List;

    @property({ type: Laya.List })
    numberList: Laya.List;

    /** 品质颜色 */
    private _qualityColors = {
        1: "#9a9a04",
        2: "#b00202",
        3: "#9b079b",
        4: "#040494"
    };

    public enableVList = false;
    public enableLetterList = false;

    onAwake(): void {
        // 水平滚动
        const hListData = [];
        for (let i = 0; i < 5; i++)hListData.push({ Label: `${i}`, quality: Laya.MathUtil.repeat(i, 4) + 1 });
        this.hList.array = hListData;
        this.hList.renderHandler = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
           // console.log("渲染", index);

           // cell.bgColor = this._qualityColors[cell.dataSource.quality];

            const labelIndex = cell.getChild("labelIndex", Laya.Label);
            labelIndex.text = `${index}`;
        });

        // 固定数据源长度配置
        const fixedLenCfg: FixedLenCfg = {
            // 固定数据源的长度（注意： 固定后数据源实际长度并非此长度，为了能循环滚动在此长度末尾还会加入一些重复项）
            targetLength: 6,
            // 列表数据源始终保留的索引（避免在对齐数据源删除元素时被删除， 索引值不能超出列表原数据源长度）。例: 开奖结果索引是需要保留的
            reservedIndices: 4,
            // 数据源填充选项（可选）
            fillOptions: {
                // 品质 key
                qualityKey: "quality",
                // 最大连续相同品质次数（可选），默认 2
                maxConsecutive: 2,
                // 品质权重（可选）
                qualityWeights: {
                    1: 1,
                    2: 1,
                    3: 1,
                    4: 1
                }
            }
        };
        const hListComp = this.hList.addComponent(ScrollingLotteryListScript).init(fixedLenCfg);
        //hListComp.isShowLogMsg = true;

        // 垂直滚动
        const vListData = [];
        for (let i = 0; i < 5; i++)vListData.push({ Label: `${i}` });
        this.vList.array = vListData;
        this.vList.renderHandler = new Laya.Handler(this, (cell: Laya.UIComponent, index: number) => {
            const labelIndex = cell.getChild("labelIndex", Laya.Label);
            labelIndex.text = `${index}`;
        });
        if (this.enableVList) {
            this.vList.addComponent(ScrollingLotteryListScript).init();
        }


        // 字母
        this.letterList.array = [{ Label: "A" }, { Label: "B" }, { Label: "C" }, { Label: "D" }, { Label: "E" }];
        if (this.enableLetterList) {
            const letterLottery = this.letterList.addComponent(ScrollingLotteryListScript);
            letterLottery.init();
            letterLottery.owner.on(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE, () => {
                console.log("滚动到结果项完成");
            });
        }

        // 数字
        const numberListData = [];
        for (let i = 0; i <= 9; i++)numberListData.push({ Label: `${i}` });
        this.numberList.array = numberListData;
        // this.numberList.addComponent(ScrollingLotteryListScript).init();
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            const resultIndex = Math.trunc(Math.random() * 5);
            const speedSign = Math.random() > 0.5 ? 1 : -1;
            const resultFocusT = Math.random();

            console.log("设置结果", resultIndex, "resultFocusT:" + resultFocusT);

            this.hList.getComponent(ScrollingLotteryListScript).speedSign = speedSign;
            this.hList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, false, resultFocusT);

            if (this.enableVList) {
                this.vList.getComponent(ScrollingLotteryListScript).speedSign = speedSign;
                this.vList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, false, resultFocusT);
            }
        } else if (evt.key === 'k') {
            const resultIndex = Math.trunc(Math.random() * 5);
            const resultFocusT = Math.random();

            console.log("立即滚动到结果处", resultIndex, "resultFocusT:" + resultFocusT);

            this.hList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, true, resultFocusT);

            if (this.enableVList) {
                this.vList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, true, resultFocusT);
            }
        } else if (evt.key === 'l') {
            console.log("开始滚动");

            this.hList.getComponent(ScrollingLotteryListScript).startScrolling();

            if (this.enableVList) {
                this.vList.getComponent(ScrollingLotteryListScript).startScrolling();
            }
        }

        if (this.enableLetterList) {
            const letterLottery = this.letterList.getComponent(ScrollingLotteryListScript);
            if (evt.key === 'u') {
                const resultIndex = Math.trunc(Math.random() * 5);
                console.log(`设置结果:${resultIndex}, label:${this.letterList.array[resultIndex].Label}`);
                letterLottery.speedSign = Math.random() > 0.5 ? 1 : -1;
                letterLottery.setResult(resultIndex);
            } else if (evt.key === 'i') {
                const resultIndex = Math.trunc(Math.random() * 5);
                console.log(`立即滚动到结果处:${resultIndex}, label:${this.letterList.array[resultIndex].Label}`);
                letterLottery.setResult(resultIndex, true);
            } else if (evt.key === 'o') {
                letterLottery.startScrolling();
            }

            if (evt.key === 'p') {
                letterLottery.setPaused(!letterLottery.isPaused);
            }
        }
    }

}