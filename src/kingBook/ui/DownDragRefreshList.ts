const { regClass, property } = Laya;


/** 下滑刷新的列表 */
@regClass()
export class DownDragRefreshList extends Laya.Script {

    declare owner: Laya.List;

    @property({ type: Laya.Box, private: false })
    private _iconUpDrag: Laya.Box;
    @property({ type: Laya.Box, private: false })
    private _iconDownDrag: Laya.Box;
    /** 当前显示的图标（上/下拖列表边缘时，表示正在加载/更新 ）*/
    private _curIcon: Laya.Box;
    private _oldMouseY: number;
    private _curIonOldY: number;
    private _isDownDragRefresh: boolean;
    /** 滚动结束时执行的处理函数 */
    private _onScrollEndHandler: () => void;

    /** 上拖时的刷新处理函数，函数格式为: (): void */
    public upDragRefreshHandler: Laya.Handler;
    /** 下拖时的刷新处理函数，函数格式为: (): void */
    public downDragRefreshHandler: Laya.Handler;

    onAwake(): void {
        this._iconUpDrag.visible = this._iconDownDrag.visible = false;

        this.owner.scrollBar.triggerUpDragLimit = this.triggerUpDragLimit.bind(this);
        this.owner.scrollBar.triggerDownDragLimit = this.triggerDownDragLimit.bind(this);
        this.owner.scrollBar.on(Laya.Event.END, this, this.onScrollEnd);
    }

    onMouseDrag(evt: Laya.Event): void {
        if (this._curIcon) {
            let mouseDy = this.owner.mouseY - this._oldMouseY;
            this._curIcon.y = this._curIonOldY + mouseDy * 0.1;
        }
    }

    onMouseDragEnd(evt: Laya.Event): void {
        console.log("onMouseDragEnd");

        if (this._curIcon) {
            this.changeIconStatus(this._curIcon, false);
            Laya.timer.once(350, this, this.hideCurIcon);
            let isScrolling: boolean = this.owner.scrollBar.value > this.owner.scrollBar.max;
            // 向上拖到边缘时，如果加入新项，不能再手动调用滚动到末尾项，所以如果在滚动时
            // 则等待其滚动结束后再，执行添加新项操作
            if (isScrolling) {
                this._onScrollEndHandler = this.runRefreshHandler;
            } else {
                this.runRefreshHandler();
            }
        }
    }

    private runRefreshHandler(): void {
        if (this._isDownDragRefresh) {
            this.downDragRefreshHandler?.run();
        } else {
            this.upDragRefreshHandler?.run();
            // 滚动到最后一项
            this.owner.scrollTo(this.owner.array.length - 1);
        }
    }

    private onScrollEnd(): void {
        if (this._onScrollEndHandler) {
            this._onScrollEndHandler.call(this);
            this._onScrollEndHandler = null;
        }
    }

    private triggerUpDragLimit(isTweenMove: boolean): void {
        if (isTweenMove) return;
        this.displayIcon(this._iconUpDrag, true, false);
    }

    private triggerDownDragLimit(isTweenMove: boolean): void {
        if (isTweenMove) return;
        this.displayIcon(this._iconDownDrag, true, true);
    }

    private hideCurIcon(): void {
        if (this._curIcon) {
            this._curIcon.visible = false;
            this._curIcon.y = this._curIonOldY;
            this._curIcon = null;
        }
    }

    private displayIcon(icon: Laya.Box, isArrow: boolean, isDownDragRefresh: boolean): void {
        if (this._curIcon) {
            Laya.timer.clear(this, this.hideCurIcon);
            this.hideCurIcon();
        }
        this._curIcon = icon;
        this._curIcon.visible = true;
        this.changeIconStatus(icon, isArrow);

        this._oldMouseY = this.owner.mouseY;
        this._curIonOldY = this._curIcon.y;

        this._isDownDragRefresh = isDownDragRefresh;
    }

    /** 切换图标显示箭头/刷新 */
    private changeIconStatus(icon: Laya.Box, isArrow: boolean): void {
        this._curIcon.getChild("Arrow", Laya.Image).visible = isArrow;
        this._curIcon.getChild("Refresh", Laya.Image).visible = !isArrow;
    }

    onDestroy(): void {
        Laya.timer.clear(this, this.hideCurIcon);
        this.owner.scrollBar.triggerUpDragLimit = null;
        this.owner.scrollBar.triggerDownDragLimit = null;
        this.owner.scrollBar.off(Laya.Event.END, this, this.onScrollEnd);
    }
}