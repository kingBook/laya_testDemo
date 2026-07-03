const { regClass, property } = Laya;

@regClass()
export class Chart extends Laya.Script {

    @property({ type: Laya.Box, private: false, tips: "画布" })
    private _canvas: Laya.Box;

    @property({ type: Laya.Sprite, private: false, tips: "线头" })
    private _lineHead: Laya.Sprite;

    private _lineSprite: Laya.Sprite;

    onAwake(): void {

        this.createLineSprite();

        this.drawLine([
            0, 0,
            100, 100,
            400, 200
        ]);

    }

    private createLineSprite(): void {
        this._lineSprite = new Laya.Sprite();
        this._lineSprite.addComponent(Laya.Mesh2DRender);
        this._lineSprite.pos(0, this._canvas.height);
        this._canvas.addChild(this._lineSprite);
    }

    /**
     * 画线
     * @param points 顶点数组，格式：[x,y, x,y, ...]
     */
    private drawLine(points: number[]): void {
        
    }

    /**
     * 设置值
     * @param multiple 倍数
     * @param height 高度
     */
    public setValue(multiple: number, height: number): void {

    }

    /**
     * 跳点
     * @param multiple 倍数
     */
    public jump(multiple: number): void {

    }



}