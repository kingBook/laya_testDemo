
/** 凸分解 */
export class Convexdecomposition {

    public static testMergedHoleVertices: Laya.IV2[] = [];

    /**
     * 将非凸多边形分割成凸多边形
     * @param vertices 凹多边形的顶点（顺时针顺序）
     * @param holeVertices [可选] 孔洞顶点（顺时针顺序）
     * @param scale [可选] 原用于在Box2D中绘制形状的比例。越大，精度越高。默认值为30。
     * @return 返回 凸分解后各个多边形的顶点
     * */
    public static separate(vertices: Laya.IV2[], holeVertices?: Laya.IV2[][], scale: number = 30): Laya.IV2[][] {
        // 缩放多边形顶点
        let scaleVertices: Laya.IV2[] = [];
        for (let i = 0, n = vertices.length; i < n; i++) {
            scaleVertices[i] = {
                x: vertices[i].x * scale,
                y: vertices[i].y * scale
            };
        }


        const scaleHoleVertices: Laya.IV2[][] = [];
        if (holeVertices) {
            // 缩放孔洞顶点
            for (let i = 0, n = holeVertices.length; i < n; i++) {
                const vec1 = holeVertices[i];
                const vec2 = [];
                for (let j = 0, m = vec1.length; j < m; j++) {
                    vec2[j] = {
                        x: vec1[j].x * scale,
                        y: vec1[j].y * scale
                    };
                }
                scaleHoleVertices[i] = vec2;
            }

            // 合并孔洞
            scaleVertices = this.mergeHolesToPolygon(scaleVertices, scaleHoleVertices);
            this.testMergedHoleVertices = scaleVertices.map(v => {
                return {
                    x: v.x / scale,
                    y: v.y / scale
                };
            });
            console.log("测试合并孔洞结果 this.testMergedHoleVertices", this.testMergedHoleVertices);
        }

        // 凸分解
        const figs: Laya.IV2[][] = this.calcShapes(scaleVertices, scaleHoleVertices);
        // 还原缩放
        for (let i = 0, n = figs.length; i < n; i++) {
            const fig = figs[i];
            for (let j = 0, m = fig.length; j < m; j++) {
                // 此代码会出错
                // fig[j].x /= scale;
                // fig[j].y /= scale;
                fig[j] = { x: fig[j].x / scale, y: fig[j].y / scale };
            }
        }

        throw new Error(`测试合并孔洞结果`);
        return figs;
    }

    /**
     * 合并孔洞到多边形
     * @param vertices 凹多边形顶点（顺时针顺序）
     * @param holeVertices 孔洞顶点（顺时针顺序）
     * @param output 输出-合并孔洞后的多边形顶点
     * @returns 返回-合并孔洞后的多边形顶点
     */
    public static mergeHolesToPolygon(vertices: Laya.IV2[], holeVertices: Laya.IV2[][], output?: Laya.IV2[]): Laya.IV2[] {
        let i: number, j: number, k: number, h: number, n: number, m: number, u: number;
        let j1: number, k1: number;
        let h1: number, h2: number;
        let vec: Laya.IV2[], v: Laya.IV2, p: Laya.IV2, v1: Laya.IV2, v2: Laya.IV2;
        let isIntersect: boolean;

        output ||= [];
        output.length = 0;
        u = vertices.length;
        for (k = 0; k < u; k++) output[k] = { x: vertices[k].x, y: vertices[k].y };

        n = holeVertices.length;
        for (i = 0; i < n; i++) {
            vec = holeVertices[i];

            m = vec.length;

            // j1,k1 孔洞与多边形分割线顶点索引
            j1 = k1 = -1;

            // 孔洞顶点遍历
            for (j = 0; j < m; j++) {
                v = vec[j];

                // 多边形顶点遍历
                u = output.length;
                for (k = 0; k < u; k++) {
                    p = output[k];

                    // 与孔洞相交检测
                    isIntersect = false;
                    for (h = 0; h < m; h++) {
                        h1 = h;
                        h2 = (h < m - 1 ? h + 1 : h + 1 - m);

                        // 与当前孔洞顶点相邻的边，不检测
                        if (h1 == j || h2 == j) continue;

                        v1 = vec[h1];
                        v2 = vec[h2];

                        console.log("与孔洞相交", "h:", h, "j:", j, "k:", k, "hitSegment:", this.hitSegment(v.x, v.y, p.x, p.y, v1.x, v1.y, v2.x, v2.y));
                        // 与孔洞相交
                        if (this.hitSegment(v.x, v.y, p.x, p.y, v1.x, v1.y, v2.x, v2.y)) {
                            isIntersect = true;
                            break;
                        }
                    }

                    // 与孔洞相交，当前多边形顶点与孔洞顶点不适合
                    if (isIntersect) continue;

                    // 与多边形相交检测
                    for (h = 0; h < u; h++) {
                        h1 = h;
                        h2 = (h < u - 1 ? h + 1 : h + 1 - u);

                        // 与当前多边形顶点相邻的边，不检测
                        if (h1 == k || h2 == k) continue;

                        v1 = output[h1];
                        v2 = output[h2];

                        console.log("与多边形相交检测：", "h:", h, "j:", j, "k:", k, "hitSegment:", this.hitSegment(v.x, v.y, p.x, p.y, v1.x, v1.y, v2.x, v2.y));
                        // 与多边形相交
                        if (this.hitSegment(v.x, v.y, p.x, p.y, v1.x, v1.y, v2.x, v2.y)) {
                            isIntersect = true;
                            break;
                        }
                    }

                    // 与多边形相交，当前多边形顶点与孔洞顶点不适合
                    if (isIntersect) continue;

                    if (!isIntersect) {
                        // j1,k1 孔洞与多边形分割线顶点索引
                        j1 = j; // 孔洞索引
                        k1 = k; // 多边形索引
                        break;
                    }
                }
                // 找到合适的分割线，打断孔洞遍历循环
                if (j1 > -1 && k1 > -1) break;
            }
            // console.log("i:", i);
            // console.log("k1:", k1, "j1:", j1,);
            // output.forEach((item, id) => { console.log(`output1 id:${id}, x:${item.x}, y:${item.y}`) });
            // console.log("m:", m);

            // 找到合适的分割线，合并孔洞
            if (j1 > -1 && k1 > -1) {
                j = j1;
                k = 0;
                while (true) {
                    k++;
                    console.log(`j:${j}, x:${vec[j].x}, y:${vec[j].y}`);

                    output.splice(k1 + k, 0, { x: vec[j].x, y: vec[j].y });
                    if (k > m) {
                        output.splice(k1 + k + 1, 0, { x: output[k1].x, y: output[k1].y });
                        break;
                    }
                    if (j - 1 < 0) j = m - 1;
                    else j--;
                }
            } else {
                console.error("合并孔洞时，未能找到合适的分割线");
            }
            output.forEach((item, id) => { console.log(`output2 id:${id}, x:${item.x}, y:${item.y}`) });
        }
        return output;
    }

    /**
     * 计算分解形状
     * @param vertices 待分解的凹多边形顶点（顺时针排序）
     * @param holeVertices 孔洞顶点（顺时针顺序）
     * @returns 返回一个二维数组，每一个子列表表示一个凸多边形
     */
    private static calcShapes(vertices: Laya.IV2[], holeVertices: Laya.IV2[][]): Laya.IV2[][] {
        let vec: Laya.IV2[];
        let i: number, j: number, k: number, k1: number, n: number;
        let c: number, c2: number;
        let i1: number, i2: number, i3: number, p1: Laya.IV2, p2: Laya.IV2, p3: Laya.IV2;
        let d: number, d1: number, d2: number;
        let isConvex: boolean;
        let isIntersect: boolean;
        let isHolePoint: boolean;
        let isInside: boolean;
        let figsVec: Laya.IV2[][] = [], queue: Laya.IV2[][] = [];
        let v: Laya.IV2, v1: Laya.IV2, v2: Laya.IV2;
        let holeVec: Laya.IV2[];
        let hit: Laya.IV2;

        queue.push(vertices);

        while (queue.length) {
            vec = queue[0];
            c = vec.length;
            isConvex = true;

            for (i = 0; i < c; i++) {
                i1 = (i - 1 + c) % c;
                i2 = i;
                i3 = (i + 1) % c;

                p1 = vec[i1]; // 上个点
                p2 = vec[i2]; // 当前点
                p3 = vec[i3]; // 下个点

                d = this.det(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y); // 叉积 axb (a=p2-p1, b=p3-p1)
                console.log(i, d);

                if (d < 0) {
                    isConvex = false; // 凹点

                    // 找与凹点相连不相交且在内部的顶点
                    for (j = 0; j < c; j++) {
                        console.log(j);
                        if (j == i1 || j == i2 || j == i3) continue; // 跳过相邻、相同点
                        v = vec[j];

                        // 相交检测
                        isIntersect = false;
                        for (k = 0; k < c; k++) {
                            k1 = (i + 1) % c;
                            v1 = vec[k];
                            v2 = vec[k1];
                            hit = this.hitSegment(p2.x, p2.y, v.x, v.y, v1.x, v1.y, v2.x, v2.y);
                            if (hit && !this.pointsMatch(hit.x, hit.y, v1.x, v1.y) && !this.pointsMatch(hit.x, hit.y, v2.x, v2.y)) {
                                isIntersect = true; // 相交
                                break;
                            }
                            if (isIntersect) break;
                        }
                        if (isIntersect) {
                            console.warn("跳过相交点", i2, j, k, k1);
                            continue; // 跳过相交点
                        }

                        // 孔洞点检测
                        isHolePoint = false;
                        for (k = 0, c = holeVertices.length; k < c; k++) {
                            holeVec = holeVertices[k];
                            for (n = 0, c2 = holeVec.length; n < c2; n++) {
                                v1 = holeVec[n];
                                if (this.pointsMatch(v.x, v.y, v1.x, v1.y)) {
                                    isHolePoint = true;
                                    break;
                                }
                            }
                            if (isHolePoint) break;
                        }
                        if (isHolePoint) {
                            console.warn("跳过孔洞点", i2, j);
                            continue; // 跳过孔洞点
                        }

                        // 凹点与顶点连线，是否在多边形内部
                        isInside = true;
                        d1 = this.det(p1.x, p1.y, v.x, v.y, p2.x, p2.y);
                        d2 = this.det(p2.x, p2.y, v.x, v.y, p3.x, p3.y);
                        if (d1 > 0 && d2 > 0) {
                            isInside = false;
                        }
                        if (!isInside) {
                            console.warn("跳过不在多边形内部的点", i2, j, d1, d2);
                            continue; // 跳过不在多边形内部的点
                        }

                        // 找到与凹点相连不相交且在内部的顶点
                        console.log("找到与凹点相连不相交且在内部的顶点", i2, j);

                        break;
                    }
                }
            }

            queue.shift(); // 移除首个
        }
        return figsVec;
    }

    /** 射线p1,p2与线段p3,p4的交点，交点必须在射线p1,p2外 */
    private static hitRay(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Laya.IV2 {
        let t1: number = x3 - x1, t2: number = y3 - y1, t3: number = x2 - x1, t4: number = y2 - y1,
            t5: number = x4 - x3, t6: number = y4 - y3, t7: number = t4 * t5 - t3 * t6, a: number;

        a = (t5 * t2 - t6 * t1) / t7;
        let px: number = x1 + a * t3, py: number = y1 + a * t4;
        // 交点必须在线段p1,p2延长线外
        let b1: boolean = this.isOnSegment(x2, y2, x1, y1, px, py);
        // 交点必须在线段p3,p4上
        let b2: boolean = this.isOnSegment(px, py, x3, y3, x4, y4);

        if (b1 && b2) return { x: px, y: py };

        return null;
    }

    /** 两线段的交点 */
    public static hitSegment(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): Laya.IV2 {
        let t1: number = x3 - x1, t2: number = y3 - y1, t3: number = x2 - x1, t4: number = y2 - y1,
            t5: number = x4 - x3, t6: number = y4 - y3, t7: number = t4 * t5 - t3 * t6, a: number;

        a = (t5 * t2 - t6 * t1) / t7;
        let px: number = x1 + a * t3, py: number = y1 + a * t4;
        // 交点在线段p1,p2上
        let b1: boolean = this.isOnSegment(px, py, x1, y1, x2, y2);
        // 交点在线段p3,p4上
        let b2: boolean = this.isOnSegment(px, py, x3, y3, x4, y4);

        if (b1 && b2) return { x: px, y: py };

        return null;
    }

    /** 点p是否在线段上，端点误差为0.1 */
    private static isOnSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): boolean {
        // px 在线段的x范围内
        let b1: boolean = ((x1 + 0.1 >= px && px >= x2 - 0.1) || (x1 - 0.1 <= px && px <= x2 + 0.1));
        // py 在线段的y范围内
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

    /** 点p是否在直线上 */
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

    /** p2在向量p1,p3的哪一侧，计算叉积 axb (a=p2-p1, b=p3-p1) */
    private static det(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1;
    }


}