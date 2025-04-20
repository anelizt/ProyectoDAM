function iniciarMinijuegoHorda() {
  const canvas = document.getElementById('gameCanvas');
  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');

  // Recursos
  const fondo = new Image();
  fondo.src = 'assets/minijuego/fondo.png';

  const carretera = new Image();
  carretera.src = 'assets/minijuego/carretera.png';

  const zombie = new Image();
  zombie.src = 'assets/minijuego/zombie_nbg.png';

  const humano = new Image();
  humano.src = 'assets/minijuego/humano_huye.png';

  const obstaculosSprites = [
    'assets/minijuego/valla_nbg.png',
    'assets/minijuego/coche_nbg.png',
    'assets/minijuego/autobus_nbg.png',
  ].map(src => {
    const img = new Image();
    img.src = src;
    return img;
  });

  const resources = [fondo, carretera, zombie, humano, ...obstaculosSprites];
  let loaded = 0;

  resources.forEach(img => {
    img.onload = () => {
      loaded++;
      if (loaded === resources.length) {
        iniciarJuego(); // Solo empieza cuando TODO está cargado
      }
    };
  });

  function iniciarJuego() {

    const ZOMBIE_W = 110;
    const ZOMBIE_H = 110;
    const OBS_W = 100;
    const OBS_H = 100;

    const zombieX = 100;
    let zombieY = 200;
    let velocityY = 0;
    let isJumping = false;
    const gravity = 1;

    let scroll = 0;
    let obstacles = [];
    let frame = 0;
    let gameOver = false;
    let score = 0;

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !isJumping) {
        velocityY = -18;
        isJumping = true;
      }
    });

    function crearObstaculo() {
      const tipo = Math.floor(Math.random() * obstaculosSprites.length);
      const img = obstaculosSprites[tipo];
      obstacles.push({
        x: canvas.width + 100,
        y: canvas.height - OBS_H - 20,
        width: OBS_W,
        height: OBS_H,
        img
      });
    }

    function detectarColision(a, b) {
      // porcentaje a recortar siendo H altura y W ancho
      const recortaH = 0.25;
      const recortaW = 0.15;

      // Aplicamos un recorte a la colisión para eliminar la zona transparente de la imagen
      const ax = a.x + a.width * recortaW;
      const ay = a.y + a.height * recortaH;
      const aw = a.width * (1 - 2 * recortaW);
      const ah = a.height * (1 - 2 * recortaH);

      const recorteWDer = 0.2; // recoerte extra por la perte de detrás de los obstáculos
      const bx = b.x + b.width * recortaW;
      const by = b.y + b.height * recortaH;
      const bw = b.width * (1 - 2 * recortaW - recorteWDer);
      const bh = b.height * (1 - 2 * recortaH);

      return ax < bx + bw &&
        ax + aw > bx &&
        ay < by + bh &&
        ay + ah > by;
    }

    function draw() {
      if (gameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);

      scroll -= 4;
      if (scroll <= -canvas.width) scroll = 0;
      ctx.drawImage(carretera, scroll, canvas.height - 60, canvas.width, 60);
      ctx.drawImage(carretera, scroll + canvas.width, canvas.height - 60, canvas.width, 60);

      ctx.drawImage(humano, canvas.width - 80, canvas.height - 120, 60, 80);

      obstacles.forEach((obs, index) => {
        obs.x -= 5;
        ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);

        if (detectarColision({ x: zombieX, y: zombieY, width: 70, height: 70 }, obs)) {
          gameOver = true;
          alert('💀 El zombie ha chocado. ¡Fin del juego!');
        }

        if (obs.x + obs.width < 0) {
          obstacles.splice(index, 1);
          if (obs.img.src.includes('valla')) score += 5;
          else if (obs.img.src.includes('coche')) score += 10;
          else if (obs.img.src.includes('autobus')) score += 25;
        }
      });

      velocityY += gravity;
      zombieY += velocityY;
      if (zombieY >= 200) {
        zombieY = 200;
        isJumping = false;
      }

      ctx.drawImage(zombie, zombieX, zombieY - (ZOMBIE_H - 70), ZOMBIE_W, ZOMBIE_H);

      ctx.fillStyle = '#39ff14';
      ctx.font = '20px Arial';
      ctx.fillText('Puntos: ' + score, 20, 30);

      if (score >= 250) {
        gameOver = true;               
        alert('🎉 ¡Enhorabuena! Has cazado a un humano.');
        return;
      }

      frame++;
      if (frame % 120 === 0) {
        crearObstaculo();
      }
      requestAnimationFrame(draw);
    }

    crearObstaculo();
    draw();
  }
}