const { regClass, property } = Laya;

@regClass()
export class TestSuperEllipse extends Laya.Script {

    private _sprite: Laya.Sprite;

    @property({ type: Number, min: 0 , step:1})
    a: number = 100;

    @property({ type: Number, min: 0, step:1 })
    b: number = 100;

    @property({ type: Number, min: 0, step:0.1 })
    n: number = 1;

    onAwake(): void {
        this._sprite = new Laya.Sprite();
        this._sprite.name = "drawParent";
        this._sprite.x = Laya.stage.width / 2;
        this._sprite.y = Laya.stage.height / 2;
        this.owner.addChild(this._sprite);
    }

    onUpdate(): void {
        this.drawSuperEllipse();
    }

    private drawSuperEllipse(): void {
        const path: any[] = [];
        for (let i = 0; i <= 360; i++) {
            const radian = i * Math.PI / 180;
            const cos = Math.cos(radian);
            const sin = Math.sin(radian);

            const x = Math.pow(Math.abs(cos), 2 / this.n) * this.a * Math.sign(cos);
            const y = Math.pow(Math.abs(sin), 2 / this.n) * this.b * Math.sign(sin);

            path.push([i == 0 ? "moveTo" : "lineTo", x, y]);
        }
        
        this._sprite.graphics.clear();
        this._sprite.graphics.drawPath(0, 0, path, { fillStyle: "#ff0000" }, { "strokeStyle": "#ffffff", "lineWidth": "10" });


    }
}