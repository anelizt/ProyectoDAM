document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.flip-card-inner');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const isFlipped = card.classList.contains('flipped');

            // quitar la clase flipped de todas
            cards.forEach(c => c.classList.remove('flipped'));

            // si no estaba girada, girarla
            if (!isFlipped) {
                card.classList.add('flipped');
            }
        });
    });
});