@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    /* @IEditor.onLoad
     static async onLoad() {
         await gui.UIPackage.resourceMgr.load("MyField.widget");
     }*/

    //private _input:IEditor.CurveInput;

    public override create(): IEditor.IPropertyFieldCreateResult {

        const input: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        input.maxKeyFrame = 2;
        //input.isNormalization = true;
        //input.minValue = 0;
        //input.maxValue = 1;
        input.isWeight = true; // 控制点可任意拖动

        console.log("this.property.type:", this.property.type);
        console.log("this.property.type2:", Editor.typeRegistry.types[`${this.property.type}`]);

        console.log("types:", Editor.typeRegistry.types);
        console.log("name:", this.property.name);


        console.log("super.create", super.create);

        //const superResult = super.create();
        setTimeout(() => {
             this.createInstance();
        }, 10);


        return { ui: input };

    }

    private createInstance(): void {
        console.log("createInstance");

        const typeDef = Editor.typeRegistry.types[`${this.property.type}`];
        console.log("typeDef:", typeDef);


        const initProp = Editor.typeRegistry.getInitProps(typeDef);
        console.log("initProp", initProp);


        initProp._$type = typeDef.name;
        this.parent.target.setPropertyValue(this.property.name, initProp);
        this.expanded = true;
    }

    // onClickCreateInstance(typeName: string): void {
    //     super.onClickCreateInstance(typeName);
    //     console.log("onClickCreateInstance", typeName);
    // }

    // onClickSetNull(): void {
    //     super.onClickSetNull();
    //     console.log("onClickSetNull");
    // }

    // onResetData(): void {
    //     super.onResetData();
    //     console.log("onResetData");
    // }



}