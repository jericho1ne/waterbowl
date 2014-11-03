var Alloy = require("alloy"), _ = require("alloy/underscore")._, model, collection;

exports.definition = {
    config: {
        columns: {
            dog_ID: "int",
            dog_name: "varchar",
            owner_ID: "int",
            last_seen: "datetime",
            photo: "varchar",
            birth_year: "int",
            breed: "varchar"
        },
        adapter: {
            type: "sql",
            collection_name: "dogs"
        }
    },
    extendModel: function(Model) {
        _.extend(Model.prototype, {});
        return Model;
    },
    extendCollection: function(Collection) {
        _.extend(Collection.prototype, {});
        return Collection;
    }
};

model = Alloy.M("dogs", exports.definition, []);

collection = Alloy.C("dogs", exports.definition, model);

exports.Model = model;

exports.Collection = collection;