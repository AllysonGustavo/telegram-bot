const axios = require("axios");
const fs = require("fs");

async function obterRespostaCompleta(url) {
  try {
    const resposta = await axios.get(url);
    return resposta.data;
  } catch (error) {
    console.error(`Erro na solicitação: ${error.message}`);
    return null;
  }
}

async function main() {
  fs.writeFileSync("sites.txt", ""); // Limpa o arquivo sites.txt

  for (let x = inicioDaProcura; x < fimDaProcura; x++) {
    const urlDoSite = `https://growth.99app.com/api/package/channel/coupon/index?aid=${x}#/`;

    try {
      const conteudoResposta = await obterRespostaCompleta(urlDoSite);

      console.log(x); // Exibe o ID do cupom que está sendo verificado
      const conteudoString = JSON.stringify(conteudoResposta); // Transforma o conteúdo da resposta em string

      if (
        conteudoString.includes('"errmsg\\":\\"SUCC\\"') &&
        conteudoString.includes('\\"canonical_country_code\\":\\"BR\\"') &&
        conteudoString.includes(
          "Insira abaixo o telefone vinculado a sua conta 99"
        )
      ) {
        fs.appendFileSync("sites.txt", `${urlDoSite}\n`); // Adiciona o link do cupom no arquivo sites.txt
      }
    } catch (error) {
      console.error(`Erro na solicitação para ${urlDoSite}: ${error.message}`);
    }
  }
}

// Função para calcular o tempo restante até a meia-noite e ai atualizar
function calcularTempoParaMeiaNoite() {
  const agora = new Date();
  const meiaNoite = new Date(
    agora.getFullYear(),
    agora.getMonth(),
    agora.getDate() + 1, // Próximo dia
    0,
    0,
    0 // Hora, minuto, segundo
  );
  return meiaNoite - agora;
}

// Agendar a execução do código para a próxima meia-noite
setTimeout(() => {
  let config = require("./config.json");
  config.updateIsRunning = true; // Atualização ocorrendo
  fs.writeFileSync("./config.json", JSON.stringify(config, null, 2)); // Escreve o objeto config de volta para o arquivo JSON
  fs.readFile("sites.txt", "utf8", (err, data) => {
    if (err)
      return console.log("Erro ao ler o número de inicio/fim da procura:", err);
    inicioDaProcura = (data.match(/\d{5}/g) || [])[0].slice(0, 2) * 1000 - 1000; // ID do cupom que será iniciado a procura
    fimDaProcura = inicioDaProcura + 2000; // ID do cupom que será finalizado a procura

    main();
  });
}, calcularTempoParaMeiaNoite());
