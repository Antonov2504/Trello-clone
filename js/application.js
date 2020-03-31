var Application = {
    save() {
        var object = {
            columns: {
                idCounter: Column.idCounter,
                items: []
            },
            notes: {
                idCounter: Note.idCounter,
                items: []
            }
        }

        Row.initialisation();
        Row.columns.forEach(columnElement => {
            var column = {
                id: parseInt(columnElement.getAttribute("data-column-id")),
                header: columnElement.querySelector(".column-header").textContent,
                noteIds: []
            };

            columnElement
                .querySelectorAll(".note")
                .forEach(noteElement => {
                    column.noteIds.push(parseInt(noteElement.getAttribute("data-note-id")));
                });

            object.columns.items.push(column);
        });

        Row.notes.forEach(noteElement => {
            var note = {
                id: parseInt(noteElement.getAttribute("data-note-id")),
                content: noteElement.textContent
            }

            object.notes.items.push(note);
        });

        var json = JSON.stringify(object);
        localStorage.setItem("trello", json);

        console.log("Сохранено");
        return object;
    },

    load() {
        Row.initialisation();

        if (!localStorage.getItem("trello")) {
            Application.save();
        }

        Row.columns.forEach(column => column.remove());

        var object = JSON.parse(localStorage.getItem("trello"));

        var getNoteById = id => object.notes.items.find(note => note.id === id);

        for (var { id, header, noteIds } of object.columns.items) {
            var column = new Column(id);
            Row.columnClasses.push(id, column);
            column.element.querySelector(".column-header").textContent = header;
            Row.element.append(column.element);

            for (var noteId of noteIds) {
                var { id, content } = getNoteById(noteId);
                var note = new Note(id, content);
                column.add(note);
            }
        }
        Row.initialisation();
    }
}