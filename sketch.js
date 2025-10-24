let mapCanvas;
let mapCanvasWidth;
let mapCanvasHeight;
let gridWidth;
let gridHeight;
let hexagonSize;
let saveButton;
let nameInput;
let mapName = 'map';
let nameButton;
let hexTypeSelect;
let xMin;
let yMin;
let hexes = [];
let selectedHex;
let terrainLegendY;
let terrainMods;


function setup() {

  createCanvas(windowWidth, windowHeight);
  background(15, 35, 0);

  mapCanvasWidth = windowWidth * 0.8;
  mapCanvasHeight = windowHeight * 0.8;
  mapCanvas = createGraphics(mapCanvasWidth, mapCanvasHeight);
  mapCanvas.background(15);

  gridWidth = mapCanvasWidth;
  gridHeight = mapCanvasHeight;
  hexagonSize = mapCanvasWidth / 30;

  // --- Terrain Mod Definitions (used by map + legend) ---
terrainMods = [
  {
    name: 'Mountains',
    color: '#AAAAAA',
    shape: (g, cx, cy) => {
      g.noFill();
      g.stroke(255);
      g.triangle(cx, cy - 5, cx - 5, cy + 5, cx + 5, cy + 5);
    }
  },
  {
    name: 'Lake',
    color: '#0000FF',
    shape: (g, cx, cy) => {
      g.noStroke();
      g.fill('#0000FF');
      g.ellipse(cx, cy, hexagonSize / 3, hexagonSize / 4);
    }
  },
  {
    name: 'Tower',
    color: '#FFFDD0',
    shape: (g, cx, cy) => {
      g.fill('#FFFDD0');
      g.noStroke();
      g.rect(cx - 3, cy - 6, 6, 10);
    }
  },
  {
    name: 'Cemetery',
    color: '#808080',
    shape: (g, cx, cy) => {
      g.stroke('#808080');
      g.line(cx - 5, cy + 5, cx + 5, cy + 5);
      g.noFill();
      g.arc(cx, cy + 5, 10, 20, PI, TWO_PI);
    }
  },
  {
    name: 'City',
    color: '#FF0000',
    shape: (g, cx, cy) => {
      g.fill('#FF0000');
      g.noStroke();
      g.circle(cx, cy, hexagonSize / 4);
    }
  },
  {
    name: 'Cave',
    color: '#444444',
    shape: (g, cx, cy) => {
      g.fill('#444444');
      g.noStroke();
      g.ellipse(cx, cy, hexagonSize / 4, hexagonSize / 2);
    }
  },
  {
    name: 'Whirlpool',
    color: '#FFFFFF',
    shape: (g, cx, cy) => {
      g.noFill();
      g.stroke(200);
      g.arc(cx, cy-2, 15, 10, cx, 0, HALF_PI), 
      g.arc(cx, cy+5, 15, 10, cx+3, HALF_PI, PI), 
      g.arc(cx, cy+1, 5, 5, cx, -3, PI), 
      g.arc(cx-2, cy+2, 10, 10, cx-2, PI, HALF_PI) 
    }
  }
];


  noFill();
  strokeWeight(7);
  stroke(255);
  rect(windowWidth * 0.17, windowHeight * 0.12, windowWidth * 0.8, windowHeight * 0.8);

  makeGrid();

  //Buttons 
  saveButton = createButton('save');
  saveButton.position(25 , 600);
  saveButton.mousePressed(saveRegion);

  clearButton = createButton('clear');
  clearButton.position(75 , 600);
  clearButton.mousePressed(clearMap);

  nameInput = createInput();
  nameInput.attribute('placeholder', 'name your map');
  nameInput.size(100);
  nameInput.position(25, 100);
  fill(255);
  noStroke();
  text('Name Your Map!', nameInput.x, 85);

  nameButton = createButton('submit');
  nameButton.position(nameInput.x + nameInput.width + 10, 100);
  nameButton.mousePressed(assignName);

  hexTypeSelect = createSelect();
  hexTypeSelect.position(25, 220);
  hexTypeSelect.option('blank', '#000000');
  hexTypeSelect.option('forest','#00C800');
  hexTypeSelect.option('desert','#EDC9AF');
  hexTypeSelect.option('swamp','#228B22');
  hexTypeSelect.option('plain','#C8C864');
  hexTypeSelect.option('water','#0000FF');
  hexTypeSelect.option('ice','#ADD8E6');
  hexTypeSelect.option('jungle','#006400');
  hexTypeSelect.option('scorched','#4F0D00');

  terrainModSelect = createSelect();
  terrainModSelect.position(25, 400);
  terrainModSelect.option('-', '-');
  terrainModSelect.option('mountains');
  terrainModSelect.option('lake');
  terrainModSelect.option('tower');
  terrainModSelect.option('cemetery');
  terrainModSelect.option('city');
  terrainModSelect.option('cave');
  terrainModSelect.option('whirlpool');

  

}

function draw() {
  background(15, 35, 0);

  // Map Name
  fill(255);
  noStroke();
  text('TITLE', nameInput.x, 85);

  // Terrain Select Preview
  fill(hexTypeSelect.value());
  stroke(128);
  strokeWeight(2);
  drawHex(60, 160, hexagonSize / 2);

  // Terrain Selection
  fill(255);
  noStroke();
  text('Terrain Select', nameInput.x, 205);

  // Terrain Mod Preview

fill(0);
stroke(128);
drawHex(60, 340, hexagonSize / 2);

// Get currently selected mod
const selectedMod = terrainModSelect.value();
if (selectedMod && selectedMod !== '-') {
  shapePreview(selectedMod, this, 60, 340);
}


  // Terrain Mods
  fill(255);
  noStroke();
  text('Terrain Mod', nameInput.x, 385);

  // Grid
  image(mapCanvas, windowWidth * 0.17, windowHeight * 0.12);
  
  
  
}

function drawHexagon(cx, cy, r, fillColor) {
  mapCanvas.push();
  mapCanvas.fill(fillColor);
  mapCanvas.stroke(255);
  mapCanvas.strokeWeight(1);
  mapCanvas.beginShape();
  for (let a = 0; a < TAU; a += TAU / 6) {
    mapCanvas.vertex(cx + r * cos(a), cy + r * sin(a));
  }
  mapCanvas.endShape(CLOSE);
  mapCanvas.pop();
}


function drawHex(cx, cy, r) {
  
  beginShape();
  for (let a = 0; a < TAU; a += TAU / 6) {
    vertex(cx + r * cos(a), cy + r * sin(a));
  }
  endShape(CLOSE);
}

function makeGrid() {
  hexes = [];
  mapCanvas.clear();

  let r = hexagonSize / 2;
  let legendWidth = gridWidth * 0.1;
  let count = 0;

  for (let y = 0; y < gridHeight; y += hexagonSize / 2.3) {
    for (let x = 0; x < gridWidth - legendWidth; x += hexagonSize * 1.5) {
      let cx = x + hexagonSize * (count % 2 == 0 ? 0.75 : 0);
      let cy = y;

      // store hex position and default color (black)
      hexes.push({
        x: cx,
        y: cy,
        terrain: '#000000',
        mod: '-'
      });

      // draw it filled black
      drawHexagon(cx, cy, r, '#000000');
    }
    count++;
  }
  drawLegend();
}

function assignName() {
  mapName = nameInput.value();
  nameInput.value('');
  redrawMap();
}

function mousePressed() {
  // convert mouse coords to local mapCanvas coordinates
  let localX = mouseX - windowWidth * 0.17;
  let localY = mouseY - windowHeight * 0.12;

  // only process clicks inside the mapCanvas
  if (localX < 0 || localY < 0 || localX > mapCanvas.width || localY > mapCanvas.height) return;

  // find nearest hex
  let nearest = null;
  let minDist = Infinity;
  for (let h of hexes) {
    let d = dist(localX, localY, h.x, h.y);
    if (d < minDist) {
      minDist = d;
      nearest = h;
    }
  }

  // update the hex terrain or mod if clicked close enough
  if (nearest && minDist < hexagonSize / 1.2) {
    const selectedMod = terrainModSelect.value();

    if (selectedMod === '-') {
      // 🟩 no mod selected → change base terrain color
      nearest.terrain = hexTypeSelect.value();
      nearest.mod = '-';
    } else {
      // 🗻 mod selected → overlay it on top of terrain
      nearest.mod = selectedMod;
    }
    console.log('Terrain select value:', hexTypeSelect.value());
    redrawMap();
  }
}

function redrawMap() {
  mapCanvas.clear();

  for (let h of hexes) {
    // draw terrain color
    drawHexagon(h.x, h.y, hexagonSize / 2, h.terrain);

    // draw mod overlay if any
    if (h.mod && h.mod !== '-') {
      const mod = terrainMods.find(m => m.name.toLowerCase() === h.mod.toLowerCase());
      if (mod) mod.shape(mapCanvas, h.x, h.y);
    }
  }

  drawLegend();
}

function shapes (cx, cy) {
  let s = terrainModSelect.value();

  if (s === 'mountains')
      {
       
        mapCanvas.noFill();
        mapCanvas.stroke(255);
        mapCanvas.circle(cx, cy, hexagonSize / 4);
       
      }

}

function shapePreview(modName, g, cx, cy) {
  const mod = terrainMods.find(m => m.name.toLowerCase() === modName.toLowerCase());
  if (!mod) return;

  g.push();
  mod.shape(g, cx, cy);
  g.pop();
}



function drawLegend(cnv) {
  let legendCanvas = cnv || mapCanvas; // default to main canvas
  let legendX = legendCanvas.width * 0.89; 
  let legendY = 80;
  let lineHeight = 20;

  legendCanvas.push();
  legendCanvas.noStroke();
  legendCanvas.fill(15);
  legendCanvas.rect(legendX, 0, legendCanvas.width * 0.10, legendCanvas.height); // legend background

  legendCanvas.textAlign(LEFT, CENTER);
  legendCanvas.textSize(16);
  legendCanvas.fill('#FF10F0');
  legendCanvas.text('Legend', legendX + 15, 20);
  legendCanvas.textSize(14);
  legendCanvas.fill('#F8C8DC');
  legendCanvas.text('Terrain', legendX + 15, 60)
  

  let terrainEntries = [
    { name: 'Forest', color: '#00C800' },
    { name: 'Desert', color: '#EDC9AF' },
    { name: 'Swamp', color: '#228B22' },
    { name: 'Plain', color: '#C8C864' },
    { name: 'Water', color: '#0000FF' },
    { name: 'Ice', color: '#ADD8E6' },
    { name: 'Jungle', color: '#006400' },
    { name: 'Scorched', color: '#4F0D00' }
  ];

  for (let i = 0; i < terrainEntries.length; i++) {
    let entry = terrainEntries[i];
    let y = legendY + i * lineHeight;

    legendCanvas.fill(entry.color);
    legendCanvas.beginShape();
    for (let a = 0; a < TAU; a += TAU / 6) {
      legendCanvas.vertex(legendX + 15 + hexagonSize / 4 * cos(a),
                          y + hexagonSize / 4 * sin(a));
    }
    legendCanvas.endShape(CLOSE);

    legendCanvas.fill('#C9A9A6');
    legendCanvas.noStroke();
    legendCanvas.textSize(10);
    legendCanvas.text(entry.name, legendX + 30, y + 1);
    terrainLegendY = y + 1;
  }

  legendCanvas.textSize(14);
  legendCanvas.fill('#F8C8DC');
  legendCanvas.text('Terrain Mods', legendX + 15, terrainLegendY + 40);


// --- Draw terrain mod shapes in legend ---
for (let i = 0; i < terrainMods.length; i++) {
  const entry = terrainMods[i];
  const yMod = terrainLegendY + 60 + i * (lineHeight + 3);
  const cx = legendX + 30;
  const cy = yMod;

  legendCanvas.push();
  entry.shape(legendCanvas, cx - 15, cy);
  legendCanvas.pop();

  legendCanvas.noStroke();
  legendCanvas.fill('#C9A9A6');
  legendCanvas.textSize(10);
  legendCanvas.text(entry.name, legendX + 30, yMod);
}
legendCanvas.fill('#F8C8DC');
legendCanvas.textSize(14);
legendCanvas.text('Map Title', legendX + 15, terrainLegendY + 300);
legendCanvas.fill('#C9A9A6');
legendCanvas.textSize(12);
legendCanvas.text(mapName, legendX + 15, terrainLegendY + 320);

}

function saveRegion() {
  let tempCanvas = createGraphics(mapCanvas.width, mapCanvas.height);
  tempCanvas.background(15);

  for (let h of hexes) {
    // Draw terrain color
    tempCanvas.noStroke();
    tempCanvas.fill(h.terrain || color(15));
    tempCanvas.beginShape();
    for (let a = 0; a < TAU; a += TAU / 6) {
      tempCanvas.vertex(h.x + hexagonSize / 2 * cos(a), h.y + hexagonSize / 2 * sin(a));
    }
    tempCanvas.endShape(CLOSE);

    // Draw mod overlay if any (this MUST be inside the loop)
    if (h.mod && h.mod !== '-') {
      const mod = terrainMods.find(m => m.name.toLowerCase() === h.mod.toLowerCase());
      if (mod) mod.shape(tempCanvas, h.x, h.y);
    }
  }

  drawLegend(tempCanvas);
  save(tempCanvas, mapName || 'map.png'); 
}

function clearMap() {
  mapCanvas.clear();
  makeGrid();
  drawLegend();
}