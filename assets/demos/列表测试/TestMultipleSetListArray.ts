import { ScrollingLotteryListScript } from "../循环滚动抽奖列表/ScrollingLotteryListScript";

const { regClass, property } = Laya;
/**
 * 测试列表数据源长度由短变长（且先设置 array，后设置 repeatX 与 array 长度一样）， 短时滚动列表，再切换到长数据源时，引起的头部空白问题
 */
@regClass()
export class TestMultipleSetListArray extends Laya.Script {

    @property({ type: Laya.List })
    public list: Laya.List;

    private _lotteryScript: ScrollingLotteryListScript;

    onAwake(): void {
    }

    onUpdate(): void {
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            console.log("setListArray(5)");
            this.setListArray(5);
        } else if (evt.key === 'k') {
            console.log("setListArray(10)");
            this.setListArray(10);
        } else if (evt.key === 'r') {
            this.list.refresh();
        }
    }

    private setListArray(len: number): void {
        const arr = [];
        for (let i = 0; i < len; i++) {
            arr[i] = {
                id: `${i}`
            };
        }
        //this.list.array = null; // 方案1：当数据源长度由短变长时，需要将滚动值置0，否则滚动值不为0列表开始处会出现空白

        this.list.array = arr;
        this.list.renderHandler = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            console.log("渲染列表项：", index);

            cell.getChild("label", Laya.Label).text = `${cell.dataSource.id}`;
        });
        this.list.repeatX = arr.length;

        // 方案2：当数据源长度由短变长时，需要将滚动值置0，否则滚动值不为0列表开始处会出现空白
        //console.log(this.list.scrollBar.value);
        //this.list.scrollBar.value = 0;


    }

}