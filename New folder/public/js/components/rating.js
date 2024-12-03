class TopicRating {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentRating = 0;
    }

    render() {
        this.container.innerHTML = `
            <div class="rating-container">
                ${Array(5).fill(0).map((_, index) => `
                    <span class="star" data-rating="${index + 1}">
                        ${index < this.currentRating ? '★' : '☆'}
                    </span>
                `).join('')}
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        const stars = this.container.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                this.currentRating = parseInt(e.target.dataset.rating);
                this.render();
                this.onRatingSubmit(this.currentRating);
            });
        });
    }

    onRatingSubmit(rating) {
        // Event to be handled by parent component
    }
} 