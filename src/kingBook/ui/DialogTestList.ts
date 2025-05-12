import { DownDragRefreshList } from "./DownDragRefreshList";
import { DragMode, DragTopBottomRefreshList } from "./DragTopBottomRefreshList";

const { regClass, property } = Laya;

@regClass()
export class DialogTestList extends Laya.Script {

    @property({ type: Laya.List, private: false })
    private _list: Laya.List;
    @property({ type: DragTopBottomRefreshList, private: false })
    private _dragTopBottomRefreshList: DragTopBottomRefreshList;

    onAwake(): void {
        //Laya.Dialog.manager.on(Laya.Event.CLOSE, this, this.onClose);
        //Laya.Dialog.manager.on(Laya.Event.OPEN, this, this.onOpen);
        this._dragTopBottomRefreshList.onDragBottomRefreshHandler = new Laya.Handler(this, this.onDragBottomRefreshHandler);
        this._dragTopBottomRefreshList.onDragTopRefreshHandler = new Laya.Handler(this, this.onDragTopRefreshHandler);
        this.initDatas();
    }

    private initDatas(): void {
        var datas: any[] = [];
        for (let i = 0; i < 15; i++) {
            datas[i] = {
                Label: "Item:" + i
            };
        }
        this._list.array = datas;
    }

    private onDragTopRefreshHandler(refreshList: DragTopBottomRefreshList): void {
        Laya.timer.once(100, this, this.onDragTopRefreshComplete);
    }

    private onDragTopRefreshComplete(): void {
        console.log("刷新列表");
        // console.log("value1:",  this._list.scrollBar.value, "min:",  this._list.scrollBar.min);
        // this._list.disableStopScroll=true;
        for (let i = 0, len = this._list.array.length; i < len; i++) {
            this._list.changeItem(i, { Label: "已刷新:" + i });
        }
        this._list.array = this._list.array.slice(0, 9);
        // console.log("_isElastic:", this._list.scrollBar['_isElastic']);
        // this._list.scrollBar['_isElastic']=true;
        // this._list.scrollBar.value=-52;

        //console.log("value2:",  this._list.scrollBar.value, "min:",  this._list.scrollBar.min);

        this._dragTopBottomRefreshList.endRefresh(DragMode.DragTop);
    }

    private onDragBottomRefreshHandler(refreshList: DragTopBottomRefreshList): void {
        Laya.timer.once(1000, this, this.onDragBottomRefreshComplete);
    }

    private onDragBottomRefreshComplete(): void {
        console.log("加载更多项");
        for (let i = 0; i < 3; i++) {
            this._list.addItem({ Label: "new:" + i });
        }

        this._dragTopBottomRefreshList.endRefresh(DragMode.DragBottom);
    }
    
    onDisable(): void {
        Laya.timer.clear(this, this.onDragBottomRefreshComplete);
        Laya.timer.clear(this, this.onDragTopRefreshComplete);
    }
}