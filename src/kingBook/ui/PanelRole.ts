import { PanelRoleRuntimeScript } from "./PanelRoleRuntimeScript";

const { regClass, property } = Laya;

@regClass()
export class PanelRole extends Laya.Script {
    
    declare owner: PanelRoleRuntimeScript;
    @property({type:Laya.Spine2DRenderNode, private:false})
    private _spineRender: Laya.Spine2DRenderNode;
    private _closeBtn: Laya.Button;
    private _tweenInPoint: Laya.Point;

    onEnable(): void {
        this._closeBtn = this.owner.getChild("closeBtn") as Laya.Button;
        this._closeBtn.on(Laya.Event.CLICK, this, this.onClose);
        
        this.owner.buttonCrouch.on(Laya.Event.CLICK, ()=>{
            this._spineRender.play("crouch",true);
        });
        this.owner.buttonAttack.on(Laya.Event.CLICK, ()=>{
            this._spineRender.play("attack",true);
        });
        this.owner.buttonHeadTurn.on(Laya.Event.CLICK, ()=>{
            this._spineRender.play("head-turn",true);
        });
        
        this.owner.buttonWalk.on(Laya.Event.CLICK, ()=>{
            this._spineRender.play("walk",true);
        });
        this.owner.buttonRun.on(Laya.Event.CLICK, ()=>{
            this._spineRender.play("run",true);
        });
        this.owner.buttonIdle.on(Laya.Event.CLICK, ()=>{
            this._spineRender.play("idle",true);
        });
        
        this._spineRender.owner.on(Laya.Event.LABEL, (e: Laya.EventData) => {
            console.log("骨骼动画事件：", e.name);
        });
        this._spineRender.owner.on(Laya.Event.PLAYED, ()=>{
            //console.log("动画开始播放");
            
        });
        //this._spineRender.getSlotByName("weapon")
        // https://blog.csdn.net/u014528558/article/details/82697910
        //https://ask.layabox.com/question/49524#!answer_form
        //https://ask.layabox.com/question/3577
        
    }

    /**
     * 开始缓动进入
     * @param origin 缓动的起始位置
     */
    public startTweenIn(origin: Laya.Sprite): void {
        let gpt = origin.localToGlobal(new Laya.Point(origin.width * 0.5, origin.height * 0.5), false, Laya.stage);
        // 记录起始位置
        this._tweenInPoint = gpt;
        // 缓动开始前放置到起始位置，并缩小
        this.owner.pos(gpt.x, gpt.y);
        this.owner.scale(0, 0);
        Laya.Tween.to(this.owner, { x: Laya.stage.width * 0.5, y: Laya.stage.height * 0.5, scaleX: 1, scaleY: 1 }, 300, Laya.Ease.linearIn).then(() => {
            // 使用适配
            this.owner.left = this.owner.right = this.owner.top = this.owner.bottom = 0;
        });
    }

    /**
     * 开始缓动飞出
     */
    private startTweenOut(): void {
        // 取消适配
        this.owner.left = this.owner.right = this.owner.top = this.owner.bottom = null;
        Laya.Tween.to(this.owner, { x: this._tweenInPoint.x, y: this._tweenInPoint.y, scaleX: 0, scaleY: 0 }, 300, Laya.Ease.circIn).then(() => {
            this.owner.destroy();
        });
    }

    private onClose(): void {
        // 缓动飞出
        this.startTweenOut();
    }

    onDisable(): void {
        Laya.Tween.killAll(this.owner);
        this._closeBtn.off(Laya.Event.CLICK, this, this.onClose);
    }

}