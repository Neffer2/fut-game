export class Menu extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        // Title
        this.add.text(width / 2, 200, 'Cabezones', { font: '64px neon', color: '#ffffff' }).setOrigin(0.5);

        // Single Player Button
        const singleBtn = this.add.text(width / 2, height / 2 - 60, 'Juego Individual', {
            font: '48px neon',
            color: '#4deeea',
            backgroundColor: '#00000040',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        // Two Players Button
        const twoBtn = this.add.text(width / 2, height / 2 + 60, 'Dos Jugadores', {
            font: '48px neon',
            color: '#ff6ac1',
            backgroundColor: '#00000040',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        singleBtn.on('pointerover', () => singleBtn.setStyle({ backgroundColor: '#00000080' }));
        singleBtn.on('pointerout', () => singleBtn.setStyle({ backgroundColor: '#00000040' }));
        twoBtn.on('pointerover', () => twoBtn.setStyle({ backgroundColor: '#00000080' }));
        twoBtn.on('pointerout', () => twoBtn.setStyle({ backgroundColor: '#00000040' }));

        singleBtn.on('pointerdown', () => {
            this.registry.set('mode', 'single');
            this.scene.start('Game');
        });

        twoBtn.on('pointerdown', () => {
            this.registry.set('mode', 'two');
            this.scene.start('Game');
        });

        // Fullscreen Button
        const fullscreenBtn = this.add.circle(width - 50, 50, 25, 0x333333, 0.8);
        fullscreenBtn.setInteractive({ useHandCursor: true });
        fullscreenBtn.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
        
        // Añadir ícono de pantalla completa
        this.add.text(width - 50, 50, '⛶', { 
            font: '20px Arial', 
            fill: '#fff' 
        }).setOrigin(0.5);
    }
}
