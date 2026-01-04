
const { regClass, property, classInfo } = Laya;

/**
 * 循环滚动抽奖多列表
 */
@regClass()
export class ScrollingLotteryMultipleListScript extends Laya.Script {

    declare owner: Laya.List;

    @property({ type: Laya.List, private: false, tips: "子列表模板" })
    private _subListTemplate: Laya.List;

    public parentRenderHandler: Laya.Handler;
    public subRenderHandler: Laya.Handler;

    public onAwake(): void {
        this.owner.callLater(() => {
            this.owner.renderHandler = this.parentRenderHandler ? this.parentRenderHandler : new Laya.Handler(this, this.onRenderParentItem);


        });
    }

    private onRenderParentItem(cell: Laya.Box, index: number): void {

    }




}