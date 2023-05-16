/* 
gerer les sprites de morts ou pas  / brulure 

sprite de chute lorsque gravity de barry est positive 

calculer la vitesse maximale des objet pour que ca soit possible 

ajouter d'autre modele de pieces 

faire en sorte que on puisse ajouter 2 rocket
 */
present = true;
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") {
    console.log("L'utilisateur est sur la page.");
    present = true;
  } else {
    console.log("L'utilisateur n'est pas sur la page.");
    present = false;
  }
});

restart = document.getElementById("restart"); // selectionne le bouton restart
// zone de 1 a H de bas en haut
var zone1 = false; //100
var zone2 = false; // game.config.height / 4 + 100
var zone3 = false; // game.config.height 2/ 4 + 100
var zone4 = false; // game.config.height / 4 + 100

var estEntrainDeCourir = true;
var monnaie;
var Barry;
var score = 0;
var evt;
var Vitesse = -200;
var vie = 1;

//idAjoutbriques = 0;
idIntervalVitesse = 0;
idAjoutpiece = 0;
idAjoutzap = 0;
idAjoutrocket = 0;

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

var game = new Phaser.Game(config);

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
  // this.load.image("brique", "./assets/brique.png");
  this.load.image("rocket", "./assets/rocket.png");
}

function create() {
  clearInterval(idIntervalVitesse);
  //clearInterval(idAjoutbriques);
  clearInterval(idAjoutpiece);
  clearInterval(idAjoutzap);
  clearInterval(idAjoutrocket);
  idIntervalVitesse = setInterval(AugmenterVitesse, 3000);
  idAjoutpiece = setInterval(ajoutPieces, 10000);
  idAjoutzap = setInterval(ajoutZapper, 8000);
  //idAjoutbriques = setInterval(ajoutBriques, 15000);
  idAjoutrocket = setInterval(ajoutRocket, 5000);
  /* creation du background*/
  this.add.image(game.config.width / 2, game.config.height / 2, "background");

  /*Creation sol*/
  ground = this.physics.add.image(
    game.config.width / 2 + 100,
    game.config.height - 40,
    "ground"
  );
  ground.setCollideWorldBounds(true);
  /* creation des fusee*/
  fusee = this.physics.add.group();
  /*creation des briques*/
  plateformes = this.physics.add.group();
  /*creation des pieces*/
  pieces = this.physics.add.group();
  this.anims.create({
    key: "piecetourne",
    frames: this.anims.generateFrameNumbers("piece", { start: 0, end: 13 }), // les frames d'images à jouer
    frameRate: 13,
    repeat: -1,
  });

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
  Barry.setBodySize(50, 70);

  /*zapper*/
  zap = this.physics.add.group();
  this.anims.create({
    key: "zapper",
    frames: this.anims.generateFrameNumbers("zap", { start: 0, end: 3 }), // les frames d'images à jouer
    frameRate: 5,
    repeat: -1,
  });
  zapper = zap.create(-game.config.width, -game.config.height, "zap");
  heightZapHor = zapper.width;
  widthZapHor = zapper.height;

  /* COLLISION ADD */
  this.physics.add.collider(ground, Barry, Courir);
  this.physics.add.collider(plateformes, Barry, Courir);
  this.physics.add.overlap(Barry, pieces, collectPieces, null, this);
  this.physics.add.collider(Barry, zap, perdu);
  this.physics.add.collider(Barry, fusee, perdu);

  evt = this.input.keyboard.createCursorKeys();
  scoreAff = this.add.text(16, 16, "score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  //ZONE DE TEST
}

function update() {
  if (evt.space.isDown) {
    estEntrainDeCourir = false;
    Barry.setVelocity(0, -200);
    Barry.setTexture("barryVol");
    Barry.anims.play("barryJetpack");
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
  restart.addEventListener("click", () => {
    vie = 1;
    score = 0;
    Vitesse = -200;
    game.config.physics.arcade.gravity.y = 350;
    document.getElementsByClassName("menuFin")[0].style.display = "none";
    this.scene.restart(); //reinitiliser le jeu
    // this.scene.resume();
  });
}

function ajoutZapper() {
  if (present == true) {
    console.log("ajout zapper");
    let tmpal = Math.random() * 10;
    (zone1 = false), (zone2 = false), (zone3 = false), (zone4 = false);
    i = 0;
    while (i < (parseInt(tmpal, 10) % 5) + 1) {
      let heightRandom = parseInt((Math.random() * 10) % 4);

      switch (heightRandom) {
        case 0:
          if (zone2 == false || zone3 == false || zone4 == false) {
            heightRandom = 200;
            zone1 = true;
          }
          break;
        case 1:
          if (zone1 == false || zone3 == false || zone4 == false) {
            heightRandom = game.config.height / 4 + 200;
            zone2 = true;
          }
          break;
        case 2:
          if (zone2 == false || zone1 == false || zone4 == false) {
            heightRandom = (game.config.height * 2) / 4 + 200;
            zone3 = true;
          }
          break;
        case 3:
          if (zone2 == false || zone3 == false || zone1 == false) {
            heightRandom = (game.config.height * 3) / 4 + 125;
            zone4 = true;
          }
          break;
      }
      if (heightRandom > 10) {
        // quand la valeur de height randoma  ete assigne a qqch => une zone est libre
        zapper = zap.create(
          game.config.width * 1.5 + i * 400,
          heightRandom - ground.height,
          "zap"
        );
        zapper.setVelocityX(Vitesse);
        zapper.body.allowGravity = false;
        zapper.setBodySize(65, 215);
        if (parseInt((Math.random() * 10) % 4) == 3) {
          // 1 fois sur 4 on met a l'horizontal
          zapper.setBodySize(215, 65);
          zapper.angle = 90;
        }
        zapper.anims.play("zapper");
      }
      i++;
    }
  }
}

function ajoutRocket() {
  if (present == true) {
    console.log("ajout de fusee ");
    rocket = fusee.create(game.config.width * 1.5, Barry.y, "rocket");
    rocket.setVelocityX(Vitesse * 2);
    rocket.setBodySize(50, 25);
    rocket.body.allowGravity = false;
  }
}

function Courir() {
  if (estEntrainDeCourir == false) {
    Barry.anims.play("barryCours");
    estEntrainDeCourir = true;
  }
}

function ajoutPieces() {
  if (present == true) {
    console.log("fonction piece");
    if (parseInt(Math.random() * 10, 10) % 5 == 0) {
      console.log("3ligne 8 col");
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 8; j++) {
          monnaie = pieces.create(
            game.config.width * 1.5 + j * 70,
            60 + i * 60,
            "piece"
          );
          monnaie.body.allowGravity = false;
          monnaie.setVelocityX(Vitesse);
          monnaie.anims.play("piecetourne");
        }
      }
    } else {
      console.log("fleche de piece");
      let flecheok = false;
      let tmpswitch = parseInt(Math.random() * 10, 10) % 4;
      let hauteurFleche = 0;
      while (flecheok == false) {
        switch (tmpswitch) {
          case 0:
            if (zone1 == true) tmpswitch += 1;
            else {
              flecheok = true;
              hauteurFleche = 100;
            }
            break;
          case 1:
            if (zone2 == true) tmpswitch += 1;
            else {
              flecheok = true;
              hauteurFleche = 400;
            }
            break;
          case 2:
            if (zone3 == true) tmpswitch += 1;
            else {
              flecheok = true;
              hauteurFleche = 600;
            }
            break;
          case 3:
            if (zone4 == true) tmpswitch = 0;
            else {
              flecheok = true;
              hauteurFleche = game.config.height - 175;
            }
            break;
        }
        console.log(tmpswitch);
      }
      for (let j = 0; j < 7; j++) {
        if (j == 5) {
          for (let i = 0; i < 3; i++) {
            monnaie = pieces.create(
              game.config.width * 1.25 + j * 70,
              hauteurFleche - 60 + i * 60,
              "piece"
            );
            monnaie.body.allowGravity = false;
            monnaie.setVelocityX(Vitesse);
            monnaie.anims.play("piecetourne");
          }
        } else {
          monnaie = pieces.create(
            game.config.width * 1.25 + j * 70,
            hauteurFleche,
            "piece"
          );
          monnaie.body.allowGravity = false;
          monnaie.setVelocityX(Vitesse);
          monnaie.anims.play("piecetourne");
        }
      }
    }

    nbalPieces = Math.random() * 6000 + 150;
  }
}

/*function ajoutBriques() {
  if (present == true) {
    console.log("ajout briques");
    for (i = 0; i < 3; i++) {
      briques = plateformes.create(
        game.config.width * 1.5 + i * 205,
        config.height / 2,
        "brique"
      );
      briques.body.allowGravity = false;
      briques.setVelocityX(Vitesse);
      briques.setImmovable(true);
      console.log(briques.width + " ," + briques.height);
    }
  }
}*/

function collectPieces(barry, piece) {
  piece.disableBody(true, true);
  score += 5;
  scoreAff.setText("Score: " + score);
}

function AugmenterVitesse() {
  if (present == true) {
    console.log(Vitesse);
    console.log(game.config.physics.arcade.gravity.y);
    if (Vitesse <= -500) {
      clearInterval(idIntervalVitesse);
      console.log("vitesse Maximale");
    } else {
      Vitesse -= 10;
      game.config.physics.arcade.gravity.y += 5;
    }
  }
}
