'use strict';

export function obj2txt(obj){
    if (typeof window === 'undefined') {
        const util = require('util')
	    return util.inspect(obj, {depth: null});
    }else{
	    return JSON.stringify(obj, null, 4);
    }
}

export function printv(obj){
	console.log(obj2txt(obj));
}

export function Clone(data) {
	return JSON.parse(JSON.stringify(data))
}
