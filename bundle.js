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

    addAddOn(name, price){
        if(name in this.soft){
            this.soft[name] += price
            this.softCopy[name] += price
        }else{
            this.soft[name] = price
            this.softCopy[name] = price
        }
    }

    addTradeIn(value){
        this.tradeIn += parseFloat(value);
        this.tradeInLeft += parseFloat(value)*(1-this.tradeInProportion);
    }


    setDeposit(value){
        this.deposit = value;
    }

    updateTradeIn(){
        this.tradeInLeft = this.tradeIn*(1-this.tradeInProportion)
        this.hard[this.deviceName] = this.devicePrice;
        for(var addon in this.soft) {
            if(this.tradeInLeft > this.softCopy[addon]){
                this.tradeInLeft -= this.softCopy[addon]
                this.soft[addon] = 0;
            }else{
                this.soft[addon] = this.softCopy[addon]
            }
        }   
        let a = this.minSoftCost()
        if(a != false){
            this.soft[this.minSoftCost()[0]] -= this.tradeInLeft;
        }else{
            this.hard[this.deviceName] -= this.tradeInLeft;
        }
        this.tradeInLeft = 0;
    }

    minSoftCost(){
        let min = Infinity;
        let minKey = "";
        for (const [key, value] of Object.entries(this.soft)) {
            if(key != "Accessory"){
                if(value < min && value > 0){
                    min = value;
                    minKey = key
                }
            }
        }
        if(minKey != ""){
         return [minKey, min];
        }else{
            return false;
        }
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
        this.updateTradeIn()
    }

    moveSoftCostToOutright(name){
        this.outright[name] = this.soft[name];
        delete this.soft[name];
        this.updateTradeIn()
    }

    moveServiceCostToSoft(name){
        this.soft[name] = this.service[name];
        delete this.service[name];
        this.updateTradeIn()
    }

    moveOutrightCostToSoft(name){
        this.soft[name] = this.outright[name];
        delete this.outright[name];
        this.updateTradeIn()
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
        return this.hardCost() + this.softCost() - this.tradeInLeft
    }

    fixSoftCost(){

        if(this.softCostPercentage() > 0.1){
            let values = []
            let reversed = {}
            for (const [key, value] of Object.entries(this.softCopy)) {
                values.push(value);
                reversed[value] = key;
                if(key == "Accessory"){
                    this.moveSoftCostToOutright(key)
                }else{
                    this.moveSoftCostToService(key)
                }
            }


            //turn all values to service
            let array = this.generateSubsets(values)
            let closest = 0;
            let bestSubset = 0
            for(let i = 0; i < array.length; i++){
                let sum = 0
                for(let j=0; j < array[i].length; j++){
                    sum += array[i][j]
                }
                if((sum)/(this.hardCost()+sum) > closest && (sum)/(this.hardCost()+sum) <= 0.1){
                    closest = (sum)/(this.hardCost()+sum) 
                    bestSubset = i
                }
            }
            // turn selecet values back to soft
            for(let i=0; i<array[bestSubset].length; i++){
                if(reversed[array[bestSubset][i]] == "Accessory"){
                    this.moveOutrightCostToSoft(reversed[array[bestSubset][i]])
                }else{
                    this.moveServiceCostToSoft(reversed[array[bestSubset][i]])
                }
            }
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


    generateBundleControls(){
        let div = document.createElement("div");
       div.innerHTML = `<div id="tradeInSlider"  style="display: none" class="input-group mb-3 flex-nowrap">
        <label for="vendorProportionSlider`+ numBundles.toString() +`" class="form-label">Net vendor Incentive Proportion</label>
        <input id="vendorProportionSlider`+ numBundles.toString() +`" type="range" class="form-range" min="0" max="1" value="0" step="0.05">
        </div>
        <div id="recalculatedTable"></div>
        <h6>Indicative FMV: £` + (this.devicePrice*0.185).toFixed(2) + `</h6>
        <h6>Soft Cost Percentage: <span id="softCost`+numBundles.toString()+`">`+ this.softCostPercentage().toString()+ `%</span></h6>
        <p id="disclaimer" style="display: none">For an operating lease the percentage of soft cost assets must be under 10%. The button below will transfer your excess soft costs into a separate bundle, resolving this issue.</p>
        <input style="display: none" id="fixSoftCost"  type="submit" class="btn btn-success mb-3" value="Recalculate"></input>`
        div.innerHTML += "<form id=bundleForm" + numBundles.toString() + ` class="input-group">
        <select name="bundleAddon" class="form-select">
            <option disabled selected hidden>Add to bundle</option>
            <option value="Accessory">Accessory</option>
            <option value="Warranty">Warranty</option>
            <option value="Accidental Damage Maintenance">Accidental Damage Maintenance</option>
            <option value="School Management Fee">School Management Fee</option>
            <option value="Net Vendor Incentive (Ex VAT)">Net Vendor Incentive (Ex VAT)</option>
            <option value="Net Vendor Incentive (Inc VAT)">Net Vendor Incentive (Inc VAT)</option>
            <option value="Insurance">Insurance</option>
            <option value="Other">Other</option>
        </select>
            <input type="number" class="form-control" name="Price" placeholder="Price.." step="0.01">
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
            table += `<tr>
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
            table += `<tr>
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
            table += `<tr>
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

    generateRecalculatedTable(bundleNumber){
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
        <td>Lease</td>
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
