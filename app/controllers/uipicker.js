/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var args = arguments[0] || {};
Ti.API.debug(JSON.stringify(args));


//
// 				LOGIC FLOW
//
//-----------------------------------------------------------------------
//		(0)		Build dog info registration form
//-----------------------------------------------------------------------
// 		(1)  Add section header
var header_title = "";
if (args._type=="breed") {
	header_title = args._dog_name + "'s "+(args._index_val==1 ? "1st" : "2nd") + " breed";
}
else if (args._type=="birthdate") {
	header_title = "Tell us "+ args._dog_name + "'s birthdate";
}
else if (args._type=="weight") {
	header_title = "How much does "+ args._dog_name + " weigh?";
}
$.content.add( myUiFactory.buildMasterSectionHeader("picker_header", header_title) );

var form_width = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;
var title_label = myUiFactory.buildLabel( "Pick your dog's first breed.  You'll have the option of adding a second breed later.", form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000","left" );	

/////////////////////	 	CONTAINERS AND ANIMATIONS  		/////////////////////////////////
var value_picker = Titanium.UI.createPicker( { 
	top				: 20,
  useSpinner: true,
  width			: form_width,
	opacity 	: 1,
	borderColor: "#000000",
	borderWidth: 2
} );


/////////////////////	 	BREED PICKER 							/////////////////////////////////////
var data = [ "Affenpinscher", "Afghan", "Airedale", "Akita", "Alaskan", "American", "Anatolian", "Australian", "Basenji", "Basset", "Beagle", "Bearded", "Beauceron", "Bedlington", "Belgian", "Bergamasco", "Bernese", "Bichon", "Black", "Bloodhound", "Bluetick", "Boerboel", "Border", "Borzoi", "Boston", "Bouvier", "Boxer", "Boykin", "Briard", "Brittany", "Brussels", "Bull", "Bulldog", "Bullmastiff", "Cairn", "Canaan", "Cane", "Cardigan", "Cavalier", "Cesky", "Chesapeake", "Chihuahua", "Chinese", "Chinook", "Chow", "Cirneco", "Clumber", "Cocker", "Collie", "Coton", "Curly-CoatedRetriever", "Dachshund", "Dalmatian", "Dandie", "Doberman", "Dogue", "English", "Entlebucher", "Field", "Finnish", "Flat-CoatedRetriever", "French", "German", "Giant", "Glen", "Golden", "Gordon", "Great", "Greater", "Greyhound", "Harrier", "Havanese", "Ibizan", "Icelandic", "Irish", "Italian", "Japanese", "Keeshond", "Kerry", "Komondor", "Kuvasz", "Labrador", "Lakeland", "Leonberger", "Lhasa", "Lowchen", "Maltese", "Manchester", "Mastiff", "Miniature", "Neapolitan", "Newfoundland", "Norfolk", "Norwegian", "Norwich", "Nova", "Old", "Otterhound", "Papillon", "Parson", "Pekingese", "Pembroke", "Petit", "Pharaoh", "Plott", "Pointer", "Polish", "Pomeranian", "Poodle", "Portuguese", "Pug", "Puli", "Pyrenean", "Rat", "Redbone", "Rhodesian", "Rottweiler", "Russell", "Saluki", "Samoyed", "Schipperke", "Scottish", "Sealyham", "Shetland", "Shiba", "Shih", "Siberian", "Silky", "Skye", "Smooth", "Soft", "Spanish", "Spinone", "St.Bernard", "Staffordshire", "Standard", "Sussex", "Swedish", "Tibetan", "Toy", "Treeing", "Vizsla", "Weimaraner", "Welsh", "West", "Whippet", "Wire", "Wirehaired", "Xoloitzcuintli", "Yorkshire" ];

var dataRows = [];
var data_length = data.length
for (var i=0; i<data_length; i++) {
	var tableRow = Ti.UI.createPickerRow( { "title": data[i] } )
	dataRows.push(  tableRow  );
}
value_picker.add(dataRows);


$.content.add(title_label);

var saveBtn = myUiFactory.buildButton( "saveBtn", "save", "xl" );
saveBtn.addEventListener('click', function(e) {
	var selected_value = value_picker.getSelectedRow(0).title
	//alert( JSON.stringify(e) );
	if (args._type=="breed" && args._index_val==1) {
		// alert( selected_value);
		mySesh.dog.breed1 = selected_value;
	} else if (args._type=="breed" && args._index_val==2) {
		mySesh.dog.breed2 = selected_value;
	} else if (args._type=="birthdate") {
		mySesh.dog.birthdate = selected_value;
	}
	closeWindowController();
});	

$.content.add(value_picker);
$.content.add(saveBtn);

