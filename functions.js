const axios = require('axios');

async function cupom(telefone) {
    const url = 'https://growth.didiglobal.com/api/engine/activity/participate?';
    const respostas = [];

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

    const ids = [32713,32715,32755,32949,33027,33029,33031,33033,33035,33037,33101];

    for (const id of ids) {
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
            const response = await axios.post(url, data, { headers });
            console.log(response.data.errmsg)
            if (response.data.errmsg == 'SUCC') {
                respostas.push(`Cupom ${id} resgatado com sucesso!`);
            }
            else {
                respostas.push(`Cupom ${id} não resgatado!`);
            }
        } catch (error) {
            console.error(`Erro na solicitação: ${error.message}`);
        }
    }
    return respostas;
}

module.exports = cupom;