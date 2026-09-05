import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

type Collider = Circle | Rectangle;

type Vec2 = { x: number; y: number };

/** 碰撞管理器 */
export default class CollisionManager {

    private static readonly DEFAULT_ANGULAR_DAMPING = 0.992;
    private static readonly DEFAULT_FRICTION = 0.14;

    private _colliders: Collider[];

    public init(colliders: Collider[]): void {
        this._colliders = colliders;
    }

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

        this.applyAngularDamping();
    }

    private applyAngularDamping(): void {
        for (const collider of this._colliders) {
            if (!collider) continue;
            const damping = this.getAngularDamping(collider);
            collider.angularVelocity *= damping;
            if (Math.abs(collider.angularVelocity) < 0.0005) {
                collider.angularVelocity = 0;
            }
        }
    }

    private getAngularDamping(collider: Collider): number {
        const value = (collider as any).angularDamping ?? CollisionManager.DEFAULT_ANGULAR_DAMPING;
        return Math.max(0, Math.min(1, value));
    }

    private getFrictionCoefficient(a: Collider, b: Collider): number {
        const fA = (a as any).friction ?? CollisionManager.DEFAULT_FRICTION;
        const fB = (b as any).friction ?? CollisionManager.DEFAULT_FRICTION;
        return (fA + fB) * 0.5;
    }

    private isCircle(obj: Collider): obj is Circle {
        return (obj as Circle).radius !== undefined;
    }

    private isRectangle(obj: Collider): obj is Rectangle {
        return (obj as Rectangle).width !== undefined && (obj as Rectangle).height !== undefined;
    }

    private resolveCircleCircle(ci: Circle, cj: Circle): void {
        const dx = cj.owner.x - ci.owner.x;
        const dy = cj.owner.y - ci.owner.y;
        const distSq = dx * dx + dy * dy;
        const minDist = ci.radius + cj.radius;

        if (distSq >= minDist * minDist) return;

        const dist = Math.sqrt(distSq) || 0.0001;
        const nx = dist === 0 ? 1 : dx / dist;
        const ny = dist === 0 ? 0 : dy / dist;

        // 先分离重叠
        const overlap = minDist - dist;
        const totalMass = ci.mass + cj.mass;
        const ciMove = (cj.mass / totalMass) * overlap;
        const cjMove = (ci.mass / totalMass) * overlap;

        ci.owner.x -= nx * ciMove;
        ci.owner.y -= ny * ciMove;
        cj.owner.x += nx * cjMove;
        cj.owner.y += ny * cjMove;

        const r1 = { x: nx * ci.radius, y: ny * ci.radius };
        const r2 = { x: -nx * cj.radius, y: -ny * cj.radius };

        const v1Contact = this.add(ci.velocity, this.rotatePerp(r1, ci.angularVelocity));
        const v2Contact = this.add(cj.velocity, this.rotatePerp(r2, cj.angularVelocity));

        const rv = this.sub(v2Contact, v1Contact);
        const velAlongNormal = this.dot(rv, { x: nx, y: ny });

        if (velAlongNormal > 0) return;

        const restitution = Math.min(ci.restitution, cj.restitution);
        const invMass1 = 1 / ci.mass;
        const invMass2 = 1 / cj.mass;
        const invI1 = 1 / this.getCircleInertia(ci);
        const invI2 = 1 / this.getCircleInertia(cj);

        const r1CrossN = r1.x * ny - r1.y * nx;
        const r2CrossN = r2.x * ny - r2.y * nx;
        const denom = invMass1 + invMass2 + (r1CrossN * r1CrossN) * invI1 + (r2CrossN * r2CrossN) * invI2;
        const jn = (-(1 + restitution) * velAlongNormal) / denom;

        const impulseN = { x: jn * nx, y: jn * ny };

        ci.velocity.x -= impulseN.x * invMass1;
        ci.velocity.y -= impulseN.y * invMass1;
        cj.velocity.x += impulseN.x * invMass2;
        cj.velocity.y += impulseN.y * invMass2;

        const torque1N = r1.x * impulseN.y - r1.y * impulseN.x;
        const torque2N = r2.x * impulseN.y - r2.y * impulseN.x;

        ci.angularVelocity -= torque1N * invI1;
        cj.angularVelocity += torque2N * invI2;

        // 让圆在碰撞时真正旋转：增加切向摩擦冲量
        const tangent = { x: -ny, y: nx };
        const tangentSpeed = this.dot(rv, tangent);
        const denomT = invMass1 + invMass2 + (this.cross(r1, tangent) ** 2) * invI1 + (this.cross(r2, tangent) ** 2) * invI2;
        const jt = -tangentSpeed / denomT;
        const mu = this.getFrictionCoefficient(ci, cj);
        const maxFriction = mu * Math.abs(jn);
        const clampedJt = this.clamp(jt, -maxFriction, maxFriction);

        const impulseT = { x: clampedJt * tangent.x, y: clampedJt * tangent.y };

        ci.velocity.x -= impulseT.x * invMass1;
        ci.velocity.y -= impulseT.y * invMass1;
        cj.velocity.x += impulseT.x * invMass2;
        cj.velocity.y += impulseT.y * invMass2;

        const torque1T = r1.x * impulseT.y - r1.y * impulseT.x;
        const torque2T = r2.x * impulseT.y - r2.y * impulseT.x;

        ci.angularVelocity -= torque1T * invI1;
        cj.angularVelocity += torque2T * invI2;
    }

    private resolveCircleRect(circle: Circle, rect: Rectangle): void {
        const rectRot = this.deg2Rad(rect.owner.rotation);
        const cos = Math.cos(rectRot);
        const sin = Math.sin(rectRot);

        const dx = circle.owner.x - rect.owner.x;
        const dy = circle.owner.y - rect.owner.y;

        const localX = dx * cos + dy * sin;
        const localY = -dx * sin + dy * cos;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;

        const closestLocalX = this.clamp(localX, -halfW, halfW);
        const closestLocalY = this.clamp(localY, -halfH, halfH);

        const closestWorld = {
            x: rect.owner.x + closestLocalX * cos - closestLocalY * sin,
            y: rect.owner.y + closestLocalX * sin + closestLocalY * cos
        };

        const toClosest = this.sub({ x: circle.owner.x, y: circle.owner.y }, closestWorld);
        const distSq = toClosest.x * toClosest.x + toClosest.y * toClosest.y;

        if (distSq > circle.radius * circle.radius) return;

        let normal: Vec2 = { x: 0, y: 0 };
        const dist = Math.sqrt(distSq) || 0.0001;

        if (distSq > 0.0001) {
            normal = { x: toClosest.x / dist, y: toClosest.y / dist };
        } else {
            const left = Math.abs(localX + halfW);
            const right = Math.abs(localX - halfW);
            const top = Math.abs(localY + halfH);
            const bottom = Math.abs(localY - halfH);
            const min = Math.min(left, right, top, bottom);

            if (min === left) { normal = { x: -cos, y: -sin }; }
            else if (min === right) { normal = { x: cos, y: sin }; }
            else if (min === top) { normal = { x: -sin, y: cos }; }
            else { normal = { x: sin, y: -cos }; }
        }

        // 方向统一为：从矩形指向圆
        const rectToCircle = { x: normal.x, y: normal.y };
        const overlap = Math.max(0, circle.radius - dist);

        if (overlap > 0.001) {
            const totalMass = circle.mass + rect.mass;
            const circleMove = (rect.mass / totalMass) * overlap;
            const rectMove = (circle.mass / totalMass) * overlap;

            circle.owner.x += rectToCircle.x * circleMove;
            circle.owner.y += rectToCircle.y * circleMove;
            rect.owner.x -= rectToCircle.x * rectMove;
            rect.owner.y -= rectToCircle.y * rectMove;
        }

        const contact = {
            x: circle.owner.x - rectToCircle.x * circle.radius * 0.75,
            y: circle.owner.y - rectToCircle.y * circle.radius * 0.75
        };

        const rA = this.sub(contact, { x: rect.owner.x, y: rect.owner.y });
        const rB = this.sub(contact, { x: circle.owner.x, y: circle.owner.y });

        const vA = this.add(rect.velocity, this.rotatePerp(rA, rect.angularVelocity));
        const vB = this.add(circle.velocity, this.rotatePerp(rB, circle.angularVelocity));
        const rv = this.sub(vB, vA);
        const velAlongNormal = this.dot(rv, rectToCircle);

        if (velAlongNormal > 0) return;

        const restitution = Math.min(circle.restitution, rect.restitution);
        const invMassA = 1 / rect.mass;
        const invMassB = 1 / circle.mass;
        const invIA = 1 / this.getRectInertia(rect);
        const invIB = 1 / this.getCircleInertia(circle);

        const rACrossN = this.cross(rA, rectToCircle);
        const rBCrossN = this.cross(rB, rectToCircle);
        const denom = invMassA + invMassB + (rACrossN * rACrossN) * invIA + (rBCrossN * rBCrossN) * invIB;
        const j = (-(1 + restitution) * velAlongNormal) / denom;
        const impulse = { x: j * rectToCircle.x, y: j * rectToCircle.y };

        rect.velocity.x -= impulse.x * invMassA;
        rect.velocity.y -= impulse.y * invMassA;
        circle.velocity.x += impulse.x * invMassB;
        circle.velocity.y += impulse.y * invMassB;

        rect.angularVelocity -= this.cross(rA, impulse) * invIA;
        circle.angularVelocity += this.cross(rB, impulse) * invIB;

        // 切向摩擦：控制旋转不失控
        const tangent = { x: -rectToCircle.y, y: rectToCircle.x };
        const tangentLen = Math.hypot(tangent.x, tangent.y) || 1;
        const tangentUnit = { x: tangent.x / tangentLen, y: tangent.y / tangentLen };
        const tangentVel = this.dot(rv, tangentUnit);
        const rAT = this.cross(rA, tangentUnit);
        const rBT = this.cross(rB, tangentUnit);
        const tangentDenom = invMassA + invMassB + (rAT * rAT) * invIA + (rBT * rBT) * invIB;

        if (tangentDenom > 0.0001) {
            const jt = -tangentVel / tangentDenom;
            const mu = this.getFrictionCoefficient(rect, circle);
            const maxFriction = mu * Math.abs(j);
            const clampedJt = this.clamp(jt, -maxFriction, maxFriction);
            const frictionImpulse = { x: clampedJt * tangentUnit.x, y: clampedJt * tangentUnit.y };

            rect.velocity.x -= frictionImpulse.x * invMassA;
            rect.velocity.y -= frictionImpulse.y * invMassA;
            circle.velocity.x += frictionImpulse.x * invMassB;
            circle.velocity.y += frictionImpulse.y * invMassB;

            rect.angularVelocity -= this.cross(rA, frictionImpulse) * invIA;
            circle.angularVelocity += this.cross(rB, frictionImpulse) * invIB;
        }
    }

    private resolveRectRect(a: Rectangle, b: Rectangle): void {
        const verticesA = this.getRectVertices(a);
        const verticesB = this.getRectVertices(b);
        const axes = this.getRectAxes(a).concat(this.getRectAxes(b));

        let bestAxis: Vec2 = { x: 1, y: 0 };
        let bestOverlap = Number.MAX_VALUE;
        let axisFound = false;

        for (const axis of axes) {
            const projA = this.projectVertices(verticesA, axis);
            const projB = this.projectVertices(verticesB, axis);
            const overlap = Math.min(projA.max, projB.max) - Math.max(projA.min, projB.min);

            if (overlap <= 0) return;
            if (overlap < bestOverlap) {
                bestOverlap = overlap;
                bestAxis = axis;
                axisFound = true;
            }
        }

        if (!axisFound) return;

        const centerDelta = { x: b.owner.x - a.owner.x, y: b.owner.y - a.owner.y };
        if (this.dot(centerDelta, bestAxis) < 0) {
            bestAxis = { x: -bestAxis.x, y: -bestAxis.y };
        }

        const totalMass = a.mass + b.mass;
        const aMove = (b.mass / totalMass) * bestOverlap;
        const bMove = (a.mass / totalMass) * bestOverlap;

        a.owner.x -= bestAxis.x * aMove;
        a.owner.y -= bestAxis.y * aMove;
        b.owner.x += bestAxis.x * bMove;
        b.owner.y += bestAxis.y * bMove;

        const contact = {
            x: (a.owner.x + b.owner.x) * 0.5,
            y: (a.owner.y + b.owner.y) * 0.5
        };

        const rA = this.sub(contact, { x: a.owner.x, y: a.owner.y });
        const rB = this.sub(contact, { x: b.owner.x, y: b.owner.y });

        const vA = this.add(a.velocity, this.rotatePerp(rA, a.angularVelocity));
        const vB = this.add(b.velocity, this.rotatePerp(rB, b.angularVelocity));
        const rv = this.sub(vB, vA);
        const velAlongNormal = this.dot(rv, bestAxis);

        if (velAlongNormal > 0) return;

        const restitution = Math.min(a.restitution, b.restitution);
        const invMassA = 1 / a.mass;
        const invMassB = 1 / b.mass;
        const invIA = 1 / this.getRectInertia(a);
        const invIB = 1 / this.getRectInertia(b);

        const rACrossN = this.cross(rA, bestAxis);
        const rBCrossN = this.cross(rB, bestAxis);
        const denom = invMassA + invMassB + (rACrossN * rACrossN) * invIA + (rBCrossN * rBCrossN) * invIB;
        const j = (-(1 + restitution) * velAlongNormal) / denom;
        const impulse = { x: j * bestAxis.x, y: j * bestAxis.y };

        a.velocity.x -= impulse.x * invMassA;
        a.velocity.y -= impulse.y * invMassA;
        b.velocity.x += impulse.x * invMassB;
        b.velocity.y += impulse.y * invMassB;

        a.angularVelocity -= this.cross(rA, impulse) * invIA;
        b.angularVelocity += this.cross(rB, impulse) * invIB;

        const tangent = { x: -bestAxis.y, y: bestAxis.x };
        const tangentLen = Math.hypot(tangent.x, tangent.y) || 1;
        const tangentUnit = { x: tangent.x / tangentLen, y: tangent.y / tangentLen };
        const tangentVel = this.dot(rv, tangentUnit);
        const rAT = this.cross(rA, tangentUnit);
        const rBT = this.cross(rB, tangentUnit);
        const tangentDenom = invMassA + invMassB + (rAT * rAT) * invIA + (rBT * rBT) * invIB;

        if (tangentDenom > 0.0001) {
            const jt = -tangentVel / tangentDenom;
            const mu = this.getFrictionCoefficient(a, b);
            const maxFriction = mu * Math.abs(j);
            const clampedJt = this.clamp(jt, -maxFriction, maxFriction);
            const frictionImpulse = { x: clampedJt * tangentUnit.x, y: clampedJt * tangentUnit.y };

            a.velocity.x -= frictionImpulse.x * invMassA;
            a.velocity.y -= frictionImpulse.y * invMassA;
            b.velocity.x += frictionImpulse.x * invMassB;
            b.velocity.y += frictionImpulse.y * invMassB;

            a.angularVelocity -= this.cross(rA, frictionImpulse) * invIA;
            b.angularVelocity += this.cross(rB, frictionImpulse) * invIB;
        }
    }

    private getRectVertices(rect: Rectangle): Vec2[] {
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const local = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: halfW, y: halfH },
            { x: -halfW, y: halfH }
        ];

        const rad = this.deg2Rad(rect.owner.rotation);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        return local.map(p => ({
            x: rect.owner.x + p.x * cos - p.y * sin,
            y: rect.owner.y + p.x * sin + p.y * cos
        }));
    }

    private getRectAxes(rect: Rectangle): Vec2[] {
        const rad = this.deg2Rad(rect.owner.rotation);
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        return [
            { x: cos, y: sin },
            { x: -sin, y: cos }
        ];
    }

    private projectVertices(vertices: Vec2[], axis: Vec2): { min: number; max: number } {
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (const v of vertices) {
            const projection = v.x * axis.x + v.y * axis.y;
            if (projection < min) min = projection;
            if (projection > max) max = projection;
        }

        return { min, max };
    }

    private add(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x + b.x, y: a.y + b.y };
    }

    private sub(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x - b.x, y: a.y - b.y };
    }

    private dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y;
    }

    private rotate(v: Vec2, angle: number): Vec2 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
            x: v.x * cos - v.y * sin,
            y: v.x * sin + v.y * cos
        };
    }

    private rotatePerp(r: Vec2, angularVelocity: number): Vec2 {
        return {
            x: -angularVelocity * r.y,
            y: angularVelocity * r.x
        };
    }

    private average(points: Vec2[]): Vec2 {
        let x = 0;
        let y = 0;
        for (const p of points) {
            x += p.x;
            y += p.y;
        }
        return { x: x / points.length, y: y / points.length };
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.min(Math.max(value, min), max);
    }

    private deg2Rad(deg: number): number {
        return deg * Math.PI / 180;
    }

    private getCircleInertia(circle: Circle): number {
        return 0.5 * circle.mass * circle.radius * circle.radius;
    }

    private getRectInertia(rect: Rectangle): number {
        return (rect.mass * (rect.width * rect.width + rect.height * rect.height)) / 12;
    }

    private cross(v: Vec2, w: Vec2): number {
        return v.x * w.y - v.y * w.x;
    }
}