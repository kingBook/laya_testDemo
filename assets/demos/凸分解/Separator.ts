

export class Separator {


    /**
     * 将非凸多边形分割成凸多边形
     * 
     * 有一些你应该遵守的规则(否则你可能会得到意想不到的结果) :
     * * 该类专门用于非凸多边形。如果你想创建一个凸多边形，你不需要使用这个类
     * * 顶点必须按顺时针顺序排列
     * * 没有三个相邻的点位于同一线段上
     * * 不得有重叠部分和“洞”
     * @param verticesVec 非凸多边形的顶点，按顺时针顺序
     * @param scale [可选] 原用于在Box2D中绘制形状的比例。越大，精度越好。默认值为30。
     * @return 返回凸分解多边形顶点
     * */
    public static separate(verticesVec: Laya.IV2[], scale: number = 30): Laya.IV2[][] {
        let i: number, n: number, j: number = 0, m: number = 0;
        let vec: Laya.IV2[] = [], figs: Laya.IV2[][];

        // 缩放多边形顶点，使用新的数组储存
        n = verticesVec.length;
        for (i = 0; i < n; i++) vec[i] = { x: verticesVec[i].x * scale, y: verticesVec[i].y * scale };

        // 凸分解
        figs = this.calcShapes(vec);

        // 新数组储存凸分解后的多边形
        for (i = 0, n = figs.length; i < n; i++) {
            vec = figs[i];
            m = vec.length;
            for (j = 0; j < m; j++) {
                // 此代码会出错
                //vec[j].x /= scale;
                //vec[j].y /= scale;

                vec[j] = { x: vec[j].x / scale, y: vec[j].y / scale };
            }
        }
        return figs;
    }

    /**
     * 检查{@link verticesVec}中的顶点确保没有重叠的线段，并且顶点按顺时针方向排列
     * * 建议您仅将此方法用于调试，因为它可能会消耗更多的CPU资源
     * 
     * @param verticesVec 要验证的顶点
     * @return 一个整数，有以下的值：
     * * 0 顶点可以被适当地处理
     * * 1 有重叠的线
     * * 2 这些点不是按顺时针顺序排列的
     * * 3 有重叠的线，并且点不是按顺时针顺序排列的
     * */
    public static validate(verticesVec: Laya.IV2[]): { value: number, msg: string } {
        let i: number = 0, n: number = verticesVec.length, j: number = 0, j2: number = 0, i2: number = 0, i3: number = 0, d: number, ret: number = 0;
        let fl: boolean, fl2: boolean = false;

        for (i = 0; i < n; i++) {
            i2 = (i < n - 1 ? i + 1 : 0);
            i3 = (i > 0 ? i - 1 : n - 1);

            fl = false;
            for (j = 0; j < n; j++) {
                if (j != i && j != i2) {
                    if (!fl) {
                        d = this.det(verticesVec[i].x, verticesVec[i].y, verticesVec[i2].x, verticesVec[i2].y, verticesVec[j].x, verticesVec[j].y);
                        if (d > 0) fl = true;
                    }

                    if (j != i3) {
                        j2 = (j < n - 1 ? j + 1 : 0);
                        if (this.hitSegment(verticesVec[i].x, verticesVec[i].y, verticesVec[i2].x, verticesVec[i2].y, verticesVec[j].x, verticesVec[j].y, verticesVec[j2].x, verticesVec[j2].y))
                            ret = 1;
                    }
                }
            }

            if (!fl) fl2 = true;
        }

        if (fl2) {
            if (ret == 1) ret = 3;
            else ret = 2;
        }

        const output = { value: ret, msg: "" };
        switch (ret) {
            case 0:
                output.msg = "0, 顶点可以被适当地处理";
                break;
            case 1:
                output.msg = "1, 有重叠的线";
                break;
            case 2:
                output.msg = "2, 这些点不是按顺时针顺序排列的";
                break;
            case 3:
                output.msg = "3, 有重叠的线，并且点不是按顺时针顺序排列的";
                break;
        }
        return output;
    }

    /**
     * 计算分解形状
     * @param verticesVec 待分解的凹多边形顶点（顺时针排序）
     * @returns 返回一个二维数组，每一个子列表表示一个凸多边形
     */
    private static calcShapes(verticesVec: Laya.IV2[]): Laya.IV2[][] {
        let vec: Laya.IV2[];
        let i: number = 0, n: number = 0, j: number = 0;
        let d: number, t: number, dx: number, dy: number, minLen: number;
        let i1: number = 0, i2: number = 0, i3: number = 0, p1: Laya.IV2, p2: Laya.IV2, p3: Laya.IV2;
        let j1: number = 0, j2: number = 0, v1: Laya.IV2, v2: Laya.IV2, k: number = 0, h: number = 0;
        let vec1: Laya.IV2[], vec2: Laya.IV2[];
        let v: Laya.IV2, hitV: Laya.IV2;
        let isConvex: boolean;
        let figsVec: Laya.IV2[][] = [], queue: Laya.IV2[][] = [];

        queue.push(verticesVec);

        while (queue.length) {
            vec = queue[0];
            n = vec.length;
            isConvex = true;

            for (i = 0; i < n; i++) {
                i1 = i;
                i2 = (i < n - 1 ? i + 1 : i + 1 - n);
                i3 = (i < n - 2 ? i + 2 : i + 2 - n);

                p1 = vec[i1];
                p2 = vec[i2];
                p3 = vec[i3];

                d = this.det(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
                if (d < 0) {
                    isConvex = false;
                    minLen = Number.MAX_VALUE;

                    for (j = 0; j < n; j++) {
                        if (j != i1 && j != i2) {
                            j1 = j;
                            j2 = (j < n - 1 ? j + 1 : 0);

                            v1 = vec[j1];
                            v2 = vec[j2];

                            v = this.hitRay(p1.x, p1.y, p2.x, p2.y, v1.x, v1.y, v2.x, v2.y);

                            if (v) {
                                dx = p2.x - v.x;
                                dy = p2.y - v.y;
                                t = dx * dx + dy * dy;

                                if (t < minLen) {
                                    h = j1;
                                    k = j2;
                                    hitV = v;
                                    minLen = t;
                                }
                            }
                            console.log("i:", i, "inetse:", !v);

                        }
                    }

                    if (minLen == Number.MAX_VALUE) this.err(verticesVec);

                    vec1 = [];
                    vec2 = [];

                    j1 = h;
                    j2 = k;
                    v1 = vec[j1];
                    v2 = vec[j2];

                    if (!this.pointsMatch(hitV.x, hitV.y, v2.x, v2.y)) vec1.push(hitV);
                    if (!this.pointsMatch(hitV.x, hitV.y, v1.x, v1.y)) vec2.push(hitV);

                    h = -1;
                    k = i1;
                    while (true) {
                        if (k != j2) vec1.push(vec[k]);
                        else {
                            if (h < 0 || h >= n) this.err(verticesVec);
                            if (!this.isOnSegment(v2.x, v2.y, vec[h].x, vec[h].y, p1.x, p1.y)) vec1.push(vec[k]);
                            break;
                        }

                        h = k;
                        if (k - 1 < 0) k = n - 1;
                        else k--;
                    }

                    vec1 = vec1.reverse();

                    h = -1;
                    k = i2;
                    while (true) {
                        if (k != j1) vec2.push(vec[k]);
                        else {
                            if (h < 0 || h >= n) this.err(verticesVec);
                            if (k == j1 && !this.isOnSegment(v1.x, v1.y, vec[h].x, vec[h].y, p2.x, p2.y)) vec2.push(vec[k]);
                            break;
                        }

                        h = k;
                        if (k + 1 > n - 1) k = 0;
                        else k++;
                    }

                    queue.push(vec1, vec2);
                    queue.shift();

                    break;
                }
            }

            if (isConvex) figsVec.push(queue.shift());
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

    /** p2在向量p1,p3的哪一侧，计算 axb 叉积, a=p2-p1, b=p3-p1 */
    private static det(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
        return x1 * y2 + x2 * y3 + x3 * y1 - y1 * x2 - y2 * x3 - y3 * x1;
    }

    private static err(verticesVec: Laya.IV2[]): void {
        const ret = this.validate(verticesVec);
        throw new Error(`出现了一个问题,${ret.msg}`);
    }

}