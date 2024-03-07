const axios = require('axios');
const fs = require('fs');
const { Worker } = require('worker_threads');
const schedule = require('node-schedule');
let isScriptRunning = false;

async function cupom99(telefone) {
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
        if(code == 0){
          console.log('Atualização dos cupons 99 pop terminou com sucesso!');
        }else{
          console.log('Erro ao atualizar os cupons da 99 pop.')
        }
        removeLockFile();
      });
    } else {
      console.log('O script está em execução. Agendamento do atualizar.js adiado.');
    }
  });
}

async function cupomAmericanas() {
  let respostas = [];
  try {
    const response1 = await fetch(
      "https://www.americanas.com.br/hotsite/cupom-de-desconto-americanas",
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
          "cache-control": "max-age=0",
          "if-none-match": 'W/"651bd-8NnEVCRdgPz7W1iwhhLMjsNaIbI"',
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "cross-site",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1",
          Referer: "https://www.google.com/",
          "Referrer-Policy": "origin",
        },
        method: "GET",
      },
    );

    let response = await response1.text();

    let menorDesconto = 0;
    let calculo, menorDescontoI;
    let nomeCupom = true;
    start = response.indexOf(
      '<p class="text" style="text-align:start;font-size:14px"><strong class="text">',
    );
    end = response.indexOf("Das condições de participação");
    response = response.slice(start, end);
    searchString = "Cupom";
    for (let i = 0; i < response.length; i++) {
      const index = response.indexOf(searchString, i);
      if (index !== -1) {
        if (nomeCupom) {
          respostas.push(response.slice(index, response.indexOf("<", index)));
          nomeCupom = false;
        } else {
          respostas.push(response.slice(index, response.indexOf(";", index)));
          let indexx = response.indexOf("Válido até");
          if (indexx !== -1) {
            let endIndex = indexx + 21; // Todo a mensagem de "Válido até"
            let substring = response.substring(indexx, endIndex);
            respostas.push(substring);
          }
          nomeCupom = true;
        }
        i = index + searchString.length - 1;
      } else {
        // Se não houver mais ocorrencias para o loop
        // Calcular cupom mais barato
        for (let i = 0; i < respostas.length; i++) {
          if (i % 3 == 1) {
            arrayRegex = respostas[i].match(/\d+/g);
            desconto = parseInt(arrayRegex[0]);
            minimo = parseInt(arrayRegex[1]);
            calculo = (100 * desconto) / minimo;
            if (calculo > menorDesconto) {
              menorDesconto = calculo;
              menorDescontoI = i;
            }
          }
        }
        respostas.push(
          "Cupon(s) recomendado(s):",
          respostas[menorDescontoI - 1],
        );
        break;
      }
    }
  } catch (error) {
    console.error("Erro:", error);
  }
  return respostas;
}

module.exports = {
  cupomAmericanas,
  cupom99,
  atualizacao,
  getScriptRunningStatus,
  setScriptRunningStatus,
  createLockFile,
  removeLockFile,
};