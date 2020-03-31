class Column {
    constructor(id = null) {
        var instance = this;
        this.notes = [];
        this.element = document.createElement("div");
        this.element.className = "swiper-slide";
        this.element.classList.add("column");

        //Назначаем id колонки
        if (id) {
            this.element.setAttribute("data-column-id", id);
        } else {
            this.element.setAttribute("data-column-id", Column.idCounter);
            Column.idCounter++;
        }

        //Шаблон пустой колонки
        this.element.innerHTML = `
            <p class="column-header">В плане</p>
            <div class="notes empty" data-notes></div>
            <p class="column-footer">
            <span class="action" data-action-addNote>+ Добавить карточку</span>
            </p>
        `

        //Кнопка "Добавить карточку"
        var spanAction_addNote = this.element.querySelector("[data-action-addNote]");
        spanAction_addNote.addEventListener("click", function (event) {
            instance.element.querySelector("[data-notes]").classList.remove("empty");
            Sortable.get(Row.element).option("disabled", true);
            var note = new Note;
            instance.add(note);
            note.element.setAttribute("contenteditable", true);
            note.element.focus();
            Row.swiperH.update();
        });

        spanAction_addNote.addEventListener("touchstart", function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.click();
            this.style.color = "black";
            instance.element.querySelector("[data-notes]").lastElementChild.focus();
        });

        spanAction_addNote.addEventListener('transitionend', function () {
            this.style.color = "rgb(82, 82, 82)";
        });
        //---Кнопка "Добавить карточку"

        //Редактирование заголовка колонки по двойному клику
        var headerElement = this.element.querySelector(".column-header");
        headerElement.addEventListener("dblclick", function (event) {
            this.style.cursor = "initial";
            this.setAttribute("contenteditable", true);
            this.focus();
        });
        //---Редактирование заголовка колонки по двойному клику

        //Редактирование заголовка колонки по doubleTap
        headerElement.addEventListener("touchstart", this.doubleTap.bind(headerElement));
        //---Редактирование заголовка колонки по doubleTap

        //Сохранение заголовка колонки по событию blur
        headerElement.addEventListener("blur", function (event) {
            this.removeAttribute("contenteditable");
            this.style.cursor = "pointer";
            Application.save();
        });

        //Перетаскивание карточек
        this.sortableNotes(this.element.querySelector("[data-notes]"));
    }

    add(...notes) {
        for (var note of notes) {
            if (!this.notes.includes(note)) {
                this.notes.push(note);

                this.element.querySelector("[data-notes]").append(note.element);
            }
        }
    }

    sortableNotes(dataNotes) {
        this.sortableNotes = new Sortable(dataNotes, {
            group: "notes",
            dataIdAttr: "data-note-id",
            draggable: ".note",
            delay: 200,
            delayOnTouchOnly: true,
            touchStartThreshold: 3,
            animation: 300,
            selectedClass: "selected",
            onChoose: function (event) {
                Row.currentSlides = Array.from(Row.swiperH.slides).splice(Row.swiperH.activeIndex, Row.swiperH.params.slidesPerView);
                Row.slideIndex = Row.currentSlides.indexOf(event.item.closest(".column"));
                Sortable.get(event.item.parentElement).options.multiDrag = true;
            },

            onStart: function (event) {
                Sortable.get(Row.element).option("disabled", true);
                Row.adder.style.display = "none";
                Row.trash.style.display = "flex";
                Row.navigation.style.display = "block";

                Sortable.dragged.addEventListener("touchmove", function (event) {

                    if (Sortable.ghost && !Row.swiperH.navigation.nextEl.classList.contains("swiper-button-disabled") && event.touches[0].clientX >= Row.swiperH.navigation.nextEl.offsetLeft) {
                        Row.swiperH.navigation.nextEl.click();
                        // Sortable.ghost.style.left = (-1) * Row.swiperH.translate + (Row.swiperH.slides[0].swiperSlideSize + Row.swiperH.params.spaceBetween) * (Row.slideIndex % Row.swiperH.params.slidesPerView) + "px";
                    }

                    if (Sortable.ghost && !Row.swiperH.navigation.prevEl.classList.contains("swiper-button-disabled") && event.touches[0].clientX <= Row.swiperH.navigation.prevEl.offsetWidth) {
                        Row.swiperH.navigation.prevEl.click();
                        // Sortable.ghost.style.left = (-1) * Row.swiperH.translate + (Row.swiperH.slides[0].swiperSlideSize + Row.swiperH.params.spaceBetween) * (Row.slideIndex % Row.swiperH.params.slidesPerView) + "px";
                    }

                    if (Sortable.ghost && Row.trash.classList.contains("active") && event.touches[0].clientY < Row.trash.offsetTop) {
                        Row.trash.classList.remove("active");
                    }

                    if (Sortable.ghost && !Row.trash.classList.contains("active") && event.touches[0].clientY >= Row.trash.offsetTop) {
                        Row.trash.classList.add("active");
                    }
                })
            },
            onChange: function (event) {
                Row.initialisation();
                Row.notes.forEach(note => { note.style.backgroundColor = "white" });
            },
            onEnd: function (event) {
                var selectedNotes = Array.from(document.querySelectorAll(".note.selected"));
                if (selectedNotes.indexOf(event.item) === -1) { selectedNotes.push(event.item) };

                selectedNotes.forEach(note => {
                    Sortable.get(note.parentElement).options.multiDrag = false;
                });

                if (Row.trash.classList.contains("active")) {
                    selectedNotes.forEach(trashElement => {
                        var columnId = parseInt(trashElement.closest(".column").getAttribute("data-column-id"));
                        var columnClass = Row.columnClasses[Row.columnClasses.indexOf(columnId) + 1];
                        columnClass.notes.splice(columnClass.notes.indexOf(columnClass.notes.find(item => item.element === trashElement)), 1);

                        trashElement.parentNode.removeChild(trashElement);
                    });
                }

                document.querySelectorAll(".note.selected").forEach(note => {
                    note.classList.remove("selected");
                })

                Row.trash.classList.remove("active");
                Row.trash.style.display = "none";
                Row.navigation.style.display = "none";
                Row.adder.style.display = "flex";
                Row.spanAdder.classList.remove("active");

                Sortable.get(Row.element).option("disabled", false);
                Row.swiperH.update();
                Application.save();
            }
        })
    }

    doubleTap(event) {
        event.preventDefault();

        if (!Column.headerTapedTwice) {
            Column.headerTapedTwice = true;
            setTimeout(function () { Column.headerTapedTwice = false; }, 300);
            return false;
        }
        event.preventDefault();
        this.style.cursor = "initial";
        this.setAttribute("contenteditable", true);
        this.focus();
        Column.headerTapedTwice = false;
    }
}

Column.idCounter = 4;
Column.dragged = null;
Column.headerTapedTwice = false;

