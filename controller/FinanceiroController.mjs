import { StorageService } from '../service/StorageService.mjs';
import { Pagamento } from '../model/Pagamento.mjs';
import { Assinatura } from '../model/Assinatura.mjs';

const PLANOS = {
    '1': { nome: 'Mensal',    preco: 49.00,  duracao: 1,  cor: 'primary' },
    '2': { nome: 'Semestral', preco: 249.00, duracao: 6,  cor: 'warning' },
    '3': { nome: 'Anual',     preco: 399.00, duracao: 12, cor: 'success' }
};

const fmt = (v) => 'R$ ' + Number(v).toFixed(2).replace('.', ',');

document.addEventListener('DOMContentLoaded', () => {
    initCheckout();
    renderKPIs();
    renderResumoPlanos();
    renderFichasAssinantes();
    renderAssinaturas();
    renderPagamentos();
    initFiltros();
});

// -------------- KPIs --------------
function renderKPIs() {
    const pagamentos  = StorageService.getAll('TbPagamentos');
    const assinaturas = StorageService.getAll('TbAssinaturas');
    const agora       = new Date();

    const ativas       = assinaturas.filter(a => a.Status !== 'Cancelada' && new Date(a.DataFim) > agora);
    const inativas     = assinaturas.filter(a => a.Status === 'Cancelada' || new Date(a.DataFim) <= agora);
    const receitaTotal = pagamentos.reduce((s, p) => s + p.ValorPago, 0);
    const ticketMedio  = pagamentos.length > 0 ? receitaTotal / pagamentos.length : 0;

    document.getElementById('kpi-receita').textContent  = fmt(receitaTotal);
    document.getElementById('kpi-ativas').textContent   = ativas.length;
    document.getElementById('kpi-ticket').textContent   = fmt(ticketMedio);
    document.getElementById('kpi-inativas').textContent = inativas.length;
}

// -------------- RESUMO POR PLANO --------------
function renderResumoPlanos() {
    const container = document.getElementById('resumo-planos');
    if (!container) return;

    const assinaturas = StorageService.getAll('TbAssinaturas');
    const pagamentos  = StorageService.getAll('TbPagamentos');

    container.innerHTML = Object.entries(PLANOS).map(([id, plano]) => {
        const assDoPlano  = assinaturas.filter(a => String(a.ID_Plano) === id);
        const pagsDoPlano = pagamentos.filter(p => {
            const a = assinaturas.find(a => a.ID_Assinatura == p.ID_Assinatura);
            return a && String(a.ID_Plano) === id;
        });
        const receita = pagsDoPlano.reduce((s, p) => s + p.ValorPago, 0);
        const total   = assinaturas.length || 1;
        const pct     = Math.round((assDoPlano.length / total) * 100);

        return `
        <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="fw-bold text-${plano.cor}">${plano.nome}</span>
                        <span class="badge bg-${plano.cor}">${assDoPlano.length} assinatura${assDoPlano.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="text-muted small mb-1">Receita acumulada</div>
                    <div class="fs-5 fw-bold">${fmt(receita)}</div>
                    <div class="progress mt-2" style="height:6px;">
                        <div class="progress-bar bg-${plano.cor}" style="width:${pct}%"></div>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');
}

// -------------- FICHAS DE ASSINANTES ATIVOS --------------
function renderFichasAssinantes() {
    const container = document.getElementById('fichas-assinantes');
    const badge     = document.getElementById('badge-fichas-ativas');
    if (!container) return;

    const assinaturas = StorageService.getAll('TbAssinaturas');
    const usuarios    = StorageService.getAll('TbUsuarios');
    const pagamentos  = StorageService.getAll('TbPagamentos');
    const agora       = new Date();

    const ativas = assinaturas.filter(a => a.Status !== 'Cancelada' && new Date(a.DataFim) > agora);

    if (badge) badge.textContent = ativas.length;
    container.innerHTML = '';

    if (ativas.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info mb-0">
                    <i class="bi bi-info-circle me-2"></i>Nenhum assinante ativo no momento.
                </div>
            </div>`;
        return;
    }

    ativas.forEach(ass => {
        const usuario = usuarios.find(u => u.ID_Usuario == ass.ID_Usuario);
        const plano   = PLANOS[ass.ID_Plano];
        const pag     = pagamentos.find(p => p.ID_Assinatura == ass.ID_Assinatura);

        const nome     = usuario ? usuario.NomeCompleto : `Usuário #${ass.ID_Usuario}`;
        const email    = usuario ? usuario.Email        : '—';
        const papel    = usuario ? usuario.Papel        : '—';
        const iniciais = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

        const dataFim       = new Date(ass.DataFim);
        const diasRestantes = Math.max(0, Math.ceil((dataFim - agora) / 86400000));
        const corDias       = diasRestantes <= 7 ? 'danger' : diasRestantes <= 30 ? 'warning' : 'success';

        const nomePlano = plano ? plano.nome      : `Plano #${ass.ID_Plano}`;
        const corPlano  = plano ? plano.cor       : 'secondary';
        const valorPago = pag   ? fmt(pag.ValorPago) : '—';
        const metodo    = pag   ? pag.MetodoPagamento : '—';

        const metodoCor = { 'Cartão de Crédito': 'primary', 'PIX': 'success', 'Boleto': 'warning' };
        const corMetodo = metodoCor[metodo] || 'secondary';

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        col.innerHTML = `
            <div class="card border-0 shadow-sm h-100" style="border-left:4px solid var(--bs-${corPlano}) !important;">
                <div class="card-body p-3">
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="rounded-circle bg-${corPlano} d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                             style="width:46px;height:46px;font-size:1rem">
                            ${iniciais}
                        </div>
                        <div class="overflow-hidden flex-grow-1">
                            <div class="fw-bold text-truncate">${nome}</div>
                            <div class="text-muted small text-truncate">${email}</div>
                            <span class="badge bg-light text-dark border" style="font-size:.65rem">${papel}</span>
                        </div>
                    </div>

                    <div class="d-flex gap-2 flex-wrap mb-2">
                        <span class="badge bg-${corPlano}">${nomePlano}</span>
                        <span class="badge bg-success">Ativa</span>
                        <span class="badge bg-${corDias}">${diasRestantes}d restantes</span>
                    </div>

                    <div class="list-group list-group-flush small mb-3">
                        <div class="list-group-item px-0 py-1 border-0 d-flex gap-2">
                            <i class="bi bi-calendar-check text-muted"></i>
                            <span>Início: <strong>${new Date(ass.DataInicio).toLocaleDateString('pt-BR')}</strong></span>
                        </div>
                        <div class="list-group-item px-0 py-1 border-0 d-flex gap-2">
                            <i class="bi bi-calendar-x text-muted"></i>
                            <span>Vence: <strong>${dataFim.toLocaleDateString('pt-BR')}</strong></span>
                        </div>
                        <div class="list-group-item px-0 py-1 border-0 d-flex gap-2">
                            <i class="bi bi-wallet2 text-muted"></i>
                            <span>${valorPago} via <span class="badge bg-${corMetodo} ${corMetodo === 'warning' ? 'text-dark' : ''}">${metodo}</span></span>
                        </div>
                    </div>

                    <button class="btn btn-sm btn-outline-danger w-100"
                            onclick="window.cancelarAssinatura(${ass.ID_Assinatura})">
                        <i class="bi bi-x-circle me-1"></i>Cancelar Assinatura
                    </button>
                </div>
            </div>`;
        container.appendChild(col);
    });
}

// -------------- TABELA ASSINATURAS --------------
function getStatusAss(ass) {
    if (ass.Status === 'Cancelada')              return { texto: 'Cancelada', cor: 'danger' };
    if (new Date(ass.DataFim) <= new Date())     return { texto: 'Expirada',  cor: 'secondary' };
    return { texto: 'Ativa', cor: 'success' };
}

function renderAssinaturas(filtroStatus = '') {
    const lista  = document.getElementById('lista-assinaturas');
    const badge  = document.getElementById('badge-total-assinaturas');
    if (!lista) return;

    const assinaturas = StorageService.getAll('TbAssinaturas');
    const usuarios    = StorageService.getAll('TbUsuarios');
    const pagamentos  = StorageService.getAll('TbPagamentos');

    let dados = [...assinaturas].reverse();
    if (filtroStatus) dados = dados.filter(a => getStatusAss(a).texto === filtroStatus);

    if (badge) badge.textContent = dados.length;
    lista.innerHTML = '';

    if (dados.length === 0) {
        lista.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3">Nenhuma assinatura encontrada.</td></tr>';
        return;
    }

    dados.forEach(ass => {
        const usuario   = usuarios.find(u => u.ID_Usuario == ass.ID_Usuario);
        const plano     = PLANOS[ass.ID_Plano];
        const status    = getStatusAss(ass);
        const pag       = pagamentos.find(p => p.ID_Assinatura == ass.ID_Assinatura);

        const nomeAluno = usuario ? usuario.NomeCompleto : `Usuário #${ass.ID_Usuario}`;
        const emailAluno= usuario ? usuario.Email        : '—';
        const nomePlano = plano   ? plano.nome           : `Plano #${ass.ID_Plano}`;
        const corPlano  = plano   ? plano.cor            : 'secondary';
        const valor     = pag     ? fmt(pag.ValorPago)   : '—';

        const podeCancelar = status.texto === 'Ativa';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="font-monospace text-muted small">#${String(ass.ID_Assinatura).slice(-6)}</td>
            <td class="fw-bold">${nomeAluno}</td>
            <td class="text-muted small">${emailAluno}</td>
            <td><span class="badge bg-${corPlano}">${nomePlano}</span></td>
            <td class="fw-bold text-success">${valor}</td>
            <td class="small">${new Date(ass.DataInicio).toLocaleDateString('pt-BR')}</td>
            <td class="small">${new Date(ass.DataFim).toLocaleDateString('pt-BR')}</td>
            <td><span class="badge bg-${status.cor}">${status.texto}</span></td>
            <td>
                ${podeCancelar
                    ? `<button class="btn btn-sm btn-outline-danger"
                               onclick="window.cancelarAssinatura(${ass.ID_Assinatura})">
                           <i class="bi bi-x-circle me-1"></i>Cancelar
                       </button>`
                    : '<span class="text-muted">—</span>'}
            </td>`;
        lista.appendChild(tr);
    });
}

window.cancelarAssinatura = (id) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;
    StorageService.update('TbAssinaturas', 'ID_Assinatura', id, { Status: 'Cancelada' });
    const filtro = document.getElementById('filtro-ass-status')?.value || '';
    renderKPIs();
    renderResumoPlanos();
    renderFichasAssinantes();
    renderAssinaturas(filtro);
};

// -------------- HISTÓRICO / PAGAMENTOS --------------
function renderPagamentos(filtroPlano = '', filtroMetodo = '') {
    const lista = document.getElementById('lista-pagamentos');
    if (!lista) return;

    const assinaturas = StorageService.getAll('TbAssinaturas');
    const usuarios    = StorageService.getAll('TbUsuarios');
    let pagamentos    = StorageService.getAll('TbPagamentos');

    if (filtroPlano) {
        pagamentos = pagamentos.filter(p => {
            const a = assinaturas.find(a => a.ID_Assinatura == p.ID_Assinatura);
            return a && String(a.ID_Plano) === filtroPlano;
        });
    }
    if (filtroMetodo) {
        pagamentos = pagamentos.filter(p => p.MetodoPagamento === filtroMetodo);
    }

    lista.innerHTML = '';

    if (pagamentos.length === 0) {
        lista.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Nenhuma transação encontrada.</td></tr>';
        return;
    }

    const metodoCor = { 'Cartão de Crédito': 'primary', 'PIX': 'success', 'Boleto': 'warning' };

    [...pagamentos].reverse().forEach(pag => {
        const ass       = assinaturas.find(a => a.ID_Assinatura == pag.ID_Assinatura);
        const usuario   = ass ? usuarios.find(u => u.ID_Usuario == ass.ID_Usuario) : null;
        const plano     = ass ? PLANOS[ass.ID_Plano] : null;

        const nomeAluno = usuario ? usuario.NomeCompleto : `Assinatura #${pag.ID_Assinatura}`;
        const nomePlano = plano   ? plano.nome           : 'Desconhecido';
        const corPlano  = plano   ? plano.cor            : 'secondary';
        const corMetodo = metodoCor[pag.MetodoPagamento] || 'secondary';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold font-monospace text-primary small">${pag.Id_Transacao_Gateway}</td>
            <td>${nomeAluno}</td>
            <td><span class="badge bg-${corPlano}">${nomePlano}</span></td>
            <td class="text-success fw-bold">${fmt(pag.ValorPago)}</td>
            <td><span class="badge bg-${corMetodo} ${corMetodo === 'warning' ? 'text-dark' : ''}">${pag.MetodoPagamento}</span></td>
            <td class="small text-muted">${new Date(pag.DataPagamento).toLocaleString('pt-BR')}</td>
            <td><span class="badge bg-success">Aprovado</span></td>`;
        lista.appendChild(tr);
    });
}

// -------------- FILTROS --------------
function initFiltros() {
    const filtroAssStatus = document.getElementById('filtro-ass-status');
    if (filtroAssStatus) {
        filtroAssStatus.addEventListener('change', () => renderAssinaturas(filtroAssStatus.value));
    }

    const filtroPlano  = document.getElementById('filtro-plano');
    const filtroMetodo = document.getElementById('filtro-metodo');
    const aplicar = () => renderPagamentos(filtroPlano?.value || '', filtroMetodo?.value || '');
    filtroPlano?.addEventListener('change',  aplicar);
    filtroMetodo?.addEventListener('change', aplicar);
}

// -------------- CHECKOUT --------------
function initCheckout() {
    loadAlunos();

    // Botões "Assinar Agora" nos cards de plano
    document.querySelectorAll('.btn-assinar').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const planoId   = e.currentTarget.getAttribute('data-plano');
            const tabPlanos = document.getElementById('planos-tab');
            if (tabPlanos) new bootstrap.Tab(tabPlanos).show();

            const selectPlano = document.getElementById('check-plano');
            if (selectPlano) {
                selectPlano.value = planoId;
                atualizarResumoCheckout();
                setTimeout(() => {
                    document.getElementById('form-checkout')
                        .scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 150);
            }
        });
    });

    // Preview do aluno selecionado
    const selectAluno = document.getElementById('check-aluno');
    selectAluno?.addEventListener('change', () => atualizarInfoAluno(selectAluno.value));

    // Atualizar resumo quando plano/método mudar
    document.getElementById('check-plano')?.addEventListener('change',  atualizarResumoCheckout);
    document.getElementById('check-metodo')?.addEventListener('change', atualizarResumoCheckout);

    const formCheck = document.getElementById('form-checkout');
    if (formCheck) {
        formCheck.addEventListener('submit', (e) => {
            e.preventDefault();
            const idAluno = document.getElementById('check-aluno').value;
            const planoId = document.getElementById('check-plano').value;
            const metodo  = document.getElementById('check-metodo').value;

            if (!idAluno) { alert('Selecione um aluno para assinar!'); return; }

            // Verificar se já tem assinatura ativa
            const assinaturas = StorageService.getAll('TbAssinaturas');
            const agora       = new Date();
            const assAtiva    = assinaturas.find(a =>
                a.ID_Usuario == idAluno &&
                a.Status !== 'Cancelada' &&
                new Date(a.DataFim) > agora
            );

            if (assAtiva) {
                const planoAtivo = PLANOS[assAtiva.ID_Plano];
                const ok = confirm(
                    `Este aluno já possui o Plano ${planoAtivo?.nome || '?'} ativo até ${new Date(assAtiva.DataFim).toLocaleDateString('pt-BR')}.\n\n` +
                    `Deseja adicionar uma nova assinatura do Plano ${PLANOS[planoId].nome} mesmo assim?`
                );
                if (!ok) return;
            }

            const plano   = PLANOS[planoId];
            const hoje    = new Date();
            const dataFim = new Date();
            dataFim.setMonth(hoje.getMonth() + plano.duracao);

            const novaAss    = new Assinatura(idAluno, planoId, hoje.toISOString(), dataFim.toISOString());
            novaAss.Status   = 'Ativa';
            const assSaved   = StorageService.insert('TbAssinaturas', novaAss);

            const txId    = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            const novoPag = new Pagamento(assSaved.ID_Assinatura, plano.preco, metodo, txId);
            StorageService.insert('TbPagamentos', novoPag);

            alert(`Assinatura confirmada!\nTransação: ${txId}\nPlano: ${plano.nome}\nValor: ${fmt(plano.preco)}\nVálido até: ${dataFim.toLocaleDateString('pt-BR')}`);
            formCheck.reset();
            document.getElementById('checkout-resumo')?.classList.add('d-none');
            document.getElementById('checkout-user-info')?.classList.add('d-none');
            loadAlunos();
            renderKPIs();
            renderResumoPlanos();
            renderFichasAssinantes();
            renderAssinaturas();
            renderPagamentos();
        });
    }
}

function atualizarInfoAluno(idAluno) {
    const infoBox = document.getElementById('checkout-user-info');
    if (!infoBox) return;

    if (!idAluno) {
        infoBox.classList.add('d-none');
        return;
    }

    const usuarios    = StorageService.getAll('TbUsuarios');
    const assinaturas = StorageService.getAll('TbAssinaturas');
    const usuario     = usuarios.find(u => u.ID_Usuario == idAluno);
    const agora       = new Date();

    const assAtiva = assinaturas.find(a =>
        a.ID_Usuario == idAluno &&
        a.Status !== 'Cancelada' &&
        new Date(a.DataFim) > agora
    );

    if (assAtiva) {
        const plano = PLANOS[assAtiva.ID_Plano];
        infoBox.className = 'mt-2 small rounded p-2 border border-warning bg-warning bg-opacity-10';
        infoBox.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill text-warning me-1"></i>
            <strong>${usuario?.NomeCompleto}</strong> já possui
            <span class="badge bg-${plano?.cor || 'secondary'}">${plano?.nome || '?'}</span>
            ativo até <strong>${new Date(assAtiva.DataFim).toLocaleDateString('pt-BR')}</strong>.`;
    } else {
        infoBox.className = 'mt-2 small rounded p-2 border border-success bg-success bg-opacity-10';
        infoBox.innerHTML = `
            <i class="bi bi-person-check-fill text-success me-1"></i>
            <strong>${usuario?.NomeCompleto}</strong> (${usuario?.Email}) — sem assinatura ativa.`;
    }
    infoBox.classList.remove('d-none');
}

function atualizarResumoCheckout() {
    const planoId = document.getElementById('check-plano')?.value;
    const metodo  = document.getElementById('check-metodo')?.value;
    const resumo  = document.getElementById('checkout-resumo');
    const texto   = document.getElementById('checkout-resumo-texto');
    if (!planoId || !resumo || !texto) return;

    const plano = PLANOS[planoId];
    texto.textContent = `${plano.nome} — ${fmt(plano.preco)} via ${metodo}`;
    resumo.classList.remove('d-none');
}

function loadAlunos() {
    const selAluno = document.getElementById('check-aluno');
    if (!selAluno) return;
    const usuarios = StorageService.getAll('TbUsuarios');
    selAluno.innerHTML = '<option value="">Selecione o Aluno...</option>';
    usuarios.forEach(u => {
        selAluno.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto} — ${u.Email}</option>`;
    });
}
