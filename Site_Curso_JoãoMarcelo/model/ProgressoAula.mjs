export class ProgressoAula {
    constructor(id_usuario, id_aula) {
        this.ID_Usuario = Number(id_usuario); // PK composta
        this.ID_Aula = Number(id_aula); // PK composta
        this.DataConclusao = new Date().toISOString();
        this.Status = 'Concluído';
    }
}
