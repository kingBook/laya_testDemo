import { Random } from "../utils/Random";

const { regClass, property } = Laya;

@regClass()
export class TestObjectPool extends Laya.Script {

    @property({ type: Laya.Prefab, private: false })
    private _heroPrefab: Laya.Prefab;

    private _heroArray: any[] = [];

    onAwake(): void {
        // 创建对象，并放入对象池中
        /*let pool = Laya.Pool.getPoolBySign("Hero");
        for (let i = 0; i < 5; i++) {
            let inst = this._heroPrefab.create() as Laya.Sprite;
            pool.push(inst);
        }*/


    }

    onKeyDown(evt: Laya.Event): void {
        

        if (evt.keyCode === Laya.Keyboard.A) {
            console.log("添加");

            let hero = Laya.Pool.getItemByCreateFun("Hero", ()=>{
                let inst = this._heroPrefab.create() as Laya.Sprite;
                var pool = Laya.Pool.getPoolBySign("Hero");
                pool.push(inst);
                return inst;
            });

            this._heroArray.push(hero);

            hero.pos(Random.rangeInt(50, 500), Random.rangeInt(100, 600));
            this.owner.addChild(hero);

        } else if (evt.keyCode === Laya.Keyboard.D) {
            console.log("移除");
            if (this._heroArray.length > 0) {
                let hero2 = this._heroArray.pop();
                hero2.removeSelf();
                Laya.Pool.recover('Hero', hero2);
            }
        }

        let pool = Laya.Pool.getPoolBySign("Hero");
        console.log("对象池对象数量：",pool.length);
        

    }









}