const { regClass, property } = Laya;

@regClass()
export class DialogRole extends Laya.Script {
    declare owner: Laya.Dialog;

    private _closeBtn: Laya.Button;
    private _tweenInPoint: Laya.Point;

    onEnable(): void {
        this._closeBtn = this.owner.getChild("closeBtn") as Laya.Button;
        this._closeBtn.on(Laya.Event.CLICK, this, this.onClose);
        
        //Laya.Dialog.manager.on(Laya.Event.CLOSE, this, this.onClose);
        //Laya.Dialog.manager.on(Laya.Event.OPEN, this, this.onOpen);
    }

    /**
     * 开始缓动出现窗口动画
     * @param origin 缓动的起始位置
     */
    public startTweenIn(origin: Laya.Sprite): void {
        let gpt = origin.localToGlobal(new Laya.Point(origin.width * 0.5, origin.height * 0.5), false, Laya.stage);
        // 记录起始位置
        this._tweenInPoint = gpt;
        // 缓动开始前放置到起始位置，并缩小
        this.owner.pos(gpt.x, gpt.y);
        this.owner.scale(0, 0);

        Laya.Tween.to(this.owner, { x: Laya.stage.width * 0.5, y: Laya.stage.height * 0.5, scaleX: 1, scaleY: 1 }, 300, Laya.Ease.linearOut);
    }

    private startTweenOut(): void {
        Laya.Tween.to(this.owner, { x: this._tweenInPoint.x, y: this._tweenInPoint.y, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.circIn).then(() => {
            this.owner.destroy();
        });
    }

    private onClose(): void {
        this.startTweenOut();
    }

    onDisable(): void {
        Laya.Tween.killAll(this.owner);
        this._closeBtn.off(Laya.Event.CLICK, this, this.onClose);
    }

}