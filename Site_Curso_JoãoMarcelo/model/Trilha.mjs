export class Trilha {
    constructor(titulo, descricao, id_categoria) {
        this.ID_Trilha = Date.now();
        this.Titulo = titulo;
        this.Descricao = descricao;
        this.ID_Categoria = Number(id_categoria);
    }
}
