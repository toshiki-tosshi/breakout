/*
音源 - Sound source
https://dova-s.jp/bgm/play2138.html
Everything has an end.	written by brightwaltz
©Sound Effect Lab
https://soundeffect-lab.info/
*/

enchant(); // Initialize library
var timeoutID;
var scene2;

window.onload = function () {
	// Catch screen size
	h = window.innerHeight;
	w = window.innerWidth;
	if (w > 1200) w /= 2;
	var world;
	var gty = 9.8;

	// Definition number of blocks
	var numRows = Math.floor((h / 45) + 1);
	var numColumns = Math.floor((w / 38) + 1);
	var blockWidth = 35;
	var blockHeight = 20;
	var firstBlockX = 15;
	var firstBlockY = 40;

	// Generate game screen
	var game = new Game(w, h); // w*h(Canvas)を作成
	game.fps = 150; // フレームレートの設定。150fpsに設定
	game.preload("images/pad.png", "images/ball1.png", "images/ball2.png", "images/ball3.png",
		"images/block0.png", "images/block1.png", "images/block2.png", "images/block3.png",
		"images/block4.png", "images/block5.png", "images/block6.png", "images/block7.png",
		"images/color_pale.png", "images/clear.png", "images/game_over.png",
		"images/stage1.png", "images/stage2.png", "images/stage3.png", "images/rule.png",
		"images/stage1.png", "images/stage2.png", "images/stage3.png",
		"musics/bgm.mp3", "musics/break.mp3", "musics/touch.mp3", "musics/clear.mp3", "musics/end.mp3"); // Preload some data

	// Create label to display score
	function createScoreLabel(size_and_font, color, x, y) {
		var scoreLabel = new Label("SCORE : 0");
		scoreLabel.font = size_and_font;
		scoreLabel.color = color;
		scoreLabel.x = x; // x coordinate
		scoreLabel.y = y; // y coordinate
		return scoreLabel;
	}

	// Create label to display help
	function createHelpLabel(size_and_font, color) {
		var helpLabel = new Label("Help");
		helpLabel.font = size_and_font;
		helpLabel.color = color;
		helpLabel.x = w - 50; // x coordinate
		helpLabel.y = 20; // y coordinate
		return helpLabel;
	}

	var scoreLabel = createScoreLabel("15px Tahoma", "black", 30, 20);
	var helpLabel = createHelpLabel("15px Tahoma", "orange");

	// Process when data loading is complete
	game.onload = function () {
		// Generate box2d world
		function createGameScene() {
			var scene = new Scene();
			var sound = game.assets['musics/bgm.mp3'].play();
			var sound1 = game.assets['musics/touch.mp3'].play();
			// Configuration background color
			switch (game.stage) {
				case 1:
					scene.backgroundColor = "white";
					break;
				case 2:
					scene.backgroundColor = "gray";
					break;
				case 3:
					scene.backgroundColor = "black";
					break;
			}
			scene2 = scene;
			world = new PhysicsWorld(0, gty);
			scene.addChild(scoreLabel);
			scene.addChild(helpLabel);
			helpLabel.addEventListener(Event.TOUCH_START, function (e) {
				var scene2 = new Scene();
				scene2 = scene;
				game.pushScene(createPoseScene());
			});

			// Ball setting
			var balls = [];

			function createBall(ball_num, x, y, dx, dy) {
				var ball = new PhyCircleSprite(7, enchant.box2d.DYNAMIC_SPRITE, 1.0, 1.0, 1, true);
				ball.image = game.assets["images/ball" + String(ball_num) + ".png"];
				ball.x = x; // x coordinate
				ball.y = y; // y coordinate
				ball.applyImpulse(new b2Vec2(gty * 0.2 * Math.random(), 0));
				ball.dx = dx; // x amount of movement
				ball.dy = dy; // y amount of movement
				ball.tag = 'ball';
				scene.addChild(ball);
				balls.push(ball);
				return ball;
			}
			var ball = createBall(3, game.width / 2, game.height * 4 / 7, 2.5, 3);
			ball.applyImpulse(new b2Vec2(gty * 0.2 * Math.random(), 0));

			// Paddle setting
			var pad_width = w / 5;
			var pad_width_item = w / 3.5;
			var pad1 = new PhyBoxSprite(pad_width, 16, enchant.box2d.STATIC_SPRITE, 1.0, 1.0, 1.5, true);
			pad1.image = game.assets["images/pad.png"];
			pad1.x = w / 3; // x coordinate
			pad1.y = h * 0.9; // y coordinate
			scene.addEventListener('touchstart', function (e) {
				pad1.x = e.x - 16;
			});
			scene.addEventListener('touchmove', function (e) {
				pad1.x = e.x - 16;
			});
			scene.addChild(pad1);

			// Item setting
			items = [];

			function createItem(radius, x, y, dx, dy) {
				var item = new PhyCircleSprite(radius, enchant.box2d.DYNAMIC_SPRITE, 1.0, 1.0, 1, true);
				item.image = game.assets["images/block7.png"];
				item.x = x; // x coordinate
				item.y = y; // y coordinate
				item.dx = dx; // x amount of movement
				item.dy = dy; // y amount of movement
				item.tag = 'item';
				scene.addChild(item);
				items.push(item);
				return item;
			}
			createItem(6, game.width / 2, game.height / 2, 2.5, 3);

			// create box2d's wall
			function createWall(width, height, friction, restitution, x, y) {
				var floor = new PhyBoxSprite(width, height, enchant.box2d.STATIC_SPRITE, 0, friction, restitution, false);
				floor.backgroundColor = "#aaa";
				floor.position = {
					x: x,
					y: y
				}
				scene.addChild(floor);
			}

			// create right and left and top wall
			createWall(20, game.height, 1.0, 1.0, game.width, game.height / 2);
			createWall(20, game.height, 1.0, 1.0, 0, game.height / 2);
			createWall(game.width, 20, 0.2, 1.0, game.width / 2, 0);
			// create buttom wall
			switch (game.stage) {
				case 1:
					createWall(game.width * 0.8, 16, 0.2, 2.0, game.width / 2, game.height);
					break;
				case 2:
					createWall(game.width * 0.2, 16, 0.2, 2.0, game.width / 2, game.height);
					break;
			}

			// Placement block
			function createBlock(block_num, col, row) {
				var block = new PhyBoxSprite(30, 15, enchant.box2d.STATIC_SPRITE, 0, 0.5, 0, false);
				block.image = game.assets["images/block" + String(block_num) + ".png"];
				block.name = '';
				block.x = firstBlockX + blockWidth * col;
				block.y = firstBlockY + blockHeight * row;
				block.frame = col;
				block.flag = 0;
				block.tag = 'block';
				blocks[row * (numColumns + 1) + col] = block;
				scene.addChild(block);
				return block;
			}

			blocks = [];
			for (var row = 0; row < numRows; row++) {
				for (var col = 0; col < numColumns; col++) {
					var block = createBlock(row % 6, col, row);
					var seedValue = Math.random();
					if (seedValue > 0.95) {
						block.image = game.assets["images/block6.png"];
						block.name = 'ball_block';
					}
					if (seedValue < 0.05) {
						block.image = game.assets["images/block7.png"];
						block.name = 'pad_block';
					}
				}
			}


			// Process when a frame event occurs
			scene.addEventListener(Event.ENTER_FRAME, function () {
				world.step(game.fps);

				function judgeObj(ary) {
					for (var i = 0; i < ary.length; i++) {
						if (ary[i].y > game.height) {
							ary[i].destroy();
							scene.removeChild(ary[i]);
							ary.splice(i, 1);
						}
					}
				}

				judgeObj(balls); // Ball drop judgment
				judgeObj(items); // Item drop judgment

				pad1.setWidth = function (w) {
					this.width = w;
					this.body.m_shape.SetAsBox(w / 64, 0.25);
				};

				// Paddle and item contact judgment
				for (var i = 0; i < items.length; i++) {
					if (pad1.within(items[i])) {
						clearTimeout(timeoutID);
						timeoutID = setTimeout(function () {
							pad1.setWidth(pad_width);
						}, 3000);
						items[i].destroy();
						scene.removeChild(items[i]);
						items.splice(i, 1);
						pad1.setWidth(pad_width_item);
					}
				}

				// Game end judgment
				if (balls.length == 0) {
					// game.stop();
					removeScene(scene);
					game.replaceScene(createFalseScene());
				}

				// Game clear judgment
				if (blocks.every((x) => x.flag == 1)) {
					switch (game.stage) {
						case 1:
							game.score += 100;
							game.stage = 2;
							removeScene(scene);
							game.replaceScene(createRestScene());
							break;
						case 2:
							game.score += 1000;
							game.stage = 3;
							removeScene(scene);
							game.replaceScene(createRestScene());
							break;
						case 3:
							game.score += 10000;
							removeScene(scene);
							game.replaceScene(createClearScene());
							break;
					}
				}

				// Move paddle setting
				var n = game.input.analogX / 4;
				if (!isNaN(n)) {
					pad1.x += n; // Move paddle
					if (pad1.x < 0) {
						pad1.x = 0;
					} // Check left edge
					if (pad1.x > (game.width - pad1.width)) {
						pad1.x = game.width - pad1.width;
					} // Check left edge
				}

				// Contact judgment of ball and block
				for (var i = 0; i < balls.length; i++) {
					balls[i].contact(function (sprite) {
						if (sprite.tag == 'block') {
							var sound = game.assets['musics/break.mp3'].clone();
							sound.play();
							game.score++;
							sprite.flag = 1;
							sprite.destroy();
							if (sprite.name == 'ball_block') {
								game.score += 100;
								for (var u = 0; u < 3; u++) {
									createBall((u % 3) + 1, sprite.x, sprite.y, 2.5, -3);
								}
							}
							if (sprite.name == 'pad_block') {
								game.score += 100;
								createItem(5, sprite.x, sprite.y, 3, -2);
							}
						}
					});
				}
				// Change font color depends on SCORE
				scoreLabel.color = game.score % 10 == 0 ? "red" : "pink";
				scoreLabel.text = "SCORE : " + game.score;
			});
			return scene;
		}
		// createGameScene end

		function createStartScene() {
			var scene = new Scene();
			game.score = 0; // Prepare a variable to score
			game.stage = 1;
			var bg = new Sprite(300, 300);
			bg.x = w / 2 - 150;
			bg.y = h / 2 - 150;
			bg.image = game.assets['images/stage1.png'];
			scene.addChild(bg);
			scene.addEventListener(Event.TOUCH_START, function (e) {
				removeScene(scene);
				game.replaceScene(createGameScene()); // Replace the currently displayed scene with the game scene
			});
			return scene;
		}
		// createStartScene end

		function createClearScene() {
			var scene = new Scene();
			var bg = new Sprite(300, 300);
			bg.x = w / 2 - 150;
			bg.y = h / 2 - 150;
			bg.image = game.assets['images/clear.png'];
			scene.addChild(bg);
			scene.addEventListener(Event.TOUCH_START, function (e) {
				removeScene(scene);
				game.replaceScene(createEndScene()); // Replace the currently displayed scene with the game scene
			});
			scene.addChild(scoreLabel);
			var sound = game.assets['musics/clear.mp3'].play();
			return scene;
		}
		// createClearScene end

		function createFalseScene() {
			var scene = new Scene();
			var bg = new Sprite(300, 300);
			bg.x = w / 2 - 150;
			bg.y = h / 2 - 150;
			bg.image = game.assets['images/game_over.png'];
			scene.addChild(bg);
			var sound = game.assets['musics/end.mp3'].play();
			scene.addChild(scoreLabel);
			scene.addEventListener(Event.TOUCH_START, function (e) {
				removeScene(scene);
				game.replaceScene(createEndScene()); // Replace the currently displayed scene with the game scene
			});
			return scene;
		}
		// createFalseScene end

		function createRestScene() {
			var scene = new Scene();
			var bg = new Sprite(300, 300);
			bg.x = w / 2 - 150;
			bg.y = h / 2 - 150;
			switch (game.stage) {
				case 2:
					bg.image = game.assets['images/stage2.png'];
					break;
				case 3:
					bg.image = game.assets['images/stage3.png'];
					break;
			}
			scene.addChild(bg);
			scene.addEventListener(Event.TOUCH_START, function (e) {
				removeScene(scene);
				game.replaceScene(createGameScene()); // Replace the currently displayed scene with the game scene
			});
			return scene;
		}
		// createRestScene end

		function createEndScene() {
			var scene = new Scene();
			var bg = new Sprite(300, 300);
			bg.x = w / 2 - 150;
			bg.y = h / 2 - 150;
			bg.image = game.assets['images/color_pale.png'];
			scene.addChild(bg);
			scene.addEventListener(Event.TOUCH_START, function (e) {
				removeScene(scene);
				game.replaceScene(createStartScene()); // Replace the currently displayed scene with the game scene
			});
			return scene;
		}
		// createEndScene end

		function createPoseScene() {
			var scene = new Scene();
			var bg = new Sprite(300, 300);
			bg.x = w / 2 - 150;
			bg.y = h / 2 - 150;
			bg.image = game.assets['images/rule.png'];
			scene.addChild(bg);
			scene.addEventListener(Event.TOUCH_START, function (e) {
				removeScene(scene);
				game.replaceScene(scene2);
			});
			return scene;
		}
		// createPoseScene end

		// Set the tilt sensor
		if (!window.DeviceOrientationEvent) {
			alert("No Orientation Device");
		}
		window.addEventListener("deviceorientation", function (evt) {
			game.input.analogX = evt.gamma;
			sensorLabel.text = game.input.analogX;
		}, false);

		game.replaceScene(createStartScene());

		// Delete a scene when switching scenes
		function removeScene(scene) {
			while (scene.firstChild) {
				scene.removeChild(scene.firstChild);
			}
		}
		// removeScene end

		// Game start
	}
	game.start();
}