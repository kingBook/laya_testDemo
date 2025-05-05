import { DownDragRefreshList } from "./DownDragRefreshList";
import { DragTopBottomRefreshList } from "./DragTopBottomRefreshList";

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
        for (let i = 0; i < 8; i++) {
            datas[i] = {
                Label: "Item:" + i
            };
        }
        this._list.array = datas;
    }

    private onDragBottomRefreshHandler(): void {
        console.log("加载更多项");
        Laya.timer.once(1000, this, this.onDragBottomRefreshComplete);
    }

    private onDragBottomRefreshComplete(): void {
        for (let i = 0; i < 3; i++) {
            this._list.addItem({ Label: "new:" + i });
        }
        
        this._dragTopBottomRefreshList.endRefresh();
    }

    private onDragTopRefreshHandler(): void {
        console.log("刷新列表");
        for (let i = 0, len = this._list.array.length; i < len; i++) {
            this._list.changeItem(i, { Label: "已刷新:" + i });
        }
        Laya.timer.once(1000, this, this.onDragTopRefreshComplete);
    }

    private onDragTopRefreshComplete(): void {
        this._dragTopBottomRefreshList.endRefresh();
    }

    onDisable(): void {
        Laya.timer.clear(this, this.onDragBottomRefreshComplete);
        Laya.timer.clear(this, this.onDragTopRefreshComplete);
    }
}