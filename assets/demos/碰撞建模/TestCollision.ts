import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";
import CollisionManager from "./CollisionManager";

const { regClass, property } = Laya;

@regClass()
export class TestCollision extends Laya.Script {

    declare owner: Laya.Sprite;

    private _lastMousePos: Laya.Vector2;
    private _mouseDelta: Laya.Vector2;

    private _circleArr: Circle[];
    private _rectArr: Rectangle[];
    private _curDragCollider: Circle | Rectangle;
    private _curDragDelta: Laya.Vector2;

    private _collisionManager: CollisionManager;

    onAwake(): void {
        this._lastMousePos = new Laya.Vector2(Laya.stage.mouseX, Laya.stage.mouseY);
        this._mouseDelta = new Laya.Vector2(0, 0);

        this._circleArr = [];
        this._rectArr = [];
        this._curDragDelta = new Laya.Vector2();

        this._collisionManager = new CollisionManager();
        this._collisionManager.init([...this._circleArr, ...this._rectArr]);
    }

    /** 鼠标右键或中键按下时执行（注意：移动平台时不会执行） */
    onRightMouseDown(evt: Laya.Event): void {
        // 是否按下 shift 键？
        const hasKeyDownShift = Laya.InputManager.hasKeyDown(Laya.Keyboard.SHIFT);

        console.log("onRightMouseDown", {
            hasKeyDownShift: hasKeyDownShift,
            evt: evt
        });

        if (hasKeyDownShift) {
            // 创建矩形
            const rect = this.createRectangle(evt.touchPos.x, evt.touchPos.y);
            this._rectArr.push(rect);
            this._collisionManager.init([...this._circleArr, ...this._rectArr]);
        } else {
            // 创建圆形
            const circle = this.createCircle(evt.touchPos.x, evt.touchPos.y);
            this._circleArr.push(circle);
            this._collisionManager.init([...this._circleArr, ...this._rectArr]);
        }
    }

    onMouseDown(evt: Laya.Event): void {
        console.log("onMouseDown", evt);

        const all = [...this._circleArr, ...this._rectArr];
        const target = all.find(item => {
            // 矩形
            if (item instanceof Rectangle) {
                const cx = item.owner.x;
                const cy = item.owner.y;
                const halfW = item.width / 2;
                const halfH = item.height / 2;
                return evt.touchPos.x >= cx - halfW && evt.touchPos.x <= cx + halfW
                    && evt.touchPos.y >= cy - halfH && evt.touchPos.y <= cy + halfH;
            }

            // 圆形
            const d = Laya.MathUtil.distance(item.owner.x, item.owner.y, evt.touchPos.x, evt.touchPos.y);
            return d < item.radius;
        });

        // 开始拖动
        if (target) {
            this._curDragCollider = target;
            this._curDragDelta.x = target.owner.x - evt.touchPos.x;
            this._curDragDelta.y = target.owner.y - evt.touchPos.y;
        }
    }

    onMouseUp(evt: Laya.Event): void {
        console.log("onMouseUp", evt);

        // 停止拖动
        if (this._curDragCollider) {
            this._curDragCollider.velocity.setValue(this._mouseDelta.x, this._mouseDelta.y);
        }
        this._curDragCollider = null;
    }

    onUpdate(): void {
        // 鼠标两帧之间位移
        this._mouseDelta.x = Laya.stage.mouseX - this._lastMousePos.x;
        this._mouseDelta.y = Laya.stage.mouseY - this._lastMousePos.y;
        this._lastMousePos.x = Laya.stage.mouseX;
        this._lastMousePos.y = Laya.stage.mouseY;

        // '当前拖的形状'的位置
        if (this._curDragCollider) {
            this._curDragCollider.owner.x = Laya.stage.mouseX + this._curDragDelta.x;
            this._curDragCollider.owner.y = Laya.stage.mouseY + this._curDragDelta.y;
        }

        // 碰撞管理器，帧循环
        this._collisionManager.update();
    }

    /**
     * 创建圆
     * @param x 位置x
     * @param y 位置y
     * @param vx 速度向量x
     * @param vy 速度向量y
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

    /**
     * 创建矩形
     * @param x 位置x
     * @param y 位置y
     * @param vx 速度向量x
     * @param vy 速度向量y
     * @param angularVelocity 角速度<弧度/秒>
     * @returns 
     */
    private createRectangle(x: number, y: number, vx = 0, vy = 0, angularVelocity = 0): Rectangle {
        const sprite = new Laya.Sprite();
        sprite.pos(x, y);

        const rectCmp = sprite.addComponent(Rectangle);
        rectCmp.velocity.x = vx;
        rectCmp.velocity.y = vy;
        rectCmp.angularVelocity = angularVelocity;

        this.owner.addChild(sprite);
        return rectCmp;
    }
}