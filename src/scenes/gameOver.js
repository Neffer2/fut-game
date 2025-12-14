export class GameOver extends Phaser.Scene {
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        let width = this.game.config.width;
        let height = this.game.config.height;

        this.add.text((width / 2), (height / 2), 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            setTimeout(() => {
                this.scene.start('Menu');
            }, 500);
        });
    }
}
