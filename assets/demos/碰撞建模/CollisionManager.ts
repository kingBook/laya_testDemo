import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

type Collider = Circle | Rectangle;
type Vec2 = { x: number; y: number };

/** 更严格的刚体碰撞管理器 */
export default class CollisionManager {

    private static readonly DEFAULT_ANGULAR_DAMPING = 0.999;
    private static readonly DEFAULT_FRICTION = 0.03;

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
        return Math.max(0.0, Math.min(1.0, value));
    }

    private getFrictionCoefficient(a: Collider, b: Collider): number {
        const fA = (a as any).friction ?? CollisionManager.DEFAULT_FRICTION;
        const fB = (b as any).friction ?? CollisionManager.DEFAULT_FRICTION;
        return Math.max(0.0, Math.min(0.5, (fA + fB) * 0.5));
    }

    private isCircle(obj: Collider): obj is Circle {
        return (obj as Circle).radius !== undefined;
    }

    private isRectangle(obj: Collider): obj is Rectangle {
        return (obj as Rectangle).width !== undefined && (obj as Rectangle).height !== undefined;
    }

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

    private getCenter(collider: Collider): Vec2 {
        return { x: collider.owner.x, y: collider.owner.y };
    }

    private getInvMass(collider: Collider): number {
        if (this.isCircle(collider)) return collider.mass > 0 ? 1 / collider.mass : 0;
        return collider.mass > 0 ? 1 / collider.mass : 0;
    }

    private getInvInertia(collider: Collider): number {
        if (this.isCircle(collider)) return 1 / this.getCircleInertia(collider);
        return 1 / this.getRectInertia(collider);
    }

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

    private getRectAxes(rect: Rectangle): Vec2[] {
        const rad = this.deg2Rad(rect.owner.rotation);
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return [
            { x: c, y: s },
            { x: -s, y: c }
        ];
    }

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

    private rotatePerp(r: Vec2, angularVelocity: number): Vec2 {
        return {
            x: -angularVelocity * r.y,
            y: angularVelocity * r.x
        };
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

    private scale(v: Vec2, scalar: number): Vec2 {
        return { x: v.x * scalar, y: v.y * scalar };
    }

    private normalize(v: Vec2): Vec2 {
        const lenSq = v.x * v.x + v.y * v.y;
        if (lenSq <= 0.0000001) return { x: 0, y: 0 };
        const len = Math.sqrt(lenSq);
        return { x: v.x / len, y: v.y / len };
    }

    private cross(a: Vec2, b: Vec2): number {
        return a.x * b.y - a.y * b.x;
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
}