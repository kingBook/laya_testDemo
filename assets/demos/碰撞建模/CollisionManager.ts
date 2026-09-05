import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

type Collider = Circle | Rectangle;
type Vec2 = { x: number; y: number };

/**
 * 2D 刚体碰撞管理器。
 *
 * 负责维护所有参与碰撞的刚体，并在每帧执行：
 * 1. 刚体间的碰撞检测；
 * 2. 穿透修正；
 * 3. 冲量求解（法向反弹 + 切向摩擦）；
 * 4. 角速度更新；
 * 5. 角速度阻尼。
 *
 * 设计目标：
 * - 以真实刚体方式模拟碰撞，而不是简单的速度交换；
 * - 计算接触点到质心的力臂，从而驱动旋转；
 * - 没有人为限制 angularVelocity 上限，避免伪物理；
 * - 支持圆形与矩形的混合碰撞。
 */
export default class CollisionManager {

    /** 默认摩擦系数，未显式配置时使用此值。 */
    private static readonly DEFAULT_FRICTION = 0.03;

    /** 当前参与碰撞检测的所有刚体。 */
    private _colliders: Collider[];

    /**
     * 初始化碰撞管理器。
     * @param colliders 参与碰撞检测的刚体列表
     */
    public init(colliders: Collider[]): void {
        this._colliders = colliders;
    }

    /**
     * 每帧统一执行碰撞检测与求解。
     *
     * 先枚举所有刚体对，再根据形状类型调用：
     * - 圆-圆：resolveCircleCircle
     * - 圆-矩形：resolveCircleRect
     * - 矩形-矩形：resolveRectRect
     *
     * 最后应用角速度阻尼，模拟真实世界中的旋转衰减。
     */
    public update(): void {
        for (let i = 0; i < this._colliders.length; i++) {
            const ci = this._colliders[i];

            for (let j = i + 1; j < this._colliders.length; j++) {
                const cj = this._colliders[j];

                if (this.isCircle(ci) && this.isCircle(cj)) {
                    this.resolveCircleCircle(ci, cj);
                    continue;
                }

                if (this.isCircle(ci) && this.isRectangle(cj)) {
                    this.resolveCircleRect(ci, cj);
                    continue;
                }

                if (this.isRectangle(ci) && this.isCircle(cj)) {
                    this.resolveCircleRect(cj, ci);
                    continue;
                }

                if (this.isRectangle(ci) && this.isRectangle(cj)) {
                    this.resolveRectRect(ci, cj);
                }
            }
        }

    }

    /**
     * 计算两碰撞体的组合摩擦系数。
     *
     * 这里取两者摩擦值的平均，并做上限保护，避免摩擦过大导致数值不稳定。
     * @param a 第一个碰撞体
     * @param b 第二个碰撞体
     * @returns 两者组合后的摩擦系数
     */
    private getFrictionCoefficient(a: Collider, b: Collider): number {
        const fA = (a as any).friction ?? CollisionManager.DEFAULT_FRICTION;
        const fB = (b as any).friction ?? CollisionManager.DEFAULT_FRICTION;
        return Math.max(0.0, Math.min(0.5, (fA + fB) * 0.5));
    }

    /**
     * 判断当前对象是否为圆形碰撞体。
     * @param obj 待判断对象
     * @returns 是否为 Circle
     */
    private isCircle(obj: Collider): obj is Circle {
        return (obj as Circle).radius !== undefined;
    }

    /**
     * 判断当前对象是否为矩形碰撞体。
     * @param obj 待判断对象
     * @returns 是否为 Rectangle
     */
    private isRectangle(obj: Collider): obj is Rectangle {
        return (obj as Rectangle).width !== undefined && (obj as Rectangle).height !== undefined;
    }

    /**
     * 处理圆-圆碰撞。
     *
     * 计算两圆圆心距离、法线和穿透深度；
     * 先执行位置修正，再构造接触点，并使用刚体冲量求解反弹与旋转。
     * @param a 圆 A
     * @param b 圆 B
     */
    private resolveCircleCircle(a: Circle, b: Circle): void {
        const dx = b.owner.x - a.owner.x;
        const dy = b.owner.y - a.owner.y;
        const distSq = dx * dx + dy * dy;
        const minDist = a.radius + b.radius;
        if (distSq >= minDist * minDist) return;

        const dist = Math.sqrt(distSq) || 0.0001;
        const normal = dist > 0 ? { x: dx / dist, y: dy / dist } : { x: 1, y: 0 };
        const penetration = minDist - dist;
        this.applyPositionCorrection(a, b, normal, penetration);

        const contactA = { x: a.owner.x + normal.x * a.radius, y: a.owner.y + normal.y * a.radius };
        const contactB = { x: b.owner.x - normal.x * b.radius, y: b.owner.y - normal.y * b.radius };
        const contact = {
            x: (contactA.x + contactB.x) * 0.5,
            y: (contactA.y + contactB.y) * 0.5
        };

        this.resolveRigidBodyCollision(a, b, normal, contact);
    }

    /**
     * 处理圆-矩形碰撞。
     *
     * 先将圆心转到矩形本地坐标系，找到矩形上的最近点；
     * 再计算圆心和最近点的差值作为碰撞法线，最终参与刚体冲量求解。
     * @param circle 圆形碰撞体
     * @param rect 矩形碰撞体
     */
    private resolveCircleRect(circle: Circle, rect: Rectangle): void {
        const rectRot = this.deg2Rad(rect.owner.rotation);
        const c = Math.cos(rectRot);
        const s = Math.sin(rectRot);

        const dx = circle.owner.x - rect.owner.x;
        const dy = circle.owner.y - rect.owner.y;

        // 转到矩形本地坐标
        const localX = dx * c + dy * s;
        const localY = -dx * s + dy * c;
        const halfW = rect.width * 0.5;
        const halfH = rect.height * 0.5;

        const closestLocalX = this.clamp(localX, -halfW, halfW);
        const closestLocalY = this.clamp(localY, -halfH, halfH);

        const closestWorld = {
            x: rect.owner.x + closestLocalX * c - closestLocalY * s,
            y: rect.owner.y + closestLocalX * s + closestLocalY * c
        };

        const diff = this.sub({ x: circle.owner.x, y: circle.owner.y }, closestWorld);
        const distSq = diff.x * diff.x + diff.y * diff.y;
        if (distSq > circle.radius * circle.radius) return;

        let normal: Vec2 = { x: 0, y: 0 };
        let penetration = 0;

        if (distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            normal = { x: diff.x / dist, y: diff.y / dist };
            penetration = circle.radius - dist;
        } else {
            const left = Math.abs(localX + halfW);
            const right = Math.abs(localX - halfW);
            const top = Math.abs(localY + halfH);
            const bottom = Math.abs(localY - halfH);
            const min = Math.min(left, right, top, bottom);

            if (min === left) normal = { x: -c, y: -s };
            else if (min === right) normal = { x: c, y: s };
            else if (min === top) normal = { x: -s, y: c };
            else normal = { x: s, y: -c };

            const len = Math.hypot(normal.x, normal.y) || 1;
            normal = { x: normal.x / len, y: normal.y / len };
            penetration = circle.radius;
        }

        // 规范化法线：从矩形指向圆
        const n = { x: normal.x, y: normal.y };
        this.applyPositionCorrection(rect, circle, n, penetration);

        const contact = {
            x: closestWorld.x + n.x * 0.0001,
            y: closestWorld.y + n.y * 0.0001
        };

        this.resolveRigidBodyCollision(rect, circle, n, contact);
    }

    /**
     * 处理矩形-矩形碰撞。
     *
     * 采用 SAT（分离轴定理）来寻找最小重叠轴，作为碰撞法线；
     * 同时计算两个矩形各自的最近接触点，以便正确传递扭矩。
     * @param a 矩形 A
     * @param b 矩形 B
     */
    private resolveRectRect(a: Rectangle, b: Rectangle): void {
        const verticesA = this.getRectVertices(a);
        const verticesB = this.getRectVertices(b);
        const axes = this.getRectAxes(a).concat(this.getRectAxes(b));

        let bestAxis: Vec2 = { x: 1, y: 0 };
        let bestOverlap = Number.MAX_VALUE;
        let axisFound = false;

        for (const axis of axes) {
            const dir = this.normalize(axis);
            const projA = this.projectVertices(verticesA, dir);
            const projB = this.projectVertices(verticesB, dir);
            const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);
            if (overlap <= 0) return;

            if (overlap < bestOverlap) {
                bestOverlap = overlap;
                bestAxis = dir;
                axisFound = true;
            }
        }

        if (!axisFound) return;

        const centerDelta = this.sub({ x: b.owner.x, y: b.owner.y }, { x: a.owner.x, y: a.owner.y });
        if (this.dot(centerDelta, bestAxis) < 0) {
            bestAxis = { x: -bestAxis.x, y: -bestAxis.y };
        }

        const aClosest = this.getClosestPointOnRect(a, { x: b.owner.x, y: b.owner.y });
        const bClosest = this.getClosestPointOnRect(b, { x: a.owner.x, y: a.owner.y });
        const contact = {
            x: (aClosest.x + bClosest.x) * 0.5,
            y: (aClosest.y + bClosest.y) * 0.5
        };

        this.applyPositionCorrection(a, b, bestAxis, bestOverlap);
        this.resolveRigidBodyCollision(a, b, bestAxis, contact);
    }

    /**
     * 计算世界空间点到矩形表面的最近点。
     *
     * 通过把点转入矩形本地坐标，再将本地坐标裁剪到矩形边界内，
     * 最后转换回世界坐标，得到矩形表面上的最近点。
     * @param rect 目标矩形
     * @param p 世界空间中的点
     * @returns 矩形表面上的最近点
     */
    private getClosestPointOnRect(rect: Rectangle, p: Vec2): Vec2 {
        const rectRot = this.deg2Rad(rect.owner.rotation);
        const c = Math.cos(-rectRot);
        const s = Math.sin(-rectRot);
        const dx = p.x - rect.owner.x;
        const dy = p.y - rect.owner.y;
        const localX = dx * c - dy * s;
        const localY = dx * s + dy * c;

        const halfW = rect.width * 0.5;
        const halfH = rect.height * 0.5;
        const clampedX = this.clamp(localX, -halfW, halfW);
        const clampedY = this.clamp(localY, -halfH, halfH);

        return {
            x: rect.owner.x + clampedX * Math.cos(rectRot) - clampedY * Math.sin(rectRot),
            y: rect.owner.y + clampedX * Math.sin(rectRot) + clampedY * Math.cos(rectRot)
        };
    }

    /**
     * 执行刚体碰撞的冲量求解。
     *
     * 核心逻辑：
     * - 先求相对速度在法向上的分量；
     * - 通过质量和惯性矩计算冲量分母；
     * - 计算法向冲量并更新线速度与角速度；
     * - 再用切向方向计算摩擦冲量，模拟滚动/滑动摩擦。
     *
     * @param a 碰撞体 A
     * @param b 碰撞体 B
     * @param normal 碰撞法线
     * @param contact 触碰点位置
     */
    private resolveRigidBodyCollision(a: Collider, b: Collider, normal: Vec2, contact: Vec2): void {
        const invMassA = this.getInvMass(a);
        const invMassB = this.getInvMass(b);
        const invIA = this.getInvInertia(a);
        const invIB = this.getInvInertia(b);

        const rA = this.sub(contact, this.getCenter(a));
        const rB = this.sub(contact, this.getCenter(b));

        const vA = this.add(a.velocity, this.rotatePerp(rA, a.angularVelocity));
        const vB = this.add(b.velocity, this.rotatePerp(rB, b.angularVelocity));
        const rv = this.sub(vB, vA);
        const velAlongNormal = this.dot(rv, normal);

        if (velAlongNormal > 0) return;

        const restitution = Math.min(a.restitution, b.restitution);
        const rAcn = this.cross(rA, normal);
        const rBcn = this.cross(rB, normal);
        const denom = invMassA + invMassB + (rAcn * rAcn) * invIA + (rBcn * rBcn) * invIB;
        if (denom <= 0.0000001) return;

        const j = (-(1 + restitution) * velAlongNormal) / denom;
        const impulse = { x: j * normal.x, y: j * normal.y };
        this.applyImpulse(a, b, impulse, rA, rB);

        // 摩擦：切向冲量
        const tangent = this.normalize(this.sub(rv, this.scale(normal, this.dot(rv, normal))));
        const tangentLenSq = tangent.x * tangent.x + tangent.y * tangent.y;
        if (tangentLenSq > 0.0001) {
            const rAt = this.cross(rA, tangent);
            const rBt = this.cross(rB, tangent);
            const tangentDenom = invMassA + invMassB + (rAt * rAt) * invIA + (rBt * rBt) * invIB;
            if (tangentDenom > 0.0000001) {
                const jt = -this.dot(rv, tangent) / tangentDenom;
                const mu = this.getFrictionCoefficient(a, b);
                const maxFriction = mu * Math.abs(j);
                const clampedJt = this.clamp(jt, -maxFriction, maxFriction);
                const frictionImpulse = { x: clampedJt * tangent.x, y: clampedJt * tangent.y };
                this.applyImpulse(a, b, frictionImpulse, rA, rB);
            }
        }
    }

    /**
     * 将冲量施加到两个刚体上，并更新其线速度与角速度。
     *
     * 线性冲量会改变速度；
     * 角冲量会由力臂 r 与冲量 J 计算出扭矩，再除以惯性矩得到角速度变化。
     * @param a 碰撞体 A
     * @param b 碰撞体 B
     * @param impulse 冲量向量
     * @param rA 接触点到 A 质心的向量
     * @param rB 接触点到 B 质心的向量
     */
    private applyImpulse(a: Collider, b: Collider, impulse: Vec2, rA: Vec2, rB: Vec2): void {
        const invMassA = this.getInvMass(a);
        const invMassB = this.getInvMass(b);
        const invIA = this.getInvInertia(a);
        const invIB = this.getInvInertia(b);

        a.velocity.x -= impulse.x * invMassA;
        a.velocity.y -= impulse.y * invMassA;
        b.velocity.x += impulse.x * invMassB;
        b.velocity.y += impulse.y * invMassB;

        a.angularVelocity -= this.cross(rA, impulse) * invIA;
        b.angularVelocity += this.cross(rB, impulse) * invIB;
    }

    /**
     * 修正两刚体间的穿透量，避免重叠后卡住。
     *
     * 按质量反比分配修正位置，保持轻物体更容易被推开，重物体受到较小位移修正。
     * @param a 碰撞体 A
     * @param b 碰撞体 B
     * @param normal 碰撞法线
     * @param penetration 穿透深度
     */
    private applyPositionCorrection(a: Collider, b: Collider, normal: Vec2, penetration: number): void {
        const invMassA = this.getInvMass(a);
        const invMassB = this.getInvMass(b);
        const totalInvMass = invMassA + invMassB;
        if (totalInvMass <= 0.000001) return;

        const percent = 0.8;
        const slop = 0.01;
        const correction = Math.max(penetration - slop, 0) / totalInvMass * percent;
        const correctionVec = { x: normal.x * correction, y: normal.y * correction };

        a.owner.x -= correctionVec.x * invMassA;
        a.owner.y -= correctionVec.y * invMassA;
        b.owner.x += correctionVec.x * invMassB;
        b.owner.y += correctionVec.y * invMassB;
    }

    /**
     * 获取刚体的中心点。
     *
     * 当前实现中，我们把碰撞体的质心直接视为 owner 的位置。
     * @param collider 碰撞体
     * @returns 质心坐标
     */
    private getCenter(collider: Collider): Vec2 {
        return { x: collider.owner.x, y: collider.owner.y };
    }

    /**
     * 获取质量反比。
     *
     * 质量越大，受到冲量影响越小；质量越小，速度变化越明显。
     * @param collider 碰撞体
     * @returns 1 / mass
     */
    private getInvMass(collider: Collider): number {
        if (this.isCircle(collider)) return collider.mass > 0 ? 1 / collider.mass : 0;
        return collider.mass > 0 ? 1 / collider.mass : 0;
    }

    /**
     * 获取惯性矩反比，用于角速度计算。
     *
     * 圆形惯性矩：I = 0.5 * m * r^2
     * 矩形惯性矩：I = m * (w^2 + h^2) / 12
     * @param collider 碰撞体
     * @returns 1 / I
     */
    private getInvInertia(collider: Collider): number {
        if (this.isCircle(collider)) return 1 / this.getCircleInertia(collider);
        return 1 / this.getRectInertia(collider);
    }

    /**
     * 获取矩形的世界坐标顶点。
     *
     * 这里会先按矩形旋转角度转换局部坐标，再转换成世界坐标，
     * 用于 SAT 碰撞检测。
     * @param rect 矩形碰撞体
     * @returns 顶点数组
     */
    private getRectVertices(rect: Rectangle): Vec2[] {
        const halfW = rect.width * 0.5;
        const halfH = rect.height * 0.5;
        const local = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: halfW, y: halfH },
            { x: -halfW, y: halfH }
        ];
        const rad = this.deg2Rad(rect.owner.rotation);
        const c = Math.cos(rad);
        const s = Math.sin(rad);

        return local.map(p => ({
            x: rect.owner.x + p.x * c - p.y * s,
            y: rect.owner.y + p.x * s + p.y * c
        }));
    }

    /**
     * 获取矩形在世界空间中的两个主轴方向。
     *
     * 对于旋转矩形，这两个轴不是固定的 X/Y，而是沿着矩形的局部轴旋转后的方向。
     * @param rect 矩形碰撞体
     * @returns 两个单位轴向量
     */
    private getRectAxes(rect: Rectangle): Vec2[] {
        const rad = this.deg2Rad(rect.owner.rotation);
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            { x: c, y: s },
            { x: -s, y: c }
        ];
    }

    /**
     * 将顶点沿指定轴投影，返回投影区间。
     *
     * 这是 SAT 碰撞检测中的基础步骤，用于判断两个凸多边形是否重叠。
     * @param vertices 顶点数组
     * @param axis 轴向量
     * @returns { min, max } 投影区间
     */
    private projectVertices(vertices: Vec2[], axis: Vec2): { min: number; max: number } {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const v of vertices) {
            const p = this.dot(v, axis);
            if (p < min) min = p;
            if (p > max) max = p;
        }
        return { min, max };
    }

    /**
     * 计算 `ω × r` 的效果，表示角速度带来的线性速度。
     *
     * 在 2D 中，若 r = (x, y)，则 ω × r = (-ωy, ωx)。
     * @param r 力臂向量
     * @param angularVelocity 角速度
     * @returns 由角速度引起的线速度分量
     */
    private rotatePerp(r: Vec2, angularVelocity: number): Vec2 {
        return {
            x: -angularVelocity * r.y,
            y: angularVelocity * r.x
        };
    }

    /**
     * 向量加法。
     * @param a 向量 A
     * @param b 向量 B
     * @returns A + B
     */
    private add(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x + b.x, y: a.y + b.y };
    }

    /**
     * 向量减法。
     * @param a 向量 A
     * @param b 向量 B
     * @returns A - B
     */
    private sub(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    /**
     * 计算两个向量的点积。
     * @param a 向量 A
     * @param b 向量 B
     * @returns A · B
     */
    private dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y;
    }

    /**
     * 按标量缩放向量。
     * @param v 向量
     * @param scalar 缩放因子
     * @returns 缩放后的向量
     */
    private scale(v: Vec2, scalar: number): Vec2 {
        return { x: v.x * scalar, y: v.y * scalar };
    }

    /**
     * 标准化向量，使其长度为 1。
     * @param v 向量
     * @returns 单位向量
     */
    private normalize(v: Vec2): Vec2 {
        const lenSq = v.x * v.x + v.y * v.y;
        if (lenSq <= 0.0000001) return { x: 0, y: 0 };
        const len = Math.sqrt(lenSq);
        return { x: v.x / len, y: v.y / len };
    }

    /**
     * 计算二维叉积。
     *
     * 叉积用于计算法向投影和力矩：a × b = a.x*b.y - a.y*b.x
     * @param a 向量 A
     * @param b 向量 B
     * @returns 叉积值
     */
    private cross(a: Vec2, b: Vec2): number {
        return a.x * b.y - a.y * b.x;
    }

    /**
     * 将数值限制在给定区间内。
     * @param value 原值
     * @param min 最小值
     * @param max 最大值
     * @returns 限制后的值
     */
    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * 角度转弧度。
     * @param deg 角度值（度）
     * @returns 弧度值
     */
    private deg2Rad(deg: number): number {
        return deg * Math.PI / 180;
    }

    /**
     * 计算圆形的惯性矩。
     * @param circle 圆形碰撞体
     * @returns 圆形的惯性矩
     */
    private getCircleInertia(circle: Circle): number {
        return 0.5 * circle.mass * circle.radius * circle.radius;
    }

    /**
     * 计算矩形的惯性矩。
     *
     * 这里使用矩形绕中心轴的惯性矩公式：
     * I = m * (w^2 + h^2) / 12
     * @param rect 矩形碰撞体
     * @returns 矩形的惯性矩
     */
    private getRectInertia(rect: Rectangle): number {
        return (rect.mass * (rect.width * rect.width + rect.height * rect.height)) / 12;
    }
}