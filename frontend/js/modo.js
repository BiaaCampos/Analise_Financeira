// // ===== DARK / LIGHT MODE =====
// const toggleThemeBtn = document.getElementById('toggleTheme');
// const body = document.body;

// // Carregar tema salvo
// const temaSalvo = localStorage.getItem('theme');
// if (temaSalvo === 'dark') {
//     body.classList.add('dark-mode');
//     toggleThemeBtn.textContent = '☀️';
// }

// // Alternar tema
// toggleThemeBtn.addEventListener('click', () => {
//     body.classList.toggle('dark-mode');

//     const isDark = body.classList.contains('dark-mode');
//     toggleThemeBtn.textContent = isDark ? '☀️' : '🌙';

//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
// });
