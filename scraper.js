// Descobrir cupons ativos, serão enviados para sites.txt
const axios = require('axios');
const fs = require('fs');

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
    for (let x = 32000; x < 35000; x++) {
        const urlDoSite = `https://growth.99app.com/api/package/channel/coupon/index?aid=${x}#/`;
        const conteudoResposta = await obterRespostaCompleta(urlDoSite);

        console.log(x);
        const conteudoString = JSON.stringify(conteudoResposta);
        if (conteudoString.includes('"errmsg\\":\\"SUCC\\"') && conteudoString.includes('\\"canonical_country_code\\":\\"BR\\"') && conteudoString.includes('Insira abaixo o telefone vinculado a sua conta 99')){
            fs.appendFileSync('sites.txt', `${urlDoSite}\n`);
        }
    }
}

main();