import { Hero } from "./Hero";

const { regClass, property } = Laya;

@regClass()
export class HeroManager extends Laya.Script {
    declare owner: Laya.Sprite | Laya.Sprite3D;

    @property({ type: Laya.Prefab, private: false })
    private _heroPrefab: Laya.Prefab;

    private _intervalId: number;
    private _timeoutId:number;

    onAwake(): void {
        let i = 0;
        this._intervalId = setInterval(() => {
            this.createHero();
            i++;
            if (i >= 5) clearInterval(this._intervalId);
        }, i * 2000);

    }

    public createHero(): Laya.Sprite {
        let hero: Laya.Sprite = this._heroPrefab.create() as Laya.Sprite;
        let pos = Hero.getRandomPos();
        hero.pos(pos.x, pos.y);
        this.owner.addChild(hero);
        return hero;
    }

    public delayCreateHeroByPool(delay: number = 1000): void {
        this._timeoutId = setTimeout(() => {
            let pool = Laya.Pool.getPoolBySign("Hero");
            let hero: Laya.Sprite = pool.length > 0 ? pool.pop() : this._heroPrefab.create();
            let pos = Hero.getRandomPos();
            hero.pos(pos.x, pos.y);
            this.owner.addChild(hero);
            console.log("delayCreateHeroByPool");
        }, delay);
    }

    onDestroy(): void {
        clearInterval(this._intervalId);
        clearTimeout(this._timeoutId);
    }
}