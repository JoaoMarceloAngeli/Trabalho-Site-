import { StorageService } from '../service/StorageService.mjs';
import { Avaliacao } from '../model/Avaliacao.mjs';
import { Matricula } from '../model/Matricula.mjs';
import { Certificado } from '../model/Certificado.mjs';

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
    
    vitrine.innerHTML = '';
    
    cursos.forEach(cur => {
        const cat = categorias.find(c => c.ID_Categoria == cur.ID_Categoria) || { Nome: 'Geral' };
        
        // Verifica se o usuário já tem matrícula
        const isMatriculado = matriculas.some(m => m.ID_Usuario == user.ID_Usuario && m.ID_Curso == cur.ID_Curso);
        
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 course-card">
                <div class="card-body p-4">
                    <span class="badge bg-primary mb-2">${cat.Nome}</span>
                    <h5 class="fw-bold text-dark">${cur.Titulo}</h5>
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
    </div>
    <script>window.onload = () => window.print();<\/script>
</body>
</html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const janela = window.open(url, '_blank', 'width=900,height=650');
    janela.addEventListener('unload', () => URL.revokeObjectURL(url));
};
