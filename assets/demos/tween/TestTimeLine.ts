const { regClass, property } = Laya;

@regClass()
export class TestTimeLine extends Laya.Script {
    
    onAwake(): void {
        const sprite = this.owner.getChildByName("Sprite", Laya.Sprite);

        const timeLine = new Laya.TimeLine();
        timeLine.to(sprite, {x:200},2000,Laya.Ease.linear, 0);
        timeLine.to(sprite, {y:200},2000,Laya.Ease.linear, 2000);
        timeLine.play();

    }
}