var Row = {
    columnClasses: [],
    currentSlides: [],
    slidesPerGroup: 1,
    initialisation() {
        Row.slideIndex = 0;
        Row.element = document.querySelector(".row");
        Row.notes = document.querySelectorAll(".note");
        Row.columns = document.querySelectorAll(".column");
        Row.adder = document.querySelector(".adder");
        Row.spanAdder = document.querySelector("[data-action-addColumn]");
        Row.trash = document.querySelector(".trash");
        Row.navigation = document.querySelector(".navigation");

        Row.columns.forEach(column => {
            var dataNotesLength = Array.from(column.querySelectorAll(".note")).length;
            if (dataNotesLength === 0) {
                column.querySelector("[data-notes]").classList.add("empty");
            } else {
                column.querySelector("[data-notes]").classList.remove("empty");
            }
        });
    },

    sortableColumns(dataColumns) {
        Sortable.create(dataColumns, {
            group: "columns",
            dataIdAttr: "data-column-id",
            draggable: ".column",
            delay: 100,
            delayOnTouchOnly: true,
            touchStartThreshold: 3,
            filter: ".ignore",
            animation: 300,
            swap: true,
            onChoose: function (event) {
                Row.currentSlides = Array.from(Row.swiperH.slides).splice(Row.swiperH.activeIndex, Row.swiperH.params.slidesPerView);
                Row.slideIndex = Row.currentSlides.indexOf(event.item);
            },
            onStart: function (event) {
                Row.adder.style.display = "none";
                Row.trash.style.display = "flex";

                if (Sortable.ghost) {
                    Sortable.ghost.classList.remove("swiper-slide");

                    document.querySelector(".sortable-drag").innerHTML = `
                    <p class="column-header">В плане</p>
                    <div class="note" data-notes>Карточки</div>
                    <p class="column-footer">
                    <span class="action" data-action-addNote>+ Добавить карточку</span>
                    </p>
                `;

                    document.querySelector(".sortable-drag").style.height = "initial";
                    Row.swiperH.update();
                };
                Row.navigation.style.display = "block";

                // Тач-событие навигация корзина
                Sortable.dragged.addEventListener("touchmove", function (event) {
                    if (Sortable.ghost && !Row.swiperH.navigation.nextEl.classList.contains("swiper-button-disabled") && event.touches[0].clientX >= Row.swiperH.navigation.nextEl.offsetLeft) {
                        Row.swiperH.navigation.nextEl.click();
                        // console.log(Row.swiperH.translate, Row.slideIndex, Row.slideIndex % Row.swiperH.params.slidesPerView, Sortable.ghost.style.left);
                    }

                    if (Sortable.ghost && !Row.swiperH.navigation.prevEl.classList.contains("swiper-button-disabled") && event.touches[0].clientX <= Row.swiperH.navigation.prevEl.offsetWidth) {
                        Row.swiperH.navigation.prevEl.click();
                    }

                    if (Sortable.ghost && Row.trash.classList.contains("active") && event.touches[0].clientY < Row.trash.offsetTop) {
                        Row.trash.classList.remove("active");
                    }

                    if (Sortable.ghost && !Row.trash.classList.contains("active") && event.touches[0].clientY >= Row.trash.offsetTop) {
                        Row.trash.classList.add("active");
                    }
                })


            },
            onUpdate: function (event) {
                Row.swiperH.update();
                Row.swiperH.updateAutoHeight(300);
                Row.initialisation();
            },
            onEnd: function (event) {
                if (Row.trash.classList.contains("active")) {
                    var columnId = parseInt(event.item.getAttribute("data-column-id"));
                    Row.columnClasses.splice(Row.columnClasses[Row.columnClasses.indexOf(columnId)], 2);
                    event.item.parentNode.removeChild(event.item);
                }

                document.querySelectorAll(".note.selected").forEach(note => {
                    note.classList.remove("selected");
                })

                Row.trash.classList.remove("active");
                Row.trash.style.display = "none";
                Row.navigation.style.display = "none";
                Row.adder.style.display = "flex";
                Row.spanAdder.classList.remove("active");


                Row.swiperH.update();
                Application.save();
            },
        })
    },

    swiperColumns(dataColumns) {
        Row.swiperH = new Swiper(dataColumns, {
            slidesPerView: 1,
            slidesPerGroup: 1,
            spaceBetween: 100,
            loop: false,
            speed: 300,
            autoHeight: true,
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            preventInteractionOnTransition: true,
            swipeHandler: ".swiper-pagination",
            breakpoints: {
                // when window width is >= 768px
                768: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                    spaceBetween: 50,
                },
                // when window width is >= 1024px
                1024: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                    spaceBetween: 50,
                },
                // when window width is >= 1440px
                1440: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                    spaceBetween: 50,
                },
                // when window width is >= 1920px
                1920: {
                    slidesPerView: 5,
                    slidesPerGroup: 5,
                    spaceBetween: 50,
                },
            },
            on: {
                transitionStart: function (event) {
                    if (Sortable.ghost) {
                        Sortable.ghost.style.left = (-1) * Row.swiperH.translate + (Row.swiperH.slides[0].swiperSlideSize + Row.swiperH.params.spaceBetween) * (Row.slideIndex % Row.swiperH.params.slidesPerView) + "px";
                    }

                    Row.swiperH.params.slidesPerGroup = Row.slidesPerGroup;
                    Row.swiperH.update();
                },
                transitionEnd: function (event) {
                    if (!Row.swiperH.pagination.el.querySelector(".swiper-pagination-bullet-active")) {
                        Row.swiperH.pagination.el.lastElementChild.classList.add("swiper-pagination-bullet-active");
                    }
                    Row.spanAdder.classList.remove("active");
                }
            }
        });
    }
}

