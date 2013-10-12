app.service('indexDBService', function() {
    var db = null;

    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    if ('webkitIndexedDB' in window) {
        window.IDBTransaction = window.webkitIDBTransaction;
        window.IDBKeyRange = window.webkitIDBKeyRange;
    }
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;

    this.onerror = function(e) {
        console.log(e);
    };

    this.open = function(fn) {
        var version = 1;

        if(window.indexedDB) {
            var request = window.indexedDB.open('LmnDemoApp', version);
            // We can only create Object stores in a versionchange transaction.
            request.onupgradeneeded = function(e) {
                db = e.target.result;
                // A versionchange transaction is started automatically.
                e.target.transaction.onerror = this.onerror;

                if(db.objectStoreNames.contains('slides')) {
                    db.deleteObjectStore('slides');
                }
                var SlideStore = db.createObjectStore('slides', {keyPath: "timeStamp"});
            };

            request.onsuccess = function(e) {
                db = e.target.result;
                fn();
            };
        }
        else{
            console.log('ERROR: Error occured while accessing indexedDB.')
        }

        request.onerror = this.onerror;
    };

    this.getAllItems = function(iterateCB, finalCB) {
        var trans = db.transaction('slides', "readonly");
        var store = trans.objectStore('slides');
        // Get everything in the tabs;
        var request = store.openCursor();
        request.onsuccess = function(event) {
            var cursor = event.target.result;
            if (cursor) {
                // Called for each matching record.
                iterateCB(cursor.value);
                cursor.continue();
            }
            else{               // When the cursor is null, all the records have been iterated
                finalCB();
            }
        };
        request.onerror = this.onerror;
    };

    this.deleteRecord = function(id, fn) {
        var trans = db.transaction('slides', "readwrite");
        var store = trans.objectStore('slides');
        var request = store.delete(id);

        request.onsuccess = function(e) {    // activate the callback if record deleted successfully
            fn();
        };

        request.onerror = function(e) {
            console.log(e);
        };
    };

    this.addRecord = function(record, fn) {
        var trans = db.transaction('slides', "readwrite");
        var store = trans.objectStore('slides');
        var request = store.put(record);

        request.onsuccess = function(e) {    // activate the callback if record created successfully
            fn();
        };

        request.onerror = function(e) {
            console.log(e.value);
        };
    };

});
