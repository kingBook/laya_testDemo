const { regClass, property } = Laya;

/**
 * 测试spine骨骼位置
 */
@regClass()
export class TestSpineBonePos extends Laya.Script {

    @property({ type: Laya.Spine2DRenderNode, private: false })
    private _spineNode: Laya.Spine2DRenderNode;

    @property({ type: Laya.Sprite, private: false })
    private _circleSprite: Laya.Sprite;


    private _time = 0;

    onAwake(): void {
    }

    onUpdate(): void {
    }

    onKeyDown(evt: Laya.Event): void {
        console.log('_spineNode', this._spineNode);

        if (evt.key == 'j') {
            this._time = Laya.MathUtil.repeat(this._time + 0.01, 0.4);
            console.log("_time", this._time);

            this._spineNode.play('attack', false, true, this._time * 1000); // 注意：播放起始时间单位<毫秒>
            this._spineNode.stop();


            const weaponSlot = this._spineNode.getSlotByName("weapon"); // 武器插槽
            this._circleSprite.pos(this._spineNode.owner.x + weaponSlot.bone.worldX, this._spineNode.owner.y + (-weaponSlot.bone.worldY));
            // 同上效果一样
            // const weaponBone = this._spineNode.getBoneByName("weapon"); // 武器骨骼
            // this._circleSprite.pos(this._spineNode.owner.x + weaponBone.worldX, this._spineNode.owner.y + (-weaponBone.worldY));

            console.log(this._spineNode.setSlotAttachment);
            

        }
    }




}