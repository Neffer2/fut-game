export class Preloader extends Phaser.Scene {
    constructor ()
    {
        super('Preloader');
    }

    preload ()
    {
        this.load.setPath('public/assets');
        this.load.image('ball', 'ball/ball.png');
        this.load.image('goal1', 'env/goal1.png');
        this.load.image('goal2', 'env/goal2.png');
        this.load.image('grass', 'env/grass.png');
        this.load.image('field', 'env/field.png');
        this.load.image('stadium', 'env/stadium.png');
        this.load.image('sky', 'env/sky.png');
        
        this.load.spritesheet('player', 'player/player.png', {frameWidth: 64, frameHeight: 64});

        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    }

    create ()
    {
        this.scene.start('Game');
    }
}
