export class Modulo {
    constructor(id_curso, titulo, ordem) {
        this.ID_Modulo = Date.now();
        this.ID_Curso = Number(id_curso);
        this.Titulo = titulo;
        this.Ordem = Number(ordem);
    }
}
