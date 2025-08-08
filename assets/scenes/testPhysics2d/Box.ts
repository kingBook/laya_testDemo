
const { regClass, property } = Laya;

@regClass()
export class Box extends Laya.Script {

    onTriggerEnter(other: Laya.PhysicsColliderComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        console.log("onTriggerEnter:", other, self, contact);
    }

    onTriggerExit(other: Laya.PhysicsColliderComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        console.log("onTriggerExit:", other, self, contact);
    }

    onTriggerStay(other: Laya.PhysicsColliderComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        console.log("onTriggerStay:", other, self, contact);
    }
}