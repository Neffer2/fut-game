// Useful vars
let width, height, mContext;

// Game vars
let player1, player2, goal1, goal2, ball, grass, joyStick1, joyStick2, kickButton1, kickButton2, limits = [], goalNets = [],
    stadium, background, sky, clouds, kickAnimation, kickSound, backSound, goalSound, scorePlayer1, scorePlayer2;

// Game mode
let gameMode = 'two'; // 'single' for AI, 'two' for two players
let aiEnabled = false;

// Player movements
let p1GoRight = false, p1GoLeft = false, p1Jump = false, p1Kick = false, p1Velocity = 400;  
let p2GoRight = false, p2GoLeft = false, p2Jump = false, p2Kick = false, p2Velocity = 400;

// AI variables
let aiTimer = 0;
let aiDecisionTime = 300; // Time between AI decisions (ms)
let aiDifficulty = 0.8; // 0.5 = easy, 1 = hard  

let gamepad1, gamepad2;

export class Game extends Phaser.Scene {
    constructor ()
    {
        super('Game');
    }   

    init(){
        mContext = this;
        width = this.game.config.width;
        height = this.game.config.height;
        
        // Get game mode from registry
        gameMode = this.registry.get('mode') || 'two';
        aiEnabled = (gameMode === 'single');   
        
        background = this.add.tileSprite((width/2), 215, width, (height/2),'sky');
        clouds = this.add.tileSprite((width/2), 215, width, (height/2), 'cloud');        
        stadium = this.add.image((width/2), (height/2), 'stadium');

        grass = this.physics.add.image((width/2), (height - 28), 'field')
                .setSize(width, 50)
                .setImmovable(true)
                .setCollideWorldBounds(true);
        // grass.body.allowGravity = false;

        goal1 = this.add.image((width - 70), height - 140, 'goal1')
                .setName("Goal1")

        goal2 = this.add.image(70, height - 140, 'goal2')
                .setName("Goal2")
                
        ball = this.physics.add.sprite((width/2), (height/2), 'ball')
                .setScale(0.8)
                .setName("Ball")
                .setVelocity(600)
                .setCollideWorldBounds(true)
                .setCircle(30)
                .setBounce(1)
                .setMaxVelocity(1200)
                .setMass(0.5);

        player1 = this.physics.add.sprite((width/3), 500, "p1-iddle", 0)
                .setName("Player1")
                .setSize(30, 150, true).setOffset(90, 25)
                .setMass(1)
                .setCollideWorldBounds(true);
        player1.score = 0;

        player2 = this.physics.add.sprite((width - (width/3)), 500, "p2-iddle", 0)
                .setName("Player2")
                .setSize(30, 150, true).setOffset(90, 25)
                .setMass(1)
                .setCollideWorldBounds(true);
        player2.score = 0;
        player2.flipX = true;

        /** VIRTUAL JOYSTICKS **/
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
            visible: !aiEnabled
        }).on('update', this.player2Controls, this);
        
        // Hide joystick base and thumb when AI is enabled
        if (aiEnabled) {
            joyStick2.setVisible(false);
        }
        /****/

        /** VIRTUAL KICK BUTTONS **/
        // Crear botón de patada para jugador 1
        let kickButton1X = aiEnabled ? (width - 80) : 200;
        let kickButton1Y = aiEnabled ? (height - 80) : 350;
        kickButton1 = this.add.circle(kickButton1X, kickButton1Y, 40, 0xff6600, 0.7);
        kickButton1.setInteractive();
        kickButton1.on('pointerdown', () => {
            p1Kick = true;
            player1.anims.play('p1-kick', true);
            player1.setMass(5);
        });
        kickButton1.on('pointerup', () => {
            p1Kick = false;
            player1.setMass(1);
        });
        kickButton1.on('pointerout', () => {
            p1Kick = false;
            player1.setMass(1);
        });

        // Crear botón de patada para jugador 2
        kickButton2 = this.add.circle(width - 200, 350, 40, 0x006CFF, 0.7);
        kickButton2.setVisible(!aiEnabled);
        if (!aiEnabled) {
            kickButton2.setInteractive();
            kickButton2.on('pointerdown', () => {
                p2Kick = true;
                player2.anims.play('p2-kick', true);
                player2.setMass(5);
            });
            kickButton2.on('pointerup', () => {
                p2Kick = false;
                player2.setMass(1);
            });
            kickButton2.on('pointerout', () => {
                p2Kick = false;
                player2.setMass(1);
            });
        }

        // Añadir texto a los botones
        let kickButton1TextX = aiEnabled ? (width - 80) : 200;
        let kickButton1TextY = aiEnabled ? (height - 80) : 350;
        this.add.text(kickButton1TextX, kickButton1TextY, 'TIRAR', { 
            font: '16px Arial', 
            fill: '#fff' 
        }).setOrigin(0.5);
        
        if (!aiEnabled) {
            this.add.text(width - 200, 350, 'TIRAR', { 
                font: '16px Arial', 
                fill: '#fff' 
            }).setOrigin(0.5);
        }
        /****/

        /** GAMEPADS **/
        this.input.gamepad.once('down', function (gamepad, button, value) {
            mContext.GamepadControls();
        });
        /****/

        limits.push(this.add.rectangle(70, (height - 250), (width/9), 10, 0x6666ff).setName("goal1-limit"));
        limits.push(this.add.rectangle((width - 70), (height - 250), (width/9), 10, 0x6666ff).setName("goal2-limit"));

        limits.push(this.add.rectangle((width/2), (height - 10), width, 10, 0x6666ff).setName("sub-floor"));

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

        kickSound = this.sound.add('kick');
        goalSound = this.sound.add('goal');
        goalSound.setVolume(0.2);
        backSound = this.sound.add('background');
        backSound.loop = true;
        backSound.setVolume(0.1);
        backSound.play();

        scorePlayer1 = this.add.text((width/2) - 200, (height/5) - 30, 'Jaime Rodriguez', {font: '24px SoccerLeague', fill: '#fff'}).setOrigin(0.5);
        scorePlayer1.setTint(0xff0000);
        let scoreP1 = this.add.text((width/2) - 210, (height/5), player1.score, {font: '40px SoccerLeague', fill: '#fff'});
        scoreP1.setTint(0xff0000);
        
        scorePlayer2 = this.add.text((width/2) + 200, (height/5) - 30, 'Cristian Orlando', {font: '24px SoccerLeague', fill: '#fff'}).setOrigin(0.5);
        scorePlayer2.setTint(0x006CFF);
        let scoreP2 = this.add.text((width/2) + 180, (height/5), player2.score, {font: '40px SoccerLeague', fill: '#fff'});
        scoreP2.setTint(0x006CFF);
        
        // Store score text references for updates
        this.scoreP1Text = scoreP1;
        this.scoreP2Text = scoreP2;
 
        // Animations
        this.anims.create({
            key: 'p1-right',
            frames: this.anims.generateFrameNumbers('p1-run', {start: 0, end: 7}),
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'p1-kick',
            frames: this.anims.generateFrameNumbers('p1-kick', {start: 0, end: 1}),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'p1-jump',
            frames: this.anims.generateFrameNumbers('p1-jump', {start: 0}),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'p1-iddle',
            frames: this.anims.generateFrameNumbers('p1-iddle', {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'p2-right',
            frames: this.anims.generateFrameNumbers('p2-run', {start: 0, end: 7}),
            frameRate: 15,
            repeat: 0
        });

        this.anims.create({
            key: 'p2-kick',
            frames: this.anims.generateFrameNumbers('p2-kick', {start: 0, end: 1}),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'p2-jump',
            frames: this.anims.generateFrameNumbers('p2-jump', {start: 0}),
            frameRate: 10,
            repeat: 0
        });

        this.anims.create({
            key: 'p2-iddle',
            frames: this.anims.generateFrameNumbers('p2-iddle', {start: 0, end: 4}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'kick',
            frames: this.anims.generateFrameNumbers('kick', {start: 0, end: 11}),
            frameRate: 30,
            repeat: 0
        });
    }

    create(){
        // World step
        this.physics.world.on('worldstep', () => {
            ball.setAngularVelocity(
                Phaser.Math.RadToDeg(ball.body.velocity.x / ball.body.halfWidth)
            );
        });

        // Colitions
        this.physics.add.collider(player1, grass);
        this.physics.add.collider(player2, grass);
        this.physics.add.collider(ball, grass, () => {kickSound.play();});

        this.physics.add.collider(player1, ball, rebote);
        this.physics.add.collider(player2, ball, rebote);
        this.physics.add.collider(player1, player2);

        this.physics.add.collider(player1, limits, collideLimits);
        this.physics.add.collider(player2, limits, collideLimits);
        this.physics.add.collider(ball, limits);

        this.physics.add.collider(ball, goal1);
        this.physics.add.collider(ball, goal2);

        function collideLimits(player, limit){
            if (limit.name === "sub-floor"){
                player.setVelocityY(-450);
            }
        }

        function rebote(player, ball){
            kickSound.play();
            if (player.body.mass == 5){
                kickAnimation.setPosition(ball.x, ball.y).setVisible(true).play('kick');
                kickAnimation.on('animationcomplete', () => {
                    kickAnimation.setVisible(false);
                });
            }

            if (player.body.velocity.x === 0){
                ball.setVelocityX(Phaser.Math.Between(-600, 600));
            }
        }

        this.physics.add.overlap(ball, goalNets, (ball, net) => {
            goalSound.play();
            if (net.name === "net1"){
                player2.score++;
                mContext.scoreP2Text.setText(player2.score);
            }else if (net.name === "net2"){
                player1.score++;
                mContext.scoreP1Text.setText(player1.score);
            }
            
            // Verificar si algún jugador llegó a 5 goles
            if (player1.score >= 5 || player2.score >= 5) {
                // Pasar datos del ganador a la escena GameOver
                let winner = player1.score >= 5 ? 1 : 2;
                let finalScoreP1 = player1.score;
                let finalScoreP2 = player2.score;
                
                backSound.stop();
                mContext.scene.start('GameOver', { 
                    winner: winner, 
                    scoreP1: finalScoreP1, 
                    scoreP2: finalScoreP2 
                });
                return;
            }
            
            ball.setPosition((width/2), (height/2));
            ball.body.enable = false;
            mContext.cameras.main.shake(100);

            setTimeout(() => {
                ball.body.enable = true;
                ball.setVelocity(Phaser.Math.Between(-600, 600));
            }, 800);
        });

        kickAnimation = this.add.sprite(100, 100, 'kick').setVisible(false);
    }

    update(){
        clouds.tilePositionX -= .2;
        
        // AI Logic for Player 2
        if (aiEnabled) {
            this.updateAI();
        }

        if (p1GoLeft){
            player1.setVelocityX(-(p1Velocity));
            if (!p1Jump && !p1Kick){player1.anims.play('p1-right', true);}
            player1.flipX = true;
        }else if (p1GoRight){
            player1.setVelocityX(p1Velocity);
            if (!p1Jump && !p1Kick){player1.anims.play('p1-right', true);}
            player1.flipX = false;
        }else if(!p1Jump && !p1GoLeft && !p1GoRight && !p1Kick) {
            player1.setVelocityX(0);
            player1.anims.play('p1-iddle', true);
        }

        if (p1Jump && player1.body.touching.down){
            player1.anims.play('p1-jump', true);
            player1.setVelocityY(-450);
        }

        // ----------------------------------------- //

        if (p2GoLeft){
            player2.setVelocityX(-(p2Velocity));
            if (!p2Jump && !p2Kick){player2.anims.play('p2-right', true);}
            player2.flipX = false;
        }else if (p2GoRight){
            player2.setVelocityX(p2Velocity);
            if (!p2Jump && !p2Kick){player2.anims.play('p2-right', true);}
            player2.flipX = true;
        }else if(!p2Jump && !p2GoLeft && !p2GoRight && !p2Kick) {
            player2.setVelocityX(0);
            player2.anims.play('p2-iddle', true);
        }

        if (p2Jump && player2.body.touching.down){
            player2.anims.play('p2-jump', true);
            player2.setVelocityY(-450);
        }

        // ---------------- GAMEPAD -------------- //
        if (this.input.gamepad.total === 0)
        {
            return;
        }

        gamepad1 = this.input.gamepad.getPad(0);
        
        if (gamepad1 && gamepad1.axes.length)
        {
            const axisH = gamepad1.axes[0].getValue();
            // const axisV = pad.axes[1].getValue();

            if (axisH < 0){
                p1GoLeft = true;
                p1GoRight = false;
            }else if (axisH > 0){
                p1GoRight = true;
                p1GoLeft = false;
            }
            else {
                p1GoRight = false;
                p1GoLeft = false;
            }
        }

        // Only allow gamepad control for player 2 if AI is disabled
        if (!aiEnabled) {
            gamepad2 = this.input.gamepad.getPad(1);
            
            if (gamepad2 && gamepad2.axes.length)
            {
                const axisH = gamepad2.axes[0].getValue();
                // const axisV = pad.axes[1].getValue();

                if (axisH < 0){
                    p2GoLeft = true;
                    p2GoRight = false;
                }else if (axisH > 0){
                    p2GoRight = true;
                    p2GoLeft = false;
                }
                else {
                    p2GoRight = false;
                    p2GoLeft = false;
                }
            }
        }
    }

    /* virtual joystick */
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
        // Only allow manual control if AI is disabled
        if (aiEnabled) return;
        
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
    /* ** */

    GamepadControls(){
        gamepad1.on('down', function (pad, button, value) {
            if (pad === 2){
                p1Jump = true;
            }
        
            if (pad === 1){
                p1Kick = true;
                player1.anims.play('p1-kick', true);
                player1.setMass(5);
            }
        });

        gamepad1.on('up', function (pad, button, index) {
            if (pad === 2){
                p1Jump = false;
            }

            if (pad === 1){
                p1Kick = false;
                player1.setMass(1);
            }
        });

        // Only setup gamepad controls for player 2 if AI is disabled
        if (!aiEnabled && gamepad2) {
            gamepad2.on('down', function (pad, button, value) {
                if (pad === 2){
                    p2Jump = true;
                }

                if (pad === 1){
                    p2Kick = true;
                    player2.anims.play('p2-kick', true);
                    player2.setMass(5);
                }
            });

            gamepad2.on('up', function (pad, button, index) {
                if (pad === 2){
                    p2Jump = false;
                }

                if (pad === 1){
                    p2Kick = false;
                    player2.setMass(1);
                }
            });
        }
    }
    
    updateAI() {
        aiTimer += this.game.loop.delta;
        
        if (aiTimer >= aiDecisionTime) {
            aiTimer = 0;
            
            // Reset AI movements
            p2GoLeft = false;
            p2GoRight = false;
            p2Jump = false;
            p2Kick = false;
            
            // Calculate distances and positions
            const distanceToBall = Phaser.Math.Distance.Between(player2.x, player2.y, ball.x, ball.y);
            const ballDirection = ball.x < player2.x ? 'left' : 'right';
            const ballVelocityX = ball.body.velocity.x;
            const goalX = 70; // Player2's goal position
            
            // AI Decision making based on game state
            
            // 1. Defend goal if ball is close and moving towards it
            if (ball.x < width / 2 && ballVelocityX < -200 && ball.x < 400) {
                // Defensive mode - stay near goal
                if (player2.x > goalX + 150) {
                    p2GoLeft = true;
                } else if (player2.x < goalX + 50) {
                    p2GoRight = true;
                }
                
                // Jump to intercept high balls
                if (ball.y < player2.y - 100 && distanceToBall < 200 && Math.random() < aiDifficulty) {
                    p2Jump = true;
                }
            }
            // 2. Chase ball for offense
            else if (distanceToBall > 80) {
                // Move towards ball
                if (ball.x < player2.x - 30) {
                    p2GoLeft = true;
                } else if (ball.x > player2.x + 30) {
                    p2GoRight = true;
                }
                
                // Jump if ball is above
                if (ball.y < player2.y - 80 && distanceToBall < 150 && Math.random() < aiDifficulty * 0.8) {
                    p2Jump = true;
                }
            }
            // 3. Kick when close to ball
            else if (distanceToBall < 80) {
                // Determine kick timing based on difficulty
                const kickChance = aiDifficulty * 0.7;
                
                if (Math.random() < kickChance) {
                    p2Kick = true;
                    player2.anims.play('p2-kick', true);
                    player2.setMass(5);
                    
                    // Reset kick after short delay
                    setTimeout(() => {
                        p2Kick = false;
                        player2.setMass(1);
                    }, 200);
                }
            }
            // 4. Position for attack
            else if (ball.x > width / 2) {
                // Move towards center for attack opportunity
                const targetX = width * 0.75;
                if (player2.x < targetX - 50) {
                    p2GoRight = true;
                } else if (player2.x > targetX + 50) {
                    p2GoLeft = true;
                }
            }
            
            // Add some randomness to make AI less predictable
            if (Math.random() < 0.1) {
                p2GoLeft = !p2GoLeft;
                p2GoRight = !p2GoRight;
            }
        }
    }
}
