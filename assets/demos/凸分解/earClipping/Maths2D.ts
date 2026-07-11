
export default class Maths2D {

    private static readonly ApproxEpsilon = Number.EPSILON * 8;

    public static PseudoDistanceFromPointToLine(a: Laya.Vector2, b: Laya.Vector2, c: Laya.Vector2): number {
        return Math.abs((c.x - a.x) * (-b.y + a.y) + (c.y - a.y) * (b.x - a.x));
    }

    public static SideOfLine(a: Laya.Vector2, b: Laya.Vector2, c: Laya.Vector2): number;
    public static SideOfLine(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number;
    public static SideOfLine(ax: any, ay: any, bx: any, by?: any, cx?: any, cy?: any): number {
        if (typeof ax === "number") {
            return Math.sign((cx - ax) * (-by + ay) + (cy - ay) * (bx - ax)) | 0;
        }
        //  return Math.sign((c.x - a.x) * (-b.y + a.y) + (c.y - a.y) * (b.x - a.x)) | 0;
        return Math.sign((bx.x - ax.x) * (-ay.y + ax.y) + (bx.y - ax.y) * (ay.x - ax.x)) | 0;
    }

    public static PointInTriangle(a: Laya.Vector2, b: Laya.Vector2, c: Laya.Vector2, p: Laya.Vector2): boolean {
        const area = 0.5 * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);
        const s = 1 / (2 * area) * (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y);
        const t = 1 / (2 * area) * (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y);
        return s >= 0 && t >= 0 && (s + t) <= 1;

    }

    public static LineSegmentsIntersect(a: Laya.Vector2, b: Laya.Vector2, c: Laya.Vector2, d: Laya.Vector2): boolean {
        const denominator = ((b.x - a.x) * (d.y - c.y)) - ((b.y - a.y) * (d.x - c.x));
        if (this.Approximately(denominator, 0)) {
            return false;
        }

        const numerator1 = ((a.y - c.y) * (d.x - c.x)) - ((a.x - c.x) * (d.y - c.y));
        const numerator2 = ((a.y - c.y) * (b.x - a.x)) - ((a.x - c.x) * (b.y - a.y));

        if (this.Approximately(numerator1, 0) || this.Approximately(numerator2, 0)) {
            return false;
        }

        const r = numerator1 / denominator;
        const s = numerator2 / denominator;

        return (r > 0 && r < 1) && (s > 0 && s < 1);
    }

    // Compares two floating point values if they are similar.
    // If a or b is zero, compare that the other is less or equal to epsilon.
    // If neither a or b are 0, then find an epsilon that is good for
    // comparing numbers at the maximum magnitude of a and b.
    // Floating points have about 7 significant digits, so
    // 1.000001f can be represented while 1.0000001f is rounded to zero,
    // thus we could use an epsilon of 0.000001f for comparing values close to 1.
    // We multiply this epsilon by the biggest magnitude of a and b.
    public static Approximately(a: number, b: number): boolean {
        return Math.abs(b - a) < Math.max(0.000001 * Math.max(Math.abs(a), Math.abs(b)), this.ApproxEpsilon);
    }

}
