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

        // Con esto detecto la pagina y oculto la opción "Mis Entrenamientos" en caso de que 
        // esté en el diario de entrenamientos.
        const paginaActual = window.location.pathname.split('/').pop();
        if (paginaActual === 'diario_entrenamiento.html') {
            const enlace = dropdown.querySelector('a[href="diario_entrenamiento.html"]');
            if (enlace) enlace.remove();
        }

        trigger.addEventListener('click', e => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });
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
