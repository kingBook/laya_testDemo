const { regClass, property } = Laya;

/** 可折叠条 */
@regClass()
export class CollapsibleBar extends Laya.Script {

    declare owner: Laya.Box;

    @property({ type: Laya.List, private: false, tips:"折叠条中使用的列表" })
    private _list: Laya.List;

    @property({ type: Laya.Button, private: false, tips: "折叠/展开按钮" })
    private _collapseBtn: Laya.Button;

    /** 展开/折叠缓动的时间<毫秒> */
    private readonly delay: number = 300;
    /** 显示的图标个数 */
    private _displayItemCount: number;

    /** 可折叠条中的列表 */
    public get list(): Laya.List { return this._list; }

    onAwake(): void {
        this._collapseBtn.on(Laya.Event.CLICK, this, this.onClickButtonCollapse);
    }

    onStart(): void {
        this._list.repeatY = this.list.array.length;
    }

    onEnable(): void {
        Laya.timer.callLater(this, this.updateHeight, [false]);
        Laya.timer.callLater(this, this.updateCollapseBtnStatus);
    }

    private updateHeight(isTween: boolean): void {
        let listHeight = this._list.itemRender.data.height * this._displayItemCount;
        let bgHeight = listHeight + 70;

        if (isTween) {
            Laya.Tween.to(this.owner, { height: bgHeight }, this.delay);
        } else {
            this.owner.height = bgHeight;
        }
    }

    private updateCollapseBtnStatus(): void {
        this._collapseBtn.rotation = this._displayItemCount > 1 ? 0 : 180;
    }

    private onClickButtonCollapse(): void {
        this.setDisplayItemCount(this._displayItemCount > 1 ? 1 : this.list.array.length);
        Laya.timer.callLater(this, this.updateHeight, [true]);
        Laya.timer.callLater(this, this.updateCollapseBtnStatus);
    }

    public setDisplayItemCount(value: number): void {
        this._displayItemCount = value;
    }

    onDisable(): void {
        Laya.Tween.killAll(this.owner);
        Laya.timer.clearCallLater(this, this.updateHeight);
        Laya.timer.clearCallLater(this, this.updateCollapseBtnStatus);
    }

    onDestroy(): void {
        this._collapseBtn.off(Laya.Event.CLICK, this, this.onClickButtonCollapse);
    }

}