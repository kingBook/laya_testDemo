const { regClass, property } = Laya;

@regClass()
export class PanelGameMap extends Laya.Script {

    @property({ type: Laya.Prefab, private: false })
    private _downDragListPrefab:Laya.Prefab;
    @property({ type: Laya.Button, private: false })
    private _buttonDownDragList:Laya.Button;

    onAwake(): void {
        this._buttonDownDragList.on(Laya.Event.CLICK, this, this.onClickButtonDownDragList);
    }

    private onClickButtonDownDragList():void{

    }

    onDestroy(): void {
        this._buttonDownDragList.off(Laya.Event.CLICK, this, this.onClickButtonDownDragList);
    }


}