@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    private _input: IEditor.CurveInput;

    public override create(): IEditor.IPropertyFieldCreateResult {
        const input: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        input.maxKeyFrame = 2;
        input.isNormalization = true;
        //input.minValue = 0;
        //input.maxValue = 1;
        //input.checkable =true;
        //input.hasValue = true;
        input.isWeight = true; // 控制点可任意拖动

        input.on("submit", (evt: gui.Event) => {
            console.log("submit evt:", evt);
            console.log("_input:", this._input);

            console.log("points:", input.points);
            console.log("pt0.outTangent:", input.points[0].outTangent, "c1x:", input.points[0].c1x, "c1y:", input.points[0].c1y);
            console.log("pt1.inTangent:", input.points[1].inTangent, "c0x:", input.points[1].c0x, "c0y:", input.points[1].c0y);


            const value = this.target.getValue();

            const pt0 = input.points[0];
            const key0 = value.keys[0];
            key0.time = pt0.px;
            key0.value = pt0.py;
            key0.inTangent = pt0.inTangent;
            key0.outTangent = pt0.outTangent;
            key0.inWeight = pt0.inWeight;
            key0.outWeight = pt0.outWeight;

            const pt1 = input.points[1];
            const key1 = value.keys[1];
            key1.time = pt1.px;
            key1.value = pt1.py;
            key1.inTangent = pt1.inTangent;
            key1.outTangent = pt1.outTangent;
            key1.inWeight = pt1.inWeight;
            key1.outWeight = pt1.outWeight;

            this.target.setValue(value);

        });


        this._input = input;
        return { ui: input };
    }

    public override refresh(): void {
        console.log("refresh();");

        // 当字段为空时，创建一个默认字段
        if (!this.target.getValue()) {
            this.createInstance();

            // 默认值
            const value = this.target.getValue();
            console.log("value:",value);
            
            
            // const keys: any[] = value.keys;
            // for (let i = 0, c = keys.length; i < c; i++) {
            //     const key = value.keys[i];

            //     if (this._input.points.length - 1 < i) this._input.addPoint();

            //     const pt = this._input.points[i];
            //     pt.px = key.time;
            //     pt.py = key.value;
            //     pt.inTangent = key.inTangent;
            //     pt.outTangent = key.outTangent;
            //     pt.inWeight = key.inWeight;
            //     pt.outWeight = key.outWeight;
            // }
        }



        console.log("_input:", this._input);
        console.log("_input.onConstruct:", this._input.onConstruct);


    }


    private hermite_to_bezier(current: IEditor.PathPoint, next: IEditor.PathPoint): void {
        const a0 = (next.px - current.px) * current.outWeight;
        const b0 = current.inTangent * a0;
        current.c1x = current.px + a0 / 3;
        current.c1y = current.py + b0 / 3;


        const a1 = (next.px - current.px) * next.inWeight;
        const b1 = next.inTangent * a1;
        next.c0x = next.px - a1 / 3;
        next.c0y = next.py - b1 / 3;
    }

    private createInstance(): void {
        console.log("createInstance");

        const typeDef: IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];

        const initProp = Editor.typeRegistry.getInitProps(typeDef) || {};
        initProp._$type = typeDef.name;

        console.log("initProp:",initProp);
        

        this.parent.target.setPropertyValue(this.property.name, initProp);
    }




}