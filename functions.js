const axios = require("axios");
const fs = require("fs");

async function cupom99(telefone) {
  const url = "https://growth.didiglobal.com/api/engine/activity/participate?";
  const respostas = [];
  const ids = [];
  let cupomRecebido = false;

  try {
    // Usando leitura síncrona
    const data = fs.readFileSync("sites.txt", "utf-8");

    // Dividindo o conteúdo em linhas
    const linhas = data.split("\n");

    // Iterando sobre cada linha
    linhas.forEach((linha) => {
      // Encontrando os conjuntos de 5 números
      const regex = /\d{5}/g;
      let match;
      while ((match = regex.exec(linha)) !== null) {
        // Adicionando os IDs encontrados ao array
        ids.push(parseInt(match[0], 10));
      }
    });

    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      Connection: "keep-alive",
      "Content-Type": "application/x-www-form-urlencoded",
      DNT: "1",
      Origin: "https://growth.99app.com",
      Referer: "https://growth.99app.com/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "sec-ch-ua":
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    };

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const data = {
        activity_id: id,
        phone: telefone,
        calling_country_code: "55",
        country_code: "BR",
        ticket: "",
        sc: "",
        rc: "",
        lng: "",
        lat: "",
      };

      try {
        const response = await axios.post(url, data, {
          headers,
        });
        if (response.data.errmsg === "SUCC") {
          respostas.push(
            `Cupom ${response.data.data.coupons[0].title} resgatado com sucesso! ` +
              "Expira em: " +
              response.data.data.coupons[0].expireDate
          );
          cupomRecebido = true;
        }
        if (i === ids.length - 1 && !cupomRecebido) {
          respostas.push("Não existem cupons disponíveis para esse número.");
        }
      } catch (error) {
        console.error(`Erro na solicitação: ${error.message}`);
      }
    }
  } catch (err) {
    console.error("Erro ao ler o arquivo:", err);
  }
  return respostas;
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
      }
    );

    let response = await response1.text();

    let menorDesconto = 0;
    let calculo, menorDescontoI;
    let nomeCupom = true;
    start = response.indexOf(
      '<p class="text" style="text-align:start;font-size:14px"><strong class="text">'
    );
    end = response.indexOf("Das condições de participação");
    response = response.slice(start, end);
    searchString = "Cupom";
    for (let i = 0; i < response.length; i++) {
      const index = response.indexOf(searchString, i);
      if (index !== -1) {
        let cupom = response.slice(index, response.indexOf("<", index));
        cupom = cupom.replace(/\n/g, " "); // Substituir quebras de linha por espaços
        respostas.push(cupom);
        nomeCupom = !nomeCupom;
        i = response.indexOf(";", index); // Move para o próximo ponto e vírgula
      } else {
        // Se não houver mais ocorrencias para o loop
        // Calcular cupom mais barato
        for (let i = 0; i < respostas.length; i++) {
          if (i % 3 == 1) {
            arrayRegex = respostas[i].match(/\d+/g);
            if (arrayRegex !== null) {
              // Verifica se há correspondências
              desconto = parseInt(arrayRegex[0]);
              minimo = parseInt(arrayRegex[1]);
              calculo = (100 * desconto) / minimo;
              if (calculo > menorDesconto) {
                menorDesconto = calculo;
                menorDescontoI = i;
              }
            }
          }
        }
        respostas.push("Cupom recomendado:", respostas[menorDescontoI - 1]);
        break;
      }
    }
  } catch (error) {
    console.error("Erro:", error);
  }
  // Remover porcentagem
  for (let i = 1; i < respostas.length; i++) {
    if (respostas[i].includes("%")) {
      respostas.splice(i - 1, 2);
      i -= 2;
    }
  }
  return respostas;
}

module.exports = {
  cupomAmericanas,
  cupom99,
};
