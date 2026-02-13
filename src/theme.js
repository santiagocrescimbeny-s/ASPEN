document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('darkModeToggle');
    const apply = () => {
        const on = toggle && toggle.checked;
        if (on) document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', on ? '1' : '0');
    };

    if (toggle) {
        // restore
        const saved = localStorage.getItem('darkMode');
        if (saved === '1') { toggle.checked = true; }
        apply();
        toggle.addEventListener('change', apply);
    } else {
        // apply saved even if toggle not present
        const saved = localStorage.getItem('darkMode');
        if (saved === '1') document.body.classList.add('dark-mode');
    }
});
