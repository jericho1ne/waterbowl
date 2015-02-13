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

var intro_text = "";
var header_title = "";

if (args._type=="breed") {
	header_title = "Breed";
	intro_text   = "What is " + (args._dog_name!=""?args._dog_name:"your dog") + "'s "+(args._index_val==1 ? "primary" : "secondary") + " breed?";
}
else if (args._type=="birthdate") {
	header_title = "Birthdate";
	intro_text 	 = "Tell us "+ (args._dog_name!=""?args._dog_name:"your dog") + "'s birthdate!";
}
else if (args._type=="weight") {
	header_title = "Size / Weight";
	intro_text	 = "How much does "+(args._dog_name!=""?args._dog_name:"your dog") + " weigh?";
}

var form_width  = mySesh.device.screenwidth - myUiFactory._pad_right - myUiFactory._pad_left;

$.content.add( myUiFactory.buildMasterSectionHeader("picker_header", header_title) );
$.content.add( myUiFactory.buildSpacer("horz", 20) );
$.content.add( myUiFactory.buildLabel( intro_text, form_width, Ti.UI.SIZE, myUiFactory._text_medium, "#000000","left" ) );	

/////////////////////	 	CONTAINERS AND ANIMATIONS  		/////////////////////////////////
if (args._type=="birthdate" ) {
	var value_picker = Titanium.UI.createPicker( { 
		top				: 20,
	  useSpinner: true,
	  width			: form_width,
		type			: Ti.UI.PICKER_TYPE_DATE,
	 	minDate		: new Date(1980,1,1),
	 	maxDate		: new Date(2015,12,12),
	 	value		  : new Date(2015,1,1),
		opacity 	: 1,
		borderColor: myUiFactory._color_dkblue,
		borderRadius : 10,
		borderWidth: 2
	} );
} else {
	var value_picker = Titanium.UI.createPicker( { 
		top				: 20,
	  useSpinner: true,
	  width			: form_width,
	  opacity 	: 1,
		borderColor: "#000000",
		borderColor: myUiFactory._color_dkblue,
		borderRadius : 10,
		borderWidth: 2
	} );
}

/////////////////////	 	BREED PICKER 							/////////////////////////////////////
var data_breed = ["Affenpinscher", "Afghan Hound", "Airedale Terrier", "Akita", "Alaskan Malamute", "American Bulldog", "American English Coonhound", "American Eskimo Dog", "American Foxhound", "American Staffordshire Terrier", "American Water Spaniel", "Anatolian Shepherd Dog", "Australian Cattle Dog", "Australian Shepherd", "Australian Terrier", "Basenji", "Basset Hound", "Beagle", "Bearded Collie", "Beauceron", "Bedlington Terrier", "Belgian Malinois", "Belgian Sheepdog", "Belgian Tervuren", "Bergamasco", "Bernese Mountain Dog", "Bichon Frise", "Black Russian Terrier", "Black and Tan Coonhound", "Bloodhound", "Bluetick Coonhound", "Boerboel", "Border Collie", "Border Terrier", "Borzoi", "Boston Terrier", "Bouvier des Flandres", "Boxer", "Boykin Spaniel", "Briard", "Brittany", "Brussels Griffon", "Bull Terrier", "Bulldog", "Bullmastiff", "Cairn Terrier", "Canaan Dog", "Cane Corso", "Cardigan Welsh Corgi", "Cavalier King Charles Spaniel", "Cesky Terrier", "Chesapeake Bay Retriever", "Chihuahua", "Chinese Crested", "Chinese Shar-Pei", "Chinook", "Chow Chow", "Cirneco dell'Etna", "Clumber Spaniel", "Cocker Spaniel", "Collie", "Coton de Tulear", "Curly-Coated Retriever", "Dachshund", "Dalmatian", "Dandie Dinmont Terrier", "Doberman Pinscher", "Dogue de Bordeaux", "English Cocker Spaniel", "English Foxhound", "English Setter", "English Springer Spaniel", "English Toy Spaniel", "Entlebucher Mountain Dog", "Field Spaniel", "Finnish Lapphund", "Finnish Spitz", "Flat-Coated Retriever", "French Bulldog", "German Pinscher", "German Shepherd Dog", "German Shorthaired Pointer", "German Wirehaired Pointer", "Giant Schnauzer", "Glen of Imaal Terrier", "Golden Retriever", "Gordon Setter", "Great Dane", "Great Pyrenees", "Greater Swiss Mountain Dog", "Greyhound", "Harrier", "Havanese", "Ibizan Hound", "Icelandic Sheepdog", "Irish Red and White Setter", "Irish Setter", "Irish Terrier", "Irish Water Spaniel", "Irish Wolfhound", "Italian Greyhound", "Japanese Chin", "Keeshond", "Kerry Blue Terrier", "Komondor", "Kuvasz", "Labrador Retriever", "Lakeland Terrier", "Leonberger", "Lhasa Apso", "Lowchen", "Maltese", "Manchester Terrier", "Mastiff", "Miniature Bull Terrier", "Miniature Pinscher", "Miniature Schnauzer", "Neapolitan Mastiff", "Newfoundland", "Norfolk Terrier", "Norwegian Buhund", "Norwegian Elkhound", "Norwegian Lundehund", "Norwich Terrier", "Nova Scotia Duck Tolling Retriever", "Old English Sheepdog", "Otterhound", "Papillon", "Parson Russell Terrier", "Pekingese", "Pembroke Welsh Corgi", "Petit Basset Griffon Vendeen", "Pharaoh Hound", "Plott", "Pointer", "Polish Lowland Sheepdog", "Pomeranian", "Poodle", "Portuguese Podengo Pequeno", "Portuguese Water Dog", "Pug", "Puli", "Pyrenean Shepherd", "Rat Terrier", "Redbone Coonhound", "Rhodesian Ridgeback", "Rottweiler", "Russell Terrier", "Saluki", "Samoyed"];

var data_weight = [ "1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78","79","80","81","82","83","84","85","86","87","88","89","90","91","92","93","94","95","96","97","98","99","100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121","122","123","124","125","126","127","128","129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149","150","151","152","153","154","155","156","157","158","159","160","161","162","163","164","165","166","167","168","169","170","171","172","173","174","175","176","177","178","179","180","181","182","183","184","185","186","187","188","189","190","191","192","193","194","195","196","197","198","199","200","201","202","203","204","205","206","207","208","209","210","211","212","213","214","215","216","217","218","219","220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236","237","238","239","240","241","242","243","244","245","246","247","248","249","250","251","252","253","254","255","256","257","258","259","260","261","262","263","264","265","266","267","268","269","270","271","272","273","274","275","276","277","278","279","280","281","282","283" ];

if			(args._type=="breed")		{
	var data = data_breed;
	if (args._index_val == 1) {
		data.unshift("A Beautiful Mix");
	} else if (args._index_val == 2) {
		data.unshift("- None -");
	}
}
else if (args._type=="weight")	var data = data_weight;

if (args._type!="birthdate") {
	var dataRows = [];
	var data_length = data.length
	for (var i=0; i<data_length; i++) {
		var tableRow = Ti.UI.createPickerRow( { "title": data[i] } )
		dataRows.push(  tableRow  );
	}
	value_picker.add(dataRows);
}

var saveBtn = myUiFactory.buildButton( "saveBtn", "save", "xl" );
////// SAVE BUTTON CLICK /////////////////////////////////////////
saveBtn.addEventListener('click', function(e) {
	if (args._type=="birthdate")
		var selected_value = value_picker.value;
	else
		var selected_value = value_picker.getSelectedRow(0).title;
		
	//alert( JSON.stringify(e) );
	if 	(args._type	=="breed") {
		if  		(args._index_val==1) 	
			mySesh.dog.breed1 = selected_value;
		else if (args._index_val==2)	{
			if (mySesh.dog.breed1 == selected_value || selected_value=="- None -")
				mySesh.dog.breed2 = "";
			else
				mySesh.dog.breed2 = selected_value;
		}
	}  
	else if (args._type	=="weight") {
		mySesh.dog.weight = selected_value;
	}
	else if (args._type	=="birthdate") {
		var day = selected_value.getDate();
    day = day.toString();
 
    if (day.length < 2)         day = '0' + day;
 
    var month = selected_value.getMonth();
    month = month + 1;
    month = month.toString();
 
    if (month.length < 2)       month = '0' + month; 
    var year = selected_value.getFullYear();
    var b_date = year + "-" + month + "-" + day;
		mySesh.dog.birthdate = b_date;
		selected_value = b_date;
	}
	Ti.API.debug( " .... [+] saveBtn :: "+ selected_value );
	closeWindowController();
});	

$.content.add(value_picker);
$.content.add( myUiFactory.buildSpacer("horz", 30) );
$.content.add(saveBtn);

