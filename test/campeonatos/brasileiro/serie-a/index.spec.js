const chai = require('chai');
const expect = chai.expect;
const BrasileiroSerieA = require('./../../../../src/campeonatos/brasileiro/serie-a');

describe('Campeonato Brasileiro Serie A', () => {  
  const obj = new BrasileiroSerieA(2017);

  it('getTimes() deve retornar uma lista de times', () => {
    return obj.getTimes().then((response) => {
        expect(response.times.length).to.equal(20);
    })
  });

  it('getJogos() deve retornar uma lista de rodadas com jogos de cada rodada', () => {
    return obj.getJogos().then((response) => {
        expect(response.rodadas.length).to.equal(38);
        expect(response.rodadas[0].jogos.length).to.equal(10);
    });
  });

  it('getJogos(time) deve retornar uma lista de rodadas com jogos do time passado como parametro de cada rodada', () => {
    return obj.getJogos('Santos-SP').then((response) => {
        expect(response.rodadas.length).to.equal(38);
        expect(response.rodadas[0].jogos.length).to.equal(1);
    });
  });

  it('getArtilharia() deve retornar uma lista de artilheiros', () => {
    return obj.getArtilharia().then((response) => {
        expect(response.artilheiros.length).to.be.above(0);
    });
  });

  it('getArtilharia(time) deve retornar uma lista de artilheiros', () => {
    return obj.getArtilharia('Santos-SP').then((response) => {
        expect(response.artilheiros.length).to.be.above(0);
    });
  });

  it('getClassificacao() deve retornar a classificacao', () => {
    return obj.getClassificacao().then((response) => {
        expect(response.classificacao.length).to.equal(20);
    });
  });
});