/* 
trouver eds roquettes 

gerer les sprites de morts ou pas  / brulure 

diviser le jeu en plusieurs zone horizontale => pouvoir verifier que le jeu est pas impossible 

gerer les briques et les zapper 

pour les briques , faire en sorte que barry recule a cause de la collision et si il 
touche la fin du mur il meurt ( peut etre du feu)

du coup sa vitesse augmente quand il est pas a une certaine position

 */

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 1000,
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 350 },
      debug: true,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

restart = document.getElementById("restart"); // selectionne le bouton restart

var idIntervalVitesse = setInterval(AugmenterVitesse, 3000);
var game = new Phaser.Game(config);
var estEntrainDeCourir = true;
var monnaie;
var Barry;
var score = 0;
var evt;
var Vitesse = -200;
var vie = 1;
var nbal = 1500;
var nbalPieces = 3000;
var dernierePiece;
console.log(game);

/*PRELOAD*/
function preload() {
  this.load.spritesheet("barrySol", "./assets/BarrySpritesol.png", {
    frameWidth: 84,
    frameHeight: 74,
  });

  this.load.spritesheet("barryVol", "./assets/BarryVol.png", {
    frameWidth: 84,
    frameHeight: 74,
  });

  this.load.spritesheet("piece", "./assets/piece.png", {
    frameWidth: 32.7,
    frameHeight: 35,
  });
  this.load.spritesheet("zap", "./assets/zap.png", {
    frameWidth: 105,
    frameHeight: 250,
  });

  this.load.image("ground", "./assets/ground.png");
  this.load.image("background", "./assets/background.png");
  this.load.image("spikes", "./assets/spikes.png");
  this.load.image("brique", "./assets/brique.png");
}

function create() {
  /*Creation sol*/
  this.add.image(game.config.width / 2, game.config.height / 2, "background");
  ground = this.physics.add.image(
    game.config.width / 2 + 100,
    game.config.height - 40,
    "ground"
  );
  ground.setCollideWorldBounds(true);

  /*Creation du premier Spike*/
  spike = this.physics.add.image(
    game.config.width * 1.5,
    game.config.height - ground.height * 1.5,
    "spikes"
  );
  spike.setVelocity(Vitesse, 0);
  spike.body.allowGravity = false;
  /*creation des briques*/
  plateformes = this.physics.add.group();
  briques = plateformes.create(config.width / 2, config.height / 2, "brique");
  briques.body.allowGravity = false;
  briques.setBodySize(235, 115);
  briques.setVelocityX(Vitesse);
  briques.setImmovable(true);
  br = plateformes.create(config.width / 2 + 235, config.height / 2, "brique");
  br.body.allowGravity = false;
  br.setBodySize(235, 115);
  br.setVelocityX(Vitesse);
  br.setImmovable(true);
  /*creation des pieces*/

  pieces = this.physics.add.group();
  this.anims.create({
    key: "piecetourne",
    frames: this.anims.generateFrameNumbers("piece", { start: 0, end: 13 }), // les frames d'images à jouer
    frameRate: 13,
    repeat: -1,
  });
  // pour pouvoir declancher les suivantes
  monnaie = pieces.create(-100, 0, "piece");
  monnaie.setVelocityX(Vitesse);

  /*Creation Barry*/
  this.anims.create({
    key: "barryCours",
    frames: this.anims.generateFrameNumbers("barrySol", { start: 0, end: 3 }), // les frames d'images à jouer
    frameRate: 6,
    repeat: -1,
  });
  this.anims.create({
    key: "barryJetpack",
    frames: this.anims.generateFrameNumbers("barryVol", { start: 0, end: 3 }), // les frames d'images à jouer
    frameRate: 6,
    repeat: 1,
  });
  Barry = this.physics.add.sprite(
    150,
    game.config.height - ground.height * 1.5,
    "barrySol"
  );
  Barry.body.collideWorldBounds = true;
  Barry.anims.play("barryCours");

  /*zapper*/
  this.anims.create({
    key: "zapper",
    frames: this.anims.generateFrameNumbers("zap", { start: 0, end: 3 }), // les frames d'images à jouer
    frameRate: 5,
    repeat: -1,
  });
  zapper = this.physics.add.sprite(
    game.config.width / 2,
    game.config.height / 2,
    "zap"
  );
  tmpheightzap = zapper.height;
  tmpwidthzap = zapper.width;
  zapper.setVelocityX(Vitesse);
  zapper.body.allowGravity = false;
  zapper.anims.play("zapper");
  zapper.setBodySize(tmpheightzap, tmpwidthzap);
  zapper.angle = 90;

  /* COLLISION ADD */
  this.physics.add.collider(ground, Barry, Courir);
  this.physics.add.overlap(Barry, pieces, collectPieces, null, this);
  this.physics.add.collider(ground, spike);
  this.physics.add.collider(Barry, spike, perdu);
  this.physics.add.collider(Barry, zapper, perdu);
  this.physics.add.collider(Barry, plateformes);

  evt = this.input.keyboard.createCursorKeys();

  scoreAff = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });
}

function update() {
  if (evt.space.isDown) {
    estEntrainDeCourir = false;
    Barry.setVelocity(0, -250);
    Barry.setTexture("barryVol");
    Barry.anims.play("barryJetpack");
  }
  if (spike.x < -nbal) {
    /*Appartion des spikes*/
    console.log("apparition de spike");
    ajoutSpike.call(this);
    console.log(monnaie.x);
  }
  if (monnaie.x < -nbalPieces) {
    console.log("apparition de piece");
    /*Appartion des spikes*/
    ajoutPieces.call(this);
  }
  if (vie === 0) {
    gameOver.call(this); // fonction appele avec this permet de travailler sur notre jeu y comprsi dans la fonction ajoutée
  }
}

function perdu() {
  vie -= 1;
}

function gameOver() {
  this.scene.pause(); // physics a la place de scene si on veut qu la scene tourne toujours
  document.getElementsByClassName("menuFin")[0].style.display = "block";
  // Barry.setTexture("fleche");   mettre autre chose que fleche evidement
  //si on clique sur le gameover on peut recommencer
  restart.addEventListener("click", () => {
    /* remettre les parametre par defaut , ennemyvelocity , vie , score */
    vie = 1;
    score = 0;
    Vitesse = -200;

    /*enleve la fenetre game over et relance le jeu*/
    document.getElementsByClassName("menuFin")[0].style.display = "none";
    this.scene.restart(); //reinitiliser le jeu
    this.scene.resume();
  });
}

function ajoutSpike() {
  spike = this.physics.add.image(
    game.config.width * 1.5,
    game.config.height - ground.height * 1.5,
    "spikes"
  );
  spike.setVelocity(Vitesse, 0);
  spike.body.allowGravity = false;
  this.physics.add.collider(ground, spike);
  this.physics.add.collider(Barry, spike, perdu);
  nbal = Math.random() * 6000 + 150;
}

function Courir() {
  //Barry.setTexture("barrySol");
  if (estEntrainDeCourir == false) {
    Barry.anims.play("barryCours");
    estEntrainDeCourir = true;
  }
}

function ajoutPieces() {
  console.log("fonction piece");
  if (nbalPieces % 5 == 0) {
    console.log("4ligne 8 col");
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        monnaie = pieces.create(
          game.config.width * 1.5 + j * 70,
          60 + i * 60,
          "piece"
        );
        monnaie.body.allowGravity = false;
        monnaie.setVelocityX(Vitesse);
        monnaie.setVelocityY(0);
        monnaie.anims.play("piecetourne");
      }
    }
  } else {
    console.log("fleche de piece");

    for (let j = 0; j < 8; j++) {
      if (j == 6) {
        for (let i = 0; i < 3; i++) {
          monnaie = pieces.create(
            game.config.width * 1.5 + j * 70,
            game.config.height / 2 - 60 + i * 60,
            "piece"
          );
          monnaie.body.allowGravity = false;
          monnaie.setVelocityX(Vitesse);
          monnaie.setVelocityY(0);
          monnaie.anims.play("piecetourne");
        }
      } else {
        monnaie = pieces.create(
          game.config.width * 1.5 + j * 70,
          game.config.height / 2,
          "piece"
        );
        monnaie.body.allowGravity = false;
        monnaie.setVelocityX(Vitesse);
        monnaie.setVelocityY(0);
        monnaie.anims.play("piecetourne");
      }
    }
  }

  nbalPieces = Math.random() * 6000 + 150;
}
function collectPieces(barry, piece) {
  if (piece === monnaie) {
    monnaie = pieces.create(-5, game.config.height, "piece");
    monnaie.setVelocityX(Vitesse);
  }
  piece.disableBody(true, true);
  score += 5;
  scoreAff.setText("Score: " + score);
}

function AugmenterVitesse() {
  Vitesse -= 10;
  console.log(Vitesse);
}
