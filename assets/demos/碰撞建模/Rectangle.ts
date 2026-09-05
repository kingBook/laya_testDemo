const { regClass, property } = Laya;

@regClass()
export class Rectangle extends Laya.Script {

    declare owner: Laya.Sprite;

    @property({ type: Number, tips: "宽" })
    public width: number = 100;

    @property({ type: Number, tips: "高" })
    public height: number = 80;

    @property({ type: Laya.Vector2, tips: "速度向量" })
    public velocity: Laya.Vector2 = new Laya.Vector2(0, 0);

    @property({ type: Number, tips: "角速度<弧度/秒>" })
    public angularVelocity: number = 0;

    /** 质量 */
    public mass: number = 1;

    /** 恢复系数 */
    public restitution: number = 1;

    @property({ type: Number, tips: "摩擦系数（越大越容易拖住旋转）" })
    public friction: number = 0.06;

    @property({ type: Number, tips: "角速度阻尼（0~1，越大衰减越慢）" })
    public angularDamping: number = 0.99;

    onAwake(): void {
        this.owner.graphics.drawRect(-this.width / 2, -this.height / 2, this.width, this.height, "#00ff0033", "#ffffff", 2);
        this.owner.graphics.drawLine(0, 0, this.width * 0.6, 0, "#ffffff", 2);
    }

    onUpdate(): void {
        // 位移
        let x = this.owner.x;
        let y = this.owner.y;

        x += this.velocity.x;
        y += this.velocity.y;

        if (x + this.width / 2 >= Laya.stage.width) {
            x = Laya.stage.width - this.width / 2;
            this.velocity.x = -this.velocity.x;
        } else if (x - this.width / 2 <= 0) {
            x = 0 + this.width / 2;
            this.velocity.x = -this.velocity.x;
        }

        if (y + this.height / 2 >= Laya.stage.height) {
            y = Laya.stage.height - this.height / 2;
            this.velocity.y = -this.velocity.y;
        } else if (y - this.height / 2 <= 0) {
            y = 0 + this.height / 2;
            this.velocity.y = -this.velocity.y;
        }

        this.owner.pos(x, y);

        
        // 旋转
        const dt = Laya.timer.delta;
        let rotation = this.owner.rotation;
        rotation += this.angularVelocity / Laya.MathUtils3D.Deg2Rad * dt;
        this.owner.rotation = rotation;
    }
}
