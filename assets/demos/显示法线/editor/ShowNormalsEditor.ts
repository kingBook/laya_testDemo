

@IEditorEnv.customEditor(Laya.MeshFilter)
export class ShowNormalsEditor extends IEditorEnv.CustomEditor {

    declare owner: Laya.Sprite3D;

    //private _manager: IEditorEnv.IGizmosManager;
    private _meshFilter: Laya.MeshFilter;

    private _start: Laya.Vector3;
    private _end: Laya.Vector3;

    public override onDrawGizmosSelected(): void {
        //this._manager = IEditorEnv.Gizmos2D.getManager(this.owner);
        this._meshFilter = this.owner.getComponent(Laya.MeshFilter);
    }

    public override onSceneGUI(): void {
        // IEditorEnv.Handles.drawHemiSphere(this.owner.transform.position, 2);

        if (this._meshFilter && this._meshFilter.sharedMesh) {
            const mesh = this._meshFilter.sharedMesh;

            const positions: Laya.Vector3[] = [];
            mesh.getPositions(positions);

            const normals: Laya.Vector3[] = [];
            mesh.getNormals(normals);

            const worldMatrix = (<Laya.Sprite3D>this._meshFilter.owner).transform.worldMatrix;

            this._start = new Laya.Vector3();
            this._end = new Laya.Vector3();

            positions.forEach((pos, i) => {
                const l = 0.1;

                this._end.x = pos.x + normals[i].x * l;
                this._end.y = pos.y + normals[i].y * l;
                this._end.z = pos.z + normals[i].z * l;

                // 将局部坐标变换到世界坐标
                Laya.Vector3.transformCoordinate(pos, worldMatrix, this._start);
                Laya.Vector3.transformCoordinate(this._end, worldMatrix, this._end);

                IEditorEnv.Handles.drawLine(this._start, this._end, Laya.Color.BLUE);
            });
        }

    }

    public override onDrawGizmos(): void {
        // IEditorEnv.Gizmos.drawIcon(this.owner.transform.position, "editorResources/UI/ready1.png");
    }

}