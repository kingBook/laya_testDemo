import * as poly2tri from "./poly2tri/poly2tri";

const { regClass, property, classInfo } = Laya;

@regClass()
export class Mesh2dGraphics extends Laya.Script {

    owner: Laya.Sprite;

    @property({ type: Laya.Material, tips: "材质" })
    public sharedMaterial: Laya.Material;

    private _cmds: IMesh2dGraphicsCmd[] = [];

    private _mesh2dRender: Laya.Mesh2DRender;

    public onAwake(): void {
        this._mesh2dRender ||= this.owner.getComponent(Laya.Mesh2DRender);
        this._mesh2dRender ||= this.owner.addComponent(Laya.Mesh2DRender);
        this._mesh2dRender.sharedMaterial = this.sharedMaterial;
    }

    /**
     * 清空绘制
     * @param isRemoveAllCmd [默认: false] 是否移除所有绘制命令
     */
    public clear(isRemoveAllCmd: boolean = false): void {
        if (isRemoveAllCmd) {
            this._cmds.length = 0;
        }

        const sharedMesh = this._mesh2dRender.sharedMesh;
        this._mesh2dRender.sharedMesh = null;

        // 销毁释放内存
        sharedMesh?.destroy();
    }

    /**
     * 添加绘制命令
     * @param cmd 要被添加的命令
     * @param index 可选）插入的索引
     * @returns 
     */
    public addCmd(cmd: IMesh2dGraphicsCmd, index?: number): void {
        if (index === undefined) {
            this._cmds.push(cmd);
            return;
        }

        this._cmds[index] = cmd;
    }

    /**
     * 移除绘制命令
     * @param cmd 要被移除的命令
     */
    public removeCmd(cmd: IMesh2dGraphicsCmd): void {
        const index = this._cmds.indexOf(cmd);

        if (index === -1) throw new Error("未找到旧的命令");

        this._cmds.splice(index, 1);
    }

    /**
     * 替换绘制命令
     * @param oldCmd 旧的命令
     * @param newCmd 新的命令
     */
    public replaceCmd(oldCmd: IMesh2dGraphicsCmd, newCmd: IMesh2dGraphicsCmd): void {
        const index = this._cmds.indexOf(oldCmd);

        if (index === -1) throw new Error("未找到旧的命令");

        this._cmds[index] = newCmd;
    }

    /**
     * 重绘
     */
    public repaint(): void {
        for (let i = 0, len = this._cmds.length; i < len; i++) {
            const cmd = this._cmds[i];
            cmd.run(this._mesh2dRender);
        }
    }
}

/**
 * Mesh2d 绘制命令接口
 */
export interface IMesh2dGraphicsCmd {

    /**
     * 运行
     * @param mesh2dRender 
     */
    run(mesh2dRender: Laya.Mesh2DRender): void;
}

/**
 * Mesh2d 画直线命令
 */
export class Mesh2dDrawLineCmd implements IMesh2dGraphicsCmd {

    /**
     * @en X-axis start position
     * @zh X轴起始位置
     */
    public fromX: number;

    /**
     * @en Y-axis start position
     * @zh Y轴起始位置
     */
    public fromY: number;

    /**
     * @en X-axis end position
     * @zh X轴结束位置
     */
    public toX: number;

    /**
     * @en Y-axis end position
     * @zh Y轴结束位置
     */
    public toY: number;

    /**
     * @en (Optional) Line width
     * @zh （可选）线条宽度
     */
    public lineWidth: number;


    public run(mesh2dRender: Laya.Mesh2DRender): void {
        const halfW = this.lineWidth / 2; // 线半宽

        const dy = this.toY - this.fromY;
        const dx = this.toX - this.fromX;

        const k = dy / dx; // 线斜率, 即: tanA, A=线与x的夹角
        const kn = -1 / k; // 垂直于线的法线斜率

        const radN = Math.atan(kn); // 法线弧度
        const radN2 = radN + Math.PI; // 反向法线弧度

        const vertices = new Float32Array(4 * 5);
        const indices = new Uint16Array(2 * 3);

        // 顺序为: 顶点(x,y,z)、 UV
        // 顶点排列顺序为：右上角开始，水平向右，垂直向下，顺时针
        let index = 0;
        vertices[index++] = this.fromX + halfW * Math.cos(radN); // vertex.x
        vertices[index++] = this.fromY + halfW * Math.sin(radN); // vertex.y
        vertices[index++] = 0; // vertex.z
        vertices[index++] = 0; // uv.x
        vertices[index++] = 0; // uv.y

        vertices[index++] = this.toX + halfW * Math.cos(radN); // vertex.x
        vertices[index++] = this.toY + halfW * Math.sin(radN); // vertex.y
        vertices[index++] = 0; // vertex.z
        vertices[index++] = 1; // uv.x
        vertices[index++] = 0; // uv.y

        vertices[index++] = this.toX + halfW * Math.cos(radN2); // vertex.x
        vertices[index++] = this.toY + halfW * Math.sin(radN2); // vertex.y
        vertices[index++] = 0; // vertex.z
        vertices[index++] = 1; // uv.x
        vertices[index++] = 1; // uv.y

        vertices[index++] = this.fromX + halfW * Math.cos(radN2); // vertex.x
        vertices[index++] = this.fromY + halfW * Math.sin(radN2); // vertex.y
        vertices[index++] = 0; // vertex.z
        vertices[index++] = 0; // uv.x
        vertices[index++] = 1; // uv.y

        // 三角形
        let triangleIndex = 0;
        indices[triangleIndex++] = 0;
        indices[triangleIndex++] = 1;
        indices[triangleIndex++] = 3;

        indices[triangleIndex++] = 1;
        indices[triangleIndex++] = 2;
        indices[triangleIndex++] = 3;

        const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, Laya.IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);

        const sharedMesh = mesh2dRender.sharedMesh;
        mesh2dRender.sharedMesh = mesh2D;

        // 销毁释放内存
        sharedMesh?.destroy();
    }
}

/**
 * Mesh2d 画折线命令
 */
export class Mesh2dDrawLinesCmd implements IMesh2dGraphicsCmd {

    /**
     * @en Collection of points for the line segments. Format: [x1,y1,x2,y2,x3,y3...]
     * @zh 线段的点集合。格式：[x1,y1,x2,y2,x3,y3...]
     */
    public points: number[];

    /**
     * @en (Optional) Line width
     * @zh （可选）线段宽度
     */
    public lineWidth: number;

    private _tempRectVertices: number[] = [];

    public run(mesh2dRender: Laya.Mesh2DRender): void {
        //console.log("Mesh2dDrawLinesCmd::run();");
        const halfW = this.lineWidth / 2; // 线半宽

        const segmentCount = this.points.length / 2 - 1; // 段数
        const vertices = new Float32Array(segmentCount * 4 * 5);
        const indices = new Uint16Array(segmentCount * 2 * 3);

        let index = 0, triangleIndex = 0;
        let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE; // 包围盒

        //console.log("points", this.points);

        for (let i = 0, len = this.points.length / 2 - 1; i < len; i++) {
            let tempI = i * 2;
            const fromX = this.points[tempI++];
            const fromY = this.points[tempI++];
            const toX = this.points[tempI++];
            const toY = this.points[tempI++];

            //console.log("i", i, "from", fromX, fromY, "to", toX, toY);

            const dy = toY - fromY;
            const dx = toX - fromX;

            const k = dy / dx; // 线斜率, 即: tanA, A=线与x的夹角
            const kn = -1 / k; // 垂直于线的法线斜率

            const radN = Math.atan(kn); // 法线弧度
            const radN2 = radN + Math.PI; // 反向法线弧度

            // 矩形顶点数组
            this._tempRectVertices[0] = fromX + halfW * Math.cos(radN);
            this._tempRectVertices[1] = fromY + halfW * Math.sin(radN);

            this._tempRectVertices[2] = toX + halfW * Math.cos(radN);
            this._tempRectVertices[3] = toY + halfW * Math.sin(radN);

            this._tempRectVertices[4] = toX + halfW * Math.cos(radN2);
            this._tempRectVertices[5] = toY + halfW * Math.sin(radN2);

            this._tempRectVertices[6] = fromX + halfW * Math.cos(radN2);
            this._tempRectVertices[7] = fromY + halfW * Math.sin(radN2);

            // 计算包围盒
            for (let j = 0; j < 4; j++) {
                const vx = this._tempRectVertices[j * 2];
                const vy = this._tempRectVertices[j * 2 + 1];

                // 计算包围盒
                minX = Math.min(vx, minX);
                minY = Math.min(vy, minY);
                maxX = Math.max(vx, maxX);
                maxY = Math.max(vy, maxY);
            }

            // 计算顶点（顶点排列顺序为：右上角开始，X轴向右，Y轴向下，顺时针）
            index = i * 4 * 5;
            for (let j = 0; j < 4; j++) {
                const vx = this._tempRectVertices[j * 2];
                const vy = this._tempRectVertices[j * 2 + 1];

                // 顶点、UV
                vertices[index++] = vx; // vertex.x
                vertices[index++] = vy; // vertex.y
                vertices[index++] = 0;  // vertex.z
                vertices[index++] = 0;  // uv.x 顶点x映射到包围盒
                vertices[index++] = 0;  // uv.y 顶点y映射到包围盒
            }

            // 三角形
            triangleIndex = i * 2 * 3;
            indices[triangleIndex++] = i * 4 + 0;
            indices[triangleIndex++] = i * 4 + 1;
            indices[triangleIndex++] = i * 4 + 3;

            indices[triangleIndex++] = i * 4 + 1;
            indices[triangleIndex++] = i * 4 + 2;
            indices[triangleIndex++] = i * 4 + 3;
        }
        this._tempRectVertices.length = 0;

        // 计算UV
        for (let i = 0, len = vertices.length / 5; i < len; i++) {
            const vx = vertices[i * 5 + 0]; // vertex.x
            const vy = vertices[i * 5 + 1]; // vertex.y

            vertices[i * 5 + 3] = (vx - minX) / (maxX - minX); // uv.x
            vertices[i * 5 + 4] = (vy - minY) / (maxY - minY); // uv.y
        }

        const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, Laya.IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
        
        const sharedMesh = mesh2dRender.sharedMesh;
        mesh2dRender.sharedMesh = mesh2D;

        // 销毁释放内存
        sharedMesh?.destroy();
    }

}

/**
 * Mesh2d 画多边形命令
 */
export class Mesh2dDrawPolygonCmd implements IMesh2dGraphicsCmd {

    /**
     * @en The X-axis position to start drawing.
     * @zh 开始绘制的 X 轴位置。
     */
    public offsetX: number = 0;

    /**
     * @en The Y-axis position to start drawing.
     * @zh 开始绘制的 Y 轴位置。
     */
    public offsetY: number = 0;

    /**
     * @en Collection of points for the line segments. Format: [x1,y1,x2,y2,x3,y3...]
     * @zh 多边形的点集合。格式：[x1,y1,x2,y2,x3,y3...]
     */
    public points: number[];

    /**
     * 多边形孔洞顶点集合
     */
    public holePoints?: number[][];


    public run(mesh2dRender: Laya.Mesh2DRender): void {
        //console.log("Mesh2dPolygonCmd::run();");
        // 多边形点偏移
        for (let i = 0, len = this.points.length / 2; i < len; i++) {
            this.points[i * 2] += this.offsetX;
            this.points[i * 2 + 1] += this.offsetY;
        }

        // 多边形点转换数据结构
        const polygonVertices: poly2tri.Point[] = [];
        for (let i = 0, len = this.points.length / 2; i < len; i++) {
            const px = this.points[i * 2];
            const py = this.points[i * 2 + 1];
            polygonVertices.push(new poly2tri.Point(px, py));
        }

        let holeVertices: poly2tri.Point[][];
        if (this.holePoints && this.holePoints.length > 0) {
            // 孔洞点偏移
            for (let i = 0, len = this.holePoints.length; i < len; i++) {
                const hole: number[] = this.holePoints[i];
                for (let j = 0, c = hole.length / 2; j < c; j++) {
                    hole[j * 2] += this.offsetX;
                    hole[j * 2 + 1] += this.offsetY;
                }
            }

            // 孔洞点转换数据结构
            holeVertices = []
            for (let i = 0, len = this.holePoints.length; i < len; i++) {
                const hole: number[] = this.holePoints[i];
                const holePts: poly2tri.Point[] = [];
                for (let j = 0, c = hole.length / 2; j < c; j++) {
                    const px = hole[j * 2];
                    const py = hole[j * 2 + 1];
                    holePts.push(new poly2tri.Point(px, py));
                }
                holeVertices[i] = holePts;
            }
        }


        // 三角化 -----------------------------------------------------
        const pointsVec = new poly2tri.std_vector(polygonVertices);
        const swctx = new poly2tri.CDT(pointsVec);

        // - 添加孔洞点
        if (holeVertices) {
            for (let i = 0, len = holeVertices.length; i < len; i++) {
                swctx.AddHole(new poly2tri.std_vector(holeVertices[i]));
            }
        }

        // - 执行三角化
        swctx.Triangulate();

        // - 三角化结果
        const triangles = swctx.GetTriangles();
        // for (let i = 0; i < triangles.size(); i++) {
        //     const t = triangles.at(i);
        //     console.log([t.GetPoint(0), t.GetPoint(1), t.GetPoint(2)]);
        // }
        // -------------------------------------------------------------

        // 计算包围盒
        let minX = Number.MAX_VALUE, minY = Number.MAX_VALUE, maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE; // 包围盒
        for (let i = 0; i < triangles.size(); i++) {
            const t = triangles.at(i);
            for (let j = 0; j < 3; j++) {
                const v = t.GetPoint(j);

                // 计算包围盒
                minX = Math.min(v.x, minX);
                minY = Math.min(v.y, minY);
                maxX = Math.max(v.x, maxX);
                maxY = Math.max(v.y, maxY);
            }
        }

        const vertices = new Float32Array(triangles.size() * 3 * 5);
        const indices = new Uint16Array(triangles.size() * 3);
        let index = 0, triangleIndex = 0;

        for (let i = 0, len = triangles.size(); i < len; i++) {
            const t = triangles.at(i);

            // 顶点、UV
            index = i * 3 * 5;
            for (let j = 0; j < 3; j++) {
                const v = t.GetPoint(j);
                vertices[index++] = v.x; // vertex.x
                vertices[index++] = v.y; // vertex.y
                vertices[index++] = 0; // vertex.z
                vertices[index++] = (v.x - minX) / (maxX - minX); // uv.x 顶点x映射到包围盒
                vertices[index++] = (v.y - minY) / (maxY - minY); // uv.y 顶点y映射到包围盒
            }

            // 三角形
            triangleIndex = i * 3;
            indices[triangleIndex++] = i * 3 + 0;
            indices[triangleIndex++] = i * 3 + 1;
            indices[triangleIndex++] = i * 3 + 2;
        }

        const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, Laya.IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);

        if (mesh2dRender.sharedMesh) {
            mesh2dRender.sharedMesh.destroy();
        }

        const sharedMesh = mesh2dRender.sharedMesh;
        mesh2dRender.sharedMesh = mesh2D;

        // 销毁释放内存
        sharedMesh?.destroy();
    }

}