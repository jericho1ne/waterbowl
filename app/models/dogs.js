exports.definition = {
	config: {
		columns: {
		    "dog_ID": 		"int",
		    "dog_name": 	"varchar",
		    "owner_ID": 	"int",
		    "last_seen": 	"datetime",
		    "photo": 		"varchar",
		    "birth_year": 	"int",
		    "breed": 		"varchar"
		},
		adapter: {
			type: "sql",
			collection_name: "dogs"
		}
	},
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			// extended functions and properties go here
		});
		return Model;
	},
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
			// extended functions and properties go here
		});
		return Collection;
	}
};