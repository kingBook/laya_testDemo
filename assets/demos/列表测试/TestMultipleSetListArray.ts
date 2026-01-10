import { ScrollingLotteryListScript } from "../循环滚动抽奖列表/ScrollingLotteryListScript";

const { regClass, property } = Laya;
/**
 * 测试列表数据源长度由短变长（且设置 repeatX 与数据源长度一样）， 短时滚动列表，再切换到长数据源时，引起的头部空白问题
 */
@regClass()
export class TestMultipleSetListArray extends Laya.Script {

    @property({ type: Laya.List })
    public list: Laya.List;

    private _lotteryScript: ScrollingLotteryListScript;

    onAwake(): void {
        //this._lotteryScript = this.list.addComponent(ScrollingLotteryListScript);
    }

    onUpdate(): void {
        this.optimizeVisible();
    }

    private optimizeVisible(): void {
        this.list.cells.forEach((cell: Laya.UIComponent, index: number) => {
            const scrollRect = this.list.content.scrollRect;
            const cellRect = cell.getBounds();
            cell.visible = scrollRect.intersects(cellRect);
        });
    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'j') {
            this.setListArray(5);
            //this._lotteryScript.init(true);
        } else if (evt.key === 'k') {
            this.setListArray(10);
           // this._lotteryScript.init(true);
        }else if(evt.key==='r'){
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
        this.list.array = arr;
        this.list.renderHandler = new Laya.Handler(this, (cell: Laya.Box, index: number) => {
            console.log("渲染列表项：", index);

            cell.getChild("label", Laya.Label).text = `${cell.dataSource.id}`;
        });
        this.list.repeatX = this.list.array.length;

        // 当数据源长度由短变长时，需要将滚动值置0，否则滚动值不为0列表开始处会出现空白
        console.log(this.list.scrollBar.value);
        this.list.scrollBar.value = 0;


    }

}