import Sprite = Laya.Sprite;
import Component = Laya.Component;
import Nav2DAgent = Laya.Nav2DAgent;
import NavMesh2DSurface = Laya.NavMesh2DSurface;
const { regClass, property } = Laya;

@regClass()
export class TestNavMesh extends Laya.Script {

    @property({ type: NavMesh2DSurface })
    public navMesh2DSurface: NavMesh2DSurface;

    // 用于显示鼠标点击的位置
    @property({ type: Laya.Sprite })
    public mouseHit: Sprite;

    private _temp: Sprite;
    private _allAgent: Nav2DAgent[] = [];


    private findCompents(lists: any[], sprite: Sprite, componentType: typeof Component) {
        let comp = sprite.getComponent(componentType);
        if (comp != null) {
            lists.push(comp);
        }
        for (var i = 0; i < sprite.numChildren; i++) {
            let child = sprite.getChildAt(i) as Sprite;
            this.findCompents(lists, child, componentType);
        }
    }

    //组件被激活后执行，此时所有节点和组件均已创建完毕，此方法只执行一次
    onAwake(): void {
        let sprite = this.owner as Laya.Sprite;
        //sprite.cache = true;
        this._temp = new Laya.Sprite();
        this.owner.scene.addChild(this._temp);
        this.findCompents(this._allAgent, sprite.scene, Nav2DAgent);
    }

    onMouseClick(evt: Laya.Event): void {
        let clickGlobalPoint = new Laya.Vector2(evt.stageX, evt.stageY);
        
        this._temp.graphics.clear();

        this._allAgent.forEach((agent) => {
            agent.destination = clickGlobalPoint;
            let paths = agent.getCurrentPath();
            console.log("paths.length:", paths.length);


            // 测试手动查找路径
            const outPaths: Laya.NavigationPathData[] = [];
            // 开始位置，注意x, z为水平面
            const startPos = new Laya.Vector3(agent.owner.globalTrans.x, 0, agent.owner.globalTrans.y);
            // 结束位置，注意x, z为水平面
            const endPos = new Laya.Vector3(clickGlobalPoint.x, 0, clickGlobalPoint.y);
            const filter = agent["_filter"];

            console.time("elapsedTime");
            const isFound = this.navMesh2DSurface.findFllowPath(outPaths, startPos, endPos, agent.speed, filter);
            console.log("isFound:", isFound, "outPaths.length: ", outPaths.length);
            console.timeEnd("elapsedTime"); 

            
            //paths = outPaths;

            // 画路径
            if (paths.length >= 2) {
                let points: any = [];
                paths.forEach((point: Laya.NavigationPathData) => {
                    points.push(point.pos.x, point.pos.z);
                });
                this._temp.graphics.drawLines(0, 0, points, "#00000030", 5);
            }

        });

        // 鼠标点击位置
        const lpt = this.mouseHit.parent.globalTrans.globalToLocal(clickGlobalPoint.x, clickGlobalPoint.y);
        this.mouseHit.pos(lpt.x, lpt.y);
    }

}