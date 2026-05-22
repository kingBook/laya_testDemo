import { LuckWheel } from "./luckWheel/LuckWheel";


const { regClass, property } = Laya;

@regClass()
export class TestElapsedTime extends Laya.Script {

    private _luckWheel: LuckWheel;

    public onAwake(): void {
        this._luckWheel = this.owner.getChild("LuckWheel").getComponent(LuckWheel);
        this._luckWheel.init();
    }

    public onStart(): void {
        this._luckWheel.outerRotationObject.isShowLogMsg = true;

        this.delaySetReward();
    }

    private _time: number;
    private delaySetReward(): void {
        Laya.timer.once(Math.random() * 2000 + 2000, this, () => {
            // 用索引设置开奖结果
            // const outsideRewardIndex: number = Math.trunc(Math.random() * this._luckWheel.currentOutsideSplitData.splitAngles.length);
            // this._luckWheel.setRewardIndex(outsideRewardIndex);
            // console.log("得到开奖结果", "外转盘:" + outsideRewardIndex);

            // 用角度设置开奖结果
            const outsideRewardAngle: number = Math.trunc(Math.random() * 360);
            this._luckWheel.setRewardAngle(outsideRewardAngle);
            console.log("得到开奖结果", "外转盘角度:" + outsideRewardAngle, "外转盘索引:" + this._luckWheel.outerRewardIndex);


            const curOutsideIndex = this._luckWheel.getOuterIndexByAngle(this._luckWheel.pointerAngle - this._luckWheel.currentOuterSectorData.angleOffset - this._luckWheel.outerDisc.rotation);
            console.log(`得到开奖结果，当前外转盘索引为:${curOutsideIndex}, 当前指针角度：${this._luckWheel.pointerRotationObject.angle360}`);

            this._luckWheel.startRotation();
            console.log("开始旋转");

            this._time = Laya.timer.totalTime;

            this._luckWheel.owner.offAll(LuckWheel.EVENT_ROTATION_COMPLETE);
            this._luckWheel.owner.on(LuckWheel.EVENT_ROTATION_COMPLETE, () => {
                console.log(`得到开奖结果到停止花费时间：${(Laya.timer.totalTime - this._time) / 1000} 秒`);
                this.delaySetReward();
            });
        })
    }


}