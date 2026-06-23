const { regClass, property } = Laya;

@regClass()
export class ProgressBar extends Laya.Script {

    owner: Laya.Sprite;

    @property({ type: Number, private: false, range: [1, 180], tips: "扇形大小" })
    private _pieArcLen: number = 45;

    private _maskSprite: Laya.Sprite;

    onAwake(): void {
        this.createMaskSprite();
    }

    private createMaskSprite(): void {
        const drawPieCmd = new Laya.DrawPieCmd();
        drawPieCmd.x = 0;
        drawPieCmd.y = 0;
        drawPieCmd.radius = Math.max(this.owner.width, this.owner.height) / 2;
        drawPieCmd.startAngle = 0;
        drawPieCmd.endAngle = this._pieArcLen;
        drawPieCmd.fillColor = "#ffffff";

        this._maskSprite = new Laya.Sprite();
        this._maskSprite.pos(this.owner.width / 2, this.owner.height / 2);
        this._maskSprite.graphics.addCmd(drawPieCmd, 0);
        this.owner.addChild(this._maskSprite);

        this.owner.mask = this._maskSprite;
    }

    public onUpdate(): void {
        this._maskSprite.rotation += 2;

        const drawPieCmd = <Laya.DrawPieCmd>this._maskSprite.graphics.cmds[0];
        this._maskSprite.graphics.replaceCmd(drawPieCmd, drawPieCmd);
    }
}