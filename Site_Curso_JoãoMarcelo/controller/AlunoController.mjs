import { StorageService } from '../service/StorageService.mjs';
import { Usuario } from '../model/Usuario.mjs';
import { Matricula } from '../model/Matricula.mjs';

document.addEventListener('DOMContentLoaded', () => {
    initAlunos();
    initMatriculas();
});

// -------------- ALUNOS --------------
function initAlunos() {
    const formAluno = document.getElementById('form-aluno');
    if (formAluno) {
        formAluno.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('alu-nome').value;
            const email = document.getElementById('alu-email').value;
            const senha = document.getElementById('alu-senha').value;
            
            const novoAluno = new Usuario(nome, email, senha);
            StorageService.insert('TbUsuarios', novoAluno);
            
            formAluno.reset();
            renderAlunos();
            loadSelects(); // Atualiza Selects de matrícula
        });
    }
    renderAlunos();
}

function renderAlunos() {
    const lista = document.getElementById('lista-alunos');
    if (!lista) return;
    
    const usuarios = StorageService.getAll('TbUsuarios');
    lista.innerHTML = '';
    
    usuarios.forEach(alu => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${alu.NomeCompleto}</td>
            <td>${alu.Email}</td>
            <td>${new Date(alu.DataCadastro).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="window.deletarAluno(${alu.ID_Usuario})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        lista.appendChild(tr);
    });
}

window.deletarAluno = (id) => {
    if(confirm('Deseja excluir este aluno?')) {
        StorageService.delete('TbUsuarios', 'ID_Usuario', id);
        renderAlunos();
        loadSelects();
    }
};

// -------------- MATRICULAS --------------
function initMatriculas() {
    loadSelects();
    const formMatricula = document.getElementById('form-matricula');
    
    if (formMatricula) {
        formMatricula.addEventListener('submit', (e) => {
            e.preventDefault();
            const idAluno = document.getElementById('mat-aluno').value;
            const idCurso = document.getElementById('mat-curso').value;
            
            // Check if matricula exists
            const matriculas = StorageService.getAll('TbMatriculas');
            const exists = matriculas.find(m => m.ID_Usuario == idAluno && m.ID_Curso == idCurso);
            if(exists) {
                alert('Aluno já matriculado neste curso!');
                return;
            }

            const novaMatricula = new Matricula(idAluno, idCurso);
            StorageService.insert('TbMatriculas', novaMatricula);
            
            formMatricula.reset();
            renderMatriculas();
        });
    }
    renderMatriculas();
}

function loadSelects() {
    const selAluno = document.getElementById('mat-aluno');
    const selCurso = document.getElementById('mat-curso');
    if (!selAluno || !selCurso) return;

    const usuarios = StorageService.getAll('TbUsuarios');
    const cursos = StorageService.getAll('TbCursos');

    selAluno.innerHTML = '<option value="">Selecione o Aluno...</option>';
    usuarios.forEach(u => selAluno.innerHTML += `<option value="${u.ID_Usuario}">${u.NomeCompleto}</option>`);

    selCurso.innerHTML = '<option value="">Selecione o Curso...</option>';
    cursos.forEach(c => selCurso.innerHTML += `<option value="${c.ID_Curso}">${c.Titulo}</option>`);
}

function renderMatriculas() {
    const lista = document.getElementById('lista-matriculas');
    if (!lista) return;

    const matriculas = StorageService.getAll('TbMatriculas');
    const usuarios = StorageService.getAll('TbUsuarios');
    const cursos = StorageService.getAll('TbCursos');

    lista.innerHTML = '';

    if(matriculas.length === 0) {
        lista.innerHTML = '<div class="col-12 text-center text-muted"><p>Nenhuma matrícula encontrada.</p></div>';
        return;
    }

    matriculas.forEach(mat => {
        const aluno = usuarios.find(u => u.ID_Usuario == mat.ID_Usuario);
        const curso = cursos.find(c => c.ID_Curso == mat.ID_Curso);
        
        if(!aluno || !curso) return;

        const date = new Date(mat.DataMatricula).toLocaleDateString();

        const col = document.createElement('div');
        col.className = 'col-md-6 mb-3';
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm course-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary">Matriculado em ${date}</span>
                        ${mat.DataConclusao ? '<span class="badge bg-success">Concluído</span>' : '<span class="badge bg-warning text-dark">Em Progresso</span>'}
                    </div>
                    <h5 class="fw-bold mb-1">${curso.Titulo}</h5>
                    <p class="text-muted small mb-3"><i class="bi bi-person-fill"></i> Aluno: ${aluno.NomeCompleto}</p>
                    
                    <div class="progress mb-3" style="height: 10px;">
                        <div class="progress-bar ${mat.DataConclusao ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${mat.DataConclusao ? '100' : '20'}%" aria-valuenow="${mat.DataConclusao ? '100' : '20'}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    
                    <button class="btn btn-outline-primary w-100 btn-sm">Acessar Aulas</button>
                </div>
            </div>
        `;
        lista.appendChild(col);
    });
}
