/** 顶点数据结构 */
export interface V2 {
    x: number,
    y: number
}

/** 凸分解 */
export class Convexdecomposition {

    /**
     * 将非凸多边形分割成凸多边形
     * @param vertices 凹多边形的顶点（顺时针顺序）
     * @param holeVertices [可选] 孔洞顶点（顺时针顺序）
     * @param scale [可选] 原用于在Box2D中绘制形状的比例。越大，精度越高。默认值为30。
     * @return 返回 { vertices：凸分解后的多边形顶点, holeVertices: 合并后的孔洞顶点 }
     * */
    public static separate(vertices: V2[], holeVertices?: V2[][], scale: number = 30): { vertices: V2[][], holeVertices: V2[][] } {
        // 缩放多边形顶点
        const scaleVertices: V2[] = [];
        for (let i = 0, n = vertices.length; i < n; i++) {
            scaleVertices[i] = {
                x: vertices[i].x * scale,
                y: vertices[i].y * scale
            };
        }

        let resultVertices: V2[][], resultHoleVertices: V2[][];

        if (holeVertices) {
            // 缩放孔洞顶点
            const scaleHoleVertices: V2[][] = [];
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
            resultHoleVertices = this.mergeHoles(scaleVertices, scaleHoleVertices, scale);/*.map((v: V2) => {
                return {
                    x: v.x / scale,
                    y: v.y / scale
                };
            });*/
        }
        return { vertices: resultVertices, holeVertices: resultHoleVertices };
    }

    /**
     * 合并孔洞
     * @param vertices 凹多边形顶点（顺时针顺序）
     * @param holeVertices 孔洞顶点（顺时针顺序）
     * @param scale [可选] 原用于在Box2D中绘制形状的比例。越大，精度越高。默认值为30。
     * @returns 
     */
    private static mergeHoles(vertices: V2[], holeVertices: V2[][], scale: number = 30): V2[][] {
        // 1. 多个孔洞合并为一个
        
        // 2. 凹多边与孔洞合并为一个
        return null;
    }

}