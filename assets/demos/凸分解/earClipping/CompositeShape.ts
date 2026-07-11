

/*
 * Processes array of shapes into a single mesh
 * Automatically determines which shapes are solid, and which are holes
 * Ignores invalid shapes (contain self-intersections, too few points, overlapping holes)
 */

import { CompositeShapeData } from "./CompositeShapeData";
import Polygon from "./Polygon";
import Shape from "./Shape";

export default class CompositeShape {
    public vertices: Laya.Vector3[];
    public triangles: number[];

    shapes: Shape[];
    height = 0;

    public constructor(shapes: Shape[]) {
        this.shapes = shapes.concat();
    }

    public GetMesh() {
        this.Process();

        // return new Mesh()
        // {
        //     vertices = vertices,
        //     triangles = triangles,
        //     normals = vertices.Select(x => Vector3.up).ToArray()
        // };
        return null;
    }

    public Process(): void {
        // Generate array of valid shape data
        const eligibleShapes: CompositeShapeData[] = this.shapes.map(x => new CompositeShapeData(x.points)).filter(x => x.IsValidShape);

        // Set parents for all shapes. A parent is a shape which completely contains another shape.
        for (let i = 0; i < eligibleShapes.length; i++) {
            for (let j = 0; j < eligibleShapes.length; j++) {
                if (i == j)
                    continue;

                if (eligibleShapes[i].IsParentOf(eligibleShapes[j])) {
                    eligibleShapes[j].parents.push(eligibleShapes[i]);
                }
            }
        }

        // Holes are shapes with an odd number of parents.
        const holeShapes: CompositeShapeData[] = eligibleShapes.filter(x => x.parents.length % 2 != 0);
        holeShapes.forEach(holeShape => {
            // The most immediate parent (i.e the smallest parent shape) will be the one that has the highest number of parents of its own. 
            const immediateParent: CompositeShapeData = holeShape.parents.toSorted((a, b) => b.parents.length - a.parents.length)[0];
            immediateParent.holes.push(holeShape);
        });

        // Solid shapes have an even number of parents
        const solidShapes: CompositeShapeData[] = eligibleShapes.filter(x => x.parents.length % 2 == 0);
        solidShapes.forEach(solidShape => {
            solidShape.ValidateHoles();
        });
        // Create polygons from the solid shapes and their associated hole shapes
        const polygons: Polygon[] = solidShapes.map(x => new Polygon(x.polygon.points, x.holes.map(h => h.polygon.points)));
        
        // Flatten the points arrays from all polygons into a single array, and convert the vector2s to vector3s.
        // vertices = polygons.SelectMany(x => x.points.Select(v2 => new Vector3(v2.x, height, v2.y))).ToArray();
        this.vertices = polygons.map(x => x.points.map(v2 => new Laya.Vector3(v2.x, this.height, v2.y))).flat();

        // Triangulate each polygon and flatten the triangle arrays into a single array.
        const allTriangles: number[] = [];
        let startVertexIndex = 0;
        for (let i = 0; i < polygons.length; i++) {
            const triangulator = new Triangulator(polygons[i]);
            const polygonTriangles: number[] = triangulator.Triangulate();

            for (let j = 0; j < polygonTriangles.length; j++) {
                allTriangles.push(polygonTriangles[j] + startVertexIndex);
            }
            startVertexIndex += polygons[i].numPoints;
        }

        this.triangles = allTriangles;
    }
}
