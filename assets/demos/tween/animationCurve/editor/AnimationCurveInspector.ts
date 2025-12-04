@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.ObjectField {

    /* @IEditor.onLoad
     static async onLoad() {
         await gui.UIPackage.resourceMgr.load("MyField.widget");
     }*/

    //private _input:IEditor.CurveInput;

    /**public override create(): IEditor.IPropertyFieldCreateResult {
        
        
        const input: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        input.maxKeyFrame = 2;
        //input.isNormalization = true;
        //input.minValue = 0;
        //input.maxValue = 1;
        input.isWeight = true; // 控制点可任意拖动
        
        
        this.createInstance();
        return { ui: input };

    }*/

    private createInstance(): void {
        console.log("createInstance");
        
        
        const typeDef:IEditor.FTypeDescriptor = Editor.typeRegistry.types[`${this.property.type}`];
        console.log("typeDef:", typeDef);


        const initProp = Editor.typeRegistry.getInitProps(typeDef)||{};
        console.log("initProp", initProp);


        initProp._$type = typeDef.name;
        this.parent.target.setPropertyValue(this.property.name, initProp);
        this.expanded = true;
    }

    onClickCreateInstance(typeName: string): void {
        console.log("onClickCreateInstance", typeName);
        console.log("super.onClickCreateInstance:", super.onClickCreateInstance);
        
        //super.onClickCreateInstance(typeName);
        this.createInstance();
    }

    // onClickSetNull(): void {
    //     super.onClickSetNull();
    //     console.log("onClickSetNull");
    // }

    // onResetData(): void {
    //     super.onResetData();
    //     console.log("onResetData");
    // }



}