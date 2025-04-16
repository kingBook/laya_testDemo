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
    private _collapseBtn: Laya.Button;

    public get list(): Laya.List { return this._list; }

    onAwake(): void {
        this._collapseBtn.clickHandler = new Laya.Handler(this, this.onClickCollapse);
    }

    onUpdate(): void {
        this.updateHeight();
        this.updateCollapseBtnStatus();
    }


    private updateHeight(): void {
        this._list.height = this._list.itemRender.data.height * this._list.getChildAt(0).numChildren;

        let height = this._list.height + 65;
        this.owner.height = height;
        this._bottomImage.height = height;
    }

    private updateCollapseBtnStatus(): void {
        let itemNum = this._list.getChildAt(0).numChildren;
        this._collapseBtn.rotation = itemNum > 1 ? 0 : 180;
    }

    private onClickCollapse(): void {
        this._list.repeatY = this._list.getChildAt(0).numChildren > 1 ? 1 : this.list.array.length;

    }

}