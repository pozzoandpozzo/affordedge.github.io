class Bundle{

    constructor(deviceName, devicePrice){
        this.deviceName = deviceName;
        this.devicePrice = devicePrice;

        this.tradeIn = 0;
        this.tradeInLeft = 0;
        this.tradeInProportion = 0;
        this.deposit = 0;
           
        this.hard = {}
        this.soft = {}
        this.softCopy = {}
        this.service = {}
        this.outright = {}
        this.hard[this.deviceName] = this.devicePrice;
        
    }

    addAddOn(type, name, price){
        if(name in this.soft){
            this.soft[type + " " + name] += price
            this.softCopy[type+ " " +name] += price
        }else{
            this.soft[type+ " " + name] = price
            this.softCopy[type+ " " + name] = price
        }
    }

    addTradeIn(value){
        this.tradeIn += parseFloat(value);
        this.tradeInLeft += parseFloat(value)*(1-this.tradeInProportion);
    }


    setDeposit(value){
        this.deposit = value;
    }

    removeSoftCost(name){
        delete this.soft[name];
        delete this.softCopy[name];
        delete this.outright[name];
        delete this.service[name];
        for (const [key, value] of Object.entries(this.softCopy)) {
            this.soft[key] = this.softCopy[key]
        }
    }
    moveSoftCostToService(name){
        this.service[name] = this.softCopy[name];
        delete this.soft[name];
    }

    moveSoftCostToOutright(name){
        this.outright[name] = this.softCopy[name];
        delete this.soft[name];
    }

    moveServiceCostToSoft(name){
        this.soft[name] = this.service[name];
        delete this.service[name];
    }

    moveOutrightCostToSoft(name){
        this.soft[name] = this.outright[name];
        delete this.outright[name];
    }


    hardCost(){
        let sumHard = 0;
        for(var addon in this.hard ) {
            if(this.hard.hasOwnProperty(addon)) {
                sumHard += parseFloat(this.hard[addon]);
            }
        }
        return sumHard;
    }

    softCost(){
        let sum = 0;

        for(var addon in this.soft ) {
            if(this.soft.hasOwnProperty(addon)) {
                sum += parseFloat(this.soft[addon]);
            }
        }
        return sum;
    }

    serviceCost(){
        let sum = 0;
        for(var addon in this.service) {
            if(this.service.hasOwnProperty(addon)) {
                sum += parseFloat(this.service[addon]);
            }
        }
        return sum;
    }

    outrightCost(){
        let sum = 0;
        for(var addon in this.outright) {
            sum += parseFloat(this.outright[addon]);
        }
        return sum;
    }

    softCostPercentage(){
        return ((this.softCost()*100)/this.totalCost()).toFixed(1);
    }
    totalCost(){
        return this.hardCost() + this.softCost()
    }


    resetSoftCost(){
        for (const [key, value] of Object.entries(this.softCopy)) {
            this.soft[key] = this.softCopy[key]
        }
    }
    fixSoftCost(){

        if(this.softCostPercentage() > 0.1){
            let values = []
            let reversed = {}
            for (const [key, value] of Object.entries(this.soft)) {
                if(value > 0){
                    values.push(value);
                    reversed[value] = key;
                    if(key.substring(0,9) == "Accessory"){
                        this.moveSoftCostToOutright(key)
                    }else{
                        this.moveSoftCostToService(key)
                    }
                }
            }

            //turn all values to service
            let array = this.generateSubsets(values)
            let closest = 0;
            let closestLength = 0;
            let bestSubset = 0
            for(let i = 0; i < array.length; i++){
                let sum = 0
                for(let j=0; j < array[i].length; j++){
                    sum += array[i][j]
                }
                if(sum > this.tradeInLeft){
                    sum -= this.tradeInLeft
                }else{
                    sum = 0
                }
                if((sum)/(this.hardCost()+sum) <= 0.1){
                    if((sum)/(this.hardCost()+sum) > closest){
                        closest = (sum)/(this.hardCost()+sum)
                        closestLength = array[i].length 
                        bestSubset = i
                    }else if((sum)/(this.hardCost()+sum) == closest){
                        if(array[i].length > closestLength){
                            closestLength = array[i].length 
                            bestSubset = i
                        }
                    }
                       
                }
            }

            // turn selecet values back to soft
            let tradeInRemaining = this.tradeInLeft;
            for(let i=0; i<array[bestSubset].length; i++){
                if(reversed[array[bestSubset][i]].substring(0,9) == "Accessory"){
                    this.moveOutrightCostToSoft(reversed[array[bestSubset][i]])
                    if(this.soft[reversed[array[bestSubset][i]]] < tradeInRemaining){
                        tradeInRemaining -= this.soft[reversed[array[bestSubset][i]]]
                        this.soft[reversed[array[bestSubset][i]]] = 0
                    }else{
                        this.soft[reversed[array[bestSubset][i]]] -= tradeInRemaining
                        tradeInRemaining = 0
                    }
                }else{
                    this.moveServiceCostToSoft(reversed[array[bestSubset][i]])
                    if(this.soft[reversed[array[bestSubset][i]]] < tradeInRemaining){
                        tradeInRemaining -= this.soft[reversed[array[bestSubset][i]]]
                        this.soft[reversed[array[bestSubset][i]]] = 0
                    }else{
                        this.soft[reversed[array[bestSubset][i]]] -= tradeInRemaining
                        tradeInRemaining = 0
                    }
                }
            }
            this.hard[this.deviceName] -= tradeInRemaining;
        }
    }
    generateSubsets(array){
       array.sort()
       return this.recurSubsets([], array)
   }


    recurSubsets(current, subset){
        if(subset.length > 0){
           return this.recurSubsets(current, subset.slice(1)).concat(this.recurSubsets(current.concat([subset[0]]), subset.slice(1)))
         }
        return [current]
    }


    leaseTypeButtons(numBundles, schoolType){
        if(schoolType == "private"){
            return `<form class="mb-3" id="leaseTypeForm`+numBundles.toString()+`" style="float: left;">
                <input type="radio" class="btn-check" name="leaseTypes" id="financeOption` + numBundles.toString() + `" autocomplete="off" value="finance">
                <label class="btn btn-outline-primary" for="financeOption` + numBundles.toString() + `">Finance</label>
                <input type="radio" class="btn-check" name="leaseTypes" id="operatingOption` + numBundles.toString() + `" autocomplete="off" value="operating"checked>
                <label class="btn btn-outline-primary" for="operatingOption` + numBundles.toString() + `">Operating</label></form>`
        }
        return ""
    }

    generateBundleControls(numBundles, lease){
        let div = document.createElement("div");
       div.innerHTML = `<div id="tradeInSlider"  style="display: none" class="input-group mb-3 flex-nowrap">
        <label for="vendorProportionSlider`+ numBundles.toString() +`" class="form-label">Net vendor Incentive Proportion</label>
        <input id="vendorProportionSlider`+ numBundles.toString() +`" type="range" class="form-range" min="0" max="1" value="0" step="0.05">
        </div>
        <div id="recalculatedTable`+numBundles.toString()+`"></div>
        <div id="operatingControls`+numBundles.toString() +`">
            <h6>Indicative FMV: £` + (this.devicePrice*(lease.indicativeValue/100)).toFixed(2) + `</h6>
            <h6>Soft Cost Percentage: <span id="softCost`+numBundles.toString()+`">`+ this.softCostPercentage().toString()+ `%</span></h6>
            <p id="disclaimer`+numBundles.toString()+`" style="display: none">For an operating lease the percentage of soft cost assets must be under 10%. The button below will transfer your excess soft costs into a separate bundle, resolving this issue.</p>
        <input style="display: none" id="fixSoftCost`+numBundles.toString()+`"  type="submit" class="btn btn-success mb-3" value="Recalculate"></input></div>`

        div.innerHTML += "<form id=bundleForm" + numBundles.toString() + ` class="input-group">
        <select name="bundleAddon" class="form-select" required>
            <option value="" disabled selected hidden>Add to bundle</option>
            <option value="Accessory">Accessory</option>
            <option value="Warranty">Warranty</option>
            <option value="Accidental Damage Maintenance">Accidental Damage Maintenance</option>
            <option value="School Management Fee">School Management Fee</option>
            <option value="Net Vendor Incentive (Ex VAT)">Net Vendor Incentive (Ex VAT)</option>
            <option value="Net Vendor Incentive (Inc VAT)">Net Vendor Incentive (Inc VAT)</option>
            <option value="Insurance">Insurance</option>
            <option value="Other">Other</option>
        </select>
        <div class="form-floating">
            <input type="text" id="nameField" class="form-control" name="addonName" placeholder="Name..">
            <label for="nameField">Name</label>
        </div>
        <div class="form-floating">
            <input type="number" class="form-control" name="Price" id="priceField" placeholder="Price.." step="0.01">
            <label for="priceField">Price</label>
        </div>
            <input type="submit" class="btn btn-primary" value="Add to Bundle">
        </form>`

        return div;
    }

    generateTable(bundleNumber){
        let table =  `<table class="table" id="table`+ bundleNumber.toString() + `">
        <thead>
            <tr>
                <th>
                    Name
                </th>
                <th>
                    Price
                </th>
                <th>
                    Payment Plan
                </th>
                <th>
                </th>
            </tr>
        </thead>
        <tbody>
        <tr><td>`+ this.deviceName+`</td>
        <td>£`+this.devicePrice.toFixed(2) +`</td>
        <td>Lease</td>
        <td></td>
        </tr>`
        for (const [key, value] of Object.entries(this.softCopy)) {
            table += `<tr id="row`+ key+bundleNumber.toString() +`">
                <td>`+ key+
                `</td>
                <td>£`+value.toFixed(2) +
                `</td>
                <td>Lease
                </td>
                <td>
                <input type="button" id="`+key+bundleNumber.toString() +`" class="btn-close">
                </td>
            </tr>`
        }
        if(this.tradeInProportion < 1 && this.tradeIn > 0){
            table += `<tr id="rowLeaseTradeIn`+bundleNumber.toString() +`">
            <td>Net Vendor Incentive</td>
            <td style="color: green">-£`+(this.tradeIn * (1-this.tradeInProportion)).toFixed(2) +
            `</td>
            <td>Lease
            </td>
            <td>
            <input type="button" id="leaseTradeIn`+bundleNumber.toString() +`" class="btn-close">
            </td>
            </tr>`
        }
        if(this.tradeInProportion > 0 && this.tradeIn > 0){
            table += `<tr id="rowOutrightTradeIn`+bundleNumber.toString() +`">
            <td>Net Vendor Incentive</td>
            <td style="color: green">-£`+(this.tradeIn * (this.tradeInProportion)).toFixed(2) +
            `</td>
            <td>Outright
            </td>
            <td>
            <input type="button" id="outrightTradeIn`+bundleNumber.toString() +`" class="btn-close">
            </td>
            </tr>`
        }

        table += "</tbody></table>"
        return table;
    }

    generateRecalculatedTable(){
        let table =  `<table class="table">
        <thead>
            <tr>
                <th>
                    Name
                </th>
                <th>
                    Original Cost
                </th>
                <th>
                    Trade In Applied
                </th>
                <th>
                    Final Price
                </th>
                 <th>
                    Payment Plan
                </th>
            </tr>
        </thead>
        <tbody>`
        table += `<tr><td>`+ this.deviceName+`</td>
        <td>£`+this.devicePrice.toFixed(2) +`</td>
        <td style="color: green">-£`+(this.devicePrice-this.hard[this.deviceName]).toFixed(2) +`</td>
        <td>£`+this.hard[this.deviceName].toFixed(2) +`</td>
        <td>Lease</td'>
        </tr>`
        for (const [key, value] of Object.entries(this.soft)) {
            table += `<tr>
                <td>`+ key+
                `</td>
                <td>£`+this.softCopy[key].toFixed(2) +`</td>
                <td style="color: green">-£`+(this.softCopy[key]-value).toFixed(2) +`</td>
                <td>£`+value.toFixed(2) +`</td>
                <td>Lease
                </td>
            </tr>`
        }

        for (const [key, value] of Object.entries(this.service)) {
            table += `<tr>
                <td>`+ key+
                `</td>
                <td>£`+value.toFixed(2) +`</td>
                <td style="color: green">-£0.00</td>
                <td>£`+value.toFixed(2) +`</td>
                <td>Service
                </td>
            </tr>`
        }
        for (const [key, value] of Object.entries(this.outright)) {
            table += `<tr>
                <td>`+ key+
                `</td>
                <td>£`+value.toFixed(2) +`</td>
                <td style="color: green">-£0.00</td>
                <td>£`+value.toFixed(2) +`</td>
                <td>Outright
                </td>
            </tr>`
        }
        if(this.tradeInProportion > 0 && this.tradeIn > 0){
            table += `<tr>
            <td>Net Vendor Incentive</td>
            <td style="color: green">-£`+(this.tradeIn * (this.tradeInProportion)).toFixed(2) +
            `</td>
            <td>-
            </td>
            <td>-
            </td>
            <td>Outright
            </td>
            </tr>`
        }

        table += "</tbody></table>"
        return table;
    }
}
