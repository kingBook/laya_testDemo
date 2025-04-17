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

    private _listMask: Laya.Box;

    private readonly delay: number = 300;

    private _displayItemCount: number;

    public get list(): Laya.List { return this._list; }

    onAwake(): void {
        this._collapseBtn.clickHandler = new Laya.Handler(this, this.onClickCollapse);
        this._listMask = this._list.getChild("mask") as Laya.Box;
    }

    onStart(): void {
        this._list.repeatY = this.list.array.length;
    }

    onEnable(): void {
        Laya.timer.callLater(this, this.updateHeight, [false]);
        Laya.timer.callLater(this, this.updateCollapseBtnStatus);
    }

    private updateHeight(isTween: boolean, itemCount: number): void {
        let listHeight = this._list.itemRender.data.height * this._displayItemCount;
        let bgHeight = listHeight + 65;


        if (isTween) {
            Laya.Tween.to(this._list, { height: listHeight }, this.delay);
            Laya.Tween.to(this._listMask, { height: listHeight }, this.delay);
            Laya.Tween.to(this.owner, { height: bgHeight }, this.delay);
            Laya.Tween.to(this._bottomImage, { height: bgHeight }, this.delay);
        } else {
            this._list.height = listHeight;
            this._listMask.height = listHeight;

            this.owner.height = bgHeight;
            this._bottomImage.height = bgHeight;
        }
    }

    private updateCollapseBtnStatus(): void {
        this._collapseBtn.rotation = this._displayItemCount > 1 ? 0 : 180;
    }

    private onClickCollapse(): void {
        this.setDisplayItemCount(this._displayItemCount > 1 ? 1 : this.list.array.length);
        Laya.timer.callLater(this, this.updateHeight, [true]);
        Laya.timer.callLater(this, this.updateCollapseBtnStatus);

    }

    public setDisplayItemCount(value: number): void {
        this._displayItemCount = value;
    }

    onDisable(): void {
        Laya.Tween.killAll(this._list);
        Laya.Tween.killAll(this.owner);
        Laya.Tween.killAll(this._bottomImage);
        Laya.Tween.killAll(this._listMask);
        Laya.timer.clearCallLater(this, this.updateHeight);
        Laya.timer.clearCallLater(this, this.updateCollapseBtnStatus);
    }

}