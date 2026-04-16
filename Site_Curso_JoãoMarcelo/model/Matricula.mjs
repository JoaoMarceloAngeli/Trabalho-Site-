export class Matricula {
    constructor(id_usuario, id_curso) {
        this.ID_Matricula = Date.now();
        this.ID_Usuario = Number(id_usuario);
        this.ID_Curso = Number(id_curso);
        this.DataMatricula = new Date().toISOString();
        this.DataConclusao = null;
    }
}
