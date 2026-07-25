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
        const acceleration = 0.002;
        this._rocketChart.init(initSpeed, acceleration);

        // 开始发射
        this._rocketChart.startLaunch();

        // 添加玩家跳点
        let multipler = 1.66;
        let sprite = this._playerJumpPointPrefab.create() as Laya.Sprite;
        let isPlayer = true;
        this._rocketChart.addJumpPoint(multipler, sprite, isPlayer);

        // 添加其他玩家跳点
        multipler = 1.0;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multipler, sprite, isPlayer);

        multipler = 1.3;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multipler, sprite, isPlayer);

        multipler = 1.5;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multipler, sprite, isPlayer);

        multipler = 1.8;
        sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
        isPlayer = false;
        this._rocketChart.addJumpPoint(multipler, sprite, isPlayer);


    }

    onUpdate(): void {
        
    }





}