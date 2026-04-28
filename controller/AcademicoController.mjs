import { StorageService } from '../service/StorageService.mjs';
import { Categoria } from '../model/Categoria.mjs';
import { Curso } from '../model/Curso.mjs';
import { Modulo } from '../model/Modulo.mjs';
import { Aula } from '../model/Aula.mjs';
import { Trilha } from '../model/Trilha.mjs';
import { TrilhaCurso } from '../model/TrilhaCurso.mjs';

document.addEventListener('DOMContentLoaded', () => {
    initCategorias();
    initCursos();
    initModulos();
    initAulas();
    initTrilhas();
});

// -------------- CATEGORIAS --------------
function initCategorias() {
    const formCat = document.getElementById('form-categoria');
    if (formCat) {
        formCat.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('cat-nome').value.trim();
            const desc = document.getElementById('cat-desc').value.trim();

            const categorias = StorageService.getAll('TbCategorias');
            if (categorias.find(c => c.Nome.toLowerCase() === nome.toLowerCase())) {
                alert('Já existe uma categoria com este nome.');
                return;
            }

            const novaCat = new Categoria(nome, desc);
            StorageService.insert('TbCategorias', novaCat);

            formCat.reset();
            renderCategorias();
            loadCategoriaOptions();
            loadTriCatOptions();
        });
    }
    renderCategorias();
}

function renderCategorias() {
    const lista = document.getElementById('lista-categorias');
    if (!lista) return;

    const categorias = StorageService.getAll('TbCategorias');
    lista.innerHTML = '';

    categorias.forEach(cat => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${cat.ID_Categoria}</td>
            <td class="fw-bold">${cat.Nome}</td>
            <td>${cat.Descricao}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarCategoria(${cat.ID_Categoria})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarCategoria = (id) => {
    if (confirm('Deseja excluir esta categoria?')) {
        StorageService.delete('TbCategorias', 'ID_Categoria', id);
        renderCategorias();
        loadCategoriaOptions();
        loadTriCatOptions();
    }
};

// -------------- CURSOS --------------
function initCursos() {
    loadCategoriaOptions();
    const formCurso = document.getElementById('form-curso');

    if (formCurso) {
        formCurso.addEventListener('submit', (e) => {
            e.preventDefault();
            const tit = document.getElementById('cur-titulo').value.trim();
            const desc = document.getElementById('cur-desc').value.trim();
            const cat = document.getElementById('cur-cat').value;
            const niv = document.getElementById('cur-nivel').value;
            const aulas = document.getElementById('cur-aulas').value;
            const horas = document.getElementById('cur-horas').value;

            const novoCurso = new Curso(tit, desc, 1, cat, niv, aulas, horas);
            StorageService.insert('TbCursos', novoCurso);

            formCurso.reset();
            renderCursos();
            loadModCursoOptions();
            loadTCCursoOptions();
        });
    }
    renderCursos();
}

function loadCategoriaOptions() {
    const select = document.getElementById('cur-cat');
    if (!select) return;

    const categorias = StorageService.getAll('TbCategorias');
    select.innerHTML = '<option value="">Selecione...</option>';
    categorias.forEach(cat => {
        select.innerHTML += `<option value="${cat.ID_Categoria}">${cat.Nome}</option>`;
    });
}

function renderCursos() {
    const lista = document.getElementById('lista-cursos');
    if (!lista) return;

    const cursos = StorageService.getAll('TbCursos');
    const categorias = StorageService.getAll('TbCategorias');

    lista.innerHTML = '';
    cursos.forEach(cur => {
        const cat = categorias.find(c => c.ID_Categoria == cur.ID_Categoria);
        const catNome = cat ? cat.Nome : 'Sem categoria';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${cur.Titulo}</td>
            <td><span class="badge bg-secondary">${catNome}</span></td>
            <td>${cur.Nivel}</td>
            <td>
                <span class="text-muted small">${cur.TotalHoras}h / ${cur.TotalAulas} aulas</span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarCurso(${cur.ID_Curso})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarCurso = (id) => {
    if (confirm('Deseja excluir este curso? Módulos e aulas vinculados também serão removidos.')) {
        const modulos = StorageService.getAll('TbModulos').filter(m => m.ID_Curso == id);
        const idModulos = modulos.map(m => m.ID_Modulo);

        let aulas = StorageService.getAll('TbAulas');
        aulas = aulas.filter(a => !idModulos.includes(a.ID_Modulo));
        StorageService.saveAll('TbAulas', aulas);

        let modList = StorageService.getAll('TbModulos');
        modList = modList.filter(m => m.ID_Curso != id);
        StorageService.saveAll('TbModulos', modList);

        let trilhasCursos = StorageService.getAll('TbTrilhasCursos');
        trilhasCursos = trilhasCursos.filter(tc => tc.ID_Curso != id);
        StorageService.saveAll('TbTrilhasCursos', trilhasCursos);

        StorageService.delete('TbCursos', 'ID_Curso', id);

        renderCursos();
        renderModulos();
        renderAulas();
        renderTrilhasCursos();
        loadModCursoOptions();
        loadAulaModuloOptions();
        loadTCCursoOptions();
    }
};

// -------------- MÓDULOS --------------
function initModulos() {
    loadModCursoOptions();
    const formMod = document.getElementById('form-modulo');

    if (formMod) {
        formMod.addEventListener('submit', (e) => {
            e.preventDefault();
            const idCurso = document.getElementById('mod-curso').value;
            const titulo = document.getElementById('mod-titulo').value.trim();
            const ordem = document.getElementById('mod-ordem').value;

            if (!idCurso) { alert('Selecione um curso.'); return; }

            const novoMod = new Modulo(idCurso, titulo, ordem);
            StorageService.insert('TbModulos', novoMod);

            formMod.reset();
            document.getElementById('mod-ordem').value = '1';
            renderModulos();
            loadAulaModuloOptions();
        });
    }
    renderModulos();
}

function loadModCursoOptions() {
    const select = document.getElementById('mod-curso');
    if (!select) return;

    const cursos = StorageService.getAll('TbCursos');
    select.innerHTML = '<option value="">Selecione o Curso...</option>';
    cursos.forEach(cur => {
        select.innerHTML += `<option value="${cur.ID_Curso}">${cur.Titulo}</option>`;
    });
}

function renderModulos() {
    const lista = document.getElementById('lista-modulos');
    if (!lista) return;

    const modulos = StorageService.getAll('TbModulos');
    const cursos = StorageService.getAll('TbCursos');

    lista.innerHTML = '';
    const sorted = [...modulos].sort((a, b) => a.Ordem - b.Ordem);

    sorted.forEach(mod => {
        const cur = cursos.find(c => c.ID_Curso == mod.ID_Curso);
        const curNome = cur ? cur.Titulo : 'Curso desconhecido';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge bg-warning text-dark">${mod.Ordem}</span></td>
            <td class="fw-bold">${mod.Titulo}</td>
            <td><span class="badge bg-success">${curNome}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarModulo(${mod.ID_Modulo})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarModulo = (id) => {
    if (confirm('Deseja excluir este módulo? As aulas vinculadas serão mantidas.')) {
        StorageService.delete('TbModulos', 'ID_Modulo', id);
        renderModulos();
        loadAulaModuloOptions();
    }
};

// -------------- AULAS --------------
function initAulas() {
    loadAulaModuloOptions();
    const formAula = document.getElementById('form-aula');

    if (formAula) {
        formAula.addEventListener('submit', (e) => {
            e.preventDefault();
            const idModulo = document.getElementById('aula-modulo').value;
            const titulo = document.getElementById('aula-titulo').value.trim();
            const tipo = document.getElementById('aula-tipo').value;
            const url = document.getElementById('aula-url').value.trim();
            const duracao = document.getElementById('aula-duracao').value;
            const ordem = document.getElementById('aula-ordem').value;

            if (!idModulo) { alert('Selecione um módulo.'); return; }

            const novaAula = new Aula(idModulo, titulo, tipo, url, duracao, ordem);
            StorageService.insert('TbAulas', novaAula);

            formAula.reset();
            document.getElementById('aula-duracao').value = '10';
            document.getElementById('aula-ordem').value = '1';
            renderAulas();
        });
    }
    renderAulas();
}

function loadAulaModuloOptions() {
    const select = document.getElementById('aula-modulo');
    if (!select) return;

    const modulos = StorageService.getAll('TbModulos');
    const cursos = StorageService.getAll('TbCursos');
    select.innerHTML = '<option value="">Selecione o Módulo...</option>';

    const sorted = [...modulos].sort((a, b) => a.Ordem - b.Ordem);
    sorted.forEach(mod => {
        const cur = cursos.find(c => c.ID_Curso == mod.ID_Curso);
        const curNome = cur ? ` (${cur.Titulo})` : '';
        select.innerHTML += `<option value="${mod.ID_Modulo}">Módulo ${mod.Ordem}: ${mod.Titulo}${curNome}</option>`;
    });
}

function renderAulas() {
    const lista = document.getElementById('lista-aulas');
    if (!lista) return;

    const aulas = StorageService.getAll('TbAulas');
    const modulos = StorageService.getAll('TbModulos');

    lista.innerHTML = '';
    const sorted = [...aulas].sort((a, b) => a.Ordem - b.Ordem);

    sorted.forEach(aula => {
        const mod = modulos.find(m => m.ID_Modulo == aula.ID_Modulo);
        const modNome = mod ? mod.Titulo : 'Módulo desconhecido';

        const tipoBadge = { 'Vídeo': 'bg-primary', 'Texto': 'bg-success', 'Quiz': 'bg-warning text-dark' };
        const badgeClass = tipoBadge[aula.TipoConteudo] || 'bg-secondary';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge bg-info text-dark">${aula.Ordem}</span></td>
            <td class="fw-bold">${aula.Titulo}</td>
            <td><small class="text-muted">${modNome}</small></td>
            <td><span class="badge ${badgeClass}">${aula.TipoConteudo}</span></td>
            <td>${aula.DuracaoMinutos}min</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarAula(${aula.ID_Aula})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarAula = (id) => {
    if (confirm('Deseja excluir esta aula?')) {
        StorageService.delete('TbAulas', 'ID_Aula', id);
        renderAulas();
    }
};

// -------------- TRILHAS --------------
function initTrilhas() {
    loadTriCatOptions();
    loadTCTrilhaOptions();
    loadTCCursoOptions();

    const formTrilha = document.getElementById('form-trilha');
    if (formTrilha) {
        formTrilha.addEventListener('submit', (e) => {
            e.preventDefault();
            const titulo = document.getElementById('tri-titulo').value.trim();
            const desc = document.getElementById('tri-desc').value.trim();
            const idCat = document.getElementById('tri-cat').value;

            if (!idCat) { alert('Selecione uma categoria.'); return; }

            const novaTrilha = new Trilha(titulo, desc, idCat);
            StorageService.insert('TbTrilhas', novaTrilha);

            formTrilha.reset();
            renderTrilhas();
            loadTCTrilhaOptions();
        });
    }

    const formTC = document.getElementById('form-trilha-curso');
    if (formTC) {
        formTC.addEventListener('submit', (e) => {
            e.preventDefault();
            const idTrilha = document.getElementById('tc-trilha').value;
            const idCurso = document.getElementById('tc-curso').value;
            const ordem = document.getElementById('tc-ordem').value;

            if (!idTrilha || !idCurso) { alert('Selecione trilha e curso.'); return; }

            const tbTrilhasCursos = StorageService.getAll('TbTrilhasCursos');
            const jaExiste = tbTrilhasCursos.find(tc => tc.ID_Trilha == idTrilha && tc.ID_Curso == idCurso);
            if (jaExiste) { alert('Este curso já está associado a esta trilha.'); return; }

            const novoTC = new TrilhaCurso(idTrilha, idCurso, ordem);
            StorageService.insert('TbTrilhasCursos', novoTC);

            formTC.reset();
            document.getElementById('tc-ordem').value = '1';
            renderTrilhasCursos();
        });
    }

    renderTrilhas();
    renderTrilhasCursos();
}

function loadTriCatOptions() {
    const select = document.getElementById('tri-cat');
    if (!select) return;

    const categorias = StorageService.getAll('TbCategorias');
    select.innerHTML = '<option value="">Selecione...</option>';
    categorias.forEach(cat => {
        select.innerHTML += `<option value="${cat.ID_Categoria}">${cat.Nome}</option>`;
    });
}

function loadTCTrilhaOptions() {
    const select = document.getElementById('tc-trilha');
    if (!select) return;

    const trilhas = StorageService.getAll('TbTrilhas');
    select.innerHTML = '<option value="">Selecione a Trilha...</option>';
    trilhas.forEach(t => {
        select.innerHTML += `<option value="${t.ID_Trilha}">${t.Titulo}</option>`;
    });
}

function loadTCCursoOptions() {
    const select = document.getElementById('tc-curso');
    if (!select) return;

    const cursos = StorageService.getAll('TbCursos');
    select.innerHTML = '<option value="">Selecione o Curso...</option>';
    cursos.forEach(cur => {
        select.innerHTML += `<option value="${cur.ID_Curso}">${cur.Titulo}</option>`;
    });
}

function renderTrilhas() {
    const lista = document.getElementById('lista-trilhas');
    if (!lista) return;

    const trilhas = StorageService.getAll('TbTrilhas');
    const categorias = StorageService.getAll('TbCategorias');

    lista.innerHTML = '';
    trilhas.forEach(t => {
        const cat = categorias.find(c => c.ID_Categoria == t.ID_Categoria);
        const catNome = cat ? cat.Nome : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${t.ID_Trilha}</td>
            <td class="fw-bold">${t.Titulo}</td>
            <td><span class="badge" style="background:#7c3aed">${catNome}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarTrilha(${t.ID_Trilha})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarTrilha = (id) => {
    if (confirm('Deseja excluir esta trilha?')) {
        StorageService.delete('TbTrilhas', 'ID_Trilha', id);
        renderTrilhas();
        loadTCTrilhaOptions();
        renderTrilhasCursos();
    }
};

function renderTrilhasCursos() {
    const lista = document.getElementById('lista-trilhas-cursos');
    if (!lista) return;

    const tbTC = StorageService.getAll('TbTrilhasCursos');
    const trilhas = StorageService.getAll('TbTrilhas');
    const cursos = StorageService.getAll('TbCursos');

    lista.innerHTML = '';
    const sorted = [...tbTC].sort((a, b) => a.Ordem - b.Ordem);

    sorted.forEach(tc => {
        const trilha = trilhas.find(t => t.ID_Trilha == tc.ID_Trilha);
        const curso = cursos.find(c => c.ID_Curso == tc.ID_Curso);
        const trilhaNome = trilha ? trilha.Titulo : '-';
        const cursoNome = curso ? curso.Titulo : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${trilhaNome}</td>
            <td>${cursoNome}</td>
            <td><span class="badge bg-secondary">${tc.Ordem}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarTrilhaCurso(${tc.ID_Trilha}, ${tc.ID_Curso})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarTrilhaCurso = (idTrilha, idCurso) => {
    if (confirm('Remover este curso da trilha?')) {
        let data = StorageService.getAll('TbTrilhasCursos');
        data = data.filter(tc => !(tc.ID_Trilha == idTrilha && tc.ID_Curso == idCurso));
        StorageService.saveAll('TbTrilhasCursos', data);
        renderTrilhasCursos();
    }
};
