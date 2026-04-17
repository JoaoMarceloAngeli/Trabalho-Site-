import { StorageService } from '../service/StorageService.mjs';
import { Pagamento } from '../model/Pagamento.mjs';
import { Assinatura } from '../model/Assinatura.mjs';

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
});

// Valores mockados de plano
const precos = {
    '1': 49.00,
    '2': 249.00,
    '3': 399.00
};

const duracaoMeses = {
    '1': 1,
    '2': 6,
    '3': 12
};

function initCheckout() {
    loadAlunos();
    
    // Auto seleção pelos botões "Assinar Agora"
    const botoes = document.querySelectorAll('.btn-assinar');
    botoes.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planoId = e.target.getAttribute('data-plano');
            const selectPlano = document.getElementById('check-plano');
            if(selectPlano) {
                selectPlano.value = planoId;
                selectPlano.focus();
                window.scrollTo({ top: document.getElementById('form-checkout').offsetTop - 100, behavior: 'smooth' });
            }
        });
    });

    const formCheck = document.getElementById('form-checkout');
    if (formCheck) {
        formCheck.addEventListener('submit', (e) => {
            e.preventDefault();
            const idAluno = document.getElementById('check-aluno').value;
            const planoId = document.getElementById('check-plano').value;
            const metodo = document.getElementById('check-metodo').value;
            
            if(!idAluno) {
                alert('Selecione um aluno para assinar!');
                return;
            }

            // Gerar Assinatura
            const hoje = new Date();
            const dataFim = new Date();
            dataFim.setMonth(hoje.getMonth() + duracaoMeses[planoId]);
            
            const novaAssinatura = new Assinatura(idAluno, planoId, hoje.toISOString(), dataFim.toISOString());
            const assSaved = StorageService.insert('TbAssinaturas', novaAssinatura);
            
            // Gerar Pagamento
            const valor = precos[planoId];
            const transacaoId = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            const novoPagamento = new Pagamento(assSaved.ID_Assinatura, valor, metodo, transacaoId);
            StorageService.insert('TbPagamentos', novoPagamento);
            
            alert('Pagamento processado com sucesso! Transação: ' + transacaoId);
            formCheck.reset();
            renderPagamentos();
        });
    }
    
    renderPagamentos();
}

function loadAlunos() {
    const selAluno = document.getElementById('check-aluno');
    if (!selAluno) return;

    const usuarios = StorageService.getAll('TbUsuarios');
    selAluno.innerHTML = '<option value="">Selecione o Aluno...</option>';
    usuarios.forEach(u => selAluno.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto}</option>`);
}

function renderPagamentos() {
    const lista = document.getElementById('lista-pagamentos');
    if (!lista) return;

    const pagamentos = StorageService.getAll('TbPagamentos');
    lista.innerHTML = '';

    if (pagamentos.length === 0) {
        lista.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma transação encontrada.</td></tr>';
        return;
    }

    pagamentos.reverse().forEach(pag => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold font-monospace text-primary">${pag.Id_Transacao_Gateway}</td>
            <td>User ID #${StorageService.getAll('TbAssinaturas').find(a => a.ID_Assinatura == pag.ID_Assinatura)?.ID_Usuario || '!'}</td>
            <td class="text-success fw-bold">R$ ${pag.ValorPago.toFixed(2)}</td>
            <td><span class="badge bg-secondary">${pag.MetodoPagamento}</span></td>
            <td>${new Date(pag.DataPagamento).toLocaleString()}</td>
            <td><span class="badge bg-success">Aprovado</span></td>
        `;
        lista.appendChild(tr);
    });
}
