const { regClass, property } = Laya;

/**
 * 测试spine动画停止在指定时间
 */
@regClass()
export class TestSpineTime extends Laya.Script {

    @property({ type: Laya.Spine2DRenderNode, private: false })
    private _spineNode: Laya.Spine2DRenderNode;

    private _time = 0;

    onAwake(): void {
    }

    onUpdate(): void {
    }

    onKeyDown(evt: Laya.Event): void {
        // console.log('_spineNode', this._spineNode);

        if (evt.key == 'j') {
            this._time = Laya.MathUtil.repeat(this._time + 0.01, 0.4);
            console.log("_time", this._time);

            this._spineNode.play('attack', false, true, this._time * 1000); // 注意：播放起始时间单位<毫秒>
            this._spineNode.stop();
        }
    }




}