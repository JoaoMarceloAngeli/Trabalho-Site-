export class Assinatura {
    constructor(id_usuario, id_plano, dataInicio, dataFim) {
        this.ID_Assinatura = Date.now();
        this.ID_Usuario = Number(id_usuario);
        this.ID_Plano = Number(id_plano);
        this.DataInicio = dataInicio;
        this.DataFim = dataFim;
    }
}
