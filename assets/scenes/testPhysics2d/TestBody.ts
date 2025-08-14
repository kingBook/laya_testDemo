import { Separator } from "./Separator";

const { regClass, property } = Laya;

@regClass()
export class TestBody extends Laya.Script {


    @property({ type: Laya.Sprite })
    polygon_graphics: Laya.Sprite;


    onAwake(): void {
        const physicsFactory: any = Laya.Physics2D.I._factory;
        console.log(physicsFactory);
        
        this.convert();
    }

    /** 转换 graphics 多边形顶点到  Laya.PolygonShape2D 数组 */
    private convert(): void {
        const drawPolyCmd = this.polygon_graphics.graphics.cmds[0] as Laya.DrawPolyCmd;

        // 将[x,y,x,y,...]转为[{x,y}, {x,y},..]
        const points: { x: number, y: number }[] = [];
        for (let i = 0; i < drawPolyCmd.points.length; i += 2) {
            points.push({ x: drawPolyCmd.points[i], y: drawPolyCmd.points[i + 1] });
        }

        // 凸分解
        const poly2ds = Separator.separate(points);

        // 将 [{x,y}, {x,y},..] 转为 [x,y,x,y,...]，并创建 PolygonShape2D 数组
        const shapes: Laya.PolygonShape2D[] = [];
        poly2ds.forEach(pts => {
            const pol = new Laya.PolygonShape2D();
            const datas: number[] = [];
            pts.forEach(pt => {
                datas.push(pt.x, pt.y);
            });
            pol.datas = datas;
            shapes.push(pol);
        });
        this.polygon_graphics.getComponent(Laya.RigidBody).shapes = shapes;

        //清除 graphcis
        this.polygon_graphics.graphics.clear();
    }

    onUpdate(): void {

    }

}