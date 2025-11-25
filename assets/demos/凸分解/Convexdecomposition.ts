export interface V2 {
    x: number,
    y: number
}

export class Convexdecomposition {

    /**
     * 将非凸多边形分割成凸多边形
     * @param vertices 非凸多边形的顶点，按顺时针顺序
     * @param holeVertices 孔洞数组，默认 null
     * @param scale [可选] 原用于在Box2D中绘制形状的比例。越大，精度越好。默认值为30。
     * @return 返回凸分解多边形顶点
     * */
    public static separate(vertices: V2[], holeVertices: V2[][] = null, scale: number = 30, mergedHoleVertices: V2[] = null): V2[][] {
        // 缩放多边形顶点，使用新的数组储存
        const scaleVertices: V2[] = [];
        for (let i = 0, n = vertices.length; i < n; i++) {
            scaleVertices[i] = { x: vertices[i].x * scale, y: vertices[i].y * scale };
        }

        if (holeVertices) {
            // 缩放孔洞顶点，使用新的数组储存
            const scaleHoleVertices: V2[][] = [];
            for (let i = 0, n = holeVertices.length; i < n; i++) {
                const vec1 = holeVertices[i];
                const vec2 = [];
                for (let j = 0, m = vec1.length; j < m; j++)  {
                    vec2[j] = { x: vec1[j].x * scale, y: vec1[j].y * scale };
                }
                scaleHoleVertices[i] = vec2;
            }

            // 合并孔洞
            const vectors = this.mergeHoles(scaleVertices, scaleHoleVertices).map((v:V2) => { return { x: v.x / scale, y: v.y / scale } });

            // 输出合并孔洞后的顶点数组
            mergedHoleVertices.push(...vectors);
        }
        return null;
    }

}