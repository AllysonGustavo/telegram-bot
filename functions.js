const axios = require('axios');
const fs = require('fs');
const { Worker } = require('worker_threads');
const schedule = require('node-schedule');
let isScriptRunning = false;

async function cupom(telefone) {
  const url = 'https://growth.didiglobal.com/api/engine/activity/participate?';
  const respostas = [];
  const ids = [];
  let cupomRecebido = false;

  try {
    // Usando leitura síncrona
    const data = fs.readFileSync('sites.txt', 'utf-8');

    // Dividindo o conteúdo em linhas
    const linhas = data.split('\n');

    // Iterando sobre cada linha
    linhas.forEach(linha => {
      // Encontrando os conjuntos de 5 números
      const regex = /\d{5}/g;
      let match;
      while ((match = regex.exec(linha)) !== null) {
        // Adicionando os IDs encontrados ao array
        ids.push(parseInt(match[0], 10));
      }
    });

    const headers = {
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      'DNT': '1',
      'Origin': 'https://growth.99app.com',
      'Referer': 'https://growth.99app.com/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    };

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const data = {
        'activity_id': id,
        'phone': telefone,
        'calling_country_code': '55',
        'country_code': 'BR',
        'ticket': '',
        'sc': '',
        'rc': '',
        'lng': '',
        'lat': '',
      };

      try {
        const response = await axios.post(url, data, {
          headers
        });
        if (response.data.errmsg === 'SUCC') {
          respostas.push(`Cupom ${response.data.data.coupons[0].title} resgatado com sucesso! ` + 'Expira em: ' + response.data.data.coupons[0].expireDate);
          cupomRecebido = true;
        }
        if (i === ids.length - 1 && !cupomRecebido) {
          respostas.push('Não existem cupons disponíveis para esse número.');
        }
      } catch (error) {
        console.error(`Erro na solicitação: ${error.message}`);
      }
    }
  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
  return respostas;
}

function getScriptRunningStatus() {
  return isScriptRunning;
}

function setScriptRunningStatus(status) {
  isScriptRunning = status;
}

function createLockFile() {
  isScriptRunning = true;
}

function removeLockFile() {
  isScriptRunning = false;
}

function atualizacao() {
  schedule.scheduleJob('1 0 * * *', () => {
    if (!getScriptRunningStatus()) {
      createLockFile();
      console.log('Iniciando atualização...');

      const worker = new Worker('./atualizar.js');

      worker.on('message', (message) => {
        console.log(`Mensagem do worker: ${message}`);
      });

      worker.on('error', (error) => {
        console.error(`Erro no worker: ${error}`);
      });

      worker.on('exit', (code) => {
        console.log(`Atualização terminou com código ${code}`);
        removeLockFile();
      });
    } else {
      console.log('O script está em execução. Agendamento do atualizar.js adiado.');
    }
  });
}

module.exports = {
  cupom,
  atualizacao,
  getScriptRunningStatus,
  setScriptRunningStatus,
  createLockFile,
  removeLockFile,
};