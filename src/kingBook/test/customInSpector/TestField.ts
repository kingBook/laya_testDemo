@IEditor.inspectorField("MyTestField")
export class TestField extends IEditor.ArrayField {
    // @IEditor.onLoad
    // static async onLoad() {
    //     //await IEditor.GUIUtils.createNumericInput();
    //     await gui.UIPackage.resourceMgr.load("~/ui/basic/Inspector/ArrayField.widget");
    // }

    public override create():IEditor.IPropertyFieldCreateResult {
    //    let input: IEditor.NumericInput = IEditor.GUIUtils.createNumericInput();
    //     input.on("changed", () => {
    //         console.log("改变了！");
    //     })
    //     this._input = input;

        //let input = gui.UIPackage.createWidgetSync("editorResources/MyField.widget");
        
        let input = gui.UIPackage.createWidgetSync("~/ui/basic/Inspector/ArrayField.widget");


        let btn = IEditor.GUIUtils.createButton();
        

        console.log("input:",input);

        let superResult=super.create();

        console.log("ui:",superResult.ui);

        superResult.ui.addChild(btn);
        btn.x=btn.parent.width-btn.width;
        let relation = new gui.Relation();
        relation.owner=btn;
        relation.target=btn.parent;
        relation.add(gui.RelationType.Right_Right,false);
        btn.relations.push(relation);
        


        //superResult.ui = input;
        return superResult;
    }

   // private _input: IEditor.NumericInput

    refresh() {
        //这里负责将数据设置到界面上
        //console.log("inspector idx:",this._input.getChild("title").text);

       // this.target.setValue(parseFloat(this._input.getChild("title").text))
    }
}