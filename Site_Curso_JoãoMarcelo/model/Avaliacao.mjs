export class Avaliacao {
    constructor(id_usuario, id_curso, nota, comentario) {
        this.ID_Avaliacao = Date.now();
        this.ID_Usuario = Number(id_usuario);
        this.ID_Curso = Number(id_curso);
        this.Nota = Number(nota);
        this.Comentario = comentario;
        this.DataAvaliacao = new Date().toISOString();
    }
}
