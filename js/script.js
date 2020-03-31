if (("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    console.log("this is a touch device");
} else {
    console.log("this is not a touch device");
    document.body.classList.add("no-touch");
}

Application.load();

Row.sortableColumns(Row.element);
Row.swiperColumns(Row.element.parentElement);
Row.currentSlides = Array.from(Row.swiperH.slides).splice(Row.swiperH.activeIndex, Row.swiperH.params.slidesPerView);
Row.slidesPerGroup = Row.swiperH.params.slidesPerGroup;


//Прослушивание события клик на элементе "+ Добавить колонку"; создание новой колонки
Row.spanAdder.addEventListener("click", function (event) {
    event.preventDefault();
    var column = new Column;
    Row.columnClasses.push(Column.idCounter, column);
    Row.element.append(column.element);
    this.classList.add("active");
    Row.swiperH.updateSlides();
    Row.swiperH.slideTo(Row.swiperH.slides.length - 1, Row.swiperH.speed, false);
    if (Row.swiperH.pagination.bullets.length > 1) { Row.swiperH.pagination.el.lastElementChild.classList.remove("swiper-pagination-bullet-active") };
    Row.swiperH.pagination.el.lastElementChild.click();

    Application.save();
});

Row.spanAdder.addEventListener("touchstart", function (event) {
    event.preventDefault();
    Row.spanAdder.click();
});

Row.spanAdder.addEventListener('transitionend', function () {
    this.classList.remove("active");
});

window.onload = function () {
    if (document.querySelector(".swiper-slide-active")) {
        Row.adder.style.width = document.querySelector(".swiper-slide-active").offsetWidth + "px";
    }

    Row.swiperH.navigation.nextEl.addEventListener("dragover", function (event) {
        Row.swiperH.navigation.nextEl.classList.add("active");
        Row.swiperH.navigation.nextEl.click();
    });
    Row.swiperH.navigation.prevEl.addEventListener("dragover", function (event) {
        Row.swiperH.navigation.prevEl.classList.add("active");
        Row.swiperH.navigation.prevEl.click();
    });
    Row.trash.addEventListener("dragover", function (event) {
        Row.trash.classList.add("active");
    });

    Row.swiperH.navigation.nextEl.addEventListener("dragleave", function (event) {
        Row.swiperH.navigation.nextEl.classList.remove("active");
    });
    Row.swiperH.navigation.prevEl.addEventListener("dragleave", function (event) {
        Row.swiperH.navigation.prevEl.classList.remove("active");
    });
    Row.trash.addEventListener("dragleave", function (event) {
        if (event.fromElement !== Row.trash.querySelector("i") && event.toElement === Row.trash && event.clientY) {
            Row.trash.classList.remove("active");
        }
    });
}
