


  if (document.readyState === "complete") {
      init();
  }
  else {
      window.onload = function () {
          //document.addEventListener('deviceready', init, false);
          init();
      };
  };






function init(){
  setupCanvas();
  preloadAssets();
}

function preloadAssets(){
    display.queue =  new createjs.LoadQueue(true);
    display.queue.installPlugin(createjs.Sound);
    display.queue.on("complete", assetsLoaded, this);
    display.queue.loadManifest([
    {id:"ls_title", src:"./resources/images/loadingScreens/ls_title.jpg"},
    {id:"ls_credit", src:"./resources/images/loadingScreens/ls_credit.jpg"},
    {id:"ls_gameOver", src:"./resources/images/loadingScreens/ls_gameOver.jpg"},
    {id:"ls_level1", src:"./resources/images/loadingScreens/ls_level1.jpg"},
    {id:"ls_level2", src:"./resources/images/loadingScreens/ls_level2.jpg"},
    {id:"ls_level3", src:"./resources/images/loadingScreens/ls_level3.jpg"},
    {id:"ls_winner", src:"./resources/images/loadingScreens/ls_winner.jpg"},

    {id:"bt_grass", src:"./resources/images/backgroundTiles/bt_grass.png"},
    {id:"bt_hole", src:"./resources/images/backgroundTiles/bt_hole.png"},
    {id:"bt_flowerRock", src:"./resources/images/backgroundTiles/bt_flowerRock.png"},
    {id:"bt_rock", src:"./resources/images/backgroundTiles/bt_rock.png"},
    {id:"bt_flowers", src:"./resources/images/backgroundTiles/bt_flowers.png"},

    {id:"snd_welcome", src:"./resources/audio/welcome.mp3"},
    {id:"snd_punch", src:"./resources/audio/punch.mp3"},
    {id:"snd_level1Background", src:"./resources/audio/circus1.mp3"},
    {id:"snd_leve21Background", src:"./resources/audio/circus2.mp3"},
    {id:"snd_leve31Background", src:"./resources/audio/circus3.mp3"},
    {id:"snd_laugh", src:"./resources/audio/laugh.mp3"},

    {id:"ss_hit", src:"./resources/images/spriteAnimations/spritesheet_hit.png"},
    {id:"ss_idle", src:"./resources/images/spriteAnimations/spritesheet_idle.png"},
    {id:"ss_laughing", src:"./resources/images/spriteAnimations/spritesheet_laughing.png"},
    {id:"ss_pop", src:"./resources/images/spriteAnimations/spritesheet_pop.png"},
    {id:"ss_tease", src:"./resources/images/spriteAnimations/spritesheet_tease.png"},

  ]);
}

function assetsLoaded(){
  //Display the Level1 Screen
  var background = display.queue.getResult("ls_title");
  display.stage.addChild(new createjs.Bitmap(background));
  display.stage.update();

  //Register Sprite Sheets
  registerSpriteSheets();

  //click to start game
  display.stage.addEventListener('click', function(){
    loadLevel();
  });

  //Play welcome music
  createjs.Sound.play('snd_welcome');
}

function registerSpriteSheets(){
  //Hit spritesheet_pop
  var data = {
    images : [display.queue.getResult('ss_hit')],
    frames : {width: 170, height: 168},
    animations : { hit: [0,6]},
    framerate : 10
  };

  var hitSpriteSheet = new createjs.SpriteSheet(data);
  display.hitAnimation = new createjs.Sprite(hitSpriteSheet, 'hit');

  //Idle spritesheet
  var data = {
    images : [display.queue.getResult('ss_idle')],
    frames : {width: 170, height: 168},
    animations : { hit: [0,6]},
    framerate : 10
  };

  var idleSpriteSheet = new createjs.SpriteSheet(data);
  display.idleAnimation = new createjs.Sprite(idleSpriteSheet, 'idle');

 //Laughing SpriteSheet
 var data = {
   images : [display.queue.getResult('ss_laughing')],
   frames : {width: 170, height: 168},
   animations : { hit: [0,12]},
   framerate : 10
 };

 var laughingSpriteSheet = new createjs.SpriteSheet(data);
 display.laughingAnimation = new createjs.Sprite(laughingSpriteSheet, 'laugh');

 //Pop animations
 var data = {
   images : [display.queue.getResult('ss_pop')],
   frames : {width: 170, height: 168},
   animations : { hit: [0,5]},
   framerate : 10
 };

 var popSpriteSheet = new createjs.SpriteSheet(data);
 display.popAnimation = new createjs.Sprite(popSpriteSheet, 'pop');

//Tease animations
var data = {
  images : [display.queue.getResult('ss_tease')],
  frames : {width: 170, height: 168},
  animations : { hit: [0,13]},
  framerate : 10
};

var teaseSpriteSheet = new createjs.SpriteSheet(data);
display.teaseAnimation = new createjs.Sprite(teaseSpriteSheet, 'tease');


}

function loadLevel(){
  //Stop Sounds
  createjs.Sound.stop();

  //Remove Current Click Listener
  display.stage.removeAllEventListeners();

  //Display Level Screen
  display.stage.removeAllChildren();
  display.stage.update();
  var levelLabel = 'ls_level' + globals.level;
  var level_screen = display.queue.getResult(levelLabel);
  display.stage.addChild(new createjs.Bitmap(level_screen));
  display.stage.update();

  //Play Level music
  var music = 'snd_level' + globals.level + 'Background';
  createjs.Sound.play(music, {loop:8});

  //Wait for click to start play
  display.stage.addEventListener('click', function(event){
    startLevel();
  })

}

function startLevel(){
  //Remove Level Screen
  display.stage.removeAllChildren();
  display.stage.removeAllEventListeners();

  //Display the Level Grid
  var levelGrid = createLevelGrid( constant.COLUMNS, constant.ROWS);
  displayLevelGrid(levelGrid, constant.COLUMNS, constant.ROWS);

  //Make a simple array of hole positions
  globals.holePositions = new Array();
  for(var x = 0; x < levelGrid.length; x++){
    for(y = 0; y < levelGrid[x].length; y++){
      if(levelGrid[x][y] === 'bt_hole'){
        globals.holePositions.push(x);
        globals.holePositions.push(y);
      }
    }
  }

  // start ticker
  createjs.Ticker.setFPS(15);
  createjs.Ticker.addEventListener('tick', display.stage);
  createjs.Ticker.addEventListener('tick', playLoop);
  globals.playing = true;
  playGame(globals.holePositions);

}

function playLoop(){
  if(globals.playing){
    globals.gameTime = globals.gameTime + (1/15);

    if(globals.gameTime < constant.LEVELTIME){
      //How Hard will the level be?
      if(globals.level == 1){
        var frequency = constant.LEVEL1FREQUENCY;
      } else if (globals.level == 2){
        var frequency = constant.LEVEL2FREQUENCY;
      } else {
        var frequency = constant.LEVEL3FREQUENCY;
      }

      //If the numbers match-- create a mole
      var match = Math.floor((Math.random() * frequency) + 0);
      if(match == 1) {
        createRandomMole();
      }
    } else {
      globals.playing = false;
      endLevel();
    }
   }
}

  function createRandomMole(){
    var numHoles = globals.holePositions.length / 2;
    var where = Math.floor( (Math.random() * globals.holePositions.length) + 0);

    // Where will the mole appear?
    if( where % 2 != 0){
      where--;
    }

    var y = globals.holePositions[where];
    var x = globals.holePositions[where + 1];

    //Mole pops up
    display.popAnimation.x = x * constant.TILEWIDTH;
    display.popAnimation.y = y * constant.TILEHEIGHT;
    display.popAnimation.play();
    display.stage.addChild(display.popAnimation);
    display.stage.update();

    //Should the mole laugh at the player
    var playSound = Math.floor( (Math.random() * 4 ) + 0);
    if(playSound === 3){
      createjs.Sound.play('snd_laugh');
    }

    //After the mole pops up run a secondary animation
    display.popAnimation.on('animationend', function(){
      // which mole
      var which = Math.floor((Math.random() * 2) + 0);
      if(which === 0){
        var mole = display.laughingAnimation;
      }else if(which === 1){
        var mole = display.idleAnimation;
      }else{
        var mole = display.teaseAnimation;
      }

      // display the mole in the proper location
      display.stage.removeChild(display.popAnimation);
      mole.y = y * constant.TILEWIDTH;
      mole.x = x * constant.TILEWIDTH;
      mole.play();
      display.stage.addChild(mole);
      display.stage.update();
      mole.addEventListener('click', hit, false); //What to do if the mole is hit

    });

  }

  function hit(mole){
    // Play a sound, and display the "hit" animation
    createjs.Sound.play('snd_punch');
    display.stage.removeChild(mole.target);
    globals.score = globals.score + 10;
    display.hitAnimation.x = mole.target.x;
    display.stage.addChild(display.hitAnimation);
    display.stage.update();
    displayScore();

    //When the animation is done, remove it
    display.hitAnimation.on('animationend', function(){
      display.stage.removeChild(display.hitAnimation);
    });
  }

  function playGame(){
    globals.playing = true;
    globals.gameTime = 0;
    displayScore();
  }

  function endLevel(){
    clearInterval(globals.gameIntv);
    if(globals.level < 3){
      globals.level++;
      loadLevel();
    }else{
      gameOver();
    }
  }

  function gameOver(){
    // Stop Sounds
    createjs.Sound.stop();

    //Remove Current Click Listener
    display.stage.removeAllEventListeners();

    //Display Level Screen
    display.stage.removeAllChildren();
    display.stage.update();

    var background = display.queue.getResult('ls_gameOver');
    display.stage.addChild(new createjs.Bitmap(background));
    display.stage.update();

    //Play welcome music
    createjs.Sound.play('snd_welcome');

    display.stage.addEventListener('click', function(){
      globals.level = 1;
      loadLevel();
      globals.score = 0;
    });
  }

  function displayLevelGrid(levelGrid, colsNumber, rowsNumber){
    // Where will the tile be positioned?
    var xPos = 0;
    var yPos = 0;

    for(var x = 0; x < rowsNumber; x++){
      xPos = 0;
      for( var y = 0; y < colsNumber; y++){
        var tile = display.queue.getResult(levelGrid[x][y]);

        //Display the tile in the correct positioned
        var bitmap = new createjs.Bitmap(tile);
        bitmap.x = xPos;
        bitmap.y = yPos;
        display.stage.addChild(bitmap);

        // Position for the next tile on the X-axis
        xPos += constant.TILEWIDTH;
      }
      // Position for the next tile on the Y-axis
      yPos += constant.TILEHEIGHT;

    }
  }

  function displayScore(){
    display.stage.removeChild(globals.scoreText);
    globals.scoreText = new createjs.Text('Score: ' + globals.score, '30px Arial', '#ffffff');
    globals.scoreText.y = 10;
    globals.scoreText.x = 10;
    display.stage.addChild(globals.scoreText);
    display.stage.update();
  }

  function createLevelGrid(colsNumber, rowsNumber){
    var levelGrid = new Array();

    //Each Row
    for(var x = 0; x < rowsNumber; x++){
      var row = new Array();

      // Each column in that row
      for( var y = 0; y < colsNumber; y++){
        var tileType = Math.floor((Math.random() * 4) + 0);

        //Associate Graphic with numberical tileType
        if(tileType === 0){
          tileType = 'bt_grass';
        }else if (tileType === 1){
          tileType = 'bt_hole';
        }else if (tileType === 2){
          tileType = 'bt_flowerRock';
        }else if (tileType === 3){
          tileType = 'bt_rock';
        }else{
          tileType = 'bt_flowers'
        }
        row[y] = tileType;
      }
      levelGrid[x] = row;
    }
    return levelGrid;
  }

  function setupCanvas(){
    display.stage = new createjs.Stage('myCanvas');
    display.stage.canvas.width = constant.WIDTH;
    display.stage.canvas.height = constant.HEIGHT;
  }
