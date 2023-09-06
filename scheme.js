"use strict;"

class Scheme {
    
    constructor(bundle, numberOfUnits, length=0, frequency=0, pool=0, reserve=0, serviceManagement=0, setup=0, schoolManagement=0, deposit=0, numberOfCollections=0){
        // case where scheme is manually defined
        this.bundle = bundle;
        this.numberOfUnits = numberOfUnits || 1;
        this.length = length;
        this.frequency = frequency;
        this.pool = pool;
        this.reserve = reserve;
        this.serviceManagement = serviceManagement;
        this.setup = setup;
        this.numberOfCollections = numberOfCollections;
        this.deposit = deposit;
        this.priceCardsGenerated = false;
        this.serviceFees = 0;
        this.tradeIn = 0;
        this.ownership = false;
        this.lease = null;
    }


    updateSchemeWithFormData(schoolType){
        this.schoolType = schoolType;
    }
    updateSchemeWithFormOneData(formData, advanceArrears, leaseType){
        this.length = parseFloat(formData.get("leaseLength"));
        this.frequency = parseFloat(formData.get("frequency"))
        this.pool = parseFloat(formData.get("pool")) || 0;
        this.advanceArrears = advanceArrears;
        this.leaseType = leaseType;
    }

    updateSchemeWithFormTwoData(formData){
        this.reserve = parseFloat(formData.get("reserve")) || 0;
        this.serviceManagement = parseFloat(formData.get("serviceCost")) || 0;
        this.setup = parseFloat(formData.get("setup")) || 0;
        this.schoolManagement = parseFloat(formData.get("schoolManagementCost")) || 0;
        this.deposit = parseFloat(formData.get("deposit")) || 0; 
        this.numberOfCollections = parseFloat(formData.get("collections")) || 1;
        this.deposit = parseFloat(formData.get("deposit")) || 0
        if(formData.get("ownership") == "yes"){
            this.ownership = true;
        }
    }

    calculateFMV(){
        return (this.lease.indicativeValue*this.bundle.hardCost())/100;
    }

    calculateDeposit(){
        if(this.ownership){
            return this.deposit-this.calculateFMV()
        }
        return this.deposit;
    }


    bundleCost(){
        return this.bundle.totalCost() + this.bundle.serviceCost() + this.bundle.outrightCost();
    }

    calculatePool(){
        return (this.bundleCost() * this.pool)/100;
    }
    
    calculateReserve(){
        return (this.bundleCost()*this.reserve)/100;
    }

    outrightPrice(){
        return this.bundleCost() + this.calculatePool() + this.calculateReserve() + this.serviceManagement + this.setup;
    }

    silverwingFee(){
        return (((0.01*this.outrightPrice())+0.5)/0.99) + 0.8;
    }

    finalPrice(){
        return this.outrightPrice() + this.silverwingFee();
    }

    paymentTiming(){
        let timings = {1:"Monthly", 3:"Quarterly", 4:"Termly", 12:"Annual"};
        return timings[this.frequency];
    }


    leaseRate(){
        return this.lease.leaseRates[this.paymentTiming()][this.leaseType][this.schoolType][this.advanceArrears][this.length-2]/1000
    }

    serviceRate(){
        if(this.schoolType == "state" && this.length == 2){
            return this.lease.leaseRates["Monthly"]["finance"]["private"][advanceArrears][this.length-2]/1000
        }else{
            return this.lease.leaseRates[this.paymentTiming()]["finance"][schoolType][advanceArrears][this.length-2]/1000
        }
    }
    
    leaseCost(){
        return (this.leaseRate() * this.bundle.totalCost())
    }

    serviceCost(){
        return (this.serviceRate() * this.bundle.serviceCost())
    }

    calculateLeasePool(){
        if(this.serviceTiming() == this.paymentTiming()){
            return ((this.leaseCost()+this.serviceCost()) * this.pool)/100
        }
        return (this.leaseCost() * this.pool)/100 + (this.serviceCost()*this.frequency*this.pool)/100
    }

    calculateLeaseReserve(){
        return ((this.leaseCost()+this.serviceCost()) * this.reserve)/100 
    }

    totalCost(){
        if(this.serviceTiming() == this.paymentTiming()){
            return this.leaseCost() + this.serviceCost() + this.calculateLeasePool() + this.calculateLeaseReserve() + this.serviceManagement - (this.calculateDeposit()/((12/this.frequency)*this.length))
        }else{
            return this.leaseCost() + this.calculateLeasePool() + this.calculateLeaseReserve() + this.serviceManagement - (this.calculateDeposit()/((12/this.frequency)*this.length))
        }
    }
    leaseSilverwingFee(){
        return (((0.01*(this.totalCost()))+0.5)/0.99);
    }
    
    finalLeasePrice(){
        if(this.serviceTiming() == this.paymentTiming()){
            return this.totalCost() + this.leaseSilverwingFee()
        }else{
            return this.totalCost() + this.leaseSilverwingFee() + this.serviceCost()*this.frequency
        }
    }

    serviceTiming(){
        if(this.schoolType == "state" && this.length == 2){
            return "Monthly"
        }else{
            return this.paymentTiming()
        }   
    }

    collectionMultiplier(){
        return ((12/this.frequency)*this.length)/this.numberOfCollections
    }

    generateForm(s, numBundles){
        const container = document.createElement("div")
        const cardOne = document.createElement("div");
        const cardTwo = document.createElement("div");
        const cardTitleOne = document.createElement("h5");
        const cardBodyOne = document.createElement("form")
        const cardTitleTwo = document.createElement("h5");
        const cardBodyTwo = document.createElement("form")


        cardTitleOne.style.textAlign = "center"
        cardTitleTwo.style.textAlign = "center"


        cardOne.classList.add("card");
        cardOne.classList.add("pt-3")
        cardOne.appendChild(cardTitleOne);
        cardOne.appendChild(cardBodyOne);


        cardTitleOne.classList.add("card-title");
        cardTitleOne.innerHTML = "Lease Options"
        cardBodyOne.classList.add("card-text")
        cardBodyOne.classList.add("card-text");
        cardBodyOne.id = "formTwo" + s.toString()
        cardBodyOne.style.margin = "15px"
        cardBodyOne.action=""



        //HTML for form
        cardBodyOne.innerHTML = "<h6>Lease Type:</h6>"
        if(this.schoolType == "private"){
            cardBodyOne.innerHTML += `
            <div class="mb-3" id="leaseTypeForm">
                <input type="radio" class="btn-check" name="leaseTypes" id="option` + ((numBundles+1)*3).toString() + `" autocomplete="off" value="finance">
                <label class="btn btn-outline-primary" for="option` + ((numBundles+1)*3).toString() + `">Finance</label>
                <input type="radio" class="btn-check" name="leaseTypes" id="option` + ((numBundles+1)*4).toString() + `" autocomplete="off" value="operating"checked>
                <label class="btn btn-outline-primary" for="option` + ((numBundles+1)*4).toString() + `">Operating</label></div>`
        }
        cardBodyOne.innerHTML += 
        `<div class="mb-3" id="AdvanceArrearsForm">
            <input type="radio" class="btn-check" name="advanceArrears" id="option` + ((numBundles+1)*5).toString() + `" autocomplete="off" value="Advance" checked>
            <label class="btn btn-outline-primary" for="option` + ((numBundles+1)*5).toString() + `">Advance</label>
            <input type="radio" class="btn-check" name="advanceArrears" id="option` + ((numBundles+1)*6).toString() + `" autocomplete="off" value="Arrears">
            <label class="btn btn-outline-primary" for="option` + ((numBundles+1)*6).toString() + `">Arrears</label></div>`
        if(this.schoolType == "state"){
            cardBodyOne.innerHTML +=  `<select name="leaseLength" class="form-select mb-3">
                <option disabled selected hidden>Lease length</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
            </select>
            <select name="frequency" class="form-select mb-3">
                <option disabled selected hidden>Payment Frequency</option>
                <option value="1">Monthly</option>
                <option value="3">Quarterly</option>
                <option value="12">Annually</option>
            </select>`
        }else{
            cardBodyOne.innerHTML +=  `<select name="leaseLength" class="form-select mb-3">
                <option disabled selected hidden>Lease length</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
            </select>`
            
            cardBodyOne.innerHTML += `<select name="frequency" class="form-select mb-3">
                <option disabled selected hidden>Payment Frequency</option>
                <option value="1">Monthly</option>
                <option value="4">Termly</option>
            </select>`
        }
            cardBodyOne.innerHTML += `<div class="input-group mb-3 flex-nowrap"">
                <input name="pool" type="number" class="form-control" placeholder="Pool" step="0.01">
                <span class="input-group-text">%</span>
            </div>
            <div class="actions text-center">
                <input type="submit" class="btn btn-primary" value="Submit">
            </div>`

        container.appendChild(cardOne)
        container.innerHTML += "<br>"

        cardBodyTwo.id = "formThree" + s.toString()

        cardTwo.classList.add("card");
        cardTwo.classList.add("pt-3")
        cardTwo.appendChild(cardTitleTwo);
        cardTwo.appendChild(cardBodyTwo);
        cardTwo.style.display = "None"
            
        cardTitleTwo.classList.add("card-title");
        cardTitleTwo.innerHTML = "1:1 Contribution Options"
        cardBodyTwo.classList.add("card-text")
        cardBodyTwo.style.margin = "15px";
        cardBodyTwo.action=""

        let html = `<div class="input-group mb-3 flex-nowrap   ">
        <input name="reserve" type="number" class="form-control" placeholder="reserve fund" step="0.01">
        <span class="input-group-text">%</span>
        </div>
        <div class="input-group mb-3">
            <span class="input-group-text">£</span>
            <input name="serviceCost" type="number" class="form-control" placeholder="Managed Service Cost.." step="0.01">
        </div>
        <div class="input-group mb-3 flex-nowrap">
            <span class="input-group-text">£</span>
            <input name="setup" type="number" class="form-control" placeholder="Set up fee.." step="0.01">
        </div>
        <div class="input-group mb-3 flex-nowrap">
            <input name="collections" type="number" class="form-control" placeholder="Number of Collections.." step="1">
        </div>
        <div class="input-group mb-3 flex-nowrap">
            <span class="input-group-text">£</span>
            <input name="deposit" type="number" class="form-control" placeholder="Deposit.." step="0.01">
        </div>`
        if(this.leaseType != "finance"){
            html += `<div class="form-check">
                <input class="form-check-input" type="checkbox" value="yes" id="flexCheckDefault`+numBundles.toString()+`" name="ownership">
                <label class="form-check-label" for="flexCheckDefault">Parent ownership at end of lease?</label>
            </div>
            <div class="actions text-center">
                <input type="submit" class="btn btn-primary" value="Submit">
            </div>`
        }
        cardBodyTwo.innerHTML = html
        container.appendChild(cardTwo)

        return container;
    }


    copyFormDataAcross(formData, newForm){
        if(formData != null){
            for(let i = 0; i < newForm.elements.length-1; i++){
                newForm.elements[i].value = formData.get(newForm.elements[i].name)
            }
        }
    }
    generatePriceCards(numBundles){
        this.priceCardsGenerated = true;
        const container = document.createElement("div")
        let rows = [document.createElement("div"), document.createElement("div"), document.createElement("div"), document.createElement("div")];
        rows[0].classList.add("row");
        rows[0].classList.add("gx-3");
        rows[1].classList.add("row");
        rows[1].classList.add("gx-3");
        rows[2].classList.add("row");
        rows[2].classList.add("gx-3");
        rows[3].classList.add("row");
        rows[3].classList.add("gx-3");


        container.appendChild(rows[3])
        container.appendChild(rows[1])
        container.appendChild(rows[0])
        container.appendChild(rows[2])
        // calculate all numbers 
        
        this.lease = new Lease(this.length)
        
        let leaseString = ""
        if(leaseType == "operating"){
            leaseString = "Operating Lease";
        }else{
            leaseString = "Finance Lease"
        }


        if(this.ownership){
            // Ownership Card
            const ownershipCol = document.createElement("div");
            rows[3].appendChild(ownershipCol);
            const ownershipCard = document.createElement("div");
            let cardTitle = document.createElement("h6");
            let cardBody = document.createElement("p");

            cardTitle.classList.add("card-title")
            cardBody.classList.add("card-text")
            cardBody.style.margin = "15px";

            ownershipCol.classList.add("col")
            ownershipCol.appendChild(ownershipCard)

            ownershipCard.classList.add("card");
            ownershipCard.classList.add("text-center")
            ownershipCard.classList.add("pt-3")
            ownershipCard.appendChild(cardTitle);
            ownershipCard.appendChild(cardBody);
                
            cardTitle.innerHTML = "Ownership Overview";

            let html = `<table class="table">
            <thead>
            <tr>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>
                   Indicative FMV  
                </td>
                <td>£`+ this.calculateFMV().toFixed(2) +
                `</td
            </tr>
            <tr>
            <td>
               Deposit
            </td>
            <td>£`+ this.deposit.toFixed(2) +
            `</td
            </tr>
            `
        
            if(this.calculateDeposit() < 0){
                html += `<tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>
                   Remainder left to pay before ownership
                </b></td>
                <td style="color: red; border-bottom: 2px solid black;border-top: 2px solid black;">£`+ (this.calculateDeposit()*-1).toFixed(2) +
                `</td
                </tr> </tbody>
                </table>`
            }else{
                html += `<tr><td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>
                Leftover deposit after ownership
                </b></td>
                <td style="color: green; border-bottom: 2px solid black;border-top: 2px solid black;">£`+ (this.calculateDeposit()).toFixed(2) +
                `</td
                </tr> </tbody>
                </table>`
            }
            cardBody.innerHTML = html;
        }

        //outright summary
        const outrightCol = document.createElement("div");
        const outrightCard = document.createElement("div");
        outrightCard.classList.add("card")
        outrightCard.classList.add("mb-4")
        outrightCard.classList.add("box-shadow")

        outrightCol.classList.add("col")

        rows[1].appendChild(outrightCol)

        outrightCard.innerHTML = `<div class="card-header">
            <h4 class="my-0 font-weight-normal">Outright Payment</h4>
        </div>
        <div class="card-body">
            <h1 class="card-title pricing-card-title">£`+ this.finalPrice().toFixed(2) +` <small class="text-muted">parental cost</small></h1>
            <ul class="list-unstyled mt-3 mb-4">
            <li>One Off Payment</li>
            <li>Excluding VAT</li>
            <li style="color: green">Trade in saving per unit: £`+ (this.bundle.tradeIn * (1-this.bundle.tradeInProportion)).toFixed(2) +`</li>
            </ul>
            <button class="btn btn-lg btn-block btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#outrightOverview" data-parent=".multi-collapse" aria-expanded="false" aria-controls="collapseExample">
                See Breakdown
            </button>
        </div>`

        outrightCol.appendChild(outrightCard)

        //lease summary

        const leaseCol = document.createElement("div");
        const leaseCard = document.createElement("div");
        leaseCard.classList.add("card")
        leaseCard.classList.add("mb-4")
        leaseCard.classList.add("box-shadow")

        leaseCol.classList.add("col")
        rows[1].appendChild(leaseCol)

        leaseCard.innerHTML =  `<div class="card-header">
                <h4 class="my-0 font-weight-normal">Repeat Payment</h4>
            </div>
            <div class="card-body">
                <h1 class="card-title pricing-card-title">£`+ (this.finalLeasePrice()*this.collectionMultiplier()).toFixed(2) + ` <small class="text-muted">/ collection</small></h1>
                <ul class="list-unstyled mt-3 mb-4">
                <li>This is a `+ this.length.toString() + ` year ` + this.leaseType + ` lease</li>
                <li>Excluding VAT</li>
                <li style="color: green">Trade in saving per collection: £`+ (this.bundle.tradeIn * (1-this.bundle.tradeInProportion) * this.leaseRate() * this.collectionMultiplier()).toFixed(2) +`</li>
                </ul>
                <button class="btn btn-lg btn-block btn-outline-primary" type="button" data-bs-toggle="collapse" data-bs-target="#leaseOverview" data-parent=".multi-collapse" aria-expanded="false" aria-controls="collapseExample">
                    See Breakdown
                </button>
            </div>`

            leaseCol.appendChild(leaseCard)



        // OVERVIEW CARD
        const overviewCol = document.createElement("div");
        rows[0].appendChild(overviewCol);
        const overviewCard = document.createElement("div");
        let cardTitle = document.createElement("h6");
        let cardBody = document.createElement("p");

        cardTitle.classList.add("card-title")
        cardBody.classList.add("card-text")
        cardBody.style.margin = "15px";

        overviewCol.classList.add("collapse")
        overviewCol.appendChild(overviewCard)
        overviewCol.id = "outrightOverview"

        overviewCard.classList.add("card");
        overviewCard.classList.add("text-center")
        overviewCard.classList.add("pt-3")
        overviewCard.appendChild(cardTitle);
        overviewCard.appendChild(cardBody);
            
        cardTitle.innerHTML = "Overview";

        let table =  `<table class="table">
            <thead>
            <tr>
                <th>
                   <b>Charge</b>
                </th>
                <th>
                    Supplier
                </th>
                <th>
                   <b>Ex VAT</b>
                </th>
                <th>
                   <b>Inc VAT</b>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>` + this.bundle.deviceName +
            `</td>
            <td>
            Edge Computers
            </td>
            <td>£`+ this.bundle.hard[this.bundle.deviceName].toFixed(2) +
            `</td>
            <td>£`+ (this.bundle.hard[this.bundle.deviceName]*1.2).toFixed(2) +
            `</td>
         </tr>`
    
            for (const [key, value] of Object.entries(this.bundle.soft)) {
                if(value != 0){
                    table += `<tr>
                        <td>`+ key+
                        `</td>
                        <td>
                        Edge Computers
                        </td>
                        <td>£`+value.toFixed(2)+`</td>
                        <td>£`+(value*1.2).toFixed(2)+`</td>
                    </tr>`
                }
            }

            for (const [key, value] of Object.entries(this.bundle.service)) {
                table += `<tr>
                    <td>`+ key+
                    `</td>
                    <td>
                    Edge Computers
                    </td>
                    <td>£`+value.toFixed(2)+`</td>
                    <td>£`+(value*1.2).toFixed(2)+`</td>
                </tr>`
            }

            for (const [key, value] of Object.entries(this.bundle.outright)) {
                table += `<tr>
                    <td>`+ key+
                    `</td>
                    <td>
                    Edge Computers
                    </td>
                    <td>£`+value.toFixed(2)+`</td>
                    <td>£`+(value*1.2).toFixed(2)+`</td>
                </tr>`
            }
            if(this.calculatePool() != 0){
                table += `<tr>
                    <td>
                        Pool
                    </td>
                    <td>
                        Edge Computers
                    </td>
                    <td>£`+ this.calculatePool().toFixed(2) +
                    `</td>
                    <td>£`+ (this.calculatePool()*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }

            table +=
            `<tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Total Cost To School</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.bundleCost() + this.calculatePool()).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ ((this.bundleCost() + this.calculatePool())*1.2).toFixed(2) +
                `</b></td>
            </tr>`

            if(this.calculateReserve() != 0){
                table += `<tr>
                <td>
                    Reserve Fund
                </td>
                <td>
                    School
                </td>
                <td>£`+ (this.calculateReserve()).toFixed(2) +
                `</td>
                <td>£`+ (this.calculateReserve()*1.2).toFixed(2) +
                `</td>
            </tr>`
            }

            if(this.serviceManagement != 0){
                table += `<tr>
                <td>
                    Managed Service Cost
                </td>
                <td>
                    Edge Computers
                </td>
                <td>£`+ (this.serviceManagement).toFixed(2) +
                `</td>
                <td>£`+(this.serviceManagement*1.2).toFixed(2) +
                `</td>
            </tr>`
            }

            if(this.setup != 0){
                table += `<tr>
                <td>
                    Set Up Fee
                </td>
                <td>
                    Edge Computers
                </td>
                <td>£`+ (this.setup).toFixed(2) +
                `</td>
                <td>£`+(this.setup*1.2).toFixed(2) +
                `</td>
            </tr>`
            }
            table += `<tr>
                <td>
                    Silverwing Collection Charge
                </td>
                <td>
                    Silverwing
                </td>
                <td>£`+ (this.silverwingFee()).toFixed(2) +
                `</td>
                <td>£`+(this.silverwingFee()*1.2).toFixed(2) +
                `</td>
            </tr>
            <tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Total Cost To Parent</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.finalPrice()).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+(this.finalPrice()*1.2).toFixed(2) +
                `</b></td>
            </tr>
            </tbody>
            </table>`

        cardBody.innerHTML = table;

        //leaseOverview
        const leaseOverviewCol = document.createElement("div");
        rows[0].appendChild(leaseOverviewCol);
        const leaseOverviewCard = document.createElement("div");
        cardTitle = document.createElement("h6");
        cardBody = document.createElement("p");

        cardTitle.classList.add("card-title")
        cardBody.classList.add("card-text")
        cardBody.style.margin = "15px";

        leaseOverviewCol.classList.add("collapse")
        leaseOverviewCol.appendChild(leaseOverviewCard)
        leaseOverviewCol.id = "leaseOverview"


        leaseOverviewCard.classList.add("card");
        leaseOverviewCard.classList.add("text-center")
        leaseOverviewCard.classList.add("pt-3")
        leaseOverviewCard.appendChild(cardTitle);
        leaseOverviewCard.appendChild(cardBody);
            
        cardTitle.innerHTML = "Overview";

        table =  `<table class="table">
            <thead>
            <tr>
                <th>
                   <b>Charge</b>
                </th>
                <th>
                    Supplier
                </th>
                <th>
                    Charge Type
                </th>
                <th>
                   <b>Ex VAT</b>
                </th>
                <th>
                   <b>Inc VAT</b>
                </th>
            </tr>
            </thead>
            <tbody>
            <tr>
            <td>` + this.bundle.deviceName +
            `</td>
            <td>
                Edge Computers
            </td>
            <td>
                Fixed
            </td>
            <td>£`+ (this.bundle.hard[this.bundle.deviceName]*this.leaseRate()).toFixed(2) +
            `</td>
            <td>£`+ (this.bundle.hard[this.bundle.deviceName]*this.leaseRate()*1.2).toFixed(2) +
            `</td>
            </tr>`

            for (const [key, value] of Object.entries(this.bundle.soft)) {
                if(value > 0){
                    table += `<tr>
                        <td>`+ key+
                            `</td>
                        <td>
                            Edge Computers
                        </td>
                        <td>
                            Fixed
                        </td>
                        <td>£` + (value*this.leaseRate()).toFixed(2) +`</td>
                        <td>£` + (value*this.leaseRate()*1.2).toFixed(2) +`</td>
                    </tr>`
                }
            }

            if(this.paymentTiming() != this.serviceTiming() & this.bundle.serviceCost() != 0){
                for (const [key, value] of Object.entries(this.bundle.service)) {
                    table += `<tr>
                        <td>`+ key+
                        ` (Service, <b>paid monthly</b>)</td>
                        <td>
                            Edge Computers
                        </td>
                        <td>
                            Fixed
                        </td>
                        <td>£` + (value*this.serviceRate()).toFixed(2) +`</td>
                        <td>£` + (value*this.serviceRate()*1.2).toFixed(2) +`</td>
                    </tr>`
                }
            }else{
                for (const [key, value] of Object.entries(this.bundle.service)) {
                    table += `<tr>
                        <td>`+ key+
                        ` (Service)</td>
                        <td>
                            Edge Computers
                        </td>
                        <td>
                            Fixed
                        </td>
                        <td>£` + (value*this.serviceRate()).toFixed(2) +`</td>
                        <td>£` + (value*this.serviceRate()*1.2).toFixed(2) +`</td>
                    </tr>`
                }
            }
        
            if(this.bundle.outrightCost() != 0){
                table += `<tr>
                <td>Outright</td>
                <td>
                    Edge Computers
                </td>
                <td>
                    Fixed
                </td>
                <td>£` + this.bundle.outrightCost().toFixed(2) +`</td>
                <td>£` + (this.bundle.outrightCost()*1.2).toFixed(2) +`</td>
            </tr>`
            }

            if(this.calculateLeasePool() != 0){
                table += `<tr>
                    <td>
                        Pool
                    </td>
                    <td>
                        Siemens/Edge Computers
                    </td>
                    <td>
                        Fixed
                    </td>
                    <td>£`+ (this.calculateLeasePool()).toFixed(2) +
                    `</td>
                    <td>£`+(this.calculateLeasePool()*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }


            if(this.serviceManagement != 0){
                table += `<tr>
                    <td>
                        Managed Service Cost
                    </td>
                    <td>
                        Edge Computers
                    </td>
                    <td>
                        Contingent
                    </td>
                    <td>£`+ (this.serviceManagement).toFixed(2) +
                    `</td>
                    <td>£`+(this.serviceManagement*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }

            table += `<tr>
            <td>
                Silverwing Collection Charge
            </td>
            <td>
                Silverwing
            </td>
            <td>
                Fixed
            </td>
            <td>£`+ (this.leaseSilverwingFee()).toFixed(2) +
            `</td>
            <td>£`+(this.leaseSilverwingFee()*1.2).toFixed(2) +
            `</td>
            </tr>`

            if(this.paymentTiming() == this.serviceTiming()){
                table += `<tr>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        <b>`+ this.paymentTiming() + ` cost To School</b>
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.leaseCost() + this.serviceCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee()).toFixed(2) +
                    `</b></td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ ((this.leaseCost() + this.serviceCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee())*1.2).toFixed(2) +
                    `</b></td>
                </tr>`
            }else{
                table += `
                    <tr>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                            <b>`+ this.serviceTiming() + ` cost To School</b>
                        </td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                            -
                        </td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                            -
                        </td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.serviceCost()).toFixed(2) +
                        `</b></td>
                        <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.serviceCost()*1.2).toFixed(2) +
                        `</b></td>
                    </tr>
                    <tr>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        <b>`+ this.paymentTiming() + ` cost To School</b>
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.leaseCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee()).toFixed(2) +
                    `</b></td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ ((this.leaseCost() + this.calculateLeasePool() + this.serviceManagement + this.leaseSilverwingFee())*1.2).toFixed(2) +
                    `</b></td>
                </tr>`
            }
            if(this.calculateLeaseReserve() != 0){
                table += `<tr>
                    <td>
                        Reserve Fund
                    </td>
                    <td>
                        School
                    </td>
                    <td>
                        -
                    </td>
                    <td>£`+ (this.calculateLeaseReserve()).toFixed(2) +
                    `</td>
                    <td>£`+(this.calculateLeaseReserve()*1.2).toFixed(2) +
                    `</td>
                </tr>`
            }
            

            if(this.calculateDeposit() > 0){
                table += `<tr>
                <td>Deposit</td>
                <td>
                   School
                </td>
                <td>
                    -
                </td>
                <td style="color:green">-£` + (this.calculateDeposit()/((12/this.frequency)*this.length)).toFixed(2) +`</td>
                <td style="color:green">-£` + ((this.calculateDeposit()*1.2)/((12/this.frequency)*this.length)).toFixed(2) +`</td>
                </tr>`
            }
    
            if(this.calculateDeposit() < 0){
                table += `<tr>
                <td>Ownership Uplift</td>
                <td>
                    School
                </td>
                <td>
                    -
                </td>
                <td>£` + ((this.calculateDeposit()*-1)/((12/this.frequency)*this.length)).toFixed(2) +`</td>
                <td>£` +  ((this.calculateDeposit()*-1*1.2)/((12/this.frequency)*this.length)).toFixed(2) +`</td>
                </tr>`
            }
            table += `<tr>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        <b>` + this.paymentTiming() + ` cost to parent</b>
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                        -
                    </td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.finalLeasePrice()).toFixed(2) +
                    `</b></td>
                    <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+(this.finalLeasePrice()*1.2).toFixed(2) +
                    `</b></td>
                </tr>`
            if(this.numberOfCollections != (this.length*12)/this.frequency){
                table +=  `<tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Cost to parent per collection (over ` + this.numberOfCollections.toString() + ` collections)</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.finalLeasePrice()*this.collectionMultiplier()).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+(this.finalLeasePrice()*this.collectionMultiplier()*1.2).toFixed(2) +
                `</b></td>
            </tr>`
            }

        if(this.deposit != 0){
            table += `<tr>
                <td>Deposit</td>
                <td>
                    School
                </td>
                <td>
                   Outright
                </td>
                <td>£` + (this.deposit).toFixed(2) +`</td>
                <td>£` + (this.deposit*1.2).toFixed(2) +`</td>
                </tr>`
        }
        for (const [key, value] of Object.entries(this.bundle.outright)) {
            table += `<tr>
                <td>`+ key+
                `</td>
                <td>
                    Edge Computers
                </td>
                <td>
                    Outright
                </td>
                <td>£` + (value).toFixed(2) +`</td>
                <td>£` + (value*1.2).toFixed(2) +`</td>
            </tr>`
        }
        table +=` <tr><td>Initial Silverwing Fee</td>
                <td>
                    Silverwing
                </td>
                <td>
                Outright
                </td>
                <td>£0.80</td>
                <td>£0.96</td>
                </tr>
                <tr>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    <b>Initial Cost to Parent</b>
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;">
                    -
                </td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+ (this.bundle.outrightCost()+this.deposit+0.8).toFixed(2) +
                `</b></td>
                <td style="border-bottom: 2px solid black;border-top: 2px solid black;"><b>£`+((this.bundle.outrightCost()+ this.deposit+0.8)*1.2).toFixed(2) +
                `</b></td>
                </tr>`
            
        table += `</tbody>
        </table>`



        cardBody.innerHTML = table;

    rows[3].outerHTML += "<br>"
    rows[0].outerHTML += "<br>"
    rows[1].outerHTML += "<br>"
 
    /*const netCard = document.createElement("div")
    const netCardTitle = document.createElement("div")
    const netCardBody = document.createElement("p")
    netCard.classList.add("card")
    netCard.classList.add("text-center")
    netCard.classList.add("pt-3")

    netCardTitle.classList.add("card-title")
    netCardTitle.classList.add("card-text")

    netCard.appendChild(netCardTitle);
    netCard.appendChild(netCardBody);

    netCardTitle.innerHTML = "Total Cost To School Over All Units"
    netCardBody.innerHTML = `<table class="table">
    <thead>
        <tr>
            <th>
            <b>Charge</b>
            </th>
            <th>
            <b>Ex VAT</b>
            </th>
            <th>
            <b>Inc VAT</b>
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                Total School Cost
            </td>
            <td>£`+ ((this.finalPrice())*this.numberOfCollections*this.numberOfUnits*(100+this.pool)/100).toFixed(2) +
                `</td>
                <td>£`+(this.finalPrice()*this.numberOfCollections*this.numberOfUnits*((100+this.pool)/100)*1.2).toFixed(2) +
                `</td>
        </tr>
        <tr>
            <td>
            Trade In Saving
            </td>
            <td style="color: green">-£`+ (this.bundle.tradeIn*this.numberOfUnits*(100+this.pool)/100).toFixed(2) +
            `</td>
            <td style="color: green">-£`+(this.bundle.tradeIn*this.numberOfUnits*1.2*(100+this.pool)/100).toFixed(2) +
            `</td>
        </tr>   
    </tr>`

    rows[2].appendChild(netCard) */
    return container;
}

    generatePDF(element) {
        let pdf = window.jspdf;
        let header = new Image();
        header.src = "EDGEheader.png"
        let footer = new Image()
        footer.src = "EDGEfooter.png"

        
        const doc = new pdf.jsPDF('p', 'pt', [595.28,  841.89]);
        const numPages = 1;
        doc.html(element, {
            callback: function (doc) {
              doc.addImage(header, 'png', 0, 0, 595.28, 250)
              doc.addImage(footer, 'png', 0, 790, 595.28, 50)
              let pageCount = doc.internal.getNumberOfPages();
              const initialCount = pageCount
              for(let i = 0; i < initialCount-numPages; i++){
                doc.deletePage(pageCount)
                pageCount = doc.internal.getNumberOfPages();
              }
              doc.save("quote.pdf");
            },
            margin: [10, 10, 10, 10],
            x: 92.64,
            y: 255,
            width: 400, //target width in the PDF document
            windowWidth: 675 //window width in CSS pixels
         });
    }
}