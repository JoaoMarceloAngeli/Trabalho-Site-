import { StorageService } from '../service/StorageService.mjs';

document.addEventListener('DOMContentLoaded', () => {
    StorageService.initDb(); // Garante o mock se ninguém visitou as outras ainda
    renderCursos();
});

function renderCursos() {
    const vitrine = document.getElementById('vitrine-cursos');
    if (!vitrine) return;

    const cursos = StorageService.getAll('TbCursos');
    const categorias = StorageService.getAll('TbCategorias');
    
    vitrine.innerHTML = '';
    
    if(cursos.length === 0) {
        vitrine.innerHTML = '<div class="alert alert-info w-100 text-center">Nenhum curso cadastrado ainda.</div>';
        return;
    }

    cursos.forEach(cur => {
        const cat = categorias.find(c => c.ID_Categoria == cur.ID_Categoria) || { Nome: 'Geral' };
        
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        col.innerHTML = `
            <div class="card h-100 shadow-sm border-0 course-card">
                <div class="card-body p-4">
                    <span class="badge bg-success mb-2">${cat.Nome}</span>
                    <h5 class="fw-bold text-dark">${cur.Titulo}</h5>
                    <p class="text-muted small mb-3">${cur.Descricao}</p>
                    <ul class="list-unstyled mb-3 small">
                        <li><i class="bi bi-bar-chart-fill text-warning"></i> Nível: ${cur.Nivel}</li>
                        <li><i class="bi bi-clock-fill text-info"></i> Horas: ${cur.TotalHoras}h</li>
                    </ul>
                    <hr>
                    <a href="login.html" class="btn btn-outline-success w-100 fw-bold">Faça login para assistir</a>
                </div>
            </div>
        `;
        vitrine.appendChild(col);
    });
}
