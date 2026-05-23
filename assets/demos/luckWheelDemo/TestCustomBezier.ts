import { LuckWheel, LuckWheelMode } from "./luckWheel/LuckWheel";


const { regClass, property } = Laya;

@regClass()
export class TestCustomBezier extends Laya.Script {

    private _luckWheel: LuckWheel;

    public onAwake(): void {
        this._luckWheel = this.owner.getChild("LuckWheel").getComponent(LuckWheel);
        this._luckWheel.init();
    }

    public onStart(): void {

        this.delaySetReward();
    }

    private delaySetReward(): void {
        Laya.timer.once(Math.random() * 2000 + 1000, this, () => {
            // 自定义贝塞尔曲线数据, https://cubic-bezier.com/
            this._luckWheel.outerAniCurve.setTo(0, 0, 1, 1);

            // 用索引设置开奖结果
            // const outsideRewardIndex: number = Math.trunc(Math.random() * this._luckWheel.currentOutsideSplitData.splitAngles.length);
            // this._luckWheel.setRewardIndex(outsideRewardIndex);
            // console.log("得到开奖结果", "外转盘:" + outsideRewardIndex);

            // 用角度设置开奖结果
            const outsideRewardAngle: number = Math.trunc(Math.random() * 360);
            this._luckWheel.setRewardAngle(outsideRewardAngle);
            console.log("得到开奖结果", "外转盘角度:" + outsideRewardAngle, "外转盘索引:" + this._luckWheel.outerRewardIndex);

            this._luckWheel.startRotation();
            console.log("开始旋转");


            this._luckWheel.owner.offAll(LuckWheel.EVENT_ROTATION_COMPLETE);
            this._luckWheel.owner.on(LuckWheel.EVENT_ROTATION_COMPLETE, () => {
                console.log("旋转完成");
            });
            this._luckWheel.outerRotationObject.isShowLogMsg = true; // 打印外转盘log
        })
    }


}