const { regClass, property } = Laya;


export class Intersection {

    /** 获取两线的交点 */
    public static getIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): { x: number, y: number }[] {
        // o12 为两线段的起始点两减，即p3-p1
        let o12x: number = x3 - x1, o12y: number = y3 - y1;
        // d1，d2 为两线段的末点减起始点，即 d1=p2-p1, d2=p4-p3
        let d1x: number = x2 - x1, d1y: number = y2 - y1;
        let d2x: number = x4 - x3, d2y: number = y4 - y3;

        // 行列式
        // |o12x -d2x|
        // |o12y -d2y|
        // ------------ = t1 = (o12x*-d2y+d2x*o12y)/(d1x*-d2y+d2x*d1y)
        // |d1x -d2x|
        // |dly -d2y|
        let t1: number = (o12x * -d2y + d2x * o12y) / (d1x * -d2y + d2x * d1y);

        // 行列式
        // |d1x o12x|
        // |d1y o12y|
        // ---------- = t2 = (d1x*o12y-o12x*d1y)/(d1x*-d2y+d2x*d1y)
        // |d1x -d2x|
        // |d1y -d2y|
        let t2: number = (d1x * o12y - o12x * d1y) / (d1x * -d2y + d2x * d1y);

        // 交点（两个点理论上是一致的）
        let it1 = { x: x1 + d1x * t1, y: y1 + d1y * t1 };
        let it2 = { x: x3 + d2x * t2, y: y3 + d2y * t2 };

        return [it1, it2];
    }

}