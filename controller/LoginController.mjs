import { StorageService } from '../service/StorageService.mjs';
import { Usuario } from '../model/Usuario.mjs';

document.addEventListener('DOMContentLoaded', () => {
    StorageService.initDb();

    const formLogin = document.getElementById('form-login');
    const erroMsg = document.getElementById('login-error');

    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;

            const usuarios = StorageService.getAll('TbUsuarios');
            const user = usuarios.find(u => u.Email === email && u.SenhaHash === senha);

            if (user) {
                sessionStorage.setItem('usuarioLogado', JSON.stringify(user));
                if (user.Papel === 'Admin' || user.Email === 'admin@formapro.com') {
                    window.location.href = 'index.html';
                } else {
                    window.location.href = 'home_aluno.html';
                }
            } else {
                erroMsg.classList.remove('d-none');
            }
        });
    }

    const formRegister = document.getElementById('form-register');
    const registerSuccess = document.getElementById('register-success');

    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('reg-nome').value;
            const email = document.getElementById('reg-email').value;
            const senha = document.getElementById('reg-senha').value;

            // Validar se email já existe
            const usuarios = StorageService.getAll('TbUsuarios');
            if (usuarios.find(u => u.Email === email)) {
                alert('Este E-mail já está em uso.');
                return;
            }

            const novoAluno = new Usuario(nome, email, senha, 'Aluno');
            StorageService.insert('TbUsuarios', novoAluno);

            formRegister.reset();
            registerSuccess.classList.remove('d-none');
            
            // Troca de volta para a aba de Login após 2 segundos
            setTimeout(() => {
                registerSuccess.classList.add('d-none');
                document.getElementById('pills-login-tab').click();
            }, 2000);
        });
    }
});

