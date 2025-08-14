export interface V2 {
    x: number,
    y: number
}

export class Curve {

    public static createCurve(vertices: V2[], curveRatio: number = 0.1, isClosed: boolean = false): V2[] {
        let n: number = vertices.length, n2: number = 2 * n;
        let i0: number, i: number, i1: number;
        let ePts: V2[] = [], curvePts: V2[], ctrlPts: V2[];
        let mid: V2, tempV: V2;
        let ox: number, oy: number, ei: number, ei1: number, dx: number, dy: number;
        let u: number, px: number, py: number;

        // 控制点收缩系数 ，经调试0.6较好
        const scale: number = 0.6;

        // 生成中点
        let mids: V2[] = [];
        for (i = 0; i < n; i++) {
            i1 = (i + 1) % n;
            mids[i] = {
                x: (vertices[i].x + vertices[i1].x) * 0.5,
                y: (vertices[i].y + vertices[i1].y) * 0.5
            };
        }
        // 平移中点 
        for (i = 0; i < n2; i++) ePts[i] = { x: 0, y: 0 };

        for (i = 0; i < n; i++) {
            i0 = (i + n - 1) % n;
            i1 = (i + 1) % n;

            mid = {
                x: (mids[i].x + mids[i0].x) * 0.5,
                y: (mids[i].y + mids[i0].y) * 0.5
            };

            ox = (vertices[i].x - mid.x) | 0;
            oy = (vertices[i].y - mid.y) | 0;

            ei = 2 * i;
            ePts[ei].x = mids[i0].x + ox;
            ePts[ei].y = mids[i0].y + oy;

            // 朝 vertices[i]方向收缩
            dx = ((ePts[ei].x - vertices[i].x) * scale) | 0;
            dy = ((ePts[ei].y - vertices[i].y) * scale) | 0;
            ePts[ei].x = vertices[i].x + dx;
            ePts[ei].y = vertices[i].y + dy;

            ei1 = (ei + 1) % (2 * n);
            ePts[ei1].x = mids[i].x + ox;
            ePts[ei1].y = mids[i].y + oy;

            // 朝 vertices[i]方向收缩
            dx = ((ePts[ei1].x - vertices[i].x) * scale) | 0;
            dy = ((ePts[ei1].y - vertices[i].y) * scale) | 0;
            ePts[ei1].x = vertices[i].x + dx;
            ePts[ei1].y = vertices[i].y + dy;

        }
        curvePts = [];
        ctrlPts = [];
        //  生成4控制点，产生贝塞尔曲线
        for (i = 0; i < n; i++) {
            if (!isClosed && i >= n - 1) break;
            ctrlPts[0] = vertices[i];
            ei = 2 * i;
            ctrlPts[1] = ePts[ei + 1];
            ei1 = (ei + 2) % (2 * n);
            ctrlPts[2] = ePts[ei1];
            i1 = (i + 1) % n;
            ctrlPts[3] = vertices[i1];
            u = 1.0;
            while (u >= 0) {
                px = (this.bezier3funcX(u, ctrlPts)) | 0;
                py = (this.bezier3funcY(u, ctrlPts)) | 0;
                // u的步长决定曲线的疏密  
                u -= curveRatio;
                tempV = { x: px, y: py };
                // 存入曲线点
                curvePts.push(tempV);
            }
        }
        return curvePts;
    }

    /** 三次贝塞尔x */
    private static bezier3funcX(uu: number, controlP: V2[]): number {
        let part0: number = controlP[0].x * uu * uu * uu;
        let part1: number = 3 * controlP[1].x * uu * uu * (1 - uu);
        let part2: number = 3 * controlP[2].x * uu * (1 - uu) * (1 - uu);
        let part3: number = controlP[3].x * (1 - uu) * (1 - uu) * (1 - uu);
        return part0 + part1 + part2 + part3;
    }

    /** 三次贝塞尔y */
    private static bezier3funcY(uu: number, controlP: V2[]): number {
        let part0: number = controlP[0].y * uu * uu * uu;
        let part1: number = 3 * controlP[1].y * uu * uu * (1 - uu);
        let part2: number = 3 * controlP[2].y * uu * (1 - uu) * (1 - uu);
        let part3: number = controlP[3].y * (1 - uu) * (1 - uu) * (1 - uu);
        return part0 + part1 + part2 + part3;
    }
}