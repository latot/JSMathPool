import {Pool, Probability, Stat, CStat} from './JSMathPool.mjs';
import {obj2txt, printv, Clone} from './utility.mjs';
'use strict';

//Return true if they are equals

var splitkey = "///"

function array2txt(data){
	for (var i = 0;i < data.length;i++){
		data[i] = obj2txt(data[i].properties) + splitkey + obj2txt(data[i].value)
	}
	data.sort()
	return data
}

function prob2txt(prob){
	var data = []
	for (var i = 0;i < prob.cases.length;i++){
		prob.cases[i]["data"] = array2txt(prob.cases[i]["data"])
		var txt = prob.cases[i]["Probability"] + splitkey
		for (var j = 0;j < prob.cases[i]["data"].length;j++){
			txt = txt + prob.cases[i]["data"][j]
		}
		data.push(txt)
	}
	data.sort()
	return data
}

function CompareProbs(prob1, prob2){
	var prob1 = prob2txt(Clone(prob1))
	var prob2 = prob2txt(Clone(prob2))
    //printv(prob1)
    //printv(prob2)
	if (prob1.length != prob2.length){return 0;}
	for (var i = 0;i < prob1.length;i++){
		if (prob1[i] != prob2[i]) {return 0;}
	}
	return 1
}


//////Here start tests


function Same(data){
	return data
}

function Plus(data){
	var i = 0;
	for (var j = 0;j < data.values.length;j++) {
		i = i + data.values[j]
	}
	return new Stat(data.properties, i)
}

function DR(data){
	var i = 1;
	for (var j = 0;j < data.values.length;j++) {
		i = i*(1-data.values[j])
	}
	return new Stat(data.properties, 1 - i)
}

function Handle(data){
	var ret = []
	for (var i = 0;i < data.values.length;i++){
		switch (data.values[i].properties){
			case "attack":
				ret.push(Plus(data.values[i]))
				break;
			case "speed":
				ret.push(DR(data.values[i]))
				break;
		}
	}
    //console.log("handle")
    //print(ret)
	return ret
}

var nerror = 1;

{
let testdata = [new Stat("attack", 100), new Stat("attack", 100), new Stat("attack", 100), new Stat("speed", 0.3), new Stat("speed", 0.2), new Stat("speed", 0.1)]
let solution = new Probability([{"Probability": 1, "data": [new Stat("attack", 300), new Stat("speed", 0.496)]}])
let test = new Pool([Handle])
test.append(testdata)
if (!(CompareProbs(test.Solve(), solution))){printv(test.Solve());printv(solution);printv("Test " + nerror + " Failed")}
nerror = nerror + 1
}

{
let testdata = [new Stat("attack", 100), new Stat("attack", 100), new Stat("attack", 100), new Stat("speed", 0.3), new Stat("speed", 0.2), new Stat("speed", 0.1)]

let test1 = new Pool([Handle])
test1.append(testdata)

let solution = new Probability([{"Probability": 1, "data": [new Stat("attack", 300), new Stat("speed", 0.496)]}])
let test = new Pool([Handle])
test.append(test1)
if (!(CompareProbs(test.Solve(), solution))){printv(test.Solve());printv(solution);printv("Test " + nerror + " Failed")}
nerror = nerror + 1
}

{
let testdata = [[new Stat("attack", 50), new Stat("attack", 1)], new Stat("attack", 100), [[new Stat("speed", 0.3)]], new Stat("speed", 0.2), new Stat("speed", 0.15)]
let solution = new Probability([{"Probability": 1, "data": [new Stat("attack", 151), new Stat("speed", 0.524)]}])
let test = new Pool([Handle])
test.append(testdata)
if (!(CompareProbs(test.Solve(), solution))){printv(test.Solve());printv(solution);printv("Test " + nerror + " Failed")}
nerror = nerror + 1
}

{
let testdata = [new Stat("attack", 100), new Stat("attack", 100), new Stat("attack", 100), new Stat("speed", 0.3), new Stat("speed", 0.2), new Stat("speed", 0.1)]
let testdata2 = [[new Stat("attack", 50), new Stat("attack", 1)], new Stat("attack", 100), [[new Stat("speed", 0.3)]], new Stat("speed", 0.2), new Stat("speed", 0.15)]

let testprob = new Probability([{"Probability": 0.2, "data": testdata}, {"Probability": 0.2, "data": []}, {"Probability": 0.6, "data": new Probability([{"Probability": 0.3, "data": testdata}, {"Probability": 0.7, "data": testdata2}])}])

let solution = new Probability([{"Probability": 0.2, "data": [new Stat("attack", 300), new Stat("speed", 0.496)]}, {"Probability": 0.2, "data": []}, {"Probability": 0.6*0.3, "data": [new Stat("attack", 300), new Stat("speed", 0.496)]}, {"Probability": 0.6*0.7, "data": [new Stat("attack", 151), new Stat("speed", 0.524)]}]) 
let test = new Pool([Handle])
test.append(testprob)
if (!(CompareProbs(test.Solve(), solution))){printv(test.Solve());printv(solution);printv("Test " + nerror + " Failed")}
nerror = nerror + 1
}


{
let testdata = [new Stat("attack", 100), new Stat("attack", 100), new Stat("attack", 100), new Stat("speed", 0.3), new Stat("speed", 0.2), new Stat("speed", 0.1)]
let testdata2 = [[new Stat("attack", 50), new Stat("attack", 1)], new Stat("attack", 100), [[new Stat("speed", 0.3)]], new Stat("speed", 0.2), new Stat("speed", 0.15)]

let testprob = new Probability([{"Probability": 0.2, "data": testdata}, {"Probability": 0.2, "data": []}, {"Probability": 0.6, "data": new Probability([{"Probability": 0.3, "data": testdata}, {"Probability": 0.7, "data": testdata2}])}])

let test1 = new Pool([Handle])
test1.append(testprob)

let solution = new Probability([{"Probability": 0.2, "data": [new Stat("attack", 300), new Stat("speed", 0.496)]}, {"Probability": 0.2, "data": []}, {"Probability": 0.6*0.3, "data": [new Stat("attack", 300), new Stat("speed", 0.496)]}, {"Probability": 0.6*0.7, "data": [new Stat("attack", 151), new Stat("speed", 0.524)]}]) 
let test = new Pool([Handle])
test.append(test1)
if (!(CompareProbs(test.Solve(), solution))){printv(test.Solve());printv(solution);printv("Test " + nerror + " Failed")}
nerror = nerror + 1
}
