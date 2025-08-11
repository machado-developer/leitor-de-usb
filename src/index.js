const { log } = require('console');
const drivelist = require('drivelist');
const fs = require('fs');
const say = require('say');
const path = require('path');

const player = require('play-sound')((opts = {}));

let drivesAnteriores = [];

async function verificarPendrives() {
  try {
    const drives = await drivelist.list();
    const pendrives = drives.filter(d => d.isRemovable && d.mountpoints.length > 0);


    const novos = pendrives.filter(p =>
      !drivesAnteriores.some(a => a.device === p.device)
    );
    const removidos = drivesAnteriores.filter(a =>
      !pendrives.some(p => p.device === a.device)
    );

    novos.forEach(p => {

      console.log(`Pen drive conectada: ${p.description}`);

      p.mountpoints.forEach(m => {
        let mountPath = m.path;

        if (process.platform === 'win32' && !mountPath.endsWith('\\')) {
          mountPath += '\\';
        }

        const filePath = path.join(mountPath, 'segredo.txt');

        if (fs.existsSync(filePath)) {

          const conteudo = fs.readFileSync(filePath, 'utf8');
          if (conteudo !== "Deus") {
            Speak("Senha incorreta! Tente novamente.");
            log("Senha incorreta! Tente novamente.");
            // process.exit(1);
          } else {

            Speak(` O conteúdo é : ${conteudo}`);
            console.log("Senha correta! Acesso concedido.");
            return true;
          }

        } else {
          Speak("Arquivo não encontrado no pen drive.");
          console.log(` Arquivo não encontrado em: ${mountPath}`);
        }
      });
    });

    removidos.forEach(p => {
      Speak(`Pen drive removida: ${p.description}`);
      console.log(`Pen drive removida: ${p.description}`);
    });

    // Atualiza lista anterior
    drivesAnteriores = pendrives;
  } catch (err) {
    Speak("Erro ao verificar pen drives.");
    console.error('Erro ao verificar pen drives:', err);
  }
}


setInterval(verificarPendrives, 3000);

console.log(' Monitorando pen drives... Pressione CTRL+C para parar.');


const Speak = (message) => {
  say.speak(message, "Microsoft Daniel Desktop", 1.0, { lang: "pt-br" }, (err) => {
    if (err) {
      return console.error('Erro ao gerar áudio:', err);
    }
    console.log('🔊 Áudio reproduzido.')
  });
}
// const playSound = player.play(alertMp3, (err) => {
//   if (err) console.error('Erro ao tocar áudio:', err);
// });