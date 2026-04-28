import { StorageService } from './service/StorageService.mjs';

const PLANOS_REL = {
    '1': { nome: 'Mensal',    cor: 'primary' },
    '2': { nome: 'Semestral', cor: 'warning' },
    '3': { nome: 'Anual',     cor: 'success'  }
};

const fmtBRL = (v) => 'R$ ' + Number(v).toFixed(2).replace('.', ',');

document.addEventListener('DOMContentLoaded', () => {
    StorageService.initDb();

    const dashboardStats = document.getElementById('dashboard-stats');
    if (dashboardStats) {
        renderDashboard(dashboardStats);
        renderRelatorioAssinaturas();
    }
});

function renderDashboard(container) {
    const cursos   = StorageService.getAll('TbCursos');
    const usuarios = StorageService.getAll('TbUsuarios');
    const aulas    = StorageService.getAll('TbAulas');

    container.innerHTML = `
        <div class="col-md-4">
            <div class="card shadow-sm border-0 bg-white h-100 dash-card">
                <div class="card-body text-center p-4">
                    <div class="rounded-circle text-primary mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background-color: rgba(13, 110, 253, 0.1);">
                        <i class="bi bi-people-fill fs-3"></i>
                    </div>
                    <h5 class="card-title fw-bold">Alunos Registrados</h5>
                    <p class="card-text display-6 text-primary fw-bold">${usuarios.length}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm border-0 bg-white h-100 dash-card">
                <div class="card-body text-center p-4">
                    <div class="rounded-circle text-success mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background-color: rgba(25, 135, 84, 0.1);">
                        <i class="bi bi-book-half fs-3"></i>
                    </div>
                    <h5 class="card-title fw-bold">Cursos Ativos</h5>
                    <p class="card-text display-6 text-success fw-bold">${cursos.length}</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm border-0 bg-white h-100 dash-card">
                <div class="card-body text-center p-4">
                    <div class="rounded-circle text-warning mx-auto mb-3 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px; background-color: rgba(255, 193, 7, 0.1);">
                        <i class="bi bi-play-circle-fill fs-3"></i>
                    </div>
                    <h5 class="card-title fw-bold">Total de Aulas</h5>
                    <p class="card-text display-6 text-warning fw-bold">${aulas.length}</p>
                </div>
            </div>
        </div>
    `;
}

function renderRelatorioAssinaturas() {
    const assinaturas = StorageService.getAll('TbAssinaturas');
    const usuarios    = StorageService.getAll('TbUsuarios');
    const pagamentos  = StorageService.getAll('TbPagamentos');
    const agora       = new Date();

    const ativas   = assinaturas.filter(a => a.Status !== 'Cancelada' && new Date(a.DataFim) > agora);
    const inativas = assinaturas.filter(a => a.Status === 'Cancelada' || new Date(a.DataFim) <= agora);
    const receita  = pagamentos.reduce((s, p) => s + Number(p.ValorPago), 0);

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('rel-kpi-receita',  fmtBRL(receita));
    setEl('rel-kpi-ativas',   ativas.length);
    setEl('rel-kpi-total',    assinaturas.length);
    setEl('rel-kpi-inativas', inativas.length);

    const badge = document.getElementById('rel-badge-assinaturas');
    if (badge) badge.textContent = assinaturas.length;

    const lista = document.getElementById('rel-lista-assinaturas');
    if (!lista) return;

    if (assinaturas.length === 0) {
        lista.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Nenhuma assinatura cadastrada ainda.</td></tr>';
        return;
    }

    lista.innerHTML = '';
    [...assinaturas].reverse().forEach(ass => {
        const usuario   = usuarios.find(u => u.ID_Usuario == ass.ID_Usuario);
        const plano     = PLANOS_REL[String(ass.ID_Plano)];
        const pag       = pagamentos.find(p => p.ID_Assinatura == ass.ID_Assinatura);

        const nome      = usuario ? usuario.NomeCompleto : `Usuário #${ass.ID_Usuario}`;
        const email     = usuario ? usuario.Email        : '—';
        const nomePlano = plano   ? plano.nome           : `Plano #${ass.ID_Plano}`;
        const corPlano  = plano   ? plano.cor            : 'secondary';
        const valor     = pag     ? fmtBRL(pag.ValorPago): '—';
        const metodo    = pag     ? pag.MetodoPagamento  : '—';

        const isAtiva     = ass.Status !== 'Cancelada' && new Date(ass.DataFim) > agora;
        const statusTexto = ass.Status === 'Cancelada' ? 'Cancelada' : isAtiva ? 'Ativa' : 'Expirada';
        const statusCor   = ass.Status === 'Cancelada' ? 'danger'    : isAtiva ? 'success' : 'secondary';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${nome}</td>
            <td class="text-muted small">${email}</td>
            <td><span class="badge bg-${corPlano}">${nomePlano}</span></td>
            <td class="fw-bold text-success">${valor}</td>
            <td class="small">${metodo}</td>
            <td class="small">${new Date(ass.DataInicio).toLocaleDateString('pt-BR')}</td>
            <td class="small">${new Date(ass.DataFim).toLocaleDateString('pt-BR')}</td>
            <td><span class="badge bg-${statusCor}">${statusTexto}</span></td>
        `;
        lista.appendChild(tr);
    });
}
