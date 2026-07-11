import Maths2D from "./Maths2D";
import Polygon from "./Polygon";

/*
 * Holds data for each shape needed when calculating composite shapes.
 */
export class CompositeShapeData {
    public readonly points: Laya.Vector2[];
    public readonly polygon: Polygon;
    public readonly triangles: number[];

    public parents: CompositeShapeData[] = [];
    public holes: CompositeShapeData[] = [];
    public IsValidShape: boolean; // { get; private set; }

    public constructor(points: Laya.Vector3[]) {
        this.points = points.map(v => new Laya.Vector2(v.x, v.z));
        this.IsValidShape = points.length >= 3 && !this.IntersectsWithSelf();

        if (this.IsValidShape) {
            this.polygon = new Polygon(this.points);
            const t = new Triangulator(this.polygon);
            this.triangles = t.Triangulate();
        }
    }

    // Removes any holes which overlap with another hole
    public ValidateHoles(): void {
        for (let i = 0; i < this.holes.length; i++) {
            for (let j = i + 1; j < this.holes.length; j++) {
                const overlap = this.holes[i].OverlapsPartially(this.holes[j]);

                if (overlap) {
                    this.holes[i].IsValidShape = false;
                    break;
                }
            }
        }

        for (let i = this.holes.length - 1; i >= 0; i--) {
            if (!this.holes[i].IsValidShape) {
                this.holes.splice(i, 1);
            }
        }
    }

    // A parent is a shape which fully contains another shape
    public IsParentOf(otherShape: CompositeShapeData): boolean {
        if (otherShape.parents.indexOf(this) > -1) {
            return true;
        }
        if (this.parents.indexOf(otherShape) > -1) {
            return false;
        }

        // check if first point in otherShape is inside this shape. If not, parent test fails.
        // if yes, then continue to line seg intersection test between the two shapes

        // (this point test is important because without it, if all line seg intersection tests fail,
        // we wouldn't know if otherShape is entirely inside or entirely outside of this shape)
        let pointInsideShape = false;
        for (let i = 0; i < this.triangles.length; i += 3) {
            if (Maths2D.PointInTriangle(this.polygon.points[this.triangles[i]], this.polygon.points[this.triangles[i + 1]], this.polygon.points[this.triangles[i + 2]], otherShape.points[0])) {
                pointInsideShape = true;
                break;
            }
        }

        if (!pointInsideShape) {
            return false;
        }

        // Check for intersections between line segs of this shape and otherShape (any intersections will fail the parent test)
        for (let i = 0; i < this.points.length; i++) {
            const parentSeg = new LineSegment(this.points[i], this.points[(i + 1) % this.points.length]);
            for (let j = 0; j < otherShape.points.length; j++) {
                const childSeg = new LineSegment(otherShape.points[j], otherShape.points[(j + 1) % otherShape.points.length]);
                if (Maths2D.LineSegmentsIntersect(parentSeg.a, parentSeg.b, childSeg.a, childSeg.b)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Test if the shapes overlap partially (test will fail if one shape entirely contains other shape, i.e. one is parent of the other).
    public OverlapsPartially(otherShape: CompositeShapeData): boolean {

        // Check for intersections between line segs of this shape and otherShape (any intersection will validate the overlap test)
        for (let i = 0; i < this.points.length; i++) {
            const segA = new LineSegment(this.points[i], this.points[(i + 1) % this.points.length]);
            for (let j = 0; j < otherShape.points.length; j++) {
                const segB = new LineSegment(otherShape.points[j], otherShape.points[(j + 1) % otherShape.points.length]);
                if (Maths2D.LineSegmentsIntersect(segA.a, segA.b, segB.a, segB.b)) {
                    return true;
                }
            }
        }
        return false;
    }

    // Checks if any of the line segments making up this shape intersect
    public IntersectsWithSelf(): boolean {

        for (let i = 0; i < this.points.length; i++) {
            const segA = new LineSegment(this.points[i], this.points[(i + 1) % this.points.length]);
            for (let j = i + 2; j < this.points.length; j++) {
                if ((j + 1) % this.points.length == i) {
                    continue;
                }
                const segB = new LineSegment(this.points[j], this.points[(j + 1) % this.points.length]);
                if (Maths2D.LineSegmentsIntersect(segA.a, segA.b, segB.a, segB.b)) {
                    return true;
                }
            }
        }
        return false;
    }


}

export class LineSegment {

    public readonly a: Laya.Vector2;
    public readonly b: Laya.Vector2;

    public constructor(a: Laya.Vector2, b: Laya.Vector2) {
        this.a = a;
        this.b = b;
    }
}
