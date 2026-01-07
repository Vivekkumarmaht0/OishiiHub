const slides = document.querySelectorAll(".slide");
let currentIndex = 0;
let autoPlayInterval;

// Function to change slides
function changeSlide(direction) {
  slides[currentIndex].classList.remove("active");
  if (direction === "next") {
    currentIndex = (currentIndex + 1) % slides.length;
  } else {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  }
  slides[currentIndex].classList.add("active");
  resetAutoPlay();
}

// Auto-play function
function startAutoPlay() {
  autoPlayInterval = setInterval(() => {
    slides[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add("active");
  }, 5000); // Change image every 5 seconds
}

// Reset auto-play when user manually clicks
function resetAutoPlay() {
  clearInterval(autoPlayInterval);
  startAutoPlay();
}

document.querySelector(".next").addEventListener("click", () => {
  changeSlide("next");
});

document.querySelector(".prev").addEventListener("click", () => {
  changeSlide("prev");
});

// Start auto-play on page load
startAutoPlay();
