@IEditor.inspectorField("AnimationCurve")
export default class AnimationCurveInspector extends IEditor.PropertyField {

    /* @IEditor.onLoad
     static async onLoad() {
         await gui.UIPackage.resourceMgr.load("MyField.widget");
     }*/

    private _input:IEditor.CurveInput;

    public override create(): IEditor.IPropertyFieldCreateResult {
        const input: IEditor.CurveInput = IEditor.GUIUtils.createCurveInput();
        input.setDefaultPoints();
        input.isCurve = true;
        input.maxKeyFrame = 2;
        //input.isNormalization = true;
        //input.minValue = 0;
        //input.maxValue = 1;
        input.isWeight = true; // 控制点可任意拖动
        console.log("curveInput:", input);
        console.log("points:", input.points);
        console.log(input);

        input.on("changed",evt=>{
            console.log("changed");
            
        });
        input.onAfterDeserialize=()=>{
            console.log("onAfterDeserialize");
        };
        //this.inspector.setData()
        //this.watchProps
        console.log(this);
        
        this._input = input;
        return { ui: input };
    }

    refresh() {
        //这里负责将数据设置到界面上
        console.log("points:",this._input.points);
        
    }

    
}