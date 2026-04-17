export class Certificado {
    constructor(id_usuario, id_curso, id_trilha = null) {
        this.ID_Certificado = Date.now();
        this.ID_Usuario = Number(id_usuario);
        this.ID_Curso = Number(id_curso);
        this.ID_Trilha = id_trilha ? Number(id_trilha) : null;
        this.CodigoVerificacao = 'CRT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        this.DataEmissao = new Date().toISOString();
    }
}
