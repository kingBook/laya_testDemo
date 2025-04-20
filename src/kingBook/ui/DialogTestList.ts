import { DownDragRefreshList } from "./DownDragRefreshList";

const { regClass, property } = Laya;

@regClass()
export class DialogTestList extends Laya.Script {
    
    @property({type:Laya.List, private:false})
    private _list:Laya.List;
    @property({type:DownDragRefreshList, private:false})
    private _downDragRefreshList: DownDragRefreshList;

    onAwake(): void {
        //Laya.Dialog.manager.on(Laya.Event.CLOSE, this, this.onClose);
        //Laya.Dialog.manager.on(Laya.Event.OPEN, this, this.onOpen);
        this._downDragRefreshList.upDragRefreshHandler = new Laya.Handler(this, this.upDragRefreshHandler);
        this._downDragRefreshList.downDragRefreshHandler = new Laya.Handler(this, this.downDragRefreshHandler);
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

    private upDragRefreshHandler(): void {
        console.log("加载更多项");
        for (let i = 0; i < 3; i++) {
            this._list.addItem({ Label: "new:" + i });
        }
    }

    private downDragRefreshHandler(): void {
        console.log("刷新列表");
        for (let i = 0, len = this._list.array.length; i < len; i++) {
            this._list.changeItem(i, { Label: "已刷新:" + i });
        }
    }
}