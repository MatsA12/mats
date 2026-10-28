
class Raster {
  constructor(r, k) {
    this.aantalRijen = r;
    this.aantalKolommen = k;
    this.celGrootte = null;
  }

  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen;
  }

  teken() {
    let g = this.celGrootte;

    // Blauwe cellen aan de buitenrand
    noStroke();
    fill(40, 100, 255, 90);

    for (let kolom = 0; kolom < this.aantalKolommen; kolom++) {
      rect(kolom * g, 0, g, g);
      rect(kolom * g, canvas.height - g, g, g);
    }

    for (let rij = 1; rij < this.aantalRijen - 1; rij++) {
      rect(0, rij * g, g, g);
      rect(canvas.width - g, rij * g, g, g);
    }

    // Rasterlijnen
    noFill();
    stroke(100);

    for (let rij = 0; rij < this.aantalRijen; rij++) {
      for (let kolom = 0; kolom < this.aantalKolommen; kolom++) {
        rect(kolom * g, rij * g, g, g);
      }
    }

    // Blauwe buitenrand
    stroke(0, 70, 255);
    strokeWeight(5);
    noFill();
    rect(0, 0, canvas.width, canvas.height);
    strokeWeight(1);
  }
}


// Speler
class Jos {
  constructor() {
    this.x = 0;
    this.y = 300;
    this.animatie = [];
    this.frameNummer = 3;
    this.stapGrootte = null;
    this.gehaald = false;
  }

  beweeg() {
    if (keyIsDown(65)) {
      this.x -= this.stapGrootte; // A
      this.frameNummer = 2;
    }

    if (keyIsDown(68)) {
      this.x += this.stapGrootte; // D
      this.frameNummer = 1;
    }

    if (keyIsDown(87)) {
      this.y -= this.stapGrootte; // W
      this.frameNummer = 4;
    }

    if (keyIsDown(83)) {
      this.y += this.stapGrootte; // S
      this.frameNummer = 5;
    }

    let g = raster.celGrootte;

    this.x = constrain(this.x, 0, canvas.width - g);
    this.y = constrain(this.y, 0, canvas.height - g);

    // Alleen winnen wanneer de rechterkant is bereikt
    if (this.x >= canvas.width - g) {
      this.gehaald = true;
    }
  }

  wordtGeraakt(object) {
    let g = raster.celGrootte;

    return (
      this.x < object.x + g &&
      this.x + g > object.x &&
      this.y < object.y + g &&
      this.y + g > object.y
    );
  }

  toon() {
    let afbeelding = this.animatie[this.frameNummer];

    if (afbeelding) {
      image(
        afbeelding,
        this.x,
        this.y,
        raster.celGrootte,
        raster.celGrootte
      );
    }
  }
}


// Vijanden: Alice, Bob en Cindy
class Vijand {
  constructor(x, y, naam) {
    this.x = x;
    this.y = y;
    this.naam = naam;
    this.sprite = null;
    this.stapGrootte = null;
  }

  beweeg() {
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;

    let g = raster.celGrootte;

    this.x = constrain(this.x, 0, canvas.width - g);
    this.y = constrain(this.y, 0, canvas.height - g);
  }

  toon() {
    let g = raster.celGrootte;

    if (this.sprite) {
      image(this.sprite, this.x, this.y, g, g);
    } else {
      // Terugvaloptie als er geen afbeelding beschikbaar is
      noStroke();

      if (this.naam === "Cindy") {
        fill(180, 50, 220);
      } else {
        fill(220, 80, 80);
      }

      ellipse(this.x + g / 2, this.y + g / 3, g * 0.5);
      rect(this.x + g * 0.3, this.y + g * 0.5, g * 0.4, g * 0.4);
    }
  }
}


// Raketten
class Raket {
  constructor(kolom, snelheid, zwaartekracht) {
    let g = raster.celGrootte;

    // Rechts van het midden van het raster
    let eersteKolom = floor(raster.aantalKolommen / 2) + 1;
    this.x = floor(random(eersteKolom, raster.aantalKolommen)) * g;

    // De meegegeven kolom wordt gebruikt als alternatieve positie
    if (kolom !== undefined && kolom !== null) {
      this.x = kolom * g;
    }

    this.y = random(0, canvas.height - g);
    this.vy = snelheid;
    this.zwaartekracht = zwaartekracht;
    this.sprite = null;
  }

  beweeg() { //chatgpt hulp
    let g = raster.celGrootte;

    // Zwaartekracht remt de raket af tijdens het stijgen
    // en versnelt de raket tijdens het dalen.
    this.vy += this.zwaartekracht;

    this.y += this.vy;

    // Stuiteren aan de boven- en onderkant
    if (this.y <= 0) {
      this.y = 0;
      this.vy = abs(this.vy);
    }

    if (this.y >= canvas.height - g) {
      this.y = canvas.height - g;
      this.vy = -abs(this.vy);
    }
  }

  toon() {
    let g = raster.celGrootte;

    if (this.sprite) {
      image(this.sprite, this.x, this.y, g, g);
    } else {
      // Getekende raket als er geen raketafbeelding is
      push();
      translate(this.x + g / 2, this.y + g / 2);

      noStroke();
      fill(220, 40, 40);
      triangle(-g * 0.3, g * 0.2, 0, -g * 0.4, g * 0.3, g * 0.2);

      fill(180);
      rect(-g * 0.2, 0, g * 0.4, g * 0.3);

      fill(255, 150, 0);
      triangle(-g * 0.13, g * 0.3, 0, g * 0.48, g * 0.13, g * 0.3);

      pop();
    }
  }
}


// Pingpongbal
class Pingpongbal {
  constructor() {
    this.sprite = null;
    this.reset();
  }

  reset() {
    let g = raster.celGrootte;

    this.x = random(g, canvas.width - 2 * g);
    this.y = random(g, canvas.height - 2 * g);

    // De bal beweegt diagonaal
    this.vx = random([-5, 5]);
    this.vy = random([-4, 4]);
  }

  beweeg() {
    let g = raster.celGrootte;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x <= 0 || this.x >= canvas.width - g) {
      this.vx *= -1;
      this.x = constrain(this.x, 0, canvas.width - g);
    }

    if (this.y <= 0 || this.y >= canvas.height - g) {
      this.vy *= -1;
      this.y = constrain(this.y, 0, canvas.height - g);
    }
  }

  toon() {
    let g = raster.celGrootte;

    if (this.sprite) {
      image(this.sprite, this.x, this.y, g, g);
    } else {
      noStroke();
      fill(255);
      ellipse(this.x + g / 2, this.y + g / 2, g * 0.55);
      stroke(180);
      noFill();
      ellipse(this.x + g / 2, this.y + g / 2, g * 0.55);
    }
  }
}


// Recursieve, omgekeerde piramide
function tekenPiramide(x, y, breedte, hoogte, niveau) {
  if (niveau <= 0) {
    return;
  }

  push();
  noFill();
  stroke(255, 230, 100, 150);
  strokeWeight(2);

  // Driehoek met de punt naar beneden
  triangle(
    x - breedte / 2, y,
    x + breedte / 2, y,
    x, y + hoogte
  );

  pop();

  // De functie roept zichzelf opnieuw aan
  tekenPiramide(
    x,
    y + hoogte * 0.25,
    breedte * 0.7,
    hoogte * 0.7,
    niveau - 1
  );
}


// Veranderende achtergrond bij aanraken blauwe rand
function muisOpBlauweRand() {
  let g = raster.celGrootte;

  return (
    mouseX >= 0 &&
    mouseX <= canvas.width &&
    mouseY >= 0 &&
    mouseY <= canvas.height &&
    (
      mouseX < g ||
      mouseX > canvas.width - g ||
      mouseY < g ||
      mouseY > canvas.height - g
    )
  );
}


// Eindscherm met parameters
function toonEindscherm(gewonnen, boodschap) {
  if (gewonnen) {
    background(0, 160, 50);
  } else {
    background(190, 20, 30);
  }

  push();
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(40);
  text(boodschap, canvas.width / 2, canvas.height / 2);
  pop();
}


function preload() {
  brug = loadImage("images/backgrounds/dame_op_brug_1800.jpg");

  eveFrames = [];

  for (let b = 0; b < 6; b++) {
    eveFrames.push(
      loadImage("images/sprites/Eve100px/Eve_" + b + ".png")
    );
  }

  aliceSprite = loadImage("images/sprites/Alice100px/Alice.png");
  bobSprite = loadImage("images/sprites/Bob100px/Bob.png");
}


function setup() {
  canvas = createCanvas(900, 600);
  frameRate(10);
  textFont("Verdana");

  // 12 rijen en 18 kolommen
  raster = new Raster(12, 18);
  raster.berekenCelGrootte();

  // Speler
  eve = new Jos();
  eve.stapGrootte = raster.celGrootte;

  eve.animatie = eveFrames;

  // Vijanden
  let g = raster.celGrootte;

  alice = new Vijand(12 * g, 2 * g, "Alice");
  alice.stapGrootte = g;
  alice.sprite = aliceSprite;

  bob = new Vijand(10 * g, 8 * g, "Bob");
  bob.stapGrootte = g;
  bob.sprite = bobSprite;

  cindy = new Vijand(15 * g, 5 * g, "Cindy");
  cindy.stapGrootte = g;

  // Optionele afbeelding voor Cindy
  loadImage(
    "images/sprites/Cindy.png",
    afbeelding => {
      cindy.sprite = afbeelding;
    },
    () => {
      cindy.sprite = null;
    }
  );

  // Drie raketten, elk met een andere snelheid en zwaartekracht
  raketten = [
    new Raket(null, -3, 0.18),
    new Raket(null, -5, 0.30),
    new Raket(null, -7, 0.42)
  ];

  // Optionele raketafbeelding
  loadImage(
    "images/sprites/Raket.png",
    afbeelding => {
      for (let raket of raketten) {
        raket.sprite = afbeelding;
      }
    },
    () => {
      // De raketten worden dan getekend met vormen.
    }
  );

  // Pingpongbal
  bal = new Pingpongbal();

  // Optionele afbeelding voor de pingpongbal
  loadImage(
    "images/sprites/Pingpongbal.png",
    afbeelding => {
      bal.sprite = afbeelding;
    },
    () => {
      bal.sprite = null;
    }
  );

  levens = 3;
  botsingCooldown = 0;
  spelAfgelopen = false;
}


function draw() {
  // Achtergrond verandert als de muis over de blauwe rand gaat
  if (muisOpBlauweRand()) {
    background(100, 180, 255);
  } else {
    background(brug);
  }

  // Decoratie op de achtergrond
  tekenPiramide(
    canvas.width / 2,
    100,
    300,
    180,
    5
  );

  raster.teken();

  // Objecten bewegen
  eve.beweeg();

  alice.beweeg();
  bob.beweeg();
  cindy.beweeg();

  for (let raket of raketten) {
    raket.beweeg();
  }

  bal.beweeg();

  // Objecten tekenen
  eve.toon();

  alice.toon();
  bob.toon();
  cindy.toon();

  for (let raket of raketten) {
    raket.toon();
  }

  bal.toon();

  // Levens linksboven
  push();
  fill(255);
  stroke(0);
  strokeWeight(3);
  textSize(22);
  textAlign(LEFT, TOP);
  text("Levens: " + levens, 12, 10);
  pop();

  // Botsingsvertraging zodat één botsing niet
  // meteen meerdere levens kost
  if (botsingCooldown > 0) {
    botsingCooldown--;
  }

  if (botsingCooldown === 0) {
    let geraakt = eve.wordtGeraakt(alice) ||
                  eve.wordtGeraakt(bob) ||
                  eve.wordtGeraakt(cindy);

    // Botsing met een raket
    for (let raket of raketten) {
      if (eve.wordtGeraakt(raket)) {
        geraakt = true;
      }
    }

    if (geraakt) {
      levens--;
      botsingCooldown = 10;

      // Speler terugzetten bij een botsing
      eve.x = 0;
      eve.y = 300;
    }

    // Pingpongbal geeft een extra leven
    if (eve.wordtGeraakt(bal)) {
      levens++;
      bal.reset();
    }
  }

  // Eindscherm bij verlies of winst
  if (levens <= 0) {
    toonEindscherm(false, "Je hebt verloren!");
    spelAfgelopen = true;
    noLoop();
    return;
  }

  if (eve.gehaald) {
    toonEindscherm(true, "Je hebt gewonnen!");
    spelAfgelopen = true;
    noLoop();
    return;
  }
}
