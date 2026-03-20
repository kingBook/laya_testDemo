import { LuckWheel, LuckWheelMode } from "./luckWheel/LuckWheel";


const { regClass, property } = Laya;

@regClass()
export class TestLuckWheel extends Laya.Script {

    private _luckWheel: LuckWheel;

    public onAwake(): void {
        this._luckWheel = this.owner.getChild("LuckWheel").getComponent(LuckWheel);
        this._luckWheel.owner.on(LuckWheel.EVENT_ROTATION_COMPLETE, this, this.onRotationComplete);
    }

    public onKeyDown(evt: Laya.Event): void {
        if (evt.keyCode === Laya.Keyboard.J) {
            // 随机取一个外转盘的开奖结果
            const outerRewardIndex: number = Math.trunc(Math.random() * this._luckWheel.currentOuterSectorData.sectorAngles.length);
            // 随机取一个内转盘的开奖结果
            const innerRewardIndex: number = Math.trunc(Math.random() * this._luckWheel.currentInnerSectorData.sectorAngles.length);
            switch (this._luckWheel.mode) {
                case LuckWheelMode.SingleRotatePointer:
                case LuckWheelMode.SingleFixedPointer:
                    console.log("得到开奖结果", "外转盘:" + outerRewardIndex);
                    this._luckWheel.setRewardIndex(outerRewardIndex);
                    break;
                case LuckWheelMode.DoubleFixedPointer:
                case LuckWheelMode.DoubleOnlyFixedInner:
                    console.log("得到开奖结果", "外转盘：" + outerRewardIndex, "内转盘：" + innerRewardIndex);
                    this._luckWheel.setRewardIndex(outerRewardIndex, innerRewardIndex);
                    break;
            }
        } else if (evt.keyCode === Laya.Keyboard.U) {
            // 随机取一个外转盘的开奖结果
            const outerRewardAngle: number = Math.trunc(Math.random() * 360);
            // 随机取一个内转盘的开奖结果
            const innerRewardAngle: number = Math.trunc(Math.random() * 360);
            let outerAngleOffset: number, outerSectorAngles0: number;
            switch (this._luckWheel.mode) {
                case LuckWheelMode.SingleRotatePointer:
                case LuckWheelMode.SingleFixedPointer:
                    this._luckWheel.setRewardAngle(outerRewardAngle);
                    outerAngleOffset = this._luckWheel.currentOuterSectorData.angleOffset;
                    outerSectorAngles0 = this._luckWheel.currentOuterSectorData.sectorAngles[0];
                    console.log("得到开奖结果", "外转盘角度:" + outerRewardAngle, "外转盘索引:" + this._luckWheel.outerRewardIndex);
                    console.log("outerAngleOffset:", outerAngleOffset, "outerSectorAngles0:", outerSectorAngles0);
                    break;
                case LuckWheelMode.DoubleFixedPointer:
                case LuckWheelMode.DoubleOnlyFixedInner:
                    this._luckWheel.setRewardAngle(outerRewardAngle, innerRewardAngle);
                    outerAngleOffset = this._luckWheel.currentOuterSectorData.angleOffset;
                    outerSectorAngles0 = this._luckWheel.currentOuterSectorData.sectorAngles[0];
                    const innerAngleOffset = this._luckWheel.currentOuterSectorData.angleOffset;
                    const innerSectorAngles0 = this._luckWheel.currentInnerSectorData.sectorAngles[0];
                    console.log("得到开奖结果", "外转盘角度:" + outerRewardAngle, "内转盘角度：" + innerRewardAngle, "外转盘索引：" + this._luckWheel.outerRewardIndex, "内转盘索引：" + this._luckWheel.innerRewardIndex);
                    console.log("outerAngleOffset:", outerAngleOffset, "outerSectorAngles0:", outerSectorAngles0);
                    console.log("innerAngleOffset:", innerAngleOffset, "innerSectorAngles0:", innerSectorAngles0);
                    break;
            }
        } else if (evt.keyCode === Laya.Keyboard.K) {
            console.log("开始旋转");
            this._luckWheel.startRotation();
        } else if (evt.keyCode === Laya.Keyboard.P) {
            this._luckWheel.setPause(!this._luckWheel.isPausing);
            console.log("设置暂停为：", this._luckWheel.isPausing);
        } else if (evt.keyCode === Laya.Keyboard.L) {
            this._luckWheel.outerSelectIndex = Math.trunc(Math.random() * this._luckWheel.outerSectorDatas.length);
            this._luckWheel.innerSelectIndex = Math.trunc(Math.random() * this._luckWheel.innerSectorDatas.length);
            console.log("选择分割数据：", "外转盘：" + this._luckWheel.outerSelectIndex, "内转盘：" + this._luckWheel.innerSelectIndex);

        } else if (evt.keyCode === Laya.Keyboard.I) {
            this._luckWheel.stopRotation();
            console.log("停止旋转");
        } else if (evt.keyCode === Laya.Keyboard.O) {
            // 随机取一个外转盘的索引
            const outsideIndex: number = Math.trunc(Math.random() * this._luckWheel.currentOuterSectorData.sectorAngles.length);
            // 随机取一个内转盘的索引
            const innerIndex: number = Math.trunc(Math.random() * this._luckWheel.currentInnerSectorData.sectorAngles.length);
            this._luckWheel.setRotationObjectAngleToIndex(outsideIndex, innerIndex);
            console.log(`设置旋转对象角度到：外索引:${outsideIndex}, 内索引:${innerIndex}`);
        }
    }

    private onRotationComplete(): void {
        console.log("旋转完成");
    }

    public onDestroy(): void {
        this._luckWheel.owner.off(LuckWheel.EVENT_ROTATION_COMPLETE, this, this.onRotationComplete);
    }
}