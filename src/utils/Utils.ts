export default class Utils {

    /**
     * 创建自定义贝塞尔缓动
     * @param t 0~1
     * @param p1x 
     * @param p1y 
     * @param p2x 
     * @param p2y 
     * @param precision 精度位数<正整数>，默认：8
     * @description 工具推荐：https://cubic-bezier.com/ （拖拽生成控制点，复制数字直接用）, 如：创建自定义贝塞尔缓动（控制点：P1(0.25, 0.1), P2(0.25, 1) —— 标准 easeOut）
     * @returns 
     */
    static createBezierEase(t: number, p1x: number, p1y: number, p2x: number, p2y: number, precision: number = 8): number {

        /**
         * 三次贝塞尔曲线计算函数（核心）
         * @param t 0~1
         * @param p1x 
         * @param p1y 
         * @param p2x 
         * @param p2y 
         * @returns 
         */
        const cubicBezier = (t: number, p1x: number, p1y: number, p2x: number, p2y: number): number => {
            // 贝塞尔曲线参数方程（t: 0~1）
            let u = 1 - t;
            let tt = t * t;
            let uu = u * u;
            let uuu = uu * u;
            let ttt = tt * t;

            // 计算 X 和 Y 的加权平均
            let x = uuu * 0 + 3 * uu * t * p1x + 3 * u * tt * p2x + ttt * 1;
            let y = uuu * 0 + 3 * uu * t * p1y + 3 * u * tt * p2y + ttt * 1;

            // 二分法求逆（找到 t' 使得 x(t') = t）
            let a = 0, b = 1;
            for (let i = 0; i < precision; i++) {  // 迭代 8 次，精度足够
                let mid = (a + b) / 2;
                let midX = cubicBezierX(mid, p1x, p2x);  // 只计算 X
                if (midX < t) {
                    a = mid;
                } else {
                    b = mid;
                }
            }
            let finalT = (a + b) / 2;
            return cubicBezierY(finalT, p1y, p2y);  // 返回对应的 Y
        }

        /**
         * 辅助函数：只计算 X（用于逆向求解）
         * @param t 0~1
         * @param p1x 
         * @param p2x 
         * @returns 
         */
        const cubicBezierX = (t: number, p1x: number, p2x: number): number => {
            let u = 1 - t;
            let tt = t * t;
            let uu = u * u;
            let uuu = uu * u;
            let ttt = tt * t;
            return 3 * uu * t * p1x + 3 * u * tt * p2x + ttt;
        }

        /**
         * 辅助函数：只计算 Y
         * @param t 0~1
         * @param p1y 
         * @param p2y 
         * @returns 
         */
        const cubicBezierY = (t: number, p1y: number, p2y: number): number => {
            let u = 1 - t;
            let tt = t * t;
            let uu = u * u;
            let uuu = uu * u;
            let ttt = tt * t;
            return 3 * uu * t * p1y + 3 * u * tt * p2y + ttt;
        }

        return cubicBezier(t, p1x, p1y, p2x, p2y);
    }

    /**
     * 反复填充对象数组，按指定动态属性随机挑选，支持品质频率权重 + 强制位置
     * 
     * @param items 原对象数组
     * @param qualityKey 对象中表示品质的属性名
     * @param targetLength 目标长度；特殊情况：当目标长度 ≤ 原数组长度时，采取方案：均匀取样 + 支持 forcedItems
     * @param options 配置项
     * @returns 新的填充后的数组
     * @example
     * const items = [
        { id: 1, name: "蓝A", quality: 2 },
        { id: 2, name: "蓝B", quality: 2 },
        { id: 3, name: "紫C", quality: 3 },
        { id: 4, name: "橙D", quality: 4 },
        { id: 5, name: "白E", quality: 1 },
        { id: 6, name: "橙F", quality: 4 },  // 另一个橙装
        ];

        // 强制指定具体对象出现在特定位置
        const orangeD = items[3];  // 橙D

        console.log(
            Utils.repeatFillWithQuality(items, 'quality', 20, {
                forcedPositions: [
                    { index: 5, quality: 3 },         // 第6位强制紫装（如果位置没被具体对象占用）
                ],
                forcedItems: [
                    { index: 0, item: orangeD },      // 第1位强制放橙D
                    { index: 10, item: items[5] }     // 第11位强制放橙F
                ],
                qualityWeights: {
                    4: 0.4,  // 橙装出现概率高
                    1: 0.05  // 白装很少
                }
            })
        );
     */
    static repeatFillWithQuality<T extends Record<string, any>>(
        items: T[],
        qualityKey: string,
        targetLength: number,
        options: {
            maxConsecutive?: number;              // 最大连续相同品质次数，默认 2
            qualityWeights?: Record<string | number, number>;  // 品质权重
            forcedPositions?: Array<{ index: number; quality: string | number; }>;  // 强制品质在某位置
            forcedItems?: Array<{ index: number; item: T }>;     // ← 新增：强制指定某个具体对象在某位置
        } = {}
    ): T[] {
        const {
            maxConsecutive = 2,
            qualityWeights: customWeights = {},
            forcedPositions = [],
            forcedItems = [],
        } = options;

        if (targetLength <= 0 || items.length === 0) {
            return [];
        }

        // ------------------ 统一提前分组（两个分支都用） ------------------
        const groups: Record<string | number, T[]> = {};
        const qualitySet = new Set<string | number>();

        // 分组（按 quality）
        items.forEach(item => {
            const q = item[qualityKey];
            if (q !== undefined && q !== null) {
                qualitySet.add(q);
                if (!groups[q]) groups[q] = [];
                groups[q].push(item);
            }
        });

        if (qualitySet.size === 0) {
            console.warn('缺少参照目标属性');
            return [];
        };

        // ------------------ 目标长度 ≤ 原数组长度：均匀取样 + 只打乱非强制位置 ------------------
        if (targetLength <= items.length) {
            const result: T[] = new Array(targetLength);
            const usedIndices = new Set<number>();

            // 1. 先填充强制具体对象（优先级最高）
            forcedItems.forEach(forced => {
                const { index, item } = forced;
                if (
                    index >= 0 &&
                    index < targetLength &&
                    !usedIndices.has(index) &&
                    items.includes(item)
                ) {
                    result[index] = item;
                    usedIndices.add(index);
                }
            });

            // 2. 再填充强制品质位置（如果位置未被占用）
            forcedPositions.forEach(forced => {
                const { index, quality } = forced;
                if (
                    index >= 0 &&
                    index < targetLength &&
                    !usedIndices.has(index) &&
                    groups[quality]?.length > 0
                ) {
                    const group = groups[quality];
                    const itemIndex = Math.floor(Math.random() * group.length);
                    result[index] = group[itemIndex];
                    usedIndices.add(index);
                }
            });

            // 3. 计算剩余需要填充的位置数量
            const remainingLength = targetLength - usedIndices.size;
            if (remainingLength <= 0) {
                return result.filter(Boolean) as T[];  // 去除 undefined
            }

            // 4. 计算每种品质的目标数量（针对剩余位置）
            const totalItems = items.length;
            const qualityCounts: Record<string | number, number> = {};
            let totalAllocated = 0;

            Object.keys(groups).forEach(q => {
                const count = groups[q].length;
                const proportion = count / totalItems;
                let targetCount = Math.round(proportion * remainingLength);
                if (targetCount === 0 && count > 0) targetCount = 1;
                qualityCounts[q] = targetCount;
                totalAllocated += targetCount;
            });

            // 补齐或截断到 remainingLength
            if (totalAllocated < remainingLength) {
                const diff = remainingLength - totalAllocated;
                const sortedQualities = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
                for (let i = 0; i < diff; i++) {
                    const q = sortedQualities[i % sortedQualities.length];
                    qualityCounts[q] = (qualityCounts[q] || 0) + 1;
                }
            } else if (totalAllocated > remainingLength) {
                const excess = totalAllocated - remainingLength;
                const allAllocated: any[] = [];
                Object.keys(qualityCounts).forEach(q => {
                    for (let i = 0; i < qualityCounts[q]; i++) allAllocated.push(q);
                });
                allAllocated.sort(() => Math.random() - 0.5);
                const kept = allAllocated.slice(0, remainingLength);
                const finalCounts: Record<string | number, number> = {};
                kept.forEach(q => finalCounts[q] = (finalCounts[q] || 0) + 1);
                Object.assign(qualityCounts, finalCounts);
            }

            // 5. 收集所有待填充的项
            const fillCandidates: T[] = [];
            Object.keys(qualityCounts).forEach(q => {
                const group = groups[q];
                const need = qualityCounts[q];
                if (need > 0 && group.length > 0) {
                    const shuffled = [...group].sort(() => Math.random() - 0.5);
                    fillCandidates.push(...shuffled.slice(0, Math.min(need, group.length)));
                }
            });

            // 6. 顺序填充剩余空位
            let fillIndex = 0;
            for (let i = 0; i < targetLength; i++) {
                if (result[i] === undefined) {
                    if (fillIndex < fillCandidates.length) {
                        result[i] = fillCandidates[fillIndex];
                        fillIndex++;
                    } else {
                        // 极端补齐
                        result[i] = items[Math.floor(Math.random() * items.length)];
                    }
                }
            }

            // 7. 只打乱非强制位置
            const nonForcedIndices: number[] = [];
            for (let i = 0; i < targetLength; i++) {
                if (!usedIndices.has(i)) {
                    nonForcedIndices.push(i);
                }
            }

            // 提取非强制位置的值，打乱后放回
            const nonForcedValues = nonForcedIndices.map(i => result[i]);
            nonForcedValues.sort(() => Math.random() - 0.5);

            nonForcedIndices.forEach((index, idx) => {
                result[index] = nonForcedValues[idx];
            });

            return result;
        }

        // 计算权重（同之前）
        const baseWeights: Record<string | number, number> = {};
        let totalCount = 0;
        for (const q in groups) {
            const count = groups[q].length;
            baseWeights[q] = count;
            totalCount += count;
        }

        const finalWeights: Record<string | number, number> = {};
        let totalWeight = 0;
        for (const q of qualitySet) {
            const custom = customWeights[q];
            finalWeights[q] = (custom !== undefined && custom > 0) ? custom : baseWeights[q] || 0;
            totalWeight += finalWeights[q];
        }

        if (totalWeight === 0) return [];

        const probabilities: Record<string | number, number> = {};
        for (const q of qualitySet) {
            probabilities[q] = finalWeights[q] / totalWeight;
        }

        // 准备结果数组
        const result: T[] = new Array(targetLength);

        // 1. 先处理强制指定具体对象的位置（优先级最高）
        const usedIndices = new Set<number>();
        forcedItems.forEach(forced => {
            const { index, item } = forced;
            if (
                index >= 0 &&
                index < targetLength &&
                !usedIndices.has(index) &&
                items.includes(item)  // 确保 item 来自原数组
            ) {
                result[index] = item;
                usedIndices.add(index);
            }
        });

        // 2. 再处理强制指定品质的位置（如果位置已被具体对象占用，则跳过）
        forcedPositions.forEach(forced => {
            const { index, quality } = forced;
            if (
                index >= 0 &&
                index < targetLength &&
                !usedIndices.has(index) &&
                groups[quality]?.length > 0
            ) {
                const group = groups[quality];
                const itemIndex = Math.floor(Math.random() * group.length);
                result[index] = group[itemIndex];
                usedIndices.add(index);
            }
        });

        // 3. 填充剩余位置（随机 + 权重 + 连续限制）
        let filledCount = usedIndices.size;
        let lastQuality: string | number | null = null;
        let consecutiveCount = 0;

        while (filledCount < targetLength) {
            let pos = 0;
            while (pos < targetLength && result[pos] !== undefined) pos++;
            if (pos >= targetLength) break;

            let availableQualities = Array.from(qualitySet).filter(q =>
                groups[q].length > 0 &&
                (lastQuality !== q || consecutiveCount < maxConsecutive)
            );

            if (availableQualities.length === 0) {
                availableQualities = Array.from(qualitySet).filter(q => groups[q].length > 0);
                consecutiveCount = 0;
            }

            let random = Math.random();
            let selectedQuality: string | number | undefined;

            for (const q of availableQualities) {
                if (random <= probabilities[q]) {
                    selectedQuality = q;
                    break;
                }
                random -= probabilities[q];
            }

            if (!selectedQuality) {
                selectedQuality = availableQualities[Math.floor(Math.random() * availableQualities.length)];
            }

            const group = groups[selectedQuality];
            const item = group[Math.floor(Math.random() * group.length)];

            result[pos] = item;

            if (selectedQuality === lastQuality) {
                consecutiveCount++;
            } else {
                consecutiveCount = 1;
                lastQuality = selectedQuality;
            }

            filledCount++;
        }

        return result;
    }


}