const { regClass, property } = Laya;

/** 可折叠的条 */
@regClass()
export class CollapsibleBar extends Laya.Script {
    declare owner: Laya.Box;

    @property({ type: Laya.Image, private: false })
    private _bottomImage: Laya.Image

    @property({ type: Laya.List, private: false })
    private _list: Laya.List;

    @property({ type: Laya.Button, private: false, tips: "折叠按钮" })
    private _collapseBtn: Laya.Button

    onAwake(): void {
        
    }

    onUpdate(): void {
        console.log(this._list.numChildren);
        //this.updateHeight();
    }


    public updateHeight():void{
        this._list.height = this._list.itemRender.data.height*this._list.numChildren;


        let height = this._list.height + 71;
        this.owner.height = height;
        this._bottomImage.height = height;
    }



}