export class Aula {
    constructor(id_modulo, titulo, tipoConteudo, urlConteudo, duracaoMinutos, ordem) {
        this.ID_Aula = Date.now();
        this.ID_Modulo = Number(id_modulo);
        this.Titulo = titulo;
        this.TipoConteudo = tipoConteudo;
        this.URL_Conteudo = urlConteudo;
        this.DuracaoMinutos = Number(duracaoMinutos);
        this.Ordem = Number(ordem);
    }
}
