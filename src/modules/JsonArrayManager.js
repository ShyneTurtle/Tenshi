const fs = require('node:fs');
const _ = undefined;

class JsonArrayManager {
    /**
     * 
     * @param {String} path Path to the JSON file to use
     * @param {Number} indent Identation of the JSON file
     */
    constructor(path, indent) {
        this.path = path;
        this.indent = indent;
        this.array = [];

        this.load();
    };

    save() {
        fs.writeFileSync(this.path,
            JSON.stringify(this.array, _, this.indent)
        );
    };

    load() {
        // If file doesn't exists, create it
        if (!fs.existsSync(this.path))
            this.save();
            
        let updated_file = JSON.parse(fs.readFileSync(this.path));

        this.array = [];

        updated_file.forEach((v) => {
            this.array.push(v);
        });
    };
};

module.exports = JsonArrayManager;