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
    const response1 = await fetch("https://www.americanas.com.br/hotsite/cupom-de-desconto-americanas", {
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
        "cache-control": "max-age=0",
        "if-none-match": "W/\"651bd-8NnEVCRdgPz7W1iwhhLMjsNaIbI\"",
        "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "cookie": "B2W-PID=1705425694787.0.4876404613532883; macroRegion=NORTHEAST_CAPITAL; oneDayDelivery=true; b2wRegion=NORTHEAST_CAPITAL_2401; B2W-UID=c9a9b79623c3e177f3573ded7e72ad38d043f3b63e27fec70afe6fc58d2038fd19351320159bd14937aaf2a1142aa1c7; customer.id=5dcf5db0c4ea583f941b31ba; customer.api.token=w5EPNjvdGsAo6xGmKzvrw5H1UBJzqyrUo0Pj4qKVXxt8MHqXuyZqcJuW1jvqKksRHBPITy0z7rRoP8lHCvN2m0whE04n8cWBQetrZRrghoDgYhjsY0aHHfskcpjhBt71-DVVIvg5_LySUXH2JTnTTthW2A3HSjFR-4lgTMX16N4vXBjnAyaqNox9CVCvSRXt-rp9n-I52RBVCuYX1-zr7cEojArTItg1QVzFl6iRWW6coYRKTBLkVvY3MW4Z2XwyTvb6O8bj_9o-7FQuK-Oz2xpthEjXdSRmBjGQTfSsSGQ; acomNick=Allyson; persistentCep=59125090; mesoRegion=2401; legionRegion=924000; B2W-SID=1709765591446.0.5233577966248717; MobileOptOut=1; b2wDevice=eyJvcyI6IldpbmRvd3MgTlQiLCJvc1ZlcnNpb24iOiIxMC4wIiwidmVuZG9yIjoiQ2hyb21lIiwidHlwZSI6ImRlc2t0b3AiLCJta3ROYW1lIjoiQ2hyb21lIDEyMiIsIm1vZGVsIjoiMTIyIiwibW9iaWxlT3B0T3V0IjoiZmFsc2UifQ==; b2wDeviceType=desktop; searchTestAB=old; b2wOpn=WZRBJFFW; b2wChannel=ACOM; B2W-IU=false; acomEPar=bo_nh_ou_go_outros; b2wEPar=bo_nh_ou_go_outros; cdn-lat=-3.72; cdn-long=-38.50; cdn-country=BR; cdn-region=CE; cdn-city=FORTALEZA; catalogTestAB=null; b2wLat=-5.7533724; b2wLong=-35.2374352; persistentAddress=59125090_Avenida%20Governador%20Ant%C3%B4nio%20de%20Melo%20e%20Souza_Potengi_Natal_RN; _abck=804B2940ED1A94972FACDE9E89789141~-1~YAAQkWdCF7CtageOAQAAw7H9FgvCbLjEyvxA0Jw86MJ45Y1XFZBec/n7PXaxgKAQcReWBjLNRADqZHheCejDcoMn89/wxPQTbupjKEWpSpNHntZp0CUUj3yAQLb9Tr4bl436aIl0X752p377WRah7zj4MjrFld6Cbpe+DOvHBWWjvEJEeYm1uvTJVWMWwDhyLZ/LyyC/sSFnYNiECX8pnN1vUhJFKMPlncwsi3wI/lhYotywgFO7PcF9GRoyxHGoxEQbGcsJDCzH6ib+c+962hWwBWwWV9BJcs7z/mXm2THCxO2ipC8uXEkG9IjucY00SJPLLYtpj5xZuBNYcKAb/d4f1WIXFE/f5zuIK/yPuGw/sQ/aoFepgQA+cTHudRPdQKnR5tJTOdp079cHDfUvCWQ=~-1~-1~-1; ak_bmsc=4FDF4012D9EFF918CFC062222E75D0D5~000000000000000000000000000000~YAAQkWdCF7GtageOAQAAw7H9Fhf53GaCyrq5F1EjnGZfqT8du9mNnVGScDXC6/QLc9O4SycF7f/bAfsc7MrrfU6DItx+I9JL7XhekPeIsSH71ub4eooRNRfx2igcnGoaFZS3c9R/Jz7oic2sEj7YbJRsKXVaBknwwd08TZYPyEszo6vXpBw7VGn4v6xY+BH1kzhlLyksIB+vlcYu45lV3lQ5fKcA9wYCxo3phtYqqgKDZL6EvNfncQeFv2Xcbye97meGdxrulCYYDnALkLiH5L0axlh4ZRIXFh+MN8XtxULSrBTvEcUWY0RnD3kFO11VNpw8s3rlEK06qkslL/P/rjpTcT2fHBAfnGtTW3KY1d1dvOkY1Phyfp/YWjEG1GbP84DdfGG0oVywfeOPFEYGtA==; bm_sz=ACAD6DB65F1203C6C17222904570CB70~YAAQkWdCF7OtageOAQAAw7H9FhcJom3pXdeZrg8kwT69gFBF+OvBG8xm9z6JiW1Yo4A9wWj8uJW/35Efbg0Kb4Ii2lZz50mnPg+jXlcZRtS+5f3v8LpR5pm7jqt4WZjH+Km5/u9YjMX9z57cLm/bjTpF5Uo9iQupgIr7F9eMsDl/KFntuDQSkI7jTQ8Eobg5HxKHPkadaUDoBhpFceSOOeoxBjzc3z2ZJ9i1Vw6ex1cHXjoZ5+mWjvMs67n0/r//X84JG3oCj1/jiNDYGDbGlOCwZ+GI1OvMg8pSJQR7Sqe+Bzo7/ho24ako28MNtJEHRCJgKHm4ZtmApPQBMDkbAfajSjmMxn4g/4wwKe0DSrM+znfumxZxICkoyifl~3354679~4274224; _dd_s=rum=0&expire=1709783611167",
        "Referer": "https://www.google.com/",
        "Referrer-Policy": "origin"
      },
      method: "GET"
    });

      let response = await response1.text();

      let nomeCupom = true;
      start = response.indexOf('<p class="text" style="text-align:start;font-size:14px"><strong class="text">');
      end = response.indexOf('Das condições de participação')
      response = response.slice(start,end)
      searchString = 'Cupom';
      for (let i = 0; i < response.length; i++) {
          const index = response.indexOf(searchString, i);
          if (index !== -1) {
              if (nomeCupom){
                respostas.push(response.slice(index,response.indexOf("<",index)))
                nomeCupom = false;
              }else{
                respostas.push(response.slice(index,response.indexOf(";",index)))
                let indexx = response.indexOf("Válido até");
                if (indexx !== -1) {
                  let endIndex = indexx + 21;
                  let substring = response.substring(indexx, endIndex);
                  respostas.push(substring);
                }
                nomeCupom = true;
              }
              i = index + searchString.length - 1;
          } else { // Se não houver mais ocorrencias para o loop
              break;
          }
      }
    } catch (error) {
      console.error('Erro:', error);
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