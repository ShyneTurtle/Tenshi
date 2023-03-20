const fs = require('node:fs');

class JsonMapManager extends Map {
    /**
     * 
     * @param {String} path The path to the JSON file
     * @param {Number} indent Indentation of the JSON file
     */
    constructor(path, indent) {
        super();
        this.path = path;
        this.indent = indent;

        this.load();
    }

    load() {
        // If file doesn't exists, create it
        if (!fs.existsSync(this.path))
            this.save();
            
        let updated_file = new Map(Object.entries(
            JSON.parse(fs.readFileSync(this.path))
        ));

        this.clear();

        updated_file.forEach((v, k) => {
            this.set(k, v);
        });
        return this;
    }

    save() {
        fs.writeFileSync(this.path, JSON.stringify(Object.fromEntries(this.entries()), this.indent, 4));
        return this;
    }
};

module.exports = JsonMapManager;