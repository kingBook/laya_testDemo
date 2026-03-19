export default class LuckWheelUtil {

    /**
     * 获取盘面分割线切分的各个扇区对称轴线的位置
     * @param angleOffset 盘面的偏移角度 [-180, 180]
     * @param sectorAngles 分割线角度列表，角度区间为：[0, 359] 小 -> 大
     * @param radius 半径
     * @param centerOffsetPoint 中心偏移
     * @param out 存储输出结果的数组，数组的长度为: {@link sectorAngles}.length * 2
     * @returns 返回位置数组，结果以 [x,y,...] 格式存储，数组的长度为: {@link sectorAngles}.length * 2, 当 {@link sectorAngles} 未定义或长度为 0 时返回空数组
     */
    public static getSectorPositions(angleOffset: number, sectorAngles: number[], radius: number, centerOffsetPoint?: { x: number, y: number }, out?: number[]): number[] {
        out ||= [];
        out.length = 0;
        if (!sectorAngles || sectorAngles.length === 0) return out;

        for (let i = 0, len = sectorAngles.length; i < len; i++) {
            const nextI = (i + 1) % len;
            const min = sectorAngles[i];
            const max = i >= len - 1 ? (360 + sectorAngles[0]) : sectorAngles[nextI];
            const rad = ((min + (max - min) * 0.5) + angleOffset) * Math.PI / 180;
            let x = Math.cos(rad) * radius;
            let y = Math.sin(rad) * radius;
            if (centerOffsetPoint) {
                x += centerOffsetPoint.x;
                y += centerOffsetPoint.y;
            }
            out.push(x, y);
        }
        return out;
    }
}