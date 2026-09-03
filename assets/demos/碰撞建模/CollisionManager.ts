import { Circle } from "./Circle";

/** 碰撞管理器 */
export default class CollisionManager {

    private _circles: Circle[];

    public init(circles: Circle[]): void {
        this._circles = circles;
    }

    public update(): void {
        // 碰撞检测与响应
        for (let i = 0; i < this._circles.length; i++) {
            const ci = this._circles[i];

            for (let j = i + 1; j < this._circles.length; j++) {
                const cj = this._circles[j];

                const dx = cj.owner.x - ci.owner.x;
                const dy = cj.owner.y - ci.owner.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = ci.radius + cj.radius;

                if (distance >= minDistance) continue;

                // 碰撞法线 n = (dx, dy) / |d|
                const nx = distance === 0 ? 1 : dx / distance;
                const ny = distance === 0 ? 0 : dy / distance;

                // 1) 先分离重叠，避免两个圆卡住
                const overlap = minDistance - distance;
                const totalMass = ci.mass + cj.mass;
                const ciMove = (cj.mass / totalMass) * overlap;
                const cjMove = (ci.mass / totalMass) * overlap;

                ci.owner.x -= nx * ciMove;
                ci.owner.y -= ny * ciMove;
                cj.owner.x += nx * cjMove;
                cj.owner.y += ny * cjMove;

                // 2) 计算相对速度在法线方向上的分量
                const relVelX = cj.velocity.x - ci.velocity.x;
                const relVelY = cj.velocity.y - ci.velocity.y;
                const velAlongNormal = relVelX * nx + relVelY * ny;

                // 如果它们正在分离，不再施加碰撞冲量
                if (velAlongNormal > 0) continue;

                const restitution = Math.min(ci.restitution, cj.restitution);
                const impulse = (-(1 + restitution) * velAlongNormal) / (1 / ci.mass + 1 / cj.mass);

                const impulseX = impulse * nx;
                const impulseY = impulse * ny;

                ci.velocity.x -= impulseX / ci.mass;
                ci.velocity.y -= impulseY / ci.mass;
                cj.velocity.x += impulseX / cj.mass;
                cj.velocity.y += impulseY / cj.mass;
            }
        }
    }

}