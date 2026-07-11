import Maths2D from "./Maths2D";
import Polygon from "./Polygon";

/*
 * Handles triangulation of given polygon using the 'ear-clipping' algorithm.
 * The implementation is based on the following paper:
 * https://www.geometrictools.com/Documentation/TriangulationByEarClipping.pdf
 */
export class Triangulator {
    vertsInClippedPolygon: Vertex[];
    tris: number[];
    triIndex: number = 0;

    public constructor(polygon: Polygon) {
        const numHoleToHullConnectionVerts = 2 * polygon.numHoles; // 2 verts are added when connecting a hole to the hull.
        const totalNumVerts = polygon.numPoints + numHoleToHullConnectionVerts;
        this.tris = [];
        this.tris.length = (totalNumVerts - 2) * 3;
        this.vertsInClippedPolygon = this.GenerateVertexList(polygon);
    }

    public Triangulate(): number[] {
        while (this.vertsInClippedPolygon.length >= 3) {
            let hasRemovedEarThisIteration = false;
            for (let i = 0; i < this.vertsInClippedPolygon.length; i++) {
                const len = this.vertsInClippedPolygon.length;
                const vertexNode: Vertex = this.vertsInClippedPolygon[i];
                const prevVertexNode: Vertex = this.vertsInClippedPolygon[(i - 1 + len) % len];
                const nextVertexNode: Vertex = this.vertsInClippedPolygon[(i + 1) % len];

                if (vertexNode.isConvex) {
                    if (!this.TriangleContainsVertex(prevVertexNode, vertexNode, nextVertexNode)) {
                        // check if removal of ear makes prev/next vertex convex (if was previously reflex)
                        if (!prevVertexNode.isConvex) {
                            const prevOfPrev = this.vertsInClippedPolygon[(i - 2 + len) % len];
                            prevVertexNode.isConvex = this.IsConvex(prevOfPrev.position, prevVertexNode.position, nextVertexNode.position);
                        }
                        if (!nextVertexNode.isConvex) {
                            const nextOfNext = this.vertsInClippedPolygon[(i + 2) % len];
                            nextVertexNode.isConvex = this.IsConvex(prevVertexNode.position, nextVertexNode.position, nextOfNext.position);
                        }

                        // add triangle to tri array
                        this.tris[this.triIndex * 3 + 2] = prevVertexNode.index;
                        this.tris[this.triIndex * 3 + 1] = vertexNode.index;
                        this.tris[this.triIndex * 3] = nextVertexNode.index;
                        this.triIndex++;

                        hasRemovedEarThisIteration = true;

                        this.vertsInClippedPolygon.splice(i, 1);
                        i--;
                        break;
                    }
                }
            }

            if (!hasRemovedEarThisIteration) {
                console.error("Error triangulating mesh. Aborted.");
                return null;
            }
        }
        return this.tris;
    }

    // Creates a linked list of all vertices in the polygon, with the hole vertices joined to the hull at optimal points.
    private GenerateVertexList(polygon: Polygon): Vertex[] {
        const vertexList: Vertex[] = [];
        let currentNode: Vertex = null;

        // Add all hull points to the linked list
        for (let i = 0; i < polygon.numHullPoints; i++) {
            const prevPointIndex = (i - 1 + polygon.numHullPoints) % polygon.numHullPoints;
            const nextPointIndex = (i + 1) % polygon.numHullPoints;

            const vertexIsConvex = this.IsConvex(polygon.points[prevPointIndex], polygon.points[i], polygon.points[nextPointIndex]);
            const currentHullVertex = new Vertex(polygon.points[i], i, vertexIsConvex);

            // if (currentNode == null)
            //     currentNode = vertexList.AddFirst(currentHullVertex);
            // else
            //     currentNode = vertexList.AddAfter(currentNode, currentHullVertex);
            vertexList.unshift(currentHullVertex);
            currentNode = currentHullVertex;
        }

        // Process holes:
        const sortedHoleData: HoleData[] = [];

        for (let holeIndex = 0; holeIndex < polygon.numHoles; holeIndex++) {
            // Find index of rightmost point in hole. This 'bridge' point is where the hole will be connected to the hull.
            let holeBridgePoint = new Laya.Vector2(Number.MIN_VALUE, 0);
            let holeBridgeIndex = 0;
            for (let i = 0; i < polygon.numPointsPerHole[holeIndex]; i++) {
                if (polygon.GetHolePoint(i, holeIndex).x > holeBridgePoint.x) {
                    holeBridgePoint = polygon.GetHolePoint(i, holeIndex);
                    holeBridgeIndex = i;

                }
            }
            sortedHoleData.push(new HoleData(holeIndex, holeBridgeIndex, holeBridgePoint));
        }
        // Sort hole data so that holes furthest to the right are first
        sortedHoleData.sort((x, y) => (x.bridgePoint.x > y.bridgePoint.x) ? -1 : 1);

        sortedHoleData.forEach((holeData: HoleData) => {
            // Find first edge which intersects with rightwards ray originating at the hole bridge point.
            const rayIntersectPoint = new Laya.Vector2(Number.MIN_VALUE, holeData.bridgePoint.y);
            const hullNodesPotentiallyInBridgeTriangle:Vertex[][] = [];
            let initialBridgeNodeOnHull:Vertex = null;
            currentNode = vertexList[0];
            while (currentNode != null) {
                LinkedListNode < Vertex > nextNode = (currentNode.Next == null) ? vertexList.First : currentNode.Next;
                    Vector2 p0 = currentNode.Value.position;
                    Vector2 p1 = nextNode.Value.position;

                // at least one point must be to right of holeData.bridgePoint for intersection with ray to be possible
                if (p0.x > holeData.bridgePoint.x || p1.x > holeData.bridgePoint.x) {
                    // one point is above, one point is below
                    if (p0.y > holeData.bridgePoint.y != p1.y > holeData.bridgePoint.y) {
                            float rayIntersectX = p1.x; // only true if line p0,p1 is vertical
                        if (!Mathf.Approximately(p0.x, p1.x)) {
                                float intersectY = holeData.bridgePoint.y;
                                float gradient = (p0.y - p1.y) / (p0.x - p1.x);
                                float c = p1.y - gradient * p1.x;
                            rayIntersectX = (intersectY - c) / gradient;
                        }

                        // intersection must be to right of bridge point
                        if (rayIntersectX > holeData.bridgePoint.x) {
                            LinkedListNode < Vertex > potentialNewBridgeNode = (p0.x > p1.x) ? currentNode : nextNode;
                                // if two intersections occur at same x position this means is duplicate edge
                                // duplicate edges occur where a hole has been joined to the outer polygon
                                bool isDuplicateEdge = Mathf.Approximately(rayIntersectX, rayIntersectPoint.x);

								// connect to duplicate edge (the one that leads away from the other, already connected hole, and back to the original hull) if the
								// current hole's bridge point is higher up than the bridge point of the other hole (so that the new bridge connection doesn't intersect).
								bool connectToThisDuplicateEdge = holeData.bridgePoint.y > potentialNewBridgeNode.Previous.Value.position.y;

                            if (!isDuplicateEdge || connectToThisDuplicateEdge) {
                                // if this is the closest ray intersection thus far, set bridge hull node to point in line having greater x pos (since def to right of hole).
                                if (rayIntersectX < rayIntersectPoint.x || isDuplicateEdge) {
                                    rayIntersectPoint.x = rayIntersectX;
                                    initialBridgeNodeOnHull = potentialNewBridgeNode;
                                }
                            }
                        }
                    }
                }

                // Determine if current node might lie inside the triangle formed by holeBridgePoint, rayIntersection, and bridgeNodeOnHull
                // We only need consider those which are reflex, since only these will be candidates for visibility from holeBridgePoint.
                // A list of these nodes is kept so that in next step it is not necessary to iterate over all nodes again.
                if (currentNode != initialBridgeNodeOnHull) {
                    if (!currentNode.Value.isConvex && p0.x > holeData.bridgePoint.x) {
                        hullNodesPotentiallyInBridgeTriangle.Add(currentNode);
                    }
                }
                currentNode = currentNode.Next;
            }

            // Check triangle formed by hullBridgePoint, rayIntersection, and bridgeNodeOnHull.
            // If this triangle contains any points, those points compete to become new bridgeNodeOnHull
            LinkedListNode < Vertex > validBridgeNodeOnHull = initialBridgeNodeOnHull;
            foreach(LinkedListNode < Vertex > nodePotentiallyInTriangle in hullNodesPotentiallyInBridgeTriangle)
            {
                if (nodePotentiallyInTriangle.Value.index == initialBridgeNodeOnHull.Value.index) {
                    continue;
                }
                // if there is a point inside triangle, this invalidates the current bridge node on hull.
                if (Maths2D.PointInTriangle(holeData.bridgePoint, rayIntersectPoint, initialBridgeNodeOnHull.Value.position, nodePotentiallyInTriangle.Value.position)) {
                        // Duplicate points occur at hole and hull bridge points.
                        bool isDuplicatePoint = validBridgeNodeOnHull.Value.position == nodePotentiallyInTriangle.Value.position;

                        // if multiple nodes inside triangle, we want to choose the one with smallest angle from holeBridgeNode.
                        // if is a duplicate point, then use the one occurring later in the list
                        float currentDstFromHoleBridgeY = Mathf.Abs(holeData.bridgePoint.y - validBridgeNodeOnHull.Value.position.y);
                        float pointInTriDstFromHoleBridgeY = Mathf.Abs(holeData.bridgePoint.y - nodePotentiallyInTriangle.Value.position.y);

                    if (pointInTriDstFromHoleBridgeY < currentDstFromHoleBridgeY || isDuplicatePoint) {
                        validBridgeNodeOnHull = nodePotentiallyInTriangle;

                    }
                }
            }

            // Insert hole points (starting at holeBridgeNode) into vertex list at validBridgeNodeOnHull
            currentNode = validBridgeNodeOnHull;
            for (int i = holeData.bridgeIndex; i <= polygon.numPointsPerHole[holeData.holeIndex] + holeData.bridgeIndex; i++)
            {
                        int previousIndex = currentNode.Value.index;
                        int currentIndex = polygon.IndexOfPointInHole(i % polygon.numPointsPerHole[holeData.holeIndex], holeData.holeIndex);
                        int nextIndex = polygon.IndexOfPointInHole((i + 1) % polygon.numPointsPerHole[holeData.holeIndex], holeData.holeIndex);

                if (i == polygon.numPointsPerHole[holeData.holeIndex] + holeData.bridgeIndex) // have come back to starting point
                {
                    nextIndex = validBridgeNodeOnHull.Value.index; // next point is back to the point on the hull
                }

                        bool vertexIsConvex = IsConvex(polygon.points[previousIndex], polygon.points[currentIndex], polygon.points[nextIndex]);
                        Vertex holeVertex = new Vertex(polygon.points[currentIndex], currentIndex, vertexIsConvex);
                currentNode = vertexList.AddAfter(currentNode, holeVertex);
            }

                    // Add duplicate hull bridge vert now that we've come all the way around. Also set its concavity
                    Vector2 nextVertexPos = (currentNode.Next == null) ? vertexList.First.Value.position : currentNode.Next.Value.position;
                    bool isConvex = IsConvex(holeData.bridgePoint, validBridgeNodeOnHull.Value.position, nextVertexPos);
                    Vertex repeatStartHullVert = new Vertex(validBridgeNodeOnHull.Value.position, validBridgeNodeOnHull.Value.index, isConvex);
            vertexList.AddAfter(currentNode, repeatStartHullVert);

            //Set concavity of initial hull bridge vert, since it may have changed now that it leads to hole vert
            LinkedListNode < Vertex > nodeBeforeStartBridgeNodeOnHull = (validBridgeNodeOnHull.Previous == null) ? vertexList.Last : validBridgeNodeOnHull.Previous;
            LinkedListNode < Vertex > nodeAfterStartBridgeNodeOnHull = (validBridgeNodeOnHull.Next == null) ? vertexList.First : validBridgeNodeOnHull.Next;
            validBridgeNodeOnHull.Value.isConvex = IsConvex(nodeBeforeStartBridgeNodeOnHull.Value.position, validBridgeNodeOnHull.Value.position, nodeAfterStartBridgeNodeOnHull.Value.position);
        });
        return vertexList;
    }


    // check if triangle contains any verts (note, only necessary to check reflex verts).
    private TriangleContainsVertex(v0: Vertex, v1: Vertex, v2: Vertex): boolean {
        for (let i = 0; i < this.vertsInClippedPolygon.length; i++) {
            let vertexNode = this.vertsInClippedPolygon[i];

            if (!vertexNode.isConvex) {  // convex verts will never be inside triangle
                const vertexToCheck = vertexNode;
                if (vertexToCheck.index != v0.index && vertexToCheck.index != v1.index && vertexToCheck.index != v2.index) { // dont check verts that make up triangle
                    if (Maths2D.PointInTriangle(v0.position, v1.position, v2.position, vertexToCheck.position)) {
                        return true;
                    }
                }
            }

        }

        return false;
    }


    // v1 is considered a convex vertex if v0-v1-v2 are wound in a counter-clockwise order.
    private IsConvex(v0: Laya.Vector2, v1: Laya.Vector2, v2: Laya.Vector2): boolean {
        return Maths2D.SideOfLine(v0, v2, v1) == -1;
    }



}

export class Vertex {
    public readonly position: Laya.Vector2;
    public readonly index: number;
    public isConvex: boolean;

    public constructor(position: Laya.Vector2, index: number, isConvex: boolean) {
        this.position = position;
        this.index = index;
        this.isConvex = isConvex;
    }
}

export class HoleData {
    public readonly holeIndex: number;
    public readonly bridgeIndex: number;
    public readonly bridgePoint: Laya.Vector2;

    public constructor(holeIndex: number, bridgeIndex: number, bridgePoint: Laya.Vector2) {
        this.holeIndex = holeIndex;
        this.bridgeIndex = bridgeIndex;
        this.bridgePoint = bridgePoint;
    }
}


