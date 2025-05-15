const { regClass, property } = Laya;

@regClass()
export class TestDialog extends Laya.Script {
    @property({ type: Laya.Prefab })
    public dialogPrefab: Laya.Prefab;

    onKeyDown(evt: Laya.Event): void {
        if (evt.keyCode === Laya.Keyboard.H) {
            let dialog = <Laya.Dialog>this.dialogPrefab.create();
            dialog.popup(false,false);
        }
    }
}