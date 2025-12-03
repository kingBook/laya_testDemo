const { regClass, property } = Laya;

@regClass()
export class TestText extends Laya.Script {

    declare owner: Laya.Sprite;

    onAwake(): void {

    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key === 'h') {
            console.time("aa");
            for (let i = 0; i < 100000; i++) {
                this.owner.graphics.clear();
                this.owner.graphics.fillText("123456我是中 国这的有人我工要在地一上了民； 为这炒+=78965ABCDEFGHIJKLMN", this._x, Math.random()*300, "", "#ffffff", "left");
            }
            console.timeEnd("aa");
        }
    }

    private _x: number = 0;
    onUpdate(): void {
        this._x++;
        this.owner.graphics.clear();
        this.owner.graphics.fillText("123456", this._x, 300, "", "#ffffff", "left");
    }

}