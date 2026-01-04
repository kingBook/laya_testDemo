import { ScrollingLotteryListScript } from "./ScrollingLotteryListScript";

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

    onAwake(): void {
        // // 水平滚动
        const hListData = [];
        for (let i = 0; i < 5; i++)hListData.push({ Label: `${i}` });
        this.hList.array = hListData;
        this.hList.renderHandler = new Laya.Handler(this, (cell: Laya.UIComponent, index: number) => {
            const labelIndex = cell.getChild("labelIndex", Laya.Label);
            labelIndex.text = `${index}`;
        });
        const hListComp = this.hList.addComponent(ScrollingLotteryListScript).init();
        //hListComp.isShowLogMsg = true;

        // 垂直滚动
        const vListData = [];
        for (let i = 0; i < 5; i++)vListData.push({ Label: `${i}` });
        this.vList.array = vListData;
        this.vList.renderHandler = new Laya.Handler(this, (cell: Laya.UIComponent, index: number) => {
            const labelIndex = cell.getChild("labelIndex", Laya.Label);
            labelIndex.text = `${index}`;
        });
        this.vList.addComponent(ScrollingLotteryListScript).init();


        // 字母
        this.letterList.array = [{ Label: "A" }, { Label: "B" }, { Label: "C" }, { Label: "D" }, { Label: "E" }];
        const letterLottery = this.letterList.addComponent(ScrollingLotteryListScript);
        letterLottery.init();
        letterLottery.owner.on(ScrollingLotteryListScript.EVENT_SCROLL_COMPLETE, () => {
            console.log("滚动到结果项完成");
        });

        // 数字
        const numberListData = [];
        for (let i = 0; i <= 9; i++)numberListData.push({ Label: `${i}` });
        this.numberList.array = numberListData;
        this.numberList.addComponent(ScrollingLotteryListScript).init();
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            const resultIndex = Math.trunc(Math.random() * 5);
            const speedSign = Math.random() > 0.5 ? 1 : -1;
            const resultFocusT = 0.5//Math.random();

            console.log("设置结果", resultIndex, "resultFocusT:" + resultFocusT);
            this.hList.getComponent(ScrollingLotteryListScript).speedSign = speedSign;
            this.hList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, false, resultFocusT);

            this.vList.getComponent(ScrollingLotteryListScript).speedSign = speedSign;
            this.vList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, false, resultFocusT);
        } else if (evt.key === 'k') {
            const resultIndex = Math.trunc(Math.random() * 5);
            const resultFocusT = 0.5//Math.random();

            console.log("立即设置到结果处", resultIndex, "resultFocusT:" + resultFocusT);
            this.hList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, true, resultFocusT);

            this.vList.getComponent(ScrollingLotteryListScript).setResult(resultIndex, true, resultFocusT);
        }


        const letterLottery = this.letterList.getComponent(ScrollingLotteryListScript);
        if (evt.key === 'i') {
            const resultIndex = Math.trunc(Math.random() * 5);
            console.log(`设置结果:${resultIndex}, label:${this.letterList.array[resultIndex].Label}`);
            letterLottery.speedSign = Math.random() > 0.5 ? 1 : -1;
            letterLottery.setResult(resultIndex);
        } else if (evt.key === 'o') {
            const resultIndex = Math.trunc(Math.random() * 5);
            console.log(`立即设置到结果处:${resultIndex}, label:${this.letterList.array[resultIndex].Label}`);
            letterLottery.setResult(resultIndex, true);
        }

        if (evt.key === 'p') {
            letterLottery.setPaused(!letterLottery.isPaused);
        }
    }

}