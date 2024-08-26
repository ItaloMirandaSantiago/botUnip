require('dotenv').config();

const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');
const chatGPT = require('./chatGPT');


(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const res = await chatGPT()
    console.log(res)
    try {
        // Acessa a página de login
        await page.goto('https://www.unip.br/aluno/central/');
        
        // Preenche o formulário de login
        await page.type('#inputRA', process.env.LOGIN);
        await page.type('#inputSenha', process.env.PASSWORD);
        await page.click('.btn-success');
        
        // Espera que a navegação para a nova página seja concluída
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Acessa o sistema de matérias online
        await page.goto('https://www.unip.br/aluno/central/sistemas/acesso/138');
        
        // Espera a página ser carregada
        await page.waitForSelector('body');
        
        // Identifica o iframe com a classe 'iframe-sistema'
        const iframeElement = await page.waitForSelector('iframe.iframe-sistema');
        
        if (iframeElement) {
            // Obtém o contexto do iframe
            const iframe = await iframeElement.contentFrame();
            
            // Espera o elemento com a classe 'Ava' estar visível dentro do iframe
            const contentIframe = await iframe.waitForSelector('a.Ava', { visible: true });
            
            if (contentIframe) {
                // Clica no elemento com a classe 'Ava'
                await contentIframe.click();
        
                //abre nova aba por conta do click

                const newPageBlackBoard = new Promise(event => browser.once('targetcreated', target => { 
                  event(target.page()
                  )
                }))

                //espera nova pagina abrir
                const newPage = await newPageBlackBoard

                await newPage.waitForSelector('body')

                const selectionElement = await newPage.waitForSelector('.boxicones')

                const div = await selectionElement.$('div')

                const link = await div.$('a')

                if (link) {
                  await link.click()
                  console.log('foi')

                  //esperar página ser carregada
                  await newPage.waitForNavigation()

                  const arrayLi = await newPage.$$("ul.coursefakeclass > li")
                  //continua


                  const linumber = arrayLi[arrayLi.length - 1]

                  const li = await linumber.$('a')
                  console.log(`tentar click`)
                  await li.click()

                  await newPage.waitForNavigation() //selecionar prova

                  const numberProv = 1

                  const Id = await newPage.$(`li#contentListItem\\:_411562${numberProv}_1 > div > h3 > a`)

                  await Id.click()

                  //confirmar

                  const buttonElement = await newPage.waitForSelector('.button-1', { visible: true, timeout: 15000 });

                  if (buttonElement) {
                      await buttonElement.click();
                      console.log('Botão .button-1 clicado com sucesso.');
                  
                      await newPage.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
                      console.log('Navegação concluída.');


                    //acessado provas

                    const containerP = await newPage.waitForSelector('#dataCollectionContainer', { visible: true });
 
                    if (containerP) {

                        const childOfContainer = await newPage.$$('#dataCollectionContainer > *')

                        let quest = ``

                        for (let i = 1; i <= (childOfContainer.length - 2); i++) {
                            console.log('rodando')
                            const questDescrible = await newPage.$$(`#stepcontent${i} ol > li > div > fieldset > legend > div`);

                            const alternatives = await newPage.$$(`#stepcontent${i} ol > li > div > fieldset > table > tbody`)

                                if (questDescrible.length > 0 && alternatives) { // Verifica se algum elemento foi encontrado
                                    
                                        const text = await newPage.evaluate(el => el.textContent, questDescrible[0]);

                                        //quest montar variavel para envio
                                        quest =  `${text}`


                                        // resolução criada pelo chatGPT
                                        
                                        for (const tbodyElement of alternatives) {
                                            const trElements = await tbodyElement.$$('tr');
                                           // console.log(`Número de <tr> encontrados: ${trElements.length}`);
                                        
                                            for (const trElement of trElements) {
                                                const tdElements = await trElement.$$('td');
                                                if (tdElements.length > 0) {
                                                    // Obtém o último <td>
                                                    const lastTdElement = tdElements[tdElements.length - 1];

                                                    const alternativeLetterElement = tdElements[tdElements.length - 2] // pega a letra da questão

                                                    const alternativeLetter = await newPage.evaluate(el => el.textContent, alternativeLetterElement)
                                                    // Dentro do último <td>, seleciona o <div>
                                                    const divElement = await lastTdElement.$('div');
                                                    if (divElement) {
                                                        // Dentro do <div>, seleciona o <label>
                                                        const labelElement = await divElement.$('label');
                                                        if (labelElement) {
                                                            // Obtém o texto do <label>
                                                            const textLabel = await newPage.evaluate(el => el.textContent, labelElement);
                                                          //  console.log(`letra da questão: ${alternativeLetter}, texto da alternativa ${textLabel}`);
                                                            quest += (`
                                                                ${alternativeLetter + textLabel}
                                                                `)
                                                            
                                                        
                                                        } else {
                                                            console.log('Nenhum <label> encontrado dentro do <div>');
                                                        }
                                                    } else {
                                                        console.log('Nenhum <div> encontrado dentro do último <td>');
                                                    }
                                                } else {
                                                    console.log('Nenhum <td> encontrado em <tr>');
                                                }
                                            }
                                        }
                                        function sleep(ms) {
                                            return new Promise(resolve => setTimeout(resolve, ms));
                                        }

                                        await sleep(6000);
                                        
                                      //  let textAlternatives = aw
                //                      console.log('rodou')
                  //                    console.log('---------------');
                    //                  console.log(quest);
                                      
                                      
                      //              await chatGPT(quest)
                        //            console.log('---------------');
                                    
                                }
                            
                        }

                        
                    } else {
                        console.log('Elemento pai #dataCollectionContainer não encontrado.');
                    }


                  } else {
                      console.log('Botão .button-1 não encontrado.');
                  }

                }else{
                  console.log('nao foi')
                }

                console.log('O clique ocorreu com sucesso!');
            } else {
                console.log('O elemento com a classe .Ava não foi encontrado dentro do iframe.');
            }
        } else {
            console.log('O iframe com a classe iframe-sistema não foi encontrado.');
        }
    } catch (error) {
        console.error('Erro durante a execução do script:', error);
    } finally {
        // Fecha o navegador
      //  await browser.close();
    }
})();

