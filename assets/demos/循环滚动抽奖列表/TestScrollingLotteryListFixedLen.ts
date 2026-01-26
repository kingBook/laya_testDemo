import { FixedLenCfg, ScrollingLotteryListScript } from "./ScrollingLotteryListScript";

const { regClass, property } = Laya;


@regClass()
export class TestScrollingLotteryListFixedLen extends Laya.Script {

    @property({ type: Laya.List })
    hList: Laya.List;


    private _resultIndex:number;

    onAwake(): void {
        // // 水平滚动
        const hListData = [];
        for (let i = 0; i < 5; i++)hListData.push({ Label: `${i}` });
        this.hList.array = hListData;
        this.hList.renderHandler = new Laya.Handler(this, (cell: Laya.UIComponent, index: number) => {
            const labelIndex = cell.getChild("labelIndex", Laya.Label);
            labelIndex.text = `${index}`;
        });

        this._resultIndex = 3; // 开奖结果索引
        const fixedLengthCfg: FixedLenCfg = {
            fixedLength: 8,
            fixedIndices:  this._resultIndex
        };
        const hListComp = this.hList.addComponent(ScrollingLotteryListScript).init(fixedLengthCfg);
        //hListComp.isShowLogMsg = true;
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            const speedSign = Math.random() > 0.5 ? 1 : -1;
            const resultFocusT = Math.random();

            console.log("设置结果", this._resultIndex, "resultFocusT:" + resultFocusT);

            this.hList.getComponent(ScrollingLotteryListScript).speedSign = speedSign;
            this.hList.getComponent(ScrollingLotteryListScript).setResult(this._resultIndex, false, resultFocusT);


        } else if (evt.key === 'k') {
            const resultFocusT = Math.random();

            console.log("立即滚动到结果处", this._resultIndex, "resultFocusT:" + resultFocusT);

            this.hList.getComponent(ScrollingLotteryListScript).setResult(this._resultIndex, true, resultFocusT);


        } else if (evt.key === 'l') {
            console.log("开始滚动");

            this.hList.getComponent(ScrollingLotteryListScript).startScrolling();

           
        }

       
    }

}