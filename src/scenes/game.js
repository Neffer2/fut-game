// Useful vars
let width, height, mContext;

// Game vars
let player1, player2, goal1, goal2, ball, grass, joyStick1, joyStick2, limits = [], goalNets = [];

// Player movements
let p1GoRight = false, p1GoLeft = false, p1Jump = false, p1Velocity = 400;  
let p2GoRight = false, p2GoLeft = false, p2Jump = false, p2Velocity = 400;  

export class Game extends Phaser.Scene {
    constructor ()
    {
        super('Game');
    }   

    init(){
        mContext = this;
        width = this.game.config.width;
        height = this.game.config.height;   
        
        grass = this.physics.add.image(10, (height), 'grass')
                .setScale(20, 1)
                .setSize(width, 40)
                .setImmovable(true);
        grass.body.allowGravity = false;

        goal1 = this.add.image((width - 70), height - 140, 'goal1')
                .setName("Goal1")

        goal2 = this.add.image(70, height - 140, 'goal2')
                .setName("Goal2")
                
        ball = this.physics.add.sprite((width/2), (height/2), 'ball')
                .setName("Ball")
                .setVelocity(600)
                .setCollideWorldBounds(true)
                .setCircle(30)
                .setBounce(1);

        player1 = this.physics.add.sprite((width/3), 600, "player", 0)
                .setName("Player1")
                .setScale(5)
                .setSize(16, 28, true).setOffset(24, 14)
                .setCollideWorldBounds(true);

        player2 = this.physics.add.sprite((width - (width/3)), 600, "player", 0)
                .setName("Player2")
                .setScale(5)
                .setSize(16, 28, true).setOffset(24, 14)
                .setCollideWorldBounds(true);
        player2.flipX = true;

        joyStick1 = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: 200,
            y: 200,
            radius: 100,
            dir: '8dir',
            fixed: true,
        }).on('update', this.player1Controls, this);

        joyStick2 = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: (width - 200),
            y: 200,
            radius: 100,
            dir: '8dir',
            fixed: true,
        }).on('update', this.player2Controls, this);

        limits.push(this.add.rectangle(70, (height - 250), (width/9), 10, 0x6666ff).setName("goal1-limit"));
        limits.push(this.add.rectangle((width - 70), (height - 250), (width/9), 10, 0x6666ff).setName("goal2-limit"));

        limits.forEach(limit => {
            this.physics.add.existing(limit, true);
            limit.setAlpha(0);
        });

        goalNets.push(this.add.rectangle(130, (height - 130), 10, (width/7), 0x6666ff).setName("net1"));
        goalNets.push(this.add.rectangle((width - 130), (height - 130), 10, (width/7), 0x6666ff).setName("net2"));

        goalNets.forEach(net => {
            net.score = 0;
            this.physics.add.existing(net, true);
            net.setAlpha(0);
        });
    }

    create(){
        this.physics.world.on('worldstep', () => {
            ball.setAngularVelocity(
                Phaser.Math.RadToDeg(ball.body.velocity.x / ball.body.halfWidth)
            );
        });

        // Colitions
        this.physics.add.collider(player1, grass, () => player1.y = 650);
        this.physics.add.collider(player2, grass, () => player2.y = 650);
        this.physics.add.collider(player1, ball, rebote);
        this.physics.add.collider(player2, ball, rebote);
        this.physics.add.collider(player1, player2);

        this.physics.add.collider(player1, limits);
        this.physics.add.collider(player2, limits);
        this.physics.add.collider(ball, limits);

        this.physics.add.collider(ball, goal1);
        this.physics.add.collider(ball, goal2);

        function rebote(player, ball){
            if (player.body.velocity.x === 0){
                ball.setVelocityX(Phaser.Math.Between(-600, 600));
            }
        }

        this.physics.add.overlap(ball, goalNets, (ball, net) => {
            if (net.name === "net1"){
                player2.score++;
                console.log("Gol del jugador 2");
            }else if (net.name === "net2"){
                player1.score++;
                console.log("Gol del jugador 1");
            }
            
            ball.setPosition((width/2), (height/2));
            ball.body.enable = false;
            mContext.cameras.main.shake(100);

            setTimeout(() => {
                ball.body.enable = true;
                ball.setVelocity(600);
            }, 800);
        });

        // Animations
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', {start: 54, end: 55}),
            frameRate: 5,
            repeat: -1
        });

        this.anims.create({
            key: 'iddle',
            frames: this.anims.generateFrameNumbers('player', {start: 53, end: 53}),
            frameRate: 5,
            repeat: -1
        });
    }

    update(){
        if (p1GoLeft){
            player1.setVelocityX(-(p1Velocity));
            player1.anims.play('right', true);
            player1.flipX = true;
        }else if (p1GoRight){
            player1.setVelocityX(p1Velocity);
            player1.anims.play('right', true);
            player1.flipX = false;
        }else {
            player1.setVelocityX(0);
            player1.anims.play('iddle', true);
        }

        if (p1Jump && player1.body.touching.down){
            player1.setVelocityY(-450);
        }

        // ----------------------------------------- //

        if (p2GoLeft){
            player2.setVelocityX(-(p2Velocity));
            player2.anims.play('right', true);
            player2.flipX = true;
        }else if (p2GoRight){
            player2.setVelocityX(p2Velocity);
            player2.anims.play('right', true);
            player2.flipX = false;
        }else {
            player2.setVelocityX(0);
            player2.anims.play('iddle', true);
        }

        if (p2Jump && player2.body.touching.down){
            player2.setVelocityY(-450);
        }
    }

    player1Controls(){
        let cursorKeys = joyStick1.createCursorKeys();
        for (var name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                switch(name){
                    case "left": 
                        p1GoLeft = true;
                        break;
                    case "right": 
                        p1GoRight = true;
                        break;
                    case "up":
                        p1Jump = true;
                        break;
                }
            }else if (cursorKeys[name].isUp) {
                switch(name){
                    case "left":
                        p1GoLeft = false;
                        break;
                    case "right": 
                        p1GoRight = false;
                        break;
                    case "up":
                        p1Jump = false;
                        break;
                }
            }
        }
    }

    player2Controls(){
        let cursorKeys = joyStick2.createCursorKeys();
        for (var name in cursorKeys) {
            if (cursorKeys[name].isDown) {
                switch(name){
                    case "left": 
                        p2GoLeft = true;
                        break;
                    case "right": 
                        p2GoRight = true;
                        break;
                    case "up":
                        p2Jump = true;
                        break;
                }
            }else if (cursorKeys[name].isUp) {
                switch(name){
                    case "left":
                        p2GoLeft = false;
                        break;
                    case "right": 
                        p2GoRight = false;
                        break;
                    case "up":
                        p2Jump = false;
                        break;
                }
            }
        }
    }
}
