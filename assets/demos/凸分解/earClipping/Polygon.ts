

/*
 * Processes given arrays of hull and hole points into single array, enforcing correct -wiseness.
 * Also provides convenience methods for accessing different hull/hole points
 */


export default class Polygon {

    public readonly points: Laya.Vector2[];
    public readonly numPoints: number;

    public readonly numHullPoints: number;

    public readonly numPointsPerHole: number[];
    public readonly numHoles: number;

    readonly holeStartIndices: number[];

    public constructor(hull: Laya.Vector2[], holes: Laya.Vector2[][] = []) {
        this.numHullPoints = hull.length;
        this.numHoles = holes.length;

        this.numPointsPerHole = [];
        this.holeStartIndices = [];
        let numHolePointsSum = 0;

        for (let i = 0; i < holes.length; i++) {
            this.numPointsPerHole[i] = holes[i].length;

            this.holeStartIndices[i] = this.numHullPoints + numHolePointsSum;
            numHolePointsSum += this.numPointsPerHole[i];
        }

        this.numPoints = this.numHullPoints + numHolePointsSum;
        this.points = [];


        // add hull points, ensuring they wind in counterclockwise order
        const reverseHullPointsOrder: boolean = !this.PointsAreCounterClockwise(hull);
        for (let i = 0; i < this.numHullPoints; i++) {
            this.points[i] = hull[(reverseHullPointsOrder) ? this.numHullPoints - 1 - i : i];
        }

        // add hole points, ensuring they wind in clockwise order
        for (let i = 0; i < this.numHoles; i++) {
            const reverseHolePointsOrder: boolean = this.PointsAreCounterClockwise(holes[i]);
            for (let j = 0; j < holes[i].length; j++) {
                this.points[this.IndexOfPointInHole(j, i)] = holes[i][(reverseHolePointsOrder) ? holes[i].length - j - 1 : j];
            }
        }

    }

    PointsAreCounterClockwise(testPoints: Laya.Vector2[]): boolean {
        let signedArea = 0;
        for (let i = 0; i < testPoints.length; i++) {
            const nextIndex = (i + 1) % testPoints.length;
            signedArea += (testPoints[nextIndex].x - testPoints[i].x) * (testPoints[nextIndex].y + testPoints[i].y);
        }

        return signedArea < 0;
    }

    public IndexOfFirstPointInHole(holeIndex: number): number {
        return this.holeStartIndices[holeIndex];
    }

    public IndexOfPointInHole(index: number, holeIndex: number): number {
        return this.holeStartIndices[holeIndex] + index;
    }

    public GetHolePoint(index: number, holeIndex: number): Laya.Vector2 {
        return this.points[this.holeStartIndices[holeIndex] + index];
    }

}

