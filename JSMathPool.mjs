import {obj2txt, printv} from './utility.mjs';
'use strict';

/*Group, will have 3 lvls of working, any stat will have a
	transformation function
	next a function over all the stats with the same name
	and a final function, over that value
	
	There will be 2 types of stats
		Normal stats, are available always
		Virtual Stats, should not exist in the final pool

Stats format:

{stat name: {fin: func to pool, fpool: global pool function, fout: out pool function}}

*/

//Sort will literally sort laa the data in a WokingProbs, be sure recolected input is a WorkingProbs

function Sort(recolected, data){
	/*console.log("working in ")
	console.log(data)
	console.log(data.constructor.name)*/
	switch (data.constructor.name) {
		case "WorkingProbs":
			recolected.Add(data)
			break;
		case "Stat":
			recolected.Static.Add(data)
			break;
		case "CStat":
			recolected.Static.Add(data)
			break;
		case "CStats":
			recolected.Static.Add(data)
			break;
		case "Array":
			for (var i = 0;i < data.length;i++){
				//console.log(data[i])
				recolected = Sort(recolected, data[i])
			}
			break;
		case "Pool":
			recolected.Pools.push(data)
			break;
		case "Probability":
			for (var j = 0;j < data.cases.length;j++) {
				var t = new WorkingProbs()
				t.Add(data.cases[j]["data"])
				data.cases[j]["data"] = t
			}
			recolected.Probabilities.push(data)
			break;
		default:
            if (data.Solve instanceof Function){
                recolected = Sort(recolected, data.Solve())
            }else{
			    console.log("Error!!!")
            }
	}
	return recolected
}

/*WorkingProbs

In the Probabilities array, we will store all the probabilities that will be applied to the data, but still not applied
The Static dicionary, keeps all the stats, and every one with an array, is the actual state of the data

*/

class WorkingProbs{
	constructor(){
		this.Probabilities = []
		this.Static = new CStats()
        this.Pools = []
	}
	Add(data){
        //print("data")
        //print(data)
		if (data.constructor.name != this.constructor.name) {
            //print("reorder")
            data = Sort(new WorkingProbs(), data)
        }
        //print("from workingprobs")
        //print(data)
		this.Probabilities = this.Probabilities.concat(data.Probabilities)
		this.Pools = this.Pools.concat(data.Pools)
		this.Static.Add(data.Static)
	}
	Ready(){return (this.Probabilities.length > 0) ? 0 : 1}
	StartEmpty(list){for (var i = 0;i < list.length;i++){this.Static[list[i]] = []}}
	/*RunPools() {
		
	}*/
}

/* Pool, will mix all the things :3
input in constructor, is an Array elemement, every element a dictionary with
type: element/stat/custome
funcs: dictionary with functions for elemenet/stat, function for custome

Other function:
append: Add data to the Pool
Solve: Returns all the data solved

*/
export class Pool {
	constructor(config) {
		this.Sections = []
		this.config = config
		this._Ready = 0
	}
	append(data){
		this._Ready = 0
		this.Sections.push(data)
	}
	FCustome(func) {
        //console.log("in")
        //print(this.Pool)
		var work = new Probability()
		for (var i = 0;i < this.Pool.cases.length;i++){
			var tmp = new WorkingProbs()
			tmp.Add(func(this.Pool.cases[i]["data"].Static))
			work.AddCase({"Probability": this.Pool.cases[i]["Probability"], "data": tmp})
		}
		this.Pool = work
		this.Pool = this.SolveProbs(this.Pool)
        //console.log("out")
        //print(this.Pool)
	}
    Ready(){
        if (!(this._Ready) || this.PostSections == undefined){return 0;}
        for (var i = 0;i < this.PostSections.Pools.length;i++){
            if (!(this.PostSections.Pools[i].Ready())){return 0;}
        }
        return 1;
    }
    PreSolution(){
        if (!(this.Ready())){this.Solve();}
        return this.Pool;
    }
    Unpack(){
        this.Pool = new WorkingProbs()
        this.Pool.Add(this.PostSections.Static)
        this.Pool.Add(this.PostSections.Probabilities)
        for (var i = 0; i < this.PostSections.Pools.length;i++){
            this.Pool.Add(this.PostSections.Pools[i].PreSolution())
        }
        while (this.Pool.Pools.length != 0){
            this.Pool.Add(this.Pool.Pools[0].Presolution())
            this.Pool.Pools.splice(0, 1)
        }
    }
	Solve() {
        if (this.Ready()){return this.Solution;}
        this.PostSections = Sort(new WorkingProbs(), this.Sections)
        this.Unpack()
		this.Pool = new Probability([{"Probability": 1, "data": this.Pool}])
        //print("pool1")
		//print(this.Pool)
		this.Pool = this.SolveProbs(this.Pool)
		//print(this.Pool)
		for (var i = 0;i < this.config.length;i++) {this.FCustome(this.config[i])}
		//print(this.Pool)
        this.Solution = new Probability()
		for (var i = 0;i < this.Pool.cases.length;i++){
			var tmp = []
			for (var j = 0; j < this.Pool.cases[i]["data"].Static.values.length; j++){
				if (this.Pool.cases[i]["data"].Static.values[j].length > 1) {console.log("Error, the stat " + i + " was not treated correctly")}
				tmp.push(new Stat(this.Pool.cases[i]["data"].Static.properties[j], this.Pool.cases[i]["data"].Static.values[j].values[0]))
			}
			this.Solution.AddCase({"Probability": this.Pool.cases[i]["Probability"], "data": tmp})
		}
		this._Ready = 1
        return this.Solution;
	}
	SolveProbs(Pool) {
		///Rewrite
		var found = 1
		while(found){
			found = 0
			for (var main_case = 0;main_case < Pool.cases.length;main_case++){
				if (Pool.cases[main_case]["data"].Probabilities.length == 0){continue;}
				found = 1
				var base_case = Pool.cases[main_case]
				Pool.cases.splice(main_case, 1)
				var apply_prob = base_case["data"].Probabilities[0]
				base_case["data"].Probabilities.splice(0, 1)
                //print("Base")
                //print(base_case)
                //print(apply_prob)
				for (var i = 0;i < apply_prob.cases.length;i++){
					var tcase = new WorkingProbs()
					tcase.Add(base_case["data"])
					tcase.Add(apply_prob.cases[i]["data"])
                    //print("Mix")
                    //print(base_case)
                    //print(apply_prob.cases[i])
					Pool.AddCase({"Probability": base_case["Probability"]*apply_prob.cases[i]["Probability"], data: tcase})
				}
			}
		}
		
		return Pool
	}
	Clean(data) {
		data = Clone(data)
			for (var i = 0;i < data.length;i++) {
				if (data[i].length == 0) {delete data[i]}
		}
		return data
	}
}

export class Probability {
	constructor(cases = []) {
		this.cases = []
		this.AddCases(cases)
	}
	AddCase(data){
        if (!(Check_DictKeys(["Probability", "data"], data))) {console.log("Error in data");}
		this.cases.push(data)
	}
	AddCases(cases){
		for (var i = 0;i < cases.length;i++) {
			this.AddCase(cases[i])
		}
	}
}

function Check_DictKeys(keys, dict){
    if (dict.constructor.name != "Object"){return 0;}
    for (var i = 0;i < keys.length;i++){
        if (!(keys[i] in dict)){return 0;}
    }
    return 1
}

//One Stat
export class Stat {
	constructor(properties, ivalue) {
		this.properties = properties
		this.value = ivalue
	}
}

//Collector of stat
export class CStat {
	constructor(properties, ivalues = []) {
		this.properties = properties
		this.values = ivalues
	}
    Add(values){
        this.values.push(values)
    }
	CAdd(data){
		this.values = this.values.concat(data)
	}
}

class CStats {
	constructor() {
		this.properties = []
		this.values = []
	}
    Add(data){
		switch (data.constructor.name) {
			case "CStat":
		        this.Check(data.properties)
		        var id = this.properties.indexOf(data.properties)
				this.values[id].CAdd(data.values)
				break;
			case "Stat":
		        this.Check(data.properties)
		        var id = this.properties.indexOf(data.properties)
				this.values[id].Add(data.value)
				break;
			case "CStats":
				for (var i = 0;i < data.values.length;i++){
					this.Add(data.values[i])
				}
				break;
			default:
				console.log("Error, don't exist type")
		}
    }
	Check(properties){
		if (!(this.properties.includes(properties))){
			this.properties.push(properties)
			this.values.push(new CStat(properties))
		}
	}
}
