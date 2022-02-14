/* 
Declarações
*/

const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const { setTimeout } = require('timers/promises');
const { send } = require('process')
const ExcelJS = require('exceljs');
const moment = require('moment');
const { path } = require('express/lib/application');
const express = require('express');



const app = express();
const SESSION_FILE_PATH = './session.json';
let sessionData;


app.use(express.urlencoded({ extended: true }))

app.post('/send', m)

/* 
 Função que executar caso ja estiver com o codigo QR autenticado  
*/
const withSession = () => {
    // Se existir o arquivo com as credenciais
    console.log('Validando sessão com o whatsapp ...');
    sessionData = require(SESSION_FILE_PATH);

    client = new Client({
        session: sessionData
    });

    client.on('ready', () => {
        console.log('Client pronto');
        listenMessage();
        
    });

    client.on('auth_failure', () => {
        console.log("** Erro de autenticação ao tentar gera o codigo QR (apague o arquivo'session.json')")
    });

    client.initialize();
}




/* 
 * Essa função gera o Codigo QR
*/
const withoutSession = () => {

    console.log("Sem sessão guardada");
    client = new Client({
        session: sessionData
    });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });


    client.on('authenticated', (session) => {
        // Guarda as credenciais da sessão para usar logo
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err){
            console.error(err);
            }
        });
        console.log('Sessão iniciada')
    })

    client.initialize();
} 




/* 
* Essa função é encarregada de ler cada vez que uma mensagem é recebida
*/
const listenMessage = () => {
    client.on('message', (msg) => {
        const { from, to, body } = msg;

        console.log(from, to, body);
        sendMessage(from, 'Teste');

        saveHistorical(from, body)
    })
}




/* 
Função encarregada de mandar mensagens
*/
const sendMessage = (to, message) => {
    
    client.sendMessage(to, message)
}


/* 
Função encarregada de mandar medias
*/

const sendMedia = (to, file) => {
    const mediaFile = MessageMedia.fromFilePath(`./media/${file}`);
    client.sendMessage(to, media)
}

const replyMessage = (to, file) => {
    client.on('message', message => {
        if(message.body === '!ping') {
            client.sendMessage(message.from, 'pong');
        }
    });

}

const saveHistorical = (number, message) => {
    const pathChat = `./chats/${number}.xlsx`;
    const workbook = new ExcelJS.Workbook();
    const today = moment().format('DD-MM-YYYY hh:mm')

    if(fs.existsSync(pathChat)) {
        workbook.xlsx.readFile(pathChat)
        .then(() => {
            const worksheet = workbook.getWorksheet(1);
            const lastRow = worksheet.lastRow;
            let getRowInsert = worksheet.getRow(++(lastRow.number));
            getRowInsert.getCell('A').value = today;
            getRowInsert.getCell('B').value = message;
            getRowInsert.commit();
            workbook.xlsx.writeFile(pathChat)
            .then(() => {
                console.log('Mensagem salva');
            })
            .catch(() => {
                console.log('Algo ocorreu... esperando chat"');
            })
        })
    } else {
        const worksheet = workbook.addWorksheet('Chats');
        worksheet.columns = [
            {header:'Horário', key:'date'},
            {header:'Mensagem', key:'message'}
        ]
        worksheet.addRow([today, message])
        workbook.xlsx.writeFile(pathChat)
        .then(() => {
            console.log(`Historico de ${number} criado`)
        })
        .catch(() => {
            console.log("Algo falhou")
        })
    }
}

const menu = () => {
    client.on('message', message => {
        let mensagem;
        switch (message.body) {
            case "1":
                mensagem = "Porque sou eu que conheço os planos que tenho para vocês’, diz o Senhor, ‘planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.\n\n"  +

                "Jeremias 29:11"
                break;

            case "2":
                mensagem = "🗣️ Que bom! Vamos fazer o devocional juntos?\n" +

                "Porque sou eu que conheço os planos que tenho para vocês’, diz o Senhor, ‘planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.\n" + 
                "Jeremias 29:11 NVI\n \n" +
                
                "✨ Quando o Senhor entregava profecias ao seu povo por meio de Jeremias, ele se dirigia com justiça e amor, apontando as falhas de seu povo mas, ao mesmo tempo, as cobrindo com sua graça e misericórdia.\n" +
                "Do mesmo modo, nós, os gentios (pessoas não-judias que foram enxertadas no Plano da Salvação) somos chamados para uma relação com Deus que, quando arrependidos, cobre nossas transgressões e nos transforma em nova criatura. É sobre esse plano que Deus fala nessa passagem e pode ser aplicado a mim e a você: plano não de condenação através da lei e das obras, afinal, somos pecadores e fadados a levar o fardo da Queda e pagar o salário do pecado -- a morte. Mas, também, por Cristo, somos tornados herdeiros do trono, do céu e das promessas antes feitas a Israel. Somos chamados, por meio de Jesus, a sair da velha vida e tomar parte no plano que o Senhor tem para nós. Nas palavras dEle, planos de prosperidade e esperança, de um futuro. Um futuro no céu, na vida eterna, em retidão e comunhão com Deus e a Sua Criação. A vontade de Deus para você é boa, perfeita, agradável, e não é para te causar dano, ou para te frustrar ou para te desamparar. *Os planos dEle para você são melhores, maiores, de paz e de esperança. Analise o que isso significa em seu contexto. Qual é a vontade, o plano divino para você? Você está pronto para se submeter a ele e desfrutar de um futuro de paz e salvação?"
                
                break;

            case "sair":
                mensagem = "✨ Terminamos por aqui! 🛐 Quer falar mais sobre isso? Converse com um de nossos jovens sobre Deus, vida cristã e fé! Estamos aqui para te ajudar nessa caminhada. 🗣️ Digite *QUERO CONVERSAR* e vamos falar sobre Jesus!"
                break;

            default:
                mensagem ="Não entendi...\n" +
                "Poderia reformular sua pergunta?"
                break;
        }
    });
} 

//delay 
const delay = (timer) => {
    setTimeout(() =>{},timer)
}

/** */
(fs.existsSync(SESSION_FILE_PATH)) ? withSession() : withoutSession();