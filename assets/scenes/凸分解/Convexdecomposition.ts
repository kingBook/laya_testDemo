export interface V2 {
    x: number,
    y: number
}

export class Convexdecomposition {

    public static separate(vertices: V2[], holes: V2[][] = null, scale: number = 30): V2[][] {
        let i: number, n: number = vertices.length, j: number = 0, m: number = 0;
        let vec: V2[] = [], figs: V2[][];

        for (i = 0; i < n; i++) vec.push({ x: vertices[i].x * scale, y: vertices[i].y * scale });

        console.time("calcShapes");
        figs = this.calcShapes(vec);
        console.timeEnd("calcShapes");

        n = figs.length;
        for (i = 0; i < n; i++) {
            vec = figs[i];
            m = vec.length;
            for (j = 0; j < m; j++) {
                vec[j].x /= scale;
                vec[j].y /= scale;
            }
        }
        return figs;
    }

    private static calcShapes(vertices: V2[]): V2[][] {
        //console.log(this.det(vertices[0].x, vertices[0].y, vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y));
        let i: number, n: number = vertices.length;
        let d: number;
        let i1: number, i2: number, i3: number, p1: V2, p2: V2, p3: V2;
        let figs: V2[][] = [];
        let isConvex: boolean;

        for (i = 0; i < n; i++) {
            isConvex = true;

            i1 = i;
            i2 = (i < n - 1 ? i + 1 : i + 1 - n);
            i3 = (i < n - 2 ? i + 2 : i + 2 - n);

            p1 = vertices[i1];
            p2 = vertices[i2];
            p3 = vertices[i3];

            d = this.det(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
            if (d < 0) {
                isConvex = false;
            }
        }

        return figs;
    }

    private static hitRay(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): V2 {
        let t1: number = x3 - x1, t2: number = y3 - y1, t3: number = x2 - x1, t4: number = y2 - y1,
            t5: number = x4 - x3, t6: number = y4 - y3, t7: number = t4 * t5 - t3 * t6, a: number;

        a = (t5 * t2 - t6 * t1) / t7;
        let px: number = x1 + a * t3, py: number = y1 + a * t4;
        let b1: boolean = this.isOnSegment(x2, y2, x1, y1, px, py);
        let b2: boolean = this.isOnSegment(px, py, x3, y3, x4, y4);

        if (b1 && b2) return { x: px, y: py };

        return null;
    }

    private static hitSegment(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): V2 {
        let t1: number = x3 - x1, t2: number = y3 - y1, t3: number = x2 - x1, t4: number = y2 - y1,
            t5: number = x4 - x3, t6: number = y4 - y3, t7: number = t4 * t5 - t3 * t6, a: number;

        a = (t5 * t2 - t6 * t1) / t7;
        let px: number = x1 + a * t3, py: number = y1 + a * t4;
        let b1: boolean = this.isOnSegment(px, py, x1, y1, x2, y2);
        let b2: boolean = this.isOnSegment(px, py, x3, y3, x4, y4);

        if (b1 && b2) return { x: px, y: py };

        return null;
    }

    /** 点p是否与线段任意一个端点重合，误差为0.1 */
    private static isOnSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
        // 与端点1重合
        let b1: boolean = ((x1 + 0.1 >= px && px >= x2 - 0.1) || (x1 - 0.1 <= px && px <= x2 + 0.1));
        // 与端点2重合
        let b2: boolean = ((y1 + 0.1 >= py && py >= y2 - 0.1) || (y1 - 0.1 <= py && py <= y2 + 0.1));
        return (b1 && b2 && this.isOnLine(px, py, x1, y1, x2, y2));
    }

    /** 两个点是否重合 */
    private static pointsMatch(x1: number, y1: number, x2: number, y2: number): boolean {
        // dx: 距离x, dy: 距离y
        let dx: number = (x2 >= x1 ? x2 - x1 : x1 - x2), dy: number = (y2 >= y1 ? y2 - y1 : y1 - y2);
        // 距离都小于0.1，则视为重合
        return (dx < 0.1 && dy < 0.1);
    }

    /** 点p是否在线段上 */
    private static isOnLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
        // 线段长度大于0.1时
        if (x2 - x1 > 0.1 || x1 - x2 > 0.1) {
            // a: 线段斜率, possibleY：竖直方向经过点p与线段的交点的y, diff:交点的y与点p的y的距离
            let a: number = (y2 - y1) / (x2 - x1), possibleY: number = a * (px - x1) + y1, diff: number = (possibleY > py ? possibleY - py : py - possibleY);
            return (diff < 0.1);
        }
        // 点与线段端点1重合，距离小于0.1，则点在线段上
        return (px - x1 < 0.1 || x1 - px < 0.1);
    }

    /** 计算 axb 叉积, a=p2-p1, b=p3-p1 */
    private static det(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1;
    }

}