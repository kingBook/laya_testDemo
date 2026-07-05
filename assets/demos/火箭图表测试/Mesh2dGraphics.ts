const { regClass, property } = Laya;

@regClass()
export class Mesh2dGraphics extends Laya.Script {

    owner: Laya.Sprite;

    private _cmds: IMesh2dGraphicsCmd[] = [];

    private _mesh2dRender: Laya.Mesh2DRender;

    public onAwake(): void {
        this._mesh2dRender ||= this.owner.addComponent(Laya.Mesh2DRender);
    }

    public onStart(): void {
        this.repaint();
    }

    public addCmd(cmd: IMesh2dGraphicsCmd, index?: number): any {

    }

    public removeCmd(cmd: IMesh2dGraphicsCmd): void {

    }

    public replaceCmd(oldCmd: IMesh2dGraphicsCmd, newCmd: IMesh2dGraphicsCmd): any {

    }

    public repaint(): void {
        for (let i = 0, len = this._cmds.length; i < len; i++) {
            const cmd = this._cmds[i];
            if (cmd instanceof Mesh2dDrawLineCmd) {
                this.drawLine(cmd);
            }
        }
    }

    private drawLine(cmd: Mesh2dDrawLineCmd) {
        const halfLineWidth = cmd.lineWidth / 2;

        const dy = cmd.toY - cmd.fromY;
        const dx = cmd.toX - cmd.fromX;
        const k = dy / dx; // 线斜率, 即: tanA, A=线与x的夹角
        const kn = -1 / k; // 垂直于线的法线斜率
        
        const vertices = new Float32Array(4 * 5);
        const indices = new Uint16Array(2 * 3);
        let index = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;

        vertices[index++] = width;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 0;

        vertices[index++] = width;
        vertices[index++] = height;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 1;

        vertices[index++] = 0;
        vertices[index++] = height;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;

        index = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = 3;

        indices[index++] = 1;
        indices[index++] = 2;
        indices[index++] = 3;

        const declaration = Laya.VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Laya.Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, Laya.IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
        this._mesh2dRender.sharedMesh = mesh2D;

    }

}

export interface IMesh2dGraphicsCmd {

}

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