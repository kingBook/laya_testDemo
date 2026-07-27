import { RocketChart } from "./rocketChart/RocketChart";

const { regClass, property } = Laya;

@regClass()
export class TestRocketChart extends Laya.Script {

    @property({ type: RocketChart, private: false, tips: "火箭图表" })
    private _rocketChart: RocketChart;

    @property({ type: Laya.Prefab, private: false, tips: "玩家跳点预制体" })
    private _playerJumpPointPrefab: Laya.Prefab;

    @property({ type: Laya.Prefab, private: false, tips: "其他用户跳点预制体" })
    private _otherUserJumpPointPrefab: Laya.Prefab;

    onStart(): void {
        // 初始化
        const initSpeed = 0.05;
        const acceleration = 0.005//0.002;
        this._rocketChart.init(initSpeed, acceleration);

        // 立即设置火箭图表状态到指定的时间、倍数
        const initTime = 18928;
        const initMultiplier = 1.36;
        this._rocketChart.updateStatusToTime(initTime, initMultiplier);

        // 开始发射
        this._rocketChart.startLaunch();

        // 添加玩家跳点
        let multiplier = 1.66;
        let sprite = this._playerJumpPointPrefab.create() as Laya.Sprite;
        let isPlayer = true;
        this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

        // 添加其他玩家跳点
        multiplier = 1.0;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

        multiplier = 1.3;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

        multiplier = 1.5;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

        multiplier = 1.8;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

        multiplier = 2.2;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

        // 爆炸
        // Laya.timer.once(3000, this, () => {
        //     if (this._rocketChart.isLaunching) {
        //         this._rocketChart.boom(18928, 1.36);
        //     }
        // });


    }

    onUpdate(): void {

    }

    onKeyDown(evt: Laya.Event): void {
        if (evt.key == 'h') {
            console.log("初始化");
            const initSpeed = 0.05;
            const acceleration = 0.005;
            this._rocketChart.init(initSpeed, acceleration);
        }


        if (evt.key == 'j') {
            console.log("爆炸");
            if (this._rocketChart.isLaunching) {
                this._rocketChart.boom(18928, 2.36);
            }
        }

        if (evt.key == 'k') {
            console.log("发射");
            this._rocketChart.startLaunch();
        }
    }





}