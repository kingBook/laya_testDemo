const { regClass, property } = Laya;

@regClass()
export class TestPromiseAwaitReturn extends Laya.Script {

    public createSpriteAsync(): Promise<Laya.Sprite> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const sprite = new Laya.Sprite();
                resolve(sprite);
            }, 1000);
        });
    }

    public createSpriteAsyncErr(): Promise<Laya.Sprite> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error("create sprite error"));
            }, 1000);
        });
    }


    public async onAwake() {
        const promise: Promise<Laya.Sprite> = this.createSpriteAsync();
        console.log("promise:", promise); // promise: Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "fulfilled"[[PromiseResult]]: Sprite

        const sprite: Laya.Sprite = await this.createSpriteAsync();
        console.log("sprite:", sprite); // 1秒后，输出：sprite: Sprite {_bits: 9, _reactiveBits: 16, _hideFlags: 0, _parent: null, _destroyed: false, …}


        const promise1: Promise<Laya.Sprite> = this.createSpriteAsyncErr();
        console.log("promise1:", promise1); // promise1: Promise {<pending>}[[Prototype]]: Promise[[PromiseState]]: "rejected"[[PromiseResult]]: Error: create sprite error at ...

        const sprite1: Laya.Sprite = await this.createSpriteAsyncErr();
        // 因报错而中止，此处以下的所有代码不会执行
        console.log("sprite1:", sprite1);
    }

}