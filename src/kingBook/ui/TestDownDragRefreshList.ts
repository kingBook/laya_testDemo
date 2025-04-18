import { DownDragRefreshList } from "./DownDragRefreshList";

const { regClass, property } = Laya;

@regClass()
export class TestDownDragRefreshList extends Laya.Script {
    declare owner: Laya.List;

    private _downDragRefreshList: DownDragRefreshList;

    onAwake(): void {
        this._downDragRefreshList = this.owner.getComponent(DownDragRefreshList);
        this._downDragRefreshList.upDragRefreshHandler = new Laya.Handler(this, this.upDragRefreshHandler);
        this._downDragRefreshList.downDragRefreshHandler = new Laya.Handler(this, this.downDragRefreshHandler);
        this.initDatas();
    }

    private initDatas(): void {
        var datas: any[] = [];
        for (let i = 0; i < 6; i++) {
            datas[i] = {
                Label: "Item:" + i
            };
        }
        this.owner.array = datas;
    }

    private upDragRefreshHandler(): void {
        console.log("加载更多项");
        for (let i = 0; i < 3; i++) {
            this.owner.addItem({ Label: "new:" + i });
        }
    }

    private downDragRefreshHandler(): void {
        console.log("刷新列表");
        for (let i = 0, len = this.owner.array.length; i < len; i++) {
            this.owner.changeItem(i, { Label: "已刷新:" + i });
        }
    }
}