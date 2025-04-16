function iniciarMinijuegoHorda() {
    const canvas = document.getElementById('gameCanvas');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
  
    // Recursos
    const fondo = new Image();
    fondo.src = '../assets/minijuego/fondo.png';
  
    const carretera = new Image();
    carretera.src = '../assets/minijuego/carretera.png';
  
    const zombie = new Image();
    zombie.src = '../assets/minijuego/zombie.png';
  
    const humano = new Image();
    humano.src = '../assets/minijuego/mario.png';
  
    const obstaculosSprites = [
      '../assets/minijuego/valla.png',
      '../assets/minijuego/coche.png',
      '../assets/minijuego/autobus.png',
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
        const width = 70;
        const height = 70;
        obstacles.push({
          x: canvas.width + 100,
          y: canvas.height - height - 20,
          width,
          height,
          img,
        });
      }
  
      function detectarColision(a, b) {
        const buffer = 10; // margen para evitar colisiones falsas
        return (
          a.x + buffer < b.x + b.width &&
          a.x + 70 - buffer > b.x &&
          a.y + buffer < b.y + b.height &&
          a.y + 70 - buffer > b.y
        );
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
  
          if (detectarColision({ x: zombieX, y: zombieY, width: 50, height: 50 }, obs)) {
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
  
        ctx.drawImage(zombie, zombieX, zombieY, 70, 70);
  
        ctx.fillStyle = '#39ff14';
        ctx.font = '20px Arial';
        ctx.fillText('Puntos: ' + score, 20, 30);
  
        if (score >= 250) {
          alert('🎉 ¡Enhorabuena! Has cazado a un humano.');
          location.reload();
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