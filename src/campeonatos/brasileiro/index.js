const cheerio = require('cheerio');
const request = require('request');
const uniqid = require('uniqid');
const moment = require('moment');

class Brasileiro {
    constructor(serie, edicao) {
        this.edicao = edicao;
        this.baseUrl = 'https://www.cbf.com.br/competicoes/brasileiro-serie-' + serie;
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
        return this.getContent(`${this.baseUrl}/equipes/${this.edicao}`).then(($) => {
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

    formatarMes(mes) {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", 
                       "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const idxMes = meses.indexOf(mes);
        if (idxMes > -1) { return ("0" + (idxMes + 1)).slice(-2); }
    }

    formatarDataHoraJogo(data, horario) {
        data = data.replace(/\n/g, "").replace(/\t/g, "");
        const dataParts = data.split(" ");
        data = dataParts[5] + "-" + this.formatarMes(dataParts[3]) + "-" + dataParts[1]; 
        return data + "T" + horario.replace(/\s+/g, "") + ":00";
    }

    getDataJogo(rowGame, horario) {
        const data = this.getDataJogoPrev(rowGame.prev());
        return this.formatarDataHoraJogo(data, horario);
    }

    getDataJogoPrev(prev) {
        if (prev.hasClass('headline')) {
            return prev.text();
        } else {
            const data = this.getDataJogoPrev(prev.prev());
            if (data) { return data; }
        }
    }

    getCalendario(time) {
        const dateFormat = "YYYYMMDDTHHmmss";
        return this.getJogos(time).then((results) => {
            let ics = `BEGIN:VCALENDAR
PRODID:-//Jogos do ${time}            
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Sao_Paulo
X-LIC-LOCATION:America/Sao_Paulo
BEGIN:DAYLIGHT
TZOFFSETFROM:-0300
TZOFFSETTO:-0200
TZNAME:-02
DTSTART:19701018T000000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=3SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0300
TZOFFSETTO:-0300
TZNAME:-03
DTSTART:19700215T000000
RRULE:FREQ=YEARLY;BYMONTH=2;BYDAY=3SU
END:STANDARD
END:VTIMEZONE
            `.trim();
            ics += '\n';
            results.rodadas.forEach((item) => {
                const jogo = item.jogos[0];
                ics += `BEGIN:VEVENT
SUMMARY:${jogo.mandante} x ${jogo.visitante}
DTSTART:${moment(jogo.dataHora).format(dateFormat)}Z
DTEND:${moment(jogo.dataHora).add(2, 'hours').format(dateFormat)}Z
DTSTAMP:${moment().format(dateFormat)}Z
UID:${uniqid()}
LOCATION:${jogo.local}
END:VEVENT
                `.trim();
                ics += '\n';
            });
            ics += `END:VCALENDAR`;
            return ics;
        });
    }

    getJogos(time) {
        return this.getContent(`${this.baseUrl}/tabela/${this.edicao}`).then(($) => {
            const rodadas = $(".carousel-inner .tabela-jogos").map((idx, item) => {
                return {
                    "numero": $('h3.stripe', item).text().replace("Rodada ", ""),
                    "jogos": $(".full-game", item).map((subIdx, subItem) => {
                        return {
                            "mandante": $('.game .game-team-1 span', subItem).text().replace(/\s+/g, ""),
                            "visitante": $('.game .game-team-2 span', subItem).text().replace(/\s+/g, ""),   
                            "dataHora": this.getDataJogo($(subItem).parent().parent(), $('.full-game-time span', subItem).text()),
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
        return this.getContent(`${this.baseUrl}/artilharia/${this.edicao}`).then(($) => {
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
        return this.getContent(`${this.baseUrl}/classificacao/${this.edicao}`).then(($) => {
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

module.exports = Brasileiro
