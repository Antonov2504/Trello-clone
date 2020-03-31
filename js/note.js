class Note {
    constructor(id = null, content = "") {
        var instance = this;
        this.element = document.createElement("div");
        this.element.classList.add("note");
        this.element.textContent = content;

        if (id) {
            this.element.setAttribute("data-note-id", id);
        } else {
            this.element.setAttribute("data-note-id", Note.idCounter);
            Note.idCounter++;
        }

        //Редактирование карточки при dblclick
        this.element.addEventListener("dblclick", function (event) {
            this.setAttribute("contenteditable", true);
            this.removeAttribute("draggable");
            instance.column.removeAttribute("draggable");
            this.focus();
        });
        this.element.addEventListener("blur", function (event) {
            this.removeAttribute("contenteditable");
            this.setAttribute("draggable", true);
            Sortable.get(Row.element).option("disabled", false);
            if (!this.textContent.trim().length) {
                this.remove();
            }
            Application.save();
        });

        //Редактирование карточки при doubleTap
        this.element.addEventListener("touchstart", this.doubleTap.bind(this));
    }

    get column() {
        return this.element.closest(".column");
    }

    doubleTap(event) {
        if (!Note.tapedTwice) {
            Note.tapedTwice = true;
            console.log(Note.tapedTwice);

            setTimeout(function () { Note.tapedTwice = false; }, 300);
            return false;
        }
        event.preventDefault();
        //action on double tap goes below
        console.log("double Tap!!!");
        this.element.setAttribute("contenteditable", true);
        this.element.removeAttribute("draggable");
        this.column.removeAttribute("draggable");
        this.element.focus();
        Note.tapedTwice = false;
    }
}

Note.idCounter = 8;
Note.dragged = null;
Note.tapedTwice = false;

