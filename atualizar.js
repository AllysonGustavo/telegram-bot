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
    fs.writeFileSync('sites.txt', ''); // Limpa o arquivo sites.txt
    for (let x = 32000; x < 35000; x++) { // Altere o inicio e o fim de acordo com o que você deseja
        const urlDoSite = `https://growth.99app.com/api/package/channel/coupon/index?aid=${x}#/`;
        const conteudoResposta = await obterRespostaCompleta(urlDoSite);

        console.log(x); // Exibe o ID do cupom que está sendo verificado
        const conteudoString = JSON.stringify(conteudoResposta); // Transforma o conteúdo da resposta em string
        if (conteudoString.includes('"errmsg\\":\\"SUCC\\"') && conteudoString.includes('\\"canonical_country_code\\":\\"BR\\"') && conteudoString.includes('Insira abaixo o telefone vinculado a sua conta 99')){
            fs.appendFileSync('sites.txt', `${urlDoSite}\n`); // Adiciona o link do cupom no arquivo sites.txt
        }
    }
}

main();