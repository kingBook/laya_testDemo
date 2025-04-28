const { regClass, property } = Laya;

@regClass()
export class TestLoadResource extends Laya.Script {

    @property({type:Laya.Texture2D})
    boxTexture:Laya.Texture2D;

    onAwake(): void {
        console.log("luck_box.png:", Laya.loader.getRes("res/luck_box.png"));
        console.log("max.wav:", Laya.loader.getRes("res/max.wav"));

        
        this.createImage();
        
        //this.playMusicByUrl("res/max.wav");
    }


    private createImage(): void {
        let image = new Laya.Image();
        //image.skin = "res/luck_box.png";
        image.skin = this.boxTexture.url;

        this.owner.addChild(image);

    }

    private playMusicByUrl(url:string):void{
        Laya.SoundManager.playMusic(url);
    }



}