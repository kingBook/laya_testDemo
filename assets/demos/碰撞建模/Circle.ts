const { regClass, property } = Laya;

@regClass()
export class Circle extends Laya.Script {

    declare owner: Laya.Sprite;

    @property({ type: Number, tips: "半径" })
    public radius: number = 50;

    @property({ type: Laya.Vector2, tips: "速度向量" })
    public velocity: Laya.Vector2 = new Laya.Vector2(0, 0);

    @property({ type: Number, tips: "角速度<弧度/秒>" })
    public angularVelocity: number = 0;

    /** 质量 */
    public mass: number = 1;

    /** 恢复系数 */
    public restitution: number = 1;

    @property({ type: Number, tips: "摩擦系数（越大越容易拖住旋转）" })
    public friction: number = 0.1;

    @property({ type: Number, tips: "角速度阻尼（0~1，越大衰减越慢）" })
    public angularDamping: number = 0.992;

    onAwake(): void {
        this.owner.graphics.drawCircle(0, 0, this.radius, "#ff000033", "#ffffff", 2);
        this.owner.graphics.drawLine(0, 0, this.radius * 1.2, 0, "#ffffff", 2);
    }

    onUpdate(): void {
        // 位置
        let x = this.owner.x;
        let y = this.owner.y;

        x += this.velocity.x;
        y += this.velocity.y;

        if (x + this.radius >= Laya.stage.width) {
            x = Laya.stage.width - this.radius;
            this.velocity.x = -this.velocity.x;
        } else if (x - this.radius <= 0) {
            x = 0 + this.radius;
            this.velocity.x = -this.velocity.x;
        }

        if (y + this.radius >= Laya.stage.height) {
            y = Laya.stage.height - this.radius;
            this.velocity.y = -this.velocity.y;
        } else if (y - this.radius <= 0) {
            y = 0 + this.radius;
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