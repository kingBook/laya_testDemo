
const { regClass, property } = Laya;

@regClass()
export class Box extends Laya.Script {

    onTriggerEnter(other: Laya.PhysicsColliderComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        console.log("onTriggerEnter:--------", other, self, contact);

        const physicsFactory: any = Laya.Physics2D.I._factory;
        const worldManifold = new physicsFactory._box2d.b2WorldManifold();
        contact.GetWorldManifold(worldManifold);
        console.log("worldManifold:", worldManifold);

    }

    onTriggerExit(other: Laya.PhysicsColliderComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        //console.log("onTriggerExit:-----", other, self, contact);
    }

    onTriggerStay(other: Laya.PhysicsColliderComponent | Laya.ColliderBase, self?: Laya.ColliderBase, contact?: any): void {
        //console.log("onTriggerStay:", other, self, contact);
    }
}