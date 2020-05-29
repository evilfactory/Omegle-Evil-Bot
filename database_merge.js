const fs = require('fs');
var _ = require('lodash');


function merge_array(array1, array2) {
    var result_array = [];
    var arr = array1.concat(array2);
    var len = arr.length;
    var assoc = {};

    while(len--) {
        var item = arr[len].date;

        if(!assoc[item]) 
        { 
            result_array.unshift(arr[len]);
            assoc[item] = true;
        }
    }

    return result_array;
}

fs.readFile('./data/database1.json', 'utf8', function (err, data) {
	if (err) {
		return console.log(err);
	}

	var database1 = JSON.parse(data)

    fs.readFile('./data/database2.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
    
        var database2 = JSON.parse(data)

        let database3 = merge_array(database1, database2);

        console.log(database3);

        fs.writeFile('./data/database3.json', JSON.stringify(database3), function (err) {
            if (err) return console.log(err);
        });
    
    });


});