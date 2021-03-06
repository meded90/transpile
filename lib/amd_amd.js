var esprima = require('esprima'),
	traverse = require('./traverse'),
	escodegen = require('escodegen'),
	comparify = require('comparify'),
	optionsNormalize = require('./options_normalize');

module.exports = function(load, options){
	
	var moduleNameToVariables = {};
	
	var output = esprima.parse(load.source.toString());
	
	traverse(output, function(obj){
		if(	comparify(obj,{
					"type": "CallExpression",
					"callee": {
						"type": "Identifier",
						"name": "define"
					}
				})  ) {
			var args = obj.arguments, arg;
			if(args[0].type !== "Literal") {
				args.unshift({
					type: "Literal",
					value: load.name,
					raw: "\""+load.name+"\""
				});
			}

			// Perform normalization on the dependency names, if needed
			if(args[1].type === "ArrayExpression") {
				var i = 0, element, val;
				arg = args[1];
				while(i < arg.elements.length) {
					element = arg.elements[i];
					element.value = optionsNormalize(options, element.value,
																					 load.name, load.address);
					element.raw = '"' + element.value + '"';
					i++;
				}
			}

			return false;
		}
	});
	
	return escodegen.generate(output);
};
