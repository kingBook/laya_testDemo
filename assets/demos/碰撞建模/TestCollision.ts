import { Circle } from "./Circle";
import CollisionManager from "./CollisionManager";

const { regClass, property } = Laya;

@regClass()
export class TestCollision extends Laya.Script {

    declare owner: Laya.Sprite;

    private _lastMousePos: Laya.Vector2;
    private _mouseDelta: Laya.Vector2;

    private _circleArr: Circle[];
    private _curDragCircle: Circle;
    private _curDragDelta: Laya.Vector2;

    private _collisionManager: CollisionManager;

    onAwake(): void {
        this._lastMousePos = new Laya.Vector2(Laya.stage.mouseX, Laya.stage.mouseY);
        this._mouseDelta = new Laya.Vector2(0, 0);

        this._circleArr = [];
        this._curDragDelta = new Laya.Vector2();

        this._collisionManager = new CollisionManager();
        this._collisionManager.init(this._circleArr);
    }

    /** 鼠标右键或中键按下时执行（注意：移动平台时不会执行） */
    onRightMouseDown(evt: Laya.Event): void {
        console.log("onRightMouseDown", evt);

        // 创建圆
        const circle = this.createCircle(evt.touchPos.x, evt.touchPos.y);
        this._circleArr.push(circle);
    }

    onMouseDown(evt: Laya.Event): void {
        console.log("onMouseDown", evt);

        // 查找鼠标下的圆
        const circle = this._circleArr.find(item => {
            const d = Laya.MathUtil.distance(item.owner.x, item.owner.y, evt.touchPos.x, evt.touchPos.y);
            if (d < item.radius) return item;
        });

        // 开始拖动鼠标下的圆
        if (circle) {
            this._curDragCircle = circle;
            this._curDragDelta.x = circle.owner.x - evt.touchPos.x;
            this._curDragDelta.y = circle.owner.y - evt.touchPos.y;
        }
    }

    onMouseUp(evt: Laya.Event): void {
        console.log("onMouseUp", evt);

        // 停止拖动
        if (this._curDragCircle) {
            this._curDragCircle.velocity.setValue(this._mouseDelta.x, this._mouseDelta.y);
        }
        this._curDragCircle = null;
    }

    onUpdate(): void {
        // 计算两帧之间的鼠标位移
        this._mouseDelta.x = Laya.stage.mouseX - this._lastMousePos.x;
        this._mouseDelta.y = Laya.stage.mouseY - this._lastMousePos.y;
        this._lastMousePos.x = Laya.stage.mouseX;
        this._lastMousePos.y = Laya.stage.mouseY;

        // 更新当前拖的圆的位置
        if (this._curDragCircle) {
            this._curDragCircle.owner.x = Laya.stage.mouseX + this._curDragDelta.x;
            this._curDragCircle.owner.y = Laya.stage.mouseY + this._curDragDelta.y;
        }

        // 更新碰撞管理器
        this._collisionManager.update();
    }

    /**
     * 创建圆
     * @param x 位置x
     * @param y 位置y
     * @param vx 速度x
     * @param vy 速度y
     * @param angularVelocity 角速度<弧度/秒>
     * @returns 
     */
    private createCircle(x: number, y: number, vx = 0, vy = 0, angularVelocity = 0): Circle {
        const sprite = new Laya.Sprite();
        sprite.pos(x, y);

        const circleCmp = sprite.addComponent(Circle);
        circleCmp.velocity.x = vx;
        circleCmp.velocity.y = vy;
        circleCmp.angularVelocity = angularVelocity;

        this.owner.addChild(sprite);
        return circleCmp;
    }

}