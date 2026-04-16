export class Curso {
    constructor(titulo, descricao, id_instrutor, id_categoria, nivel, totalAulas, totalHoras) {
        this.ID_Curso = Date.now();
        this.Titulo = titulo;
        this.Descricao = descricao;
        this.ID_Instrutor = Number(id_instrutor);
        this.ID_Categoria = Number(id_categoria);
        this.Nivel = nivel;
        this.DataPublicacao = new Date().toISOString();
        this.TotalAulas = Number(totalAulas);
        this.TotalHoras = Number(totalHoras);
    }
}
