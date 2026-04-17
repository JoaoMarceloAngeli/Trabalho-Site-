export class Pagamento {
    constructor(id_assinatura, valorPago, metodoPagamento, idTransacao) {
        this.ID_Pagamento = Date.now();
        this.ID_Assinatura = Number(id_assinatura);
        this.ValorPago = Number(valorPago);
        this.DataPagamento = new Date().toISOString();
        this.MetodoPagamento = metodoPagamento;
        this.Id_Transacao_Gateway = idTransacao;
    }
}
