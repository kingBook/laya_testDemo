import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

type Collider = Circle | Rectangle;

type Vec2 = { x: number; y: number };

/** 碰撞管理器 */
export default class CollisionManager {

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

        const rvx = cj.velocity.x - ci.velocity.x;
        const rvy = cj.velocity.y - ci.velocity.y;
        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal > 0) return;

        const restitution = Math.min(ci.restitution, cj.restitution);
        const invMass1 = 1 / ci.mass;
        const invMass2 = 1 / cj.mass;
        const invI1 = 1 / this.getCircleInertia(ci);
        const invI2 = 1 / this.getCircleInertia(cj);

        const contact1: Vec2 = { x: ci.owner.x + nx * ci.radius, y: ci.owner.y + ny * ci.radius };
        const contact2: Vec2 = { x: cj.owner.x - nx * cj.radius, y: cj.owner.y - ny * cj.radius };

        const r1 = this.sub(contact1, { x: ci.owner.x, y: ci.owner.y });
        const r2 = this.sub(contact2, { x: cj.owner.x, y: cj.owner.y });

        const v1Contact = this.add(ci.velocity, this.rotatePerp(r1, ci.angularVelocity));
        const v2Contact = this.add(cj.velocity, this.rotatePerp(r2, cj.angularVelocity));

        const rv = this.sub(v2Contact, v1Contact);
        const velAlongNormal2 = this.dot(rv, { x: nx, y: ny });

        if (velAlongNormal2 > 0) return;

        const r1CrossN = r1.x * ny - r1.y * nx;
        const r2CrossN = r2.x * ny - r2.y * nx;
        const denom = invMass1 + invMass2 + (r1CrossN * r1CrossN) * invI1 + (r2CrossN * r2CrossN) * invI2;
        const impulseScalar = (-(1 + restitution) * velAlongNormal2) / denom;

        const impulse = { x: impulseScalar * nx, y: impulseScalar * ny };

        ci.velocity.x -= impulse.x * invMass1;
        ci.velocity.y -= impulse.y * invMass1;
        cj.velocity.x += impulse.x * invMass2;
        cj.velocity.y += impulse.y * invMass2;

        const torque1 = r1.x * impulse.y - r1.y * impulse.x;
        const torque2 = r2.x * impulse.y - r2.y * impulse.x;

        ci.angularVelocity -= torque1 * invI1;
        cj.angularVelocity += torque2 * invI2;
    }

    private resolveCircleRect(circle: Circle, rect: Rectangle): void {
        const rectRot = this.deg2Rad(rect.owner.rotation);
        const cos = Math.cos(-rectRot);
        const sin = Math.sin(-rectRot);
        const dx = circle.owner.x - rect.owner.x;
        const dy = circle.owner.y - rect.owner.y;

        const localX = dx * cos - dy * sin;
        const localY = dx * sin + dy * cos;

        const halfW = rect.width / 2;
        const halfH = rect.height / 2;

        const closestX = this.clamp(localX, -halfW, halfW);
        const closestY = this.clamp(localY, -halfH, halfH);

        const diffX = localX - closestX;
        const diffY = localY - closestY;
        const distSq = diffX * diffX + diffY * diffY;

        if (distSq > circle.radius * circle.radius) return;

        const localNormal = distSq > 0.0001
            ? { x: diffX / Math.sqrt(distSq), y: diffY / Math.sqrt(distSq) }
            : { x: 0, y: 0 };

        // 如果在矩形内部，使用最接近的边法向量
        if (distSq <= 0.0001) {
            const left = Math.abs(localX + halfW);
            const right = Math.abs(localX - halfW);
            const top = Math.abs(localY + halfH);
            const bottom = Math.abs(localY - halfH);
            const min = Math.min(left, right, top, bottom);

            if (min === left) { localNormal.x = -1; localNormal.y = 0; }
            else if (min === right) { localNormal.x = 1; localNormal.y = 0; }
            else if (min === top) { localNormal.x = 0; localNormal.y = -1; }
            else { localNormal.x = 0; localNormal.y = 1; }
        }

        const worldNormal = this.rotate(localNormal, rectRot);
        const worldNormalLen = Math.hypot(worldNormal.x, worldNormal.y) || 1;
        const nx = worldNormal.x / worldNormalLen;
        const ny = worldNormal.y / worldNormalLen;

        const overlap = circle.radius - Math.sqrt(distSq || 0.0001);
        const totalMass = circle.mass + rect.mass;
        const circleMove = (rect.mass / totalMass) * overlap;
        const rectMove = (circle.mass / totalMass) * overlap;

        circle.owner.x += nx * circleMove;
        circle.owner.y += ny * circleMove;
        rect.owner.x -= nx * rectMove;
        rect.owner.y -= ny * rectMove;

        const contact1: Vec2 = { x: circle.owner.x, y: circle.owner.y };
        const contact2: Vec2 = { x: rect.owner.x + nx * (rect.width * 0.5), y: rect.owner.y + ny * (rect.height * 0.5) };

        const r1 = this.sub(contact1, { x: circle.owner.x, y: circle.owner.y });
        const r2 = this.sub(contact2, { x: rect.owner.x, y: rect.owner.y });

        const v1Contact = this.add(circle.velocity, this.rotatePerp(r1, circle.angularVelocity));
        const v2Contact = this.add(rect.velocity, this.rotatePerp(r2, rect.angularVelocity));

        const rvx = v2Contact.x - v1Contact.x;
        const rvy = v2Contact.y - v1Contact.y;
        const velAlongNormal = rvx * nx + rvy * ny;

        if (velAlongNormal > 0) return;

        const restitution = Math.min(circle.restitution, rect.restitution);
        const invMass1 = 1 / circle.mass;
        const invMass2 = 1 / rect.mass;
        const invI1 = 1 / this.getCircleInertia(circle);
        const invI2 = 1 / this.getRectInertia(rect);

        const r1CrossN = r1.x * ny - r1.y * nx;
        const r2CrossN = r2.x * ny - r2.y * nx;

        const denom = invMass1 + invMass2 + (r1CrossN * r1CrossN) * invI1 + (r2CrossN * r2CrossN) * invI2;
        const impulseScalar = (-(1 + restitution) * velAlongNormal) / denom;

        const impulse = { x: impulseScalar * nx, y: impulseScalar * ny };

        circle.velocity.x -= impulse.x * invMass1;
        circle.velocity.y -= impulse.y * invMass1;
        rect.velocity.x += impulse.x * invMass2;
        rect.velocity.y += impulse.y * invMass2;

        const torque1 = r1.x * impulse.y - r1.y * impulse.x;
        const torque2 = r2.x * impulse.y - r2.y * impulse.x;

        circle.angularVelocity -= torque1 * invI1;
        rect.angularVelocity += torque2 * invI2;
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

            if (overlap <= 0) {
                return;
            }

            if (overlap < bestOverlap) {
                bestOverlap = overlap;
                bestAxis = axis;
                axisFound = true;
            }
        }

        if (!axisFound) return;

        const centerDelta = { x: b.owner.x - a.owner.x, y: b.owner.y - a.owner.y };
        if (this.dot(centerDelta, bestAxis) < 0) {
            bestAxis.x *= -1;
            bestAxis.y *= -1;
        }

        const totalMass = a.mass + b.mass;
        const aMove = (b.mass / totalMass) * bestOverlap;
        const bMove = (a.mass / totalMass) * bestOverlap;

        a.owner.x -= bestAxis.x * aMove;
        a.owner.y -= bestAxis.y * aMove;
        b.owner.x += bestAxis.x * bMove;
        b.owner.y += bestAxis.y * bMove;

        const contactA = this.average(verticesA);
        const contactB = this.average(verticesB);
        const rA = this.sub(contactA, { x: a.owner.x, y: a.owner.y });
        const rB = this.sub(contactB, { x: b.owner.x, y: b.owner.y });

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

        const rACrossN = rA.x * bestAxis.y - rA.y * bestAxis.x;
        const rBCrossN = rB.x * bestAxis.y - rB.y * bestAxis.x;

        const denom = invMassA + invMassB + (rACrossN * rACrossN) * invIA + (rBCrossN * rBCrossN) * invIB;
        const impulseScalar = (-(1 + restitution) * velAlongNormal) / denom;
        const impulse = { x: impulseScalar * bestAxis.x, y: impulseScalar * bestAxis.y };

        a.velocity.x -= impulse.x * invMassA;
        a.velocity.y -= impulse.y * invMassA;
        b.velocity.x += impulse.x * invMassB;
        b.velocity.y += impulse.y * invMassB;

        const torqueA = rA.x * impulse.y - rA.y * impulse.x;
        const torqueB = rB.x * impulse.y - rB.y * impulse.x;

        a.angularVelocity -= torqueA * invIA;
        b.angularVelocity += torqueB * invIB;
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
}