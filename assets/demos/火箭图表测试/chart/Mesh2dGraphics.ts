const { regClass, property, classInfo } = Laya;

@regClass()
export class Mesh2dGraphics extends Laya.Script {

    owner: Laya.Sprite;

    private _cmds: IMesh2dGraphicsCmd[] = [];

    private _mesh2dRender: Laya.Mesh2DRender;

    public onAwake(): void {
        this._mesh2dRender ||= this.owner.addComponent(Laya.Mesh2DRender);
    }

    public onStart(): void {
        // 重绘
        this.repaint();
    }

    /**
     * 清空绘制命令
     */
    public clear(): void {
        this._cmds.length = 0;

        // 重绘
        this.repaint();
    }

    /**
     * 添加绘制命令
     * @param cmd 要被添加的命令
     * @param index 可选）插入的索引
     * @returns 
     */
    public addCmd(cmd: IMesh2dGraphicsCmd, index?: number): any {
        if (index === undefined) {
            this._cmds.push(cmd);
            return;
        }

        this._cmds[index] = cmd;

        // 重绘
        this.repaint();
    }

    /**
     * 移除绘制命令
     * @param cmd 要被移除的命令
     */
    public removeCmd(cmd: IMesh2dGraphicsCmd): void {
        const index = this._cmds.indexOf(cmd);

        if (index === -1) throw new Error("未找到旧的命令");

        this._cmds.splice(index, 1);

        // 重绘
        this.repaint();
    }

    /**
     * 替换绘制命令
     * @param oldCmd 旧的命令
     * @param newCmd 新的命令
     */
    public replaceCmd(oldCmd: IMesh2dGraphicsCmd, newCmd: IMesh2dGraphicsCmd): any {
        const index = this._cmds.indexOf(oldCmd);

        if (index === -1) throw new Error("未找到旧的命令");

        this._cmds[index] = newCmd;

        // 重绘
        this.repaint();
    }

    /**
     * 重绘
     */
    public repaint(): void {
        for (let i = 0, len = this._cmds.length; i < len; i++) {
            const cmd = this._cmds[i];
            if (cmd instanceof Mesh2dDrawLineCmd) {
                this.drawLine(cmd);
            } else if (cmd instanceof Mesh2dDrawLinesCmd) {
                this.drawLines(cmd);
            }
        }
    }

    /**
     * 画直线
     * @param cmd 画直线命令
     */
    private drawLine(cmd: Mesh2dDrawLineCmd): void {
        const halfW = cmd.lineWidth / 2;

        const dy = cmd.toY - cmd.fromY;
        const dx = cmd.toX - cmd.fromX;

        const k = dy / dx; // 线斜率, 即: tanA, A=线与x的夹角
        const kn = -1 / k; // 垂直于线的法线斜率

        const radN = Math.atan(kn); // 法线弧度
        const radN2 = radN + Math.PI; // 反向法线弧度

        const vertices = new Float32Array(4 * 5);
        const indices = new Uint16Array(2 * 3);

        // 顺序为: 顶点(x,y,z)、 UV
        let index = 0;
        vertices[index++] = cmd.fromX + halfW * Math.cos(radN2);
        vertices[index++] = cmd.fromY + halfW * Math.sin(radN2);
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;

        vertices[index++] = cmd.toX + halfW * Math.cos(radN2);
        vertices[index++] = cmd.toY + halfW * Math.sin(radN2);
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 0;

        vertices[index++] = cmd.toX + halfW * Math.cos(radN);
        vertices[index++] = cmd.toY + halfW * Math.sin(radN);
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 1;

        vertices[index++] = cmd.fromX + halfW * Math.cos(radN);
        vertices[index++] = cmd.fromY + halfW * Math.sin(radN);
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;

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
        this._mesh2dRender.sharedMesh = mesh2D;
    }

    /**
     * 画折线
     * @param cmd 画折线命令
     */
    private drawLines(cmd: Mesh2dDrawLinesCmd): void {
        const halfW = cmd.lineWidth / 2;

        const segmentCount = cmd.points.length / 2 - 1; // 段数
        const vertices = new Float32Array(segmentCount * 4 * 5);
        const indices = new Uint16Array(segmentCount * 2 * 3);

        let index = 0, triangleIndex = 0;

        for (let i = 0, len = cmd.points.length - 2; i < len; i += 2) {
            console.log("i", i);

            let tempI = i;
            const fromX = cmd.points[tempI++];
            const fromY = cmd.points[tempI++];
            const toX = cmd.points[tempI++];
            const toY = cmd.points[tempI++];

            console.log("from", fromX, fromY);
            console.log("to", toX, toY);

            const dy = toY - fromY;
            const dx = toX - fromX;

            const k = dy / dx; // 线斜率, 即: tanA, A=线与x的夹角
            const kn = -1 / k; // 垂直于线的法线斜率

            const radN = Math.atan(kn); // 法线弧度
            const radN2 = radN + Math.PI; // 反向法线弧度

            // 顺序为: 顶点(x,y,z)、 UV
            index = ((i / 2) * 4 * 5) - 1;
            vertices[index++] = fromX + halfW * Math.cos(radN2);
            vertices[index++] = fromY + halfW * Math.sin(radN2);
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 0;

            vertices[index++] = toX + halfW * Math.cos(radN2);
            vertices[index++] = toY + halfW * Math.sin(radN2);
            vertices[index++] = 0;
            vertices[index++] = 1;
            vertices[index++] = 0;

            vertices[index++] = toX + halfW * Math.cos(radN);
            vertices[index++] = toY + halfW * Math.sin(radN);
            vertices[index++] = 0;
            vertices[index++] = 1;
            vertices[index++] = 1;

            vertices[index++] = fromX + halfW * Math.cos(radN);
            vertices[index++] = fromY + halfW * Math.sin(radN);
            vertices[index++] = 0;
            vertices[index++] = 0;
            vertices[index++] = 1;

            // 三角形
            triangleIndex = ((i / 2) * 2 * 3) - 1;
            indices[triangleIndex++] = 0;
            indices[triangleIndex++] = 1;
            indices[triangleIndex++] = 3;

            indices[triangleIndex++] = 1;
            indices[triangleIndex++] = 2;
            indices[triangleIndex++] = 3;
        }


        const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, Laya.IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
        this._mesh2dRender.sharedMesh = mesh2D;
    }
}

/**
 * Mesh2d 绘制命令接口
 */
export interface IMesh2dGraphicsCmd {

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
}

/**
 * Mesh2d 画折线命令
 */
export class Mesh2dDrawLinesCmd implements IMesh2dGraphicsCmd {

    /**
     * @en Collection of points for the line segments. Format: [x1,y1,x2,y2,x3,y3...]
     * @zh 线段的点集合。格式：[x1,y1,x2,y2,x3,y3...]
     */
    public points: number[] | null;

    /**
     * @en (Optional) Line width
     * @zh （可选）线段宽度
     */
    public lineWidth: number;

    /**
     * 统一UV, 默认: true
     * * true，把所有线段看成一个整体映射UV
     * * false，每一线段单独去映射UV
     */
    public unifyUV: boolean = true;

}