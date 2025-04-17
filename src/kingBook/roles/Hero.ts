import { MathUtil } from "../utils/MathUtil";
import { Random } from "../utils/Random";
import { V2Util } from "../utils/V2Util";
import { HeroManager } from "./HeroManager";

const { regClass, property } = Laya;

@regClass()
export class Hero extends Laya.Script {
    declare owner: Laya.Sprite;

    private _heroManger: HeroManager;
    private _spineRender: Laya.Spine2DRenderNode;

    public static getRandomPos(): Laya.Vector2 {
        let p = new Laya.Vector2();
        p.x = Random.rangeInt(20, 600);
        p.y = Random.rangeInt(600, 900);
        return p;
    }

    onAwake(): void {
        this._heroManger = this.owner.parent.getComponent(HeroManager);
        
        
        this._spineRender = this.owner.getComponent(Laya.Spine2DRenderNode);
        this._spineRender.owner.on(Laya.Event.LABEL, (e: Laya.EventData) => {
            console.log("骨骼动画事件：", e.name);
        });
        this._spineRender.owner.on(Laya.Event.PLAYED, ()=>{
            console.log("动画开始播放");
            
        });
    }

    onEnable(): void {
        Laya.timer.once(200, this, this.setToTarget);
        Laya.timer.once(5000, this, this.removeHandler);
    }

    private setToTarget(): void {
        this._spineRender.play(Random.sign > 0 ? "run" : "walk", true);
        //console.log("this._spineRender.templet:",this._spineRender.templet);
        /*this._spineRender.templet.on(Laya.Event.LABEL, (e:any)=>{
            console.log("骨骼事件：",e);
        });*/
        let p0 = Hero.getRandomPos();

        this.owner.scaleX = MathUtil.sign(p0.x - this.owner.x) * Math.abs(this.owner.scaleX);

        Laya.Tween.create(this.owner).duration(1000).to("x", p0.x).to("y", p0.y).then(() => {
            this._spineRender.play(Random.sign > 0 ? "attack" : "idle", true);

            Laya.timer.once(1000, this, this.setToTarget);
        });

    }

    private removeHandler(): void {
        // 加入对象池
        let pool = Laya.Pool.getPoolBySign("Hero");
        pool.push(this.owner);
        // 延时从对象池新建一个
        this._heroManger.delayCreateHeroByPool(2000);
        // 从舞台移除
        this.owner.removeSelf();

        console.log("移除 hero 并加入对象池");
    }

    onDisable(): void {
        Laya.Tween.getTween(this.owner)?.kill();
        Laya.timer.clear(this, this.setToTarget);
        Laya.timer.clear(this, this.removeHandler);
    }


}