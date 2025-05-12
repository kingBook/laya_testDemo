const { regClass, property } = Laya;

/** 拽的模式 */
export enum DragMode {
    /** 无（相当于该脚本不起作用） */
    None = 0x0000,
    /** 只在顶部下拽刷新 */
    DragTop = 0x0001,
    /** 只在底部上拽刷新 */
    DragBottom = 0x0010,
    /** 在顶/底部上/下拽都刷新 */
    DragTopAndBottom = 0x0011
}


/** 
 * 拽顶/底部刷新的列表
 * 
 * onDragTopRefreshHandler: 拽顶部时的处理函数，执行完操作后需要调用 endRefresh 函数
 * onDragBottomRefreshHandler: 拽底部时的处理函数，执行完操作后需要调用 endRefresh 函数
 */
@regClass()
export class DragTopBottomRefreshList extends Laya.Script {

    declare owner: Laya.List;
    /** 顶部的图标 */
    private _iconTop: Laya.Image;
    /** 底部的图标 */
    private _iconBottom: Laya.Image;
    /** 正在执行刷新操作中... */
    private _isRefreshing: boolean;
    /** 当前显示的图标*/
    private _currentDisplayIcon: Laya.Image;

    private _lastStopTopMoveTime: number;
    private _lastStopBottomMoveTime: number;

    private _oldScrollRectY: number;

    /** 拽的模式 */
    @property({ type: DragMode, tips: "刷新的模式" })
    public dragMode: DragMode = DragMode.DragTopAndBottom;
    /** 上/下箭头或刷新图标的缩放值 */
    @property({ type: 'number', min: 0, tips: "上/下箭头或刷新图标的缩放值" })
    public iconScale: number = 1;
    /** 上/下箭头或刷新图标距离列表上下边缘的距离 */
    @property({ type: 'number', min: 0, tips: "上/下箭头或刷新图标距离列表上下边缘的距离" })
    public iconPadding: number = 10;
    /** 反复下拽或下拽时允许刷新的间隔<毫秒> */
    @property({ type: 'number', min: 500, tips: "反复下拽或下拽时允许刷新的间隔<毫秒>" })
    public refreshInterval: number = 2000;

    @property({ type: Laya.Color, tips: "图标色调" })
    public tint: Laya.Color = Laya.Color.WHITE;
    /** '向上箭头' 图标 */
    @property({ type: Laya.Texture, hidden: "data.mode==0", tips: "'向上箭头' 图标" })
    public texUp: Laya.Texture;
    /** '向下箭头' 图标 */
    @property({ type: Laya.Texture, hidden: "data.mode==0", tips: "'向下箭头' 图标" })
    public texDown: Laya.Texture;
    /** '刷新' 图标 */
    @property({ type: Laya.Texture, hidden: "data.mode==0", tips: "'刷新' 图标" })
    public texUpdate: Laya.Texture;

    /** 拽顶部时的刷新处理函数，函数格式为: (): void */
    public onDragTopRefreshHandler: Laya.Handler;
    /** 底顶部时的刷新处理函数，函数格式为: (): void */
    public onDragBottomRefreshHandler: Laya.Handler;


    public onStart(): void {
        this.owner.elasticEnabled = true; // 必须开启
        this.owner.scrollBar.on("dragTopLimit", this, this.onDragTopLimit);
        this.owner.scrollBar.on("dragBottomLimit", this, this.onDragBottomLimit);

        // 初始化 顶部图标
        this._iconTop = new Laya.Image();
        this._iconTop.skin = this.texDown.url;
        this._iconTop.size(this.texDown.width, this.texDown.height);
        this._iconTop.anchor(0.5, 0.5);
        this._iconTop.scale(this.iconScale, this.iconScale);
        this._iconTop.color = this.tint.toString();
        this.owner.content.addChild(this._iconTop);

        // 初始化 底部图标
        this._iconBottom = new Laya.Image();
        this._iconBottom.skin = this.texDown.url;
        this._iconBottom.size(this.texDown.width, this.texDown.height);
        this._iconBottom.anchor(0.5, 0.5);
        this._iconBottom.scale(this.iconScale, this.iconScale);
        this._iconBottom.color = this.tint.toString();
        this.owner.content.addChild(this._iconBottom);

        this.updateIconsPosition();

        // 设置在执行刷新操作时，顶部/底部的移动限制距离
        this.owner.scrollBar.topMoveLimit = this._iconTop.displayHeight + this.iconPadding * 2;
        this.owner.scrollBar.bottomMoveLimit = this._iconBottom.displayHeight + this.iconPadding * 2;


        // 不支持的模式，则隐藏图标
        this._iconTop.visible = (this.dragMode & DragMode.DragTop) > 0;
        this._iconBottom.visible = (this.dragMode & DragMode.DragBottom) > 0;

        // 
        this._oldScrollRectY = this.owner.content.scrollRect.y;
        this._lastStopTopMoveTime = 0;
        this._lastStopBottomMoveTime = 0;
    }

    public onUpdate(): void {
        if (this.dragMode !== DragMode.None) {
            this.updateIconsPosition();
            this.updateIconStatus();
        }
    }

    /** 更新图标的状态 */
    private updateIconStatus(): void {
        let scrollRectY: number = this.owner.content.scrollRect.y;
        let dy: number = this._oldScrollRectY - scrollRectY;
        let sign: number = dy > 0 ? 1 : dy < 0 ? -1 : 0; // 滚动方向
        this._oldScrollRectY = scrollRectY;

        if (this._isRefreshing && this._currentDisplayIcon) {
            if (Laya.timer.currTimer - this._lastStopTopMoveTime > this.refreshInterval || Laya.timer.currTimer - this._lastStopBottomMoveTime > this.refreshInterval) {
                this.setIconSkinAndRotation(this._currentDisplayIcon, this.texUpdate.url, (this._currentDisplayIcon.rotation + 8) % 360);
            } else {
                let skinUrl = sign > 0 ? this.texDown.url : this.texUp.url;
                this.setIconSkinAndRotation(this._currentDisplayIcon, skinUrl, 0);
            }
        } else {
            let ymin: number = 0;
            let ymax: number = this.owner.scrollBar.max;

            if (scrollRectY < ymin) {
                let skinUrl = sign > 0 ? this.texDown.url : sign < 0 ? this.texUp.url : this._iconTop.source.url;
                this.setIconSkinAndRotation(this._iconTop, skinUrl, 0);
            } else if (scrollRectY > ymax) {
                let skinUrl = sign > 0 ? this.texDown.url : sign < 0 ? this.texUp.url : this._iconBottom.source.url;
                this.setIconSkinAndRotation(this._iconBottom, skinUrl, 0);
            }
        }
    }

    private updateIconsPosition(): void {
        this._iconTop.centerX = 0;
        this._iconTop.y = -this._iconTop.height * 0.5 * this.iconScale - this.iconPadding;

        this._iconBottom.centerX = 0;
        this._iconBottom.y = this.owner.scrollBar.max + this.owner.content.height + this._iconBottom.height * 0.5 * this.iconScale + this.iconPadding;
    }

    /** 设置指定图标的皮肤、旋转值 */
    private setIconSkinAndRotation(icon: Laya.Image, skinUrl: string, rotation: number): void {
        if (icon.skin !== skinUrl) {
            icon.skin = skinUrl;
        }
        icon.rotation = rotation;
    }

    /** 滚动条的 dragTopLimit 事件回调 */
    private onDragTopLimit(): void {
        if ((this.dragMode & DragMode.DragTop) === 0) return;
        // 限制刷新频率，并赋值 stopMoveLimit 处理函数，滚动条停止在 topMoveLimit 指定的位置
        if (Laya.timer.currTimer - this._lastStopTopMoveTime > this.refreshInterval) {
            this._lastStopTopMoveTime = Laya.timer.currTimer;

            if (!this._isRefreshing) {
                this.owner.scrollBar.stopMoveLimit = this.emptyStopMoveLimit.bind(this);
                this._isRefreshing = true;
                this._currentDisplayIcon = this._iconTop;
                // 执行处理函数, 延时 500 避免滚动条未回弹就开始
                Laya.timer.clear(this, this.runRefreshHandler);
                Laya.timer.once(500, this, this.runRefreshHandler, [DragMode.DragTop]);
            }
        } else {
            this.owner.scrollBar.stopMoveLimit = null;
        }
    }

    /** 滚动条的 dragBottomLimit 事件回调 */
    private onDragBottomLimit(): void {
        if ((this.dragMode & DragMode.DragBottom) === 0) return;
        // 限制刷新频率，并赋值 stopMoveLimit 处理函数，滚动条停止在 bottomMoveLimit 指定的位置
        if (Laya.timer.currTimer - this._lastStopBottomMoveTime > this.refreshInterval) {
            this._lastStopBottomMoveTime = Laya.timer.currTimer;

            if (!this._isRefreshing) {
                this.owner.scrollBar.stopMoveLimit = this.emptyStopMoveLimit.bind(this);
                this._isRefreshing = true;
                this._currentDisplayIcon = this._iconBottom;
                // 执行处理函数, 延时 500 避免滚动条未回弹就开始
                Laya.timer.clear(this, this.runRefreshHandler);
                Laya.timer.once(500, this, this.runRefreshHandler, [DragMode.DragBottom]);
            }
        } else {
            this.owner.scrollBar.stopMoveLimit = null;
        }
    }

    private runRefreshHandler(dragMode: DragMode.DragTop | DragMode.DragBottom): void {
        if (dragMode === DragMode.DragTop) {
            this.onDragTopRefreshHandler?.run();
        } else if (dragMode === DragMode.DragBottom) {
            this.onDragBottomRefreshHandler?.run();
        }
    }

    /**
     * 结束刷新
     * 
     * 在 onDragTopRefreshHandler, onDragBottomRefreshHandler 执行刷新处理完成时，需要调用此函数结束刷新，让列表回滚到正确位置
     * @param dragMode type:DragMode.DragTop | DragMode.DragBottom
     */
    /**
     * 
     * @param dragMode DragMode.DragTop | DragMode.DragBottom
     * @returns 
     */
    public endRefresh(dragMode: DragMode.DragTop | DragMode.DragBottom): void {
        if (!this._isRefreshing) return;

        if (dragMode === DragMode.DragTop) {
            this.owner.scrollBar.stopMoveLimit = null;
            this.owner.scrollBar["_isElastic"] = true; // 当设置 scrollBar.value 不在 [min, max] 范围时，必须 _isElastic 为 true 时才可以
            this.owner.scrollBar.value = this.owner.scrollBar.min - this.owner.scrollBar.topMoveLimit;
            this._isRefreshing = false;
            this._currentDisplayIcon = null;
            this.owner.scrollBar.backToNormal();
        } else if (dragMode === DragMode.DragBottom) {
            this.owner.scrollBar.stopMoveLimit = null;
            this.owner.scrollBar["_isElastic"] = true; // 当设置 scrollBar.value 不在 [min, max] 范围时，必须 _isElastic 为 true 时才可以
            this.owner.scrollBar.value = this.owner.scrollBar.max + this.owner.scrollBar.bottomMoveLimit;
            this._isRefreshing = false;
            this._currentDisplayIcon = null;
            this.owner.scrollBar.backToNormal();
        }

    }

    private emptyStopMoveLimit(): boolean {
        //返回 true, 滚动条停在 scrollBar.topMoveLimit 或 scrollBar.bottomMoveLimit 指定的位置
        return true;
    }

    public onDisable(): void {
        Laya.timer.clear(this, this.runRefreshHandler);
    }

    public onDestroy(): void {
        this.owner.scrollBar.stopMoveLimit = null;
        this.owner.scrollBar.off("dragTopLimit", this, this.onDragTopLimit);
        this.owner.scrollBar.off("dragBottomLimit", this, this.onDragBottomLimit);
    }


}