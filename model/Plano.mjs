export class Plano {
    constructor(nome, descricao, preco, duracaoMeses) {
        this.ID_Plano = Date.now();
        this.Nome = nome;
        this.Descricao = descricao;
        this.Preco = Number(preco);
        this.DuracaoMeses = Number(duracaoMeses);
    }
}
