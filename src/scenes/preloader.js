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
        this.load.image('cloud', 'env/clouds.png');
        
        this.load.spritesheet('player', 'player/player.png', {frameWidth: 64, frameHeight: 64});

        this.load.spritesheet('p1-iddle', 'player/player1/idle.png', {frameWidth: 200.3, frameHeight: 200.5});
        this.load.spritesheet('p1-jump', 'player/player1/jump.png', {frameWidth: 200, frameHeight: 200});
        this.load.spritesheet('p1-kick', 'player/player1/kick.png', {frameWidth: 200, frameHeight: 200});
        this.load.spritesheet('p1-run', 'player/player1/run.png', {frameWidth: 200, frameHeight: 200});
        
        this.load.spritesheet('player2', 'player/player.png', {frameWidth: 64, frameHeight: 64});

        this.load.plugin('rexvirtualjoystickplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js', true);
    }

    create ()
    {
        this.scene.start('Game');
    }
}
