const { regClass, property } = Laya;
/**
 * 玩家逃跑历史数据结构
 */
interface CashOutUser {
    userId: string;
    userName: string;
    avatarUrl?: string;
    runTime: number;       // 逃跑时的相对游戏时间(秒)
    multiplier: number;    // 逃跑时的倍数
}

@regClass()
export class CrashGameScene extends Laya.Script {
    declare owner: Laya.Sprite;

    @property({ type: Laya.Sprite, tips: "游戏大盘总容器（包含曲线、网格、历史玩家点，用于等比整体缩放）" })
    private mapContainer: Laya.Sprite;
    @property({ type: Laya.Sprite, tips: "曲线绘制画布" })
    private curveShape: Laya.Sprite;
    @property({ type: Laya.Sprite, tips: "历史玩家逃跑标记的容器" })
    private userPointsContainer: Laya.Sprite;
    @property({ type: Laya.Sprite, tips: "火箭/小飞机节点" })
    private rocket: Laya.Sprite;
    @property({ type: Laya.Sprite, tips: "坐标轴画布（负责画底线、动态移动的刻度短线、动态移动的网格线）" })
    private axisShape: Laya.Sprite;
    @property({ type: Laya.Sprite, tips: "" })
    private xAxis: Laya.Sprite;
    @property({ type: Laya.Sprite, tips: "" })
    private yAxis: Laya.Sprite;

    /** 
     * 【新增绑定】：在场景里预先摆好、大小为 600x400、贴着原点对齐的紫色渐变 Image 组件 
     * 它的默认位置应当和你的视口完全对齐 (x = START_X, y = START_Y - VIEW_HEIGHT)
     */
    @property({type:Laya.Image})
    private gradientBgImage: Laya.Image;

    /** 用于充当遮罩的纯色画布 */
    private maskShape: Laya.Sprite;


    // --- 核心视口与坐标配置参数 ---
    private readonly START_X: number = 80;        // 左下角原点 X 像素位置
    private readonly START_Y: number = 500;       // 左下角原点 Y 像素位置
    private readonly VIEW_WIDTH: number = 600;    // 坐标轴安全显示宽度
    private readonly VIEW_HEIGHT: number = 400;   // 坐标轴安全显示高度

    private readonly INIT_SPEED_X: number = 60;   // 初始 1 秒 = 60 像素
    private readonly INIT_SPEED_Y: number = 100;  // 初始 1 个乘数单位 = 100 像素

    // --- 后端同步变量 ---
    private serverStartTime: number = 0;
    private serverRate: number = 1.06;
    private serverOffset: number = 0;
    private isRunning: boolean = false;

    // --- 核心纯数值数据存储（不带任何缩放） ---
    private historyPoints: { t: number, m: number }[] = [];
    private cachedUsers: CashOutUser[] = [];

    // 实时的像素映射比例（每帧根据插值缓动更新）
    private lastScaleX: number = 60;
    private lastScaleY: number = 100;

    // 缓存场景中现成的 Label 组件阵列
    private xLabels: Laya.Label[] = [];
    private yLabels: Laya.Label[] = [];

    onAwake(): void {

        // 1. 初始化纯色遮罩画布
        this.maskShape = new Laya.Sprite();
        
        // 2. 【核心注入】：将此画布绑定为渐变图的遮罩组件
        if (this.gradientBgImage) {
            this.gradientBgImage.mask = this.maskShape;
        }



        // 核心：整个游戏场景大容器彻底锁死 1.0 比例，绝对不缩小！
        this.mapContainer.scale(1, 1);

        // 收集你在场景里提前排好的 Label
        this.cachePreparedLabels();

        this.syncServerTime(Date.now());

        this.onGameStart({ startTime: Date.now(), rate: 1.06 });
    }

    private cachePreparedLabels(): void {
        this.xLabels = [];
        if (this.xAxis) {
            for (let i = 0; i < this.xAxis.numChildren; i++) {
                let child = this.xAxis.getChildAt(i) as Laya.Label;
                if (child instanceof Laya.Label) this.xLabels.push(child);
            }
        }
        this.yLabels = [];
        if (this.yAxis) {
            for (let i = 0; i < this.yAxis.numChildren; i++) {
                let child = this.yAxis.getChildAt(i) as Laya.Label;
                if (child instanceof Laya.Label) this.yLabels.push(child);
            }
        }
    }

    public syncServerTime(serverTimestamp: number): void {
        this.serverOffset = serverTimestamp - Date.now();
    }

    public onGameStart(data: { startTime: number, rate: number }): void {
        this.serverStartTime = data.startTime;
        this.serverRate = data.rate;
        this.isRunning = true;

        this.curveShape.graphics.clear();
        this.axisShape.graphics.clear();
        this.userPointsContainer.destroyChildren();

        this.historyPoints = [{ t: 0, m: 1.0 }];
        this.cachedUsers = [];
        this.lastScaleX = this.INIT_SPEED_X;
        this.lastScaleY = this.INIT_SPEED_Y;

        this.rocket.pos(this.START_X, this.START_Y);
        this.rocket.rotation = 0;
        this.rocket.visible = true;
    }

    public onUserCashOut(user: CashOutUser): void {
        if (!this.isRunning) return;
        this.cachedUsers.push(user);
    }

    public onGameBoom(data: { boomTime: number }): void {
        if (!this.isRunning) return;
        this.isRunning = false;

        let finalTimeSec = (data.boomTime - this.serverStartTime) / 1000;
        let finalMultiplier = Math.pow(this.serverRate, finalTimeSec);
        this.updatePhysicsAndRender(finalTimeSec, finalMultiplier);

        this.rocket.visible = false;
    }

    onUpdate(): void {
        if (!this.isRunning) return;

        let currentServerTime = Date.now() + this.serverOffset;
        let runningTimeSec = (currentServerTime - this.serverStartTime) / 1000;
        if (runningTimeSec < 0) return;

        let currentMultiplier = Math.pow(this.serverRate, runningTimeSec);
        this.updatePhysicsAndRender(runningTimeSec, currentMultiplier);
    }
/*
    private updatePhysicsAndRender(time: number, multiplier: number): void {
        let lastData = this.historyPoints[this.historyPoints.length - 1];
        if (time - lastData.t > 0.05) {
            this.historyPoints.push({ t: time, m: multiplier });
        }

        // 1. 根据纯真实数值计算如果不做视口处理，火箭会飞到的原始像素位置
        let rawPixelX = time * this.INIT_SPEED_X;
        let rawPixelY = (multiplier - 1.0) * this.INIT_SPEED_Y;

        // 2. 动态调节【映射像素比例（ScaleX / ScaleY）】
        let currentScaleX = this.INIT_SPEED_X;
        if (rawPixelX > this.VIEW_WIDTH) {
            currentScaleX = this.VIEW_WIDTH / time;
        }
        let currentScaleY = this.INIT_SPEED_Y;
        if (rawPixelY > this.VIEW_HEIGHT) {
            currentScaleY = this.VIEW_HEIGHT / (multiplier - 1.0);
        }

        // 使用符合 Laya 3.x 的 MathUtil 平滑缓冲系数
        this.lastScaleX = Laya.MathUtil.lerp(this.lastScaleX, currentScaleX, 0.2);
        this.lastScaleY = Laya.MathUtil.lerp(this.lastScaleY, currentScaleY, 0.2);

        // 3. 【重新绘制曲线路径】线宽永远是真实的 4 像素，绝不变小！
        let renderPoints: number[] = [];
        for (let pt of this.historyPoints) {
            let px = this.START_X + (pt.t * this.lastScaleX);
            let py = this.START_Y - ((pt.m - 1.0) * this.lastScaleY);
            renderPoints.push(px, py);
        }
        let rRocketX = this.START_X + (time * this.lastScaleX);
        let rRocketY = this.START_Y - ((multiplier - 1.0) * this.lastScaleY);
        renderPoints.push(rRocketX, rRocketY);

        this.curveShape.graphics.clear();
        this.curveShape.graphics.drawLines(0, 0, renderPoints, "#00A2FF", 4);

        // 4. 更新小火箭的像素物理位置（火箭本身的大小 scale 绝对不受改变）
        this.rocket.pos(rRocketX, rRocketY);
        if (renderPoints.length >= 4) {
            let len = renderPoints.length;
            let angleRad = Math.atan2(renderPoints[len - 1] - renderPoints[len - 3], renderPoints[len - 2] - renderPoints[len - 4]);
            this.rocket.rotation = angleRad * (180 / Math.PI);
        }

        // 5. 更新历史逃跑玩家标记的像素位置（头像和文字永远保持原有清晰大小）
        this.renderAllUserTags();

        // 6. 【核心实现】：让刻度线、网格线和现成的 Laya.Label 动态移动并更改数值
        this.drawAxisGridAndMoveLabels(time, multiplier);
    }
*/
    private updatePhysicsAndRender(time: number, multiplier: number): void {
        let lastData = this.historyPoints[this.historyPoints.length - 1];
        if (time - lastData.t > 0.05) {
            this.historyPoints.push({ t: time, m: multiplier });
        }

        let rawPixelX = time * this.INIT_SPEED_X;
        let rawPixelY = (multiplier - 1.0) * this.INIT_SPEED_Y;

        let currentScaleX = this.INIT_SPEED_X;
        if (rawPixelX > this.VIEW_WIDTH) currentScaleX = this.VIEW_WIDTH / time; 

        let currentScaleY = this.INIT_SPEED_Y;
        if (rawPixelY > this.VIEW_HEIGHT) currentScaleY = this.VIEW_HEIGHT / (multiplier - 1.0); 

        this.lastScaleX = Laya.MathUtil.lerp(this.lastScaleX, currentScaleX, 0.2);
        this.lastScaleY = Laya.MathUtil.lerp(this.lastScaleY, currentScaleY, 0.2);

        // 1. 生成标准的线段像素顶点数组
        let renderPoints: number[] = [];
        for (let pt of this.historyPoints) {
            let px = this.START_X + (pt.t * this.lastScaleX);
            let py = this.START_Y - ((pt.m - 1.0) * this.lastScaleY);
            renderPoints.push(px, py);
        }
        let rRocketX = this.START_X + (time * this.lastScaleX);
        let rRocketY = this.START_Y - ((multiplier - 1.0) * this.lastScaleY);
        renderPoints.push(rRocketX, rRocketY);

        // 2. 【核心重构：生成用于合围遮罩的多边形点集】
        let fillPoints: number[] = [].concat(renderPoints);
        fillPoints.push(rRocketX, this.START_Y); 
        fillPoints.push(this.START_X, this.START_Y); 

        // 3. 【无损重绘遮罩】：不再传渐变对象，直接传纯色字符串 "#FFFFFF" 绝不报错！
        this.maskShape.graphics.clear();
        this.maskShape.graphics.drawPoly(0, 0, fillPoints, "#FFFFFF");

        // 4. 在曲线层单独重绘最上方的发光亮紫色主边缘线条（线宽 3.5 像素）
        this.curveShape.graphics.clear();
        this.curveShape.graphics.drawLines(0, 0, renderPoints, "#E259FF", 3.5);

        // 5. 更新火箭、刻度和玩家标签位置
        this.rocket.pos(rRocketX, rRocketY);
        if (renderPoints.length >= 4) {
            let len = renderPoints.length;
            let angleRad = Math.atan2(renderPoints[len-1] - renderPoints[len-3], renderPoints[len-2] - renderPoints[len-4]);
            this.rocket.rotation = angleRad * (180 / Math.PI); 
        }
    
        // 7. 同步更新向原点靠拢位移的 Label 刻度与其它玩家逃跑光点
        this.drawAxisGridAndMoveLabels(time, multiplier);
        this.renderAllUserTags();
    }
    
    

    /**
     * 【终极图表级算法】控制网格和已有 Label 产生向原点缩聚和数值变大的效果
     */
    private drawAxisGridAndMoveLabels(maxTime: number, maxMultiplier: number): void {
        let g = this.axisShape.graphics;
        g.clear();

        // 绘制静止不动的 L 型主坐标轴基准线
        g.drawLine(this.START_X, this.START_Y, this.START_X, this.START_Y - this.VIEW_HEIGHT, "#ffffff", 2);
        g.drawLine(this.START_X, this.START_Y, this.START_X + this.VIEW_WIDTH, this.START_Y, "#ffffff", 2);

        // ------------------ A. X 轴（时间）动态移动刻度 ------------------
        // 我们动态定一个“数轴增量步长”，随着时间拉长，让刻度代表的真实数值按 2s, 5s, 10s 翻倍跳跃，防止线密死
        let timeStep = 2;
        if (maxTime > 15) timeStep = 5;
        if (maxTime > 40) timeStep = 10;
        if (maxTime > 100) timeStep = 20;

        let xLabelIndex = 0;
        // 遍历真实的数值刻度 (比如 t = 2, 4, 6, 8...)
        for (let t = timeStep; t <= maxTime + timeStep; t += timeStep) {
            // 通过当前比例，计算出这个真实数值刻度在舞台上应该处于的最新【像素 X 坐标】
            let px = this.START_X + (t * this.lastScaleX);

            // 如果这个刻度线已经飘出了右侧安全视口，就不画它
            if (px > this.START_X + this.VIEW_WIDTH) continue;

            // 1. 动态绘制向左移动的刻度短线与背景垂直网格
            g.drawLine(px, this.START_Y, px, this.START_Y + 6, "#fffff", 1);
            g.drawLine(px, this.START_Y, px, this.START_Y - this.VIEW_HEIGHT, "rgba(255, 255, 255, 0.06)", 1);
            
            // 2. 驱使场景中现成的 X 轴 Label 移到该像素位置，并修改文本
            if (xLabelIndex < this.xLabels.length) {
                let lbl = this.xLabels[xLabelIndex];
                lbl.visible = true;
                // 让文字完美卡在动态刻度线下方居中（假设Label在IDE里设成了居中对齐）
                lbl.pos(px - (lbl.width / 2), this.START_Y + 12);
                lbl.text = `${t}s`;
                xLabelIndex++;
            }
        }
        // 把多余没用上的预设 X轴 Label 藏起来
        for (let i = xLabelIndex; i < this.xLabels.length; i++) {
            this.xLabels[i].visible = false;
        }

        // ------------------ B. Y 轴（倍数）动态移动刻度 ------------------
        // 同理，随着倍数狂飙，动态扩大垂直数值的步长（1倍, 2倍, 5倍, 10倍...）
        let multStep = 0.5;
        if (maxMultiplier > 5) multStep = 1.0;
        if (maxMultiplier > 12) multStep = 2.0;
        if (maxMultiplier > 30) multStep = 5.0;
        if (maxMultiplier > 80) multStep = 20.0;

        let yLabelIndex = 0;
        // 遍历真实的倍数刻度 (从 1.0 开始，按步长往上累加：1.5, 2.0, 2.5...)
        for (let m = 1.0 + multStep; m <= maxMultiplier + multStep; m += multStep) {
            // 通过当前比例，计算出这个倍数在舞台上应该处于的最新【像素 Y 坐标】
            let py = this.START_Y - ((m - 1.0) * this.lastScaleY);

            // 如果超出了上方视口顶端，不画它
            if (py < this.START_Y - this.VIEW_HEIGHT) continue;

            // 1. 动态绘制向下移动的刻度短线与背景水平网格
            g.drawLine(this.START_X, py, this.START_X - 6, py, "#fffff", 1);
            g.drawLine(this.START_X, py, this.START_X + this.VIEW_WIDTH, py, "rgba(255, 255, 255, 0.06)", 1);
            // 2. 驱使场景中现成的 Y 轴 Label 移到该像素位置，并修改文本
            if (yLabelIndex < this.yLabels.length) {
                let lbl = this.yLabels[yLabelIndex];
                lbl.visible = true;
                // 将文字贴在 Y 轴左边（减去宽度和间距）
                lbl.pos(this.START_X - lbl.width - 10, py - (lbl.height / 2));
                lbl.text = m >= 10 ? m.toFixed(1) + 'x' : m.toFixed(2) + 'x'; yLabelIndex++;
            }
        }
        // 把多余没用上的预设 Y轴 Label 藏起来
        for (let i = yLabelIndex; i < this.yLabels.length; i++) {
            this.yLabels[i].visible = false;
        }
    }
    private renderAllUserTags(): void {
        this.userPointsContainer.destroyChildren(); for (let user of this.cachedUsers) {
            // 根据每帧实时的动态像素比例 lastScale 重新映射位置
            let uX = this.START_X + (user.runTime * this.lastScaleX);
            let uY = this.START_Y - ((user.multiplier - 1.0) * this.lastScaleY);
            // 超出边界就不渲染
            if (uX < this.START_X || uX > this.START_X + this.VIEW_WIDTH || uY > this.START_Y || uY < this.START_Y - this.VIEW_HEIGHT) {
                continue;
            }
            let tagSprite = new Laya.Sprite();
            tagSprite.pos(uX, uY);
            tagSprite.graphics.drawCircle(0, 0, 5, "#00FF66");
            tagSprite.graphics.fillText(user.userName + user.multiplier.toFixed(2) + 'x', 8, -6, "11px Arial", "#BBBBBB", "left");
            this.userPointsContainer.addChild(tagSprite);
        }
    }
}