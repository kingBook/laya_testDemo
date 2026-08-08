**变量初始化**
```ts
@property({ type: RocketChart, private: false, tips: "火箭图表" })
private _rocketChart: RocketChart;

@property({ type: Laya.Prefab, private: false, tips: "玩家跳点预制体" })
private _playerJumpPointPrefab: Laya.Prefab;

@property({ type: Laya.Prefab, private: false, tips: "其他用户跳点预制体" })
private _otherUserJumpPointPrefab: Laya.Prefab;
```

**初始化火箭图表**
```ts
// 需在 onEnable() 之后初始化
// 初始化后，仅绘制时间、倍数标尺，不显示其它内容
const initSpeed = 0.05; // 初速度
const acceleration = 0.005; // 加速度
this._rocketChart.init(initSpeed, acceleration); 

// 立即设置火箭图表状态到指定的时间、倍数
const time = 18928;
const multiplier = 1.36;
this._rocketChart.updateStatusToTime(time, multiplier);
```

**开始发射**
```ts
this._rocketChart.startLaunch();
```

**爆炸**
* 必须在火箭发射后才能调用爆炸
* boom() 会立即设置火箭倍数到参数指定的倍数，当前已绘的图形保持不变
* boom() 必须在火箭发射后才能调用爆炸
* boom() 之后必须重新初始化才能再次调用
```ts
Laya.timer.once(3000, this, () => {
    if (this._rocketChart.isLaunching) {
        const time = 18928;
        const multiplier = 1.36;
        this._rocketChart.boom(time, multiplier);
    }
});
```

**添加跳点**
* 火箭到达跳点指定的倍数时，才显示跳点对应的显示对象。
* 如果在火箭到达跳点指定的倍数后添加跳点，则立即显示跳点对应的显示对象
```ts
// 添加玩家跳点
let multiplier = 1.66;
let sprite = this._playerJumpPointPrefab.create() as Laya.Sprite;
let isPlayer = true;
this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);

// 添加其他玩家跳点
multiplier = 2.5;
sprite = this._otherUserJumpPointPrefab.create() as Laya.Sprite;
isPlayer = false;
this._rocketChart.addJumpPoint(multiplier, sprite, isPlayer);
```

**2.00x 变色加速**
```ts
// 加速开始时的处理器
this._rocketChart.onAccelerationStartHandler = new Laya.Handler(this, () => {
    console.log("加速开始");
});

// 正在加速...，帧循环处理器, progress∈[0,1]
this._rocketChart.onAccelerationLoopHandler = new Laya.Handler(this, (progress: number) => {
    console.log("正在加速...", progress);
});

// 加速完成时的处理器
this._rocketChart.onAccelerationFinishHandler = new Laya.Handler(this, () => {
    console.log("加速完成");
});
```