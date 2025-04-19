(function () {

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'user_menu.css';
    document.head.appendChild(link);

    function initUserMenu() {
        const nombre = localStorage.getItem('nombre') || '';
        const inicial = nombre.charAt(0).toUpperCase() || '?'; // Pone la inicial del usuario
        const trigger = document.getElementById('user-trigger');
        const dropdown = document.getElementById('user-dropdown');
        if (!trigger || !dropdown) return;

        trigger.innerText = inicial;

        // Con esto detecto la pagina y oculto la opción que sea en caso de que 
        // esté en esa página.
        const paginaActual = window.location.pathname.split('/').pop();
        if (paginaActual === 'diario_entrenamiento.html') {
            const enlace = dropdown.querySelector('a[href="diario_entrenamiento.html"]');
            if (enlace) enlace.remove();
        }
        if (paginaActual === 'panel_usuario.html') {
            const enlace = dropdown.querySelector('a[href="panel_usuario.html"]');
            if (enlace) enlace.remove();
        }

        trigger.addEventListener('click', e => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });

        const panelLink = dropdown.querySelector('a[href="panel_usuario.html"]');
        if (panelLink) {
            panelLink.addEventListener('click', async e => {
                e.preventDefault();

                const resp = await fetch('http://localhost:3000/user_menu', {
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const data = await resp.json();
                if (!data.success) {
                    alert(data.message || 'Error al cargar perfil');
                    return;
                }
                const user = data.usuario;
                
                localStorage.setItem('nombre', user.nombre);
                localStorage.setItem('email', user.email);
                localStorage.setItem('fechaRegistro', user.fechaRegistro);
                localStorage.setItem('rol', user.rol);
                localStorage.setItem('id_usuario', user.id_usuario);

                window.location.href = 'panel_usuario.html';
            });
        }
    }

    // Carga el menú desplegable
    function loadUserMenu() {
        const placeholder = document.getElementById('user-menu-placeholder');
        if (!placeholder) return;
        const isLogged = !!localStorage.getItem('token'); // Buscamos el token para saber si estamos logesados
        if (!isLogged) {
            placeholder.innerHTML = '';
            return;
        }
        fetch('user_menu.html')
            .then(resp => resp.text())
            .then(html => {
                placeholder.innerHTML = html;
                initUserMenu();
            })
            .catch(console.error);
    }

    document.addEventListener('DOMContentLoaded', loadUserMenu);

    function logout() {
        // borra las claves de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('id_usuario');
        localStorage.removeItem('rol');
        localStorage.removeItem('nombre');
        window.location.href = 'index.html';
    }

    window.logout = logout;

})();
