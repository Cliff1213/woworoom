const swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  breakpoints: {
    768: {
      slidesPerView: 2
    },
    1200: {
      slidesPerView: 3
    },
  }
});