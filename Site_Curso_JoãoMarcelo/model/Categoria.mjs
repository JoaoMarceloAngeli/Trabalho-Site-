export class Categoria {
    constructor(nome, descricao) {
        this.ID_Categoria = Date.now();
        this.Nome = nome;
        this.Descricao = descricao;
    }
}
