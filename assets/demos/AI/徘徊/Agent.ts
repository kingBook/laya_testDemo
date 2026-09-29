const { regClass, property } = Laya;

/** 向量工具 */
const Vec = {
    sub(a, b) { return { x: a.x - b.x, y: a.y - b.y }; },
    add(a, b) { return { x: a.x + b.x, y: a.y + b.y }; },
    mul(v, s) { return { x: v.x * s, y: v.y * s }; },
    len(v) { return Math.hypot(v.x, v.y); },
    normalize(v) {
        const l = Vec.len(v);
        return l === 0 ? { x: 0, y: 0 } : { x: v.x / l, y: v.y / l };
    },
    limit(v, max) {
        const l = Vec.len(v);
        if (l > max) return Vec.mul(Vec.normalize(v), max);
        return { ...v };
    }
};

@regClass()
export class Agent extends Laya.Script {

    declare owner: Laya.Sprite;

    /** 线速度 */
    vel: { x: number, y: number } = new Laya.Vector2();

    /** 加速度 */
    acc: { x: number, y: number } = new Laya.Vector2();

    /** 最大的移动速度 */
    maxSpeed = 2.5;

    /** 最大的力 */
    maxForce = 0.08

    //#region Wander 参数
    /** 虚拟圆心距离角色 */
    wanderDistance = 70;

    /** 虚拟圆半径 */
    wanderRadius = 22;

    /** 每帧扰动幅度 */
    displace = 2.2;

    /** 目标点 */
    wanderTarget: { x: number, y: number } = new Laya.Vector2();
    //#endregion

    /** 计算漫游转向力 */
    wander(): { x: number, y: number } {
        const pos = { x: this.owner.x, y: this.owner.y };
        const forward = Vec.normalize(this.vel);
        // 虚拟圆心：角色前方
        const circleCenter = Vec.add(pos, Vec.mul(forward, this.wanderDistance));

        // 给目标点施加随机扰动
        this.wanderTarget.x += (Math.random() - 0.5) * 2 * this.displace;
        this.wanderTarget.y += (Math.random() - 0.5) * 2 * this.displace;
        // 约束回圆周上
        this.wanderTarget = Vec.mul(Vec.normalize(this.wanderTarget), this.wanderRadius);

        // 转到世界坐标
        const worldTarget = Vec.add(circleCenter, this.wanderTarget);

        // Seek：指向目标的期望速度
        const desired = Vec.mul(Vec.normalize(Vec.sub(worldTarget, pos)), this.maxSpeed);
        // steer = desired - velocity  转向力
        let steer = Vec.sub(desired, this.vel);
        steer = Vec.limit(steer, this.maxForce);
        return steer;
    }

    /**
     *  施加力：F = ma，这里质量简化=1，所以 a += F
     * @param force 
     */
    applyForce(force: { x: number, y: number }): void {
        this.acc = Vec.add(this.acc, force);
    }

    physicsUpdate(): void {
        // 力产生加速度，更新速度
        this.vel = Vec.add(this.vel, this.acc);
        this.vel = Vec.limit(this.vel, this.maxSpeed);
        // 更新位置
        this.owner.x += this.vel.x;
        this.owner.y += this.vel.y;
        // 清空加速度（每帧力是瞬时的）
        this.acc = { x: 0, y: 0 };

        // 朝向旋转
        this.owner.rotation = Math.atan2(this.vel.y, this.vel.x) * 180 / Math.PI;

        // 边界环绕，跑出画布就从另一边回来
        if (this.owner.x > Laya.stage.width) this.owner.x = 0;
        if (this.owner.x < 0) this.owner.x = Laya.stage.width;
        if (this.owner.y > Laya.stage.height) this.owner.y = 0;
        if (this.owner.y < 0) this.owner.y = Laya.stage.height;
    }

    onUpdate(): void {
        const wanderForce = this.wander();
        this.applyForce(wanderForce);
        this.physicsUpdate();
    }

}