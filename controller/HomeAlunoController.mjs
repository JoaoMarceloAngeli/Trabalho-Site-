import { StorageService } from '../service/StorageService.mjs';
import { Avaliacao }    from '../model/Avaliacao.mjs';
import { Matricula }    from '../model/Matricula.mjs';
import { Certificado }  from '../model/Certificado.mjs';
import { Assinatura }   from '../model/Assinatura.mjs';
import { Pagamento }    from '../model/Pagamento.mjs';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard
    const userJson = sessionStorage.getItem('usuarioLogado');
    if(!userJson) {
        window.location.href = 'login.html';
        return;
    }
    const user = JSON.parse(userJson);
    
    // Header Info
    const nomeSpan = document.getElementById('nome-usuario-logado');
    if(nomeSpan) nomeSpan.textContent = `Olá, ${user.NomeCompleto}`;

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
        });
    }

    if(!localStorage.getItem('TbAvaliacoes')) {
        StorageService.saveAll('TbAvaliacoes', []);
    }

    renderExplorarCursos();
    renderMeusCursos();
    renderTrilhasAluno();
    renderMeuPlano();
    initAssinarAluno();
    initModalComentarios();
    initCertificados();
});

// Tornar métodos globais para onClick no HTML
window.matricularAluno = (idCurso) => {
    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const matricula = new Matricula(user.ID_Usuario, idCurso);
    StorageService.insert('TbMatriculas', matricula);
    alert('Matriculado com sucesso!');
    renderExplorarCursos();
    renderMeusCursos();
    loadCursosCertificadoOptions();
};

window.abrirSalaAula = (idCurso, titulo) => {
    document.getElementById('modalSalaAulaTitle').textContent = `Assistindo: ${titulo}`;
    const lista = document.getElementById('lista-conteudo-curso');
    lista.innerHTML = '';
    
    // Na nossa base (TbAulas, TbModulos) está vazia no mock default, mas caso o prof/admin insira:
    const aulas = StorageService.getAll('TbAulas').filter(a => a.ID_Curso == idCurso || true); // simplificado
    
    if (aulas.length === 0) {
        lista.innerHTML = '<div class="p-3 text-muted text-center">Nenhuma aula cadastrada pelo Admin ainda.</div>';
    } else {
        aulas.forEach(a => {
            lista.innerHTML += `
                <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" onclick="window.tocarAula('${a.Titulo}')">
                    <i class="bi bi-play-circle me-2"></i> ${a.Titulo}
                    <span class="badge bg-primary rounded-pill">${a.DuracaoMinutos}m</span>
                </button>
            `;
        });
    }
    
    const bsModal = new bootstrap.Modal(document.getElementById('modalSalaAula'));
    bsModal.show();
};

window.tocarAula = (titulo) => {
    document.getElementById('player-container').innerHTML = `
        <div class="ratio ratio-16x9 bg-dark">
            <div class="d-flex align-items-center justify-content-center text-white flex-column h-100">
                <i class="bi bi-play-btn fs-1 mb-2 text-primary"></i>
                <h5>Reproduzindo: ${titulo}</h5>
                <small class="text-muted">Simulação de Vídeo</small>
            </div>
        </div>
    `;
};

// Aba: Explorar Cursos
function renderExplorarCursos() {
    const vitrine = document.getElementById('vitrine-cursos');
    if (!vitrine) return;

    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const cursos = StorageService.getAll('TbCursos');
    const categorias = StorageService.getAll('TbCategorias');
    const matriculas = StorageService.getAll('TbMatriculas');
    const trilhasCursos = StorageService.getAll('TbTrilhasCursos');
    const trilhas = StorageService.getAll('TbTrilhas');

    vitrine.innerHTML = '';

    if (cursos.length === 0) {
        vitrine.innerHTML = '<div class="col-12"><div class="alert alert-info">Nenhum curso disponível ainda.</div></div>';
        return;
    }

    cursos.forEach(cur => {
        const cat = categorias.find(c => c.ID_Categoria == cur.ID_Categoria) || { Nome: 'Geral' };
        const isMatriculado = matriculas.some(m => m.ID_Usuario == user.ID_Usuario && m.ID_Curso == cur.ID_Curso);

        const tc = trilhasCursos.find(tc => tc.ID_Curso == cur.ID_Curso);
        const trilha = tc ? trilhas.find(t => t.ID_Trilha == tc.ID_Trilha) : null;
        const trilhaBadge = trilha
            ? `<span class="badge mb-2 d-inline-block" style="background:#0891b2"><i class="bi bi-diagram-3-fill me-1"></i>Trilha: ${trilha.Titulo}</span><br>`
            : '';

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 course-card">
                <div class="card-body p-4">
                    ${trilhaBadge}
                    <span class="badge bg-primary mb-2">${cat.Nome}</span>
                    <h5 class="fw-bold text-dark mt-1">${cur.Titulo}</h5>
                    <p class="text-muted small mb-3">${cur.Descricao}</p>
                    <ul class="list-unstyled mb-3 small">
                        <li><i class="bi bi-bar-chart-fill text-warning"></i> Nível: ${cur.Nivel}</li>
                        <li><i class="bi bi-clock-fill text-info"></i> Horas: ${cur.TotalHoras}h</li>
                        <li><i class="bi bi-journal-text text-success"></i> Aulas: ${cur.TotalAulas}</li>
                    </ul>
                    <hr>
                    <div class="d-flex gx-2">
                        ${isMatriculado
                            ? `<button class="btn btn-secondary w-100 fw-bold me-2" disabled>Já Matriculado</button>`
                            : `<button class="btn btn-success w-100 fw-bold me-2" onclick="window.matricularAluno(${cur.ID_Curso})">Matricular-se</button>`
                        }
                        <button class="btn btn-outline-dark fw-bold btn-avaliacoes" data-id="${cur.ID_Curso}" data-titulo="${cur.Titulo}">
                            <i class="bi bi-chat-left-text"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        vitrine.appendChild(col);
    });

    document.querySelectorAll('.btn-avaliacoes').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            const titulo = e.target.closest('button').dataset.titulo;
            abrirAvaliacoes(id, titulo);
        });
    });
}

// Aba: Meus Cursos
function renderMeusCursos() {
    const lista = document.getElementById('lista-meus-cursos');
    if (!lista) return;

    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const cursos = StorageService.getAll('TbCursos');
    const categorias = StorageService.getAll('TbCategorias');
    const matriculas = StorageService.getAll('TbMatriculas');
    
    lista.innerHTML = '';
    
    const minhasDocs = matriculas.filter(m => m.ID_Usuario == user.ID_Usuario);
    
    if(minhasDocs.length === 0) {
        lista.innerHTML = '<div class="col-12"><div class="alert alert-warning">Você ainda não está matriculado em nenhum curso. Vá para "Explorar Cursos" para começar!</div></div>';
        return;
    }

    minhasDocs.forEach(m => {
        const cur = cursos.find(c => c.ID_Curso == m.ID_Curso);
        if(!cur) return;
        const cat = categorias.find(c => c.ID_Categoria == cur.ID_Categoria) || { Nome: 'Geral' };

        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100 shadow border-success course-card border-2">
                <div class="card-body p-4 text-center">
                    <span class="badge bg-success mb-2">Matrícula Ativa</span>
                    <span class="badge bg-secondary ms-1 mb-2">${cat.Nome}</span>
                    <h5 class="fw-bold text-dark mt-2">${cur.Titulo}</h5>
                    <p class="text-muted small">${cur.Descricao}</p>
                    
                    <div class="progress mb-3" style="height: 10px;">
                        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" style="width: 10%" aria-valuenow="10" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    
                    <button class="btn btn-primary w-100 fw-bold mt-2 rounded-pill" onclick="window.abrirSalaAula(${cur.ID_Curso}, '${cur.Titulo}')">
                        <i class="bi bi-play-fill fs-5"></i> Assistir Aulas
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(col);
    });
}

function abrirAvaliacoes(idCurso, tituloCurso) {
    document.getElementById('modalComentariosTitle').textContent = `Avaliações: ${tituloCurso}`;
    document.getElementById('com-curso-id').value = idCurso;
    renderAvaliacoesLista(idCurso);
    const bsModal = new bootstrap.Modal(document.getElementById('modalComentarios'));
    bsModal.show();
}

function renderAvaliacoesLista(idCurso) {
    const container = document.getElementById('lista-avaliacoes');
    const avaliacoes = StorageService.getAll('TbAvaliacoes').filter(a => a.ID_Curso == idCurso);
    const usuarios = StorageService.getAll('TbUsuarios');

    if(avaliacoes.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Ainda não há avaliações para este curso. Seja o primeiro!</div>';
        return;
    }

    container.innerHTML = '';
    avaliacoes.reverse().forEach(av => {
        const u = usuarios.find(usr => usr.ID_Usuario == av.ID_Usuario) || { NomeCompleto: 'Usuário Desconhecido' };
        let stars = '';
        for(let i=0; i<5; i++) {
            stars += `<i class="bi bi-star${i < av.Nota ? '-fill text-warning' : ' text-muted'}"></i>`;
        }

        container.innerHTML += `
            <div class="card mb-2 border-0 shadow-sm">
                <div class="card-body py-2">
                    <div class="d-flex justify-content-between">
                        <strong class="small">${u.NomeCompleto}</strong>
                        <span>${stars}</span>
                    </div>
                    <p class="mb-0 text-muted small mt-1">"${av.Comentario}"</p>
                </div>
            </div>
        `;
    });
}

function initModalComentarios() {
    const form = document.getElementById('form-comentario');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const idCurso = document.getElementById('com-curso-id').value;
            const nota = document.getElementById('com-nota').value;
            const texto = document.getElementById('com-texto').value;
            const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));

            const avaliacao = new Avaliacao(user.ID_Usuario, idCurso, nota, texto);
            StorageService.insert('TbAvaliacoes', avaliacao);

            form.reset();
            renderAvaliacoesLista(idCurso);
        });
    }
}

// -------------- MEU PLANO --------------
const PLANOS_ALUNO = {
    '1': { nome: 'Mensal',    preco: 49.00,  duracao: 1,  cor: 'primary', desc: 'Flexível, sem fidelidade',   equiv: 'R$ 49,00/mês'     },
    '2': { nome: 'Semestral', preco: 249.00, duracao: 6,  cor: 'warning', desc: 'Economize 15%',              equiv: 'R$ 41,50/mês'     },
    '3': { nome: 'Anual',     preco: 399.00, duracao: 12, cor: 'success', desc: 'Melhor custo-benefício 30%', equiv: 'R$ 33,25/mês'     }
};

function renderMeuPlano() {
    const container = document.getElementById('meu-plano-status');
    if (!container) return;

    const user        = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const assinaturas = StorageService.getAll('TbAssinaturas');
    const pagamentos  = StorageService.getAll('TbPagamentos');
    const agora       = new Date();

    const minhas  = assinaturas
        .filter(a => a.ID_Usuario == user.ID_Usuario)
        .sort((a, b) => new Date(b.DataInicio) - new Date(a.DataInicio));

    const assAtiva = minhas.find(a => a.Status !== 'Cancelada' && new Date(a.DataFim) > agora);

    if (assAtiva) {
        const plano         = PLANOS_ALUNO[assAtiva.ID_Plano];
        const pag           = pagamentos.find(p => p.ID_Assinatura == assAtiva.ID_Assinatura);
        const dataFim       = new Date(assAtiva.DataFim);
        const diasRestantes = Math.max(0, Math.ceil((dataFim - agora) / 86400000));
        const corDias       = diasRestantes <= 7 ? 'danger' : diasRestantes <= 30 ? 'warning' : 'success';

        container.innerHTML = `
            <div class="text-center py-2">
                <i class="bi bi-patch-check-fill mb-2 text-${plano?.cor || 'primary'}" style="font-size:2.5rem"></i>
                <h5 class="fw-bold mb-1">Plano ${plano?.nome || '?'}</h5>
                <span class="badge bg-success mb-3">Ativa</span>
                <div class="list-group list-group-flush text-start small">
                    <div class="list-group-item px-0 border-0 py-1">
                        <i class="bi bi-calendar-check me-2 text-muted"></i>
                        Início: <strong>${new Date(assAtiva.DataInicio).toLocaleDateString('pt-BR')}</strong>
                    </div>
                    <div class="list-group-item px-0 border-0 py-1">
                        <i class="bi bi-calendar-x me-2 text-muted"></i>
                        Vence: <strong>${dataFim.toLocaleDateString('pt-BR')}</strong>
                        <span class="badge bg-${corDias} ms-1">${diasRestantes}d</span>
                    </div>
                    ${pag ? `<div class="list-group-item px-0 border-0 py-1">
                        <i class="bi bi-wallet2 me-2 text-muted"></i>
                        Pago: <strong>R$ ${Number(pag.ValorPago).toFixed(2).replace('.', ',')} via ${pag.MetodoPagamento}</strong>
                    </div>` : ''}
                </div>
            </div>`;
    } else {
        const ultima  = minhas[0];
        const expirou = ultima && ultima.Status !== 'Cancelada' && new Date(ultima.DataFim) <= agora;
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="bi bi-patch-question fs-1 text-muted mb-2"></i>
                <h6 class="fw-bold text-muted">${expirou ? 'Assinatura Expirada' : 'Sem Assinatura Ativa'}</h6>
                <p class="text-muted small mb-0">
                    ${expirou
                        ? 'Sua assinatura expirou. Renove ao lado para continuar!'
                        : 'Escolha um plano ao lado e comece a aprender!'}
                </p>
            </div>`;
    }

    renderPlanoOptionsAluno();
}

function renderPlanoOptionsAluno() {
    const container = document.getElementById('plano-options-aluno');
    if (!container) return;

    container.innerHTML = Object.entries(PLANOS_ALUNO).map(([id, p]) => `
        <div class="col-12">
            <div class="border rounded p-2 d-flex justify-content-between align-items-center plano-btn-aluno"
                 style="cursor:pointer;transition:box-shadow .15s" id="plano-btn-${id}"
                 onclick="window.selecionarPlanoAluno('${id}')">
                <div class="d-flex align-items-center gap-2">
                    <input type="radio" name="plano-radio-aluno" value="${id}" ${id === '1' ? 'checked' : ''}>
                    <div>
                        <span class="fw-bold text-${p.cor}">${p.nome}</span>
                        <span class="text-muted small ms-2">${p.desc}</span>
                    </div>
                </div>
                <div class="text-end">
                    <span class="badge bg-${p.cor} fw-bold">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                    <div class="text-muted" style="font-size:.7rem">${p.equiv}</div>
                </div>
            </div>
        </div>`).join('');

    atualizarResumoAluno('1');
}

window.selecionarPlanoAluno = (id) => {
    document.querySelectorAll('.plano-btn-aluno').forEach(el => {
        el.classList.remove('border-primary', 'border-warning', 'border-success', 'shadow-sm');
    });
    const corMap = { '1': 'primary', '2': 'warning', '3': 'success' };
    const btn = document.getElementById(`plano-btn-${id}`);
    if (btn) { btn.classList.add(`border-${corMap[id]}`, 'shadow-sm'); }
    const radio = btn?.querySelector('input[type=radio]');
    if (radio) radio.checked = true;
    document.getElementById('aluno-plano-selecionado').value = id;
    atualizarResumoAluno(id);
};

function atualizarResumoAluno(id) {
    const resumo = document.getElementById('aluno-checkout-resumo');
    const metodo = document.getElementById('aluno-metodo');
    if (!resumo) return;
    const p = PLANOS_ALUNO[id];
    const met = metodo ? metodo.value : 'Cartão de Crédito';
    resumo.innerHTML = `
        <i class="bi bi-receipt me-1 text-muted"></i>
        <strong>Resumo:</strong> Plano <span class="badge bg-${p.cor}">${p.nome}</span>
        — <strong>R$ ${p.preco.toFixed(2).replace('.', ',')}</strong> via ${met}`;
}

function initAssinarAluno() {
    document.getElementById('aluno-metodo')?.addEventListener('change', () => {
        const id = document.getElementById('aluno-plano-selecionado')?.value || '1';
        atualizarResumoAluno(id);
    });

    document.getElementById('btn-assinar-aluno')?.addEventListener('click', () => {
        const user    = JSON.parse(sessionStorage.getItem('usuarioLogado'));
        const planoId = document.getElementById('aluno-plano-selecionado')?.value || '1';
        const metodo  = document.getElementById('aluno-metodo')?.value || 'Cartão de Crédito';
        const plano   = PLANOS_ALUNO[planoId];

        // Usuário deve estar logado (já garantido pelo auth guard)
        if (!user?.ID_Usuario) {
            alert('Você precisa estar logado para assinar um plano.');
            return;
        }

        // Verificar assinatura ativa
        const assinaturas = StorageService.getAll('TbAssinaturas');
        const agora       = new Date();
        const assAtiva    = assinaturas.find(a =>
            a.ID_Usuario == user.ID_Usuario &&
            a.Status !== 'Cancelada' &&
            new Date(a.DataFim) > agora
        );

        if (assAtiva) {
            const planoAtual = PLANOS_ALUNO[assAtiva.ID_Plano];
            const ok = confirm(
                `Você já possui o Plano ${planoAtual?.nome || '?'} ativo até ${new Date(assAtiva.DataFim).toLocaleDateString('pt-BR')}.\n\n` +
                `Deseja contratar também o Plano ${plano.nome}?`
            );
            if (!ok) return;
        }

        const hoje    = new Date();
        const dataFim = new Date();
        dataFim.setMonth(hoje.getMonth() + plano.duracao);

        const novaAss  = new Assinatura(user.ID_Usuario, planoId, hoje.toISOString(), dataFim.toISOString());
        novaAss.Status = 'Ativa';
        const assSaved = StorageService.insert('TbAssinaturas', novaAss);

        const txId    = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const novoPag = new Pagamento(assSaved.ID_Assinatura, plano.preco, metodo, txId);
        StorageService.insert('TbPagamentos', novoPag);

        alert(`Assinatura confirmada!\nPlano: ${plano.nome}\nValor: R$ ${plano.preco.toFixed(2).replace('.', ',')}\nVálido até: ${dataFim.toLocaleDateString('pt-BR')}\nTransação: ${txId}`);
        renderMeuPlano();
    });
}

// -------------- TRILHAS --------------
function renderTrilhasAluno() {
    const lista = document.getElementById('lista-trilhas-aluno');
    if (!lista) return;

    const user          = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const trilhas       = StorageService.getAll('TbTrilhas');
    const trilhasCursos = StorageService.getAll('TbTrilhasCursos');
    const cursos        = StorageService.getAll('TbCursos');
    const categorias    = StorageService.getAll('TbCategorias');
    const matriculas    = StorageService.getAll('TbMatriculas');

    lista.innerHTML = '';

    if (trilhas.length === 0) {
        lista.innerHTML = `<div class="col-12">
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Nenhuma trilha disponível ainda. Aguarde o administrador criar trilhas de aprendizado em Módulo Acadêmico.
            </div></div>`;
        return;
    }

    trilhas.forEach(trilha => {
        const cat = categorias.find(c => c.ID_Categoria == trilha.ID_Categoria) || { Nome: 'Geral' };

        const cursosNaTrilha = [...trilhasCursos]
            .filter(tc => tc.ID_Trilha == trilha.ID_Trilha)
            .sort((a, b) => a.Ordem - b.Ordem)
            .map(tc => cursos.find(c => c.ID_Curso == tc.ID_Curso))
            .filter(Boolean);

        const matriculadosNaTrilha = cursosNaTrilha.filter(c =>
            matriculas.some(m => m.ID_Usuario == user.ID_Usuario && m.ID_Curso == c.ID_Curso)
        );

        const progresso = cursosNaTrilha.length > 0
            ? Math.round((matriculadosNaTrilha.length / cursosNaTrilha.length) * 100)
            : 0;

        const todosMatriculados = cursosNaTrilha.length > 0 &&
            matriculadosNaTrilha.length === cursosNaTrilha.length;

        const corBarra = progresso === 100 ? 'bg-success' : progresso > 0 ? 'bg-primary' : 'bg-secondary';

        const listaCursos = cursosNaTrilha.map((cur, i) => {
            const matriculado = matriculas.some(m => m.ID_Usuario == user.ID_Usuario && m.ID_Curso == cur.ID_Curso);
            return `
                <li class="list-group-item px-0 py-1 border-0 d-flex align-items-center gap-2 small">
                    <span class="badge bg-secondary rounded-pill" style="min-width:22px;text-align:center">${i + 1}</span>
                    <span class="${matriculado ? 'text-success fw-semibold' : 'text-dark'}" style="flex:1">${cur.Titulo}</span>
                    ${matriculado ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-circle text-muted"></i>'}
                </li>`;
        }).join('');

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        col.innerHTML = `
            <div class="card shadow border-0 h-100" style="border-top:4px solid #0891b2 !important;">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="badge" style="background:#0891b2">${cat.Nome}</span>
                        <span class="badge bg-light text-dark border">${cursosNaTrilha.length} curso${cursosNaTrilha.length !== 1 ? 's' : ''}</span>
                    </div>
                    <h5 class="fw-bold mt-2 mb-1">${trilha.Titulo}</h5>
                    <p class="text-muted small mb-3">${trilha.Descricao || 'Trilha de aprendizado estruturada.'}</p>

                    <div class="d-flex justify-content-between small mb-1">
                        <span class="text-muted">Progresso</span>
                        <span class="fw-bold">${matriculadosNaTrilha.length}/${cursosNaTrilha.length} concluídos</span>
                    </div>
                    <div class="progress mb-3" style="height:8px;">
                        <div class="progress-bar ${corBarra}" style="width:${progresso}%"></div>
                    </div>

                    ${cursosNaTrilha.length > 0 ? `
                    <ul class="list-group list-group-flush mb-3 border-top pt-2">
                        ${listaCursos}
                    </ul>` : '<p class="text-muted small mb-3">Nenhum curso associado ainda.</p>'}

                    ${todosMatriculados
                        ? `<button class="btn btn-success w-100 fw-bold" disabled>
                               <i class="bi bi-check-circle-fill me-1"></i>Matriculado em toda a trilha
                           </button>`
                        : `<button class="btn w-100 fw-bold text-white" style="background:#0891b2" onclick="window.matricularEmTrilha(${trilha.ID_Trilha})">
                               <i class="bi bi-lightning-fill me-1"></i>Matricular em toda a trilha
                           </button>`
                    }
                </div>
            </div>
        `;
        lista.appendChild(col);
    });
}

window.matricularEmTrilha = (idTrilha) => {
    const user          = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const trilhasCursos = StorageService.getAll('TbTrilhasCursos').filter(tc => tc.ID_Trilha == idTrilha);
    const matriculas    = StorageService.getAll('TbMatriculas');

    let novas = 0;
    trilhasCursos.forEach(tc => {
        const jaMatriculado = matriculas.some(m => m.ID_Usuario == user.ID_Usuario && m.ID_Curso == tc.ID_Curso);
        if (!jaMatriculado) {
            const m = new Matricula(user.ID_Usuario, tc.ID_Curso);
            StorageService.insert('TbMatriculas', m);
            novas++;
        }
    });

    if (novas === 0) {
        alert('Você já está matriculado em todos os cursos desta trilha!');
    } else {
        alert(`Matriculado com sucesso em ${novas} curso${novas !== 1 ? 's' : ''} da trilha!`);
    }

    renderTrilhasAluno();
    renderExplorarCursos();
    renderMeusCursos();
    loadCursosCertificadoOptions();
};

// -------------- CERTIFICADOS --------------
function initCertificados() {
    loadCursosCertificadoOptions();

    const form = document.getElementById('form-emitir-cert');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
            const idCurso = document.getElementById('cert-curso').value;
            if (!idCurso) return;

            const certificados = StorageService.getAll('TbCertificados');
            const jaEmitido = certificados.find(c => c.ID_Usuario == user.ID_Usuario && c.ID_Curso == idCurso);
            if (jaEmitido) {
                alert('Você já possui um certificado para este curso!');
                return;
            }

            const cert = new Certificado(user.ID_Usuario, idCurso);
            StorageService.insert('TbCertificados', cert);

            form.reset();
            renderMeusCertificados();
            loadCursosCertificadoOptions();
        });
    }

    renderMeusCertificados();
}

function loadCursosCertificadoOptions() {
    const select = document.getElementById('cert-curso');
    if (!select) return;

    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const matriculas = StorageService.getAll('TbMatriculas').filter(m => m.ID_Usuario == user.ID_Usuario);
    const cursos = StorageService.getAll('TbCursos');
    const certificados = StorageService.getAll('TbCertificados');

    select.innerHTML = '<option value="">Selecione o curso concluído...</option>';
    matriculas.forEach(m => {
        const cur = cursos.find(c => c.ID_Curso == m.ID_Curso);
        if (!cur) return;
        const jaCertificado = certificados.find(c => c.ID_Usuario == user.ID_Usuario && c.ID_Curso == cur.ID_Curso);
        if (!jaCertificado) {
            select.innerHTML += `<option value="${cur.ID_Curso}">${cur.Titulo}</option>`;
        }
    });
}

function renderMeusCertificados() {
    const lista = document.getElementById('lista-certificados');
    if (!lista) return;

    const user = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    const certificados = StorageService.getAll('TbCertificados').filter(c => c.ID_Usuario == user.ID_Usuario);
    const cursos = StorageService.getAll('TbCursos');

    lista.innerHTML = '';

    if (certificados.length === 0) {
        lista.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>
                    Você ainda não possui certificados. Conclua um curso e emita seu certificado acima!
                </div>
            </div>`;
        return;
    }

    certificados.forEach(cert => {
        const cur = cursos.find(c => c.ID_Curso == cert.ID_Curso) || { Titulo: 'Curso' };
        const dataEmissao = new Date(cert.DataEmissao).toLocaleDateString('pt-BR');

        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-4';
        col.innerHTML = `
            <div class="card shadow border-0 h-100" style="border-top: 4px solid #7c3aed !important;">
                <div class="card-body text-center p-4">
                    <div class="mb-3">
                        <i class="bi bi-patch-check-fill" style="font-size:3rem; color:#7c3aed;"></i>
                    </div>
                    <h5 class="fw-bold text-dark">Certificado de Conclusão</h5>
                    <p class="text-muted mb-1">Certificamos que</p>
                    <h6 class="fw-bold text-primary">${user.NomeCompleto}</h6>
                    <p class="text-muted mb-1">concluiu com êxito o curso</p>
                    <h6 class="fw-bold" style="color:#7c3aed">${cur.Titulo}</h6>
                    <hr>
                    <div class="d-flex justify-content-between align-items-center small text-muted">
                        <span><i class="bi bi-calendar-check me-1"></i>${dataEmissao}</span>
                    </div>
                    <div class="mt-2 p-2 rounded" style="background:#f3f0ff;">
                        <small class="fw-bold" style="color:#7c3aed; font-family:monospace; letter-spacing:1px;">
                            <i class="bi bi-shield-check me-1"></i>${cert.CodigoVerificacao}
                        </small>
                    </div>
                    <button class="btn btn-sm w-100 mt-3 fw-bold text-white" style="background:#7c3aed" onclick="window.imprimirCertificado('${cert.CodigoVerificacao}', '${user.NomeCompleto}', '${cur.Titulo}', '${dataEmissao}')">
                        <i class="bi bi-printer me-1"></i>Imprimir / Salvar
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(col);
    });
}

window.imprimirCertificado = (codigo, nomeAluno, nomeCurso, data) => {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Certificado - ${nomeCurso}</title>
    <style>
        body { font-family: Georgia, serif; background: #f8f4ff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .cert { background: white; border: 8px solid #7c3aed; border-radius: 16px; padding: 60px; max-width: 750px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(124,58,237,0.15); }
        .cert h1 { color: #7c3aed; font-size: 2.2rem; margin-bottom: 8px; }
        .cert .subtitle { color: #888; font-size: 1rem; margin-bottom: 32px; }
        .cert .nome { font-size: 1.8rem; color: #1e293b; font-weight: bold; margin: 16px 0; border-bottom: 2px solid #7c3aed; padding-bottom: 12px; }
        .cert .curso { font-size: 1.3rem; color: #7c3aed; font-weight: bold; margin: 16px 0 32px; }
        .cert .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
        .cert .codigo { font-family: monospace; color: #7c3aed; font-size: 0.85rem; background: #f3f0ff; padding: 8px 16px; border-radius: 8px; }
        .cert .data { color: #888; font-size: 0.9rem; }
        @media print { body { background: white; } }
    </style>
</head>
<body>
    <div class="cert">
        <h1>&#127942; Certificado de Conclusão</h1>
        <p class="subtitle">Cursos com Curso — Plataforma de Ensino Online</p>
        <p style="color:#555">Certificamos que</p>
        <div class="nome">${nomeAluno}</div>
        <p style="color:#555">concluiu com êxito o curso</p>
        <div class="curso">${nomeCurso}</div>
        <div class="footer">
            <div class="data">Emitido em: ${data}</div>
            <div class="codigo">Código: ${codigo}</div>
        </div>
        <div style="text-align:center; margin-top:32px;">
            <button onclick="window.print()" style="background:#7c3aed; color:white; border:none; padding:12px 36px; font-size:1rem; border-radius:8px; cursor:pointer; font-weight:bold;">
                &#128438; Imprimir / Salvar PDF
            </button>
        </div>
    </div>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const janela = window.open(url, '_blank', 'width=900,height=650');
    janela.addEventListener('unload', () => URL.revokeObjectURL(url));
};
