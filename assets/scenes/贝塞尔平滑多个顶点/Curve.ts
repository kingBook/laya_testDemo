export interface V2 {
    x: number,
    y: number
}

export class Curve {

    public static createCurve(originPoint: V2[], curveRatio: number = 0.1, isCap: boolean = false): V2[] {
        // 控制点收缩系数 ，经调试0.6较好
        const scale: number = 0.6;
        let originCount: number = originPoint.length;
        let i: number, nexti: number;
        // 生成中点
        let midpoints: V2[] = [];
        for (i = 0; i < originCount; i++) {
            nexti = (i + 1) % originCount;
            midpoints[i] = {
                x: (originPoint[i].x + originPoint[nexti].x) * 0.5,
                y: (originPoint[i].y + originPoint[nexti].y) * 0.5
            };
        }
        // 平移中点 
        let n: number = 2 * originCount, previ: number;
        let extrapoints: V2[] = [];
        let midinmid: V2;
        let offsetx: number, offsety: number, extraindex: number, addx: number, addy: number, extranexti: number;
        let curvePoints: V2[], controlPoints: V2[];
        let u: number, px: number, py: number;
        let tempP: V2;

        for (i = 0; i < n; i++) extrapoints[i] = { x: 0, y: 0 };

        for (i = 0; i < originCount; i++) {
            nexti = (i + 1) % originCount;
            previ = (i + originCount - 1) % originCount;

            midinmid = {
                x: (midpoints[i].x + midpoints[previ].x) * 0.5,
                y: (midpoints[i].y + midpoints[previ].y) * 0.5
            };

            offsetx = (originPoint[i].x - midinmid.x) | 0;
            offsety = (originPoint[i].y - midinmid.y) | 0;

            extraindex = 2 * i;
            extrapoints[extraindex].x = midpoints[previ].x + offsetx;
            extrapoints[extraindex].y = midpoints[previ].y + offsety;

            // 朝 originPoint[i]方向收缩
            addx = ((extrapoints[extraindex].x - originPoint[i].x) * scale) | 0;
            addy = ((extrapoints[extraindex].y - originPoint[i].y) * scale) | 0;
            extrapoints[extraindex].x = originPoint[i].x + addx;
            extrapoints[extraindex].y = originPoint[i].y + addy;

            extranexti = (extraindex + 1) % (2 * originCount);
            extrapoints[extranexti].x = midpoints[i].x + offsetx;
            extrapoints[extranexti].y = midpoints[i].y + offsety;

            // 朝 originPoint[i]方向收缩
            addx = ((extrapoints[extranexti].x - originPoint[i].x) * scale) | 0;
            addy = ((extrapoints[extranexti].y - originPoint[i].y) * scale) | 0;
            extrapoints[extranexti].x = originPoint[i].x + addx;
            extrapoints[extranexti].y = originPoint[i].y + addy;

        }
        curvePoints = [];
        controlPoints = [];
        //  生成4控制点，产生贝塞尔曲线
        for (i = 0; i < originCount; i++) {
            if (i >= originCount - 1 && !isCap) break;
            controlPoints[0] = originPoint[i];
            extraindex = 2 * i;
            controlPoints[1] = extrapoints[extraindex + 1];
            extranexti = (extraindex + 2) % (2 * originCount);
            controlPoints[2] = extrapoints[extranexti];
            nexti = (i + 1) % originCount;
            controlPoints[3] = originPoint[nexti];
            u = 1.0;
            while (u >= 0) {
                px = (this.bezier3funcX(u, controlPoints)) | 0;
                py = (this.bezier3funcY(u, controlPoints)) | 0;
                // u的步长决定曲线的疏密  
                u -= curveRatio;
                tempP = { x: px, y: py };
                // 存入曲线点
                curvePoints.push(tempP);
            }
        }
        return curvePoints;
    }

    /** 三次贝塞尔x */
    private static bezier3funcX(uu: number, controlP: V2[]): number {
        let part0: number = controlP[0].x * uu * uu * uu;
        let part1: number = 3 * controlP[1].x * uu * uu * (1 - uu);
        let part2: number = 3 * controlP[2].x * uu * (1 - uu) * (1 - uu);
        let part3: number = controlP[3].x * (1 - uu) * (1 - uu) * (1 - uu);
        return part0 + part1 + part2 + part3;
    }

    /** 三次贝塞尔y */
    private static bezier3funcY(uu: number, controlP: V2[]): number {
        let part0: number = controlP[0].y * uu * uu * uu;
        let part1: number = 3 * controlP[1].y * uu * uu * (1 - uu);
        let part2: number = 3 * controlP[2].y * uu * (1 - uu) * (1 - uu);
        let part3: number = controlP[3].y * (1 - uu) * (1 - uu) * (1 - uu);
        return part0 + part1 + part2 + part3;
    }
}