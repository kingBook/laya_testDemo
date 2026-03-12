const { regClass, property } = Laya;

@regClass()
export class TestDrawCall extends Laya.Script {

    @property({ type: Laya.Label })
    public label: Laya.Label;
    @property({ type: Laya.Label })
    public label2: Laya.Label;

    onAwake(): void {

    }

    count:number=0;

    onKeyDown(evt: Laya.Event): void {
        if (evt.key == "j") {
            this.count++;
            this.label.text += this.count;
            this.label2.text += this.count;
        }
    }

}