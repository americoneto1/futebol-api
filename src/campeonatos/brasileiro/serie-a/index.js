const cheerio = require('cheerio');
const request = require('request');
const baseUrl = 'https://www.cbf.com.br/competicoes/brasileiro-serie-a';

class BrasileiroSerieA {
    constructor(edicao) {
        this.edicao = edicao;
    }

    getContent(url) {
        return new Promise((resolve, reject) => {
            request(url, function (error, response, body) {
                if (error) { reject(error) }
                else { resolve(cheerio.load(body)); }
            })
        });
    }

    getTimes() {
        return this.getContent(`${baseUrl}/equipes/${this.edicao}`).then(($) => {
            const times = $(".magazine-page .cell a").map((idx, item) => {
                return $(item).attr('title').replace(/\s+/g, "");
            }).get();
            
            return {
                "times": times
            };
        });
    }

    getJogosPorTime(rodadas, time) {
        return rodadas.map((item) => {
            return {
                "numero": item.numero,
                "jogos": item.jogos.filter((subItem) => {
                    return subItem.mandante === time || subItem.visitante === time;
                })
            };
        });
    }

    getJogos(time) {
        return this.getContent(`${baseUrl}/tabela/${this.edicao}`).then(($) => {
            const rodadas = $(".carousel-inner .tabela-jogos").map((idx, item) => {
                return {
                    "numero": $('h3.stripe', item).text().replace("Rodada ", ""),
                    "jogos": $(".full-game", item).map((subIdx, subItem) => {
                        return {
                            "mandante": $('.game .game-team-1 span', subItem).text().replace(/\s+/g, ""),
                            "visitante": $('.game .game-team-2 span', subItem).text().replace(/\s+/g, ""),   
                            "data": "", //TODO
                            "horario": $('.full-game-time span', subItem).text().replace(/\s+/g, ""),  
                            "local": $('.full-game-location span', subItem).text()
                                .replace(/Jogo: [\d+]{0,3}/g, "").replace(/\t/g, "").replace(/\n/g, ""),                    
                        };
                    }).get() 
                };
            }).get();

            return {
                "rodadas": time ? this.getJogosPorTime(rodadas, time) : rodadas
            };
        });
    }

    getArtilhariaPorTime(artilheiros, time) {
        return artilheiros.filter((item) => {
            return item.time === time;
        });
    }

    getArtilharia(time) {
        return this.getContent(`${baseUrl}/artilharia/${this.edicao}`).then(($) => {
            const artilheiros = $("#pro tr").map((idx, item) => {
                return {
                    "jogador": $('.table-goalscores-col-name', item).eq(1).text().replace(/\n/g, "").trim(),
                    "time": $('.table-goalscores-col-team', item).text(),
                    "gols": parseInt($('.table-goalscores-col-goals', item).text())
                };
            }).get();

            return {
                "artilheiros": time ? this.getArtilhariaPorTime(artilheiros, time) : artilheiros.slice(1, artilheiros.length)
            };
        });
    }

    getClassificacao() {
        return this.getContent(`${baseUrl}/classificacao/${this.edicao}`).then(($) => {
            const classificacao = $(".table-standings tr").map((idx, item) => {
                return {
                    "ranking": $('td', item).eq(0).text(),
                    "time": $('td', item).eq(2).text().replace(/\s+/g, ""),
                    "pontos": parseInt($('td', item).eq(3).text()),
                    "jogos": parseInt($('td', item).eq(4).text()),
                    "vitorias": parseInt($('td', item).eq(5).text()),
                    "empates": parseInt($('td', item).eq(6).text()),
                    "derrotas": parseInt($('td', item).eq(7).text()),
                    "golsPro": parseInt($('td', item).eq(8).text()),
                    "golsContra": parseInt($('td', item).eq(9).text()),
                    "saldoGols": parseInt($('td', item).eq(10).text()),
                    "aproveitamento": $('td', item).last().text() + "%"
                };
            }).get();

            return {
                "classificacao": classificacao.slice(1, classificacao.length - 1)
            };
        });
    }
}

module.exports = BrasileiroSerieA
